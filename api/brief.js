import { getSecret, getServiceClient } from "./_supabase.js";

const SONNET_INPUT_COST = 3.0;
const SONNET_OUTPUT_COST = 15.0;

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") return res.status(405).json({ error: "GET or POST" });

  const supabase = getServiceClient();
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const today = new Date().toISOString().slice(0, 10);

  // GET — return today's brief if it exists
  if (req.method === "GET") {
    const { data } = await supabase.from("batcave_briefs")
      .select("*").eq("brief_date", today).single();
    if (data) return res.json({ brief: data, cached: true });
    return res.json({ brief: null, cached: false });
  }

  // POST — generate a new brief
  const apiKey = await getSecret("anthropic");
  if (!apiKey) return res.status(503).json({ error: "Anthropic not connected" });

  // Assemble context
  const weekOut = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const finnhubKey = await getSecret("finnhub");

  const [tasksRes, eventsRes, usageRes] = await Promise.all([
    supabase.from("batcave_tasks").select("*").eq("completed", false).order("due_date"),
    supabase.from("batcave_events").select("*").gte("end_date", today).order("start_date").limit(15),
    supabase.from("batcave_usage")
      .select("cost_cents")
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  // Fetch news headlines if Finnhub is connected
  let headlines = [];
  if (finnhubKey) {
    try {
      const newsResp = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`);
      if (newsResp.ok) {
        const articles = await newsResp.json();
        headlines = (articles || []).slice(0, 8).map(a => `${a.headline} (${a.source})`);
      }
    } catch {}
  }

  const tasks = tasksRes.data || [];
  const events = eventsRes.data || [];
  const monthCost = (usageRes.data || []).reduce((s, u) => s + parseFloat(u.cost_cents || 0), 0);
  const overdue = tasks.filter(t => t.due_date && t.due_date < today);

  const contextStr = `Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}

TASKS (${tasks.length} open):
${tasks.slice(0, 15).map(t => `- [${t.priority.toUpperCase()}] ${t.title} (due: ${t.due_date || "no date"})`).join("\n") || "None"}
${overdue.length > 0 ? `OVERDUE: ${overdue.map(t => `${t.title} (was due ${t.due_date})`).join(", ")}` : ""}

CALENDAR (upcoming):
${events.slice(0, 10).map(e => `- ${e.title}: ${e.start_date}${e.end_date !== e.start_date ? " to " + e.end_date : ""} [${e.category}]${e.location ? " @ " + e.location : ""}`).join("\n") || "Nothing scheduled"}

TOP NEWS HEADLINES:
${headlines.length > 0 ? headlines.map(h => `- ${h}`).join("\n") : "No news feed connected"}

PROJECTS: Batcave Console (v3.6), Omote (mk8.4), Cerebro (mk1.1), Run Recipes, Veritas (incubating)

AI USAGE THIS MONTH: $${(monthCost / 100).toFixed(2)}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        system: `You are Alfred, Tony's AI assistant generating a morning briefing inside the Batcave command center. Be concise, direct, and useful. Structure as:

1. A one-line status summary (what kind of day is it — busy, light, travel, etc.)
2. Top priorities (2-3 bullets, from tasks and calendar)
3. Flags (overdue items, conflicts, things that need attention)
4. News digest (1-2 sentence synthesis of the top headlines — what's moving markets, what matters)
5. One-line AI usage note

Keep it under 200 words. No greetings, no sign-offs. Speak like a senior engineering partner giving a standup.`,
        messages: [{ role: "user", content: contextStr }],
      }),
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Brief generation failed" });
    }

    const data = await response.json();
    const content = data.content?.map(c => c.text || "").join("") || "";
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;

    // Log usage
    const costCents = (inputTokens / 1000000 * SONNET_INPUT_COST + outputTokens / 1000000 * SONNET_OUTPUT_COST) * 100;
    await supabase.from("batcave_usage").insert({
      service: "anthropic", endpoint: "brief",
      input_tokens: inputTokens, output_tokens: outputTokens,
      model: "claude-sonnet-4-20250514",
      cost_cents: Math.round(costCents * 10000) / 10000,
    });

    // Upsert brief
    await supabase.from("batcave_briefs").upsert({
      brief_date: today, content,
      context_snapshot: { tasks: tasks.length, events: events.length, overdue: overdue.length },
      tokens_used: inputTokens + outputTokens,
    }, { onConflict: "brief_date" });

    res.json({ brief: { brief_date: today, content, tokens_used: inputTokens + outputTokens }, cached: false });
  } catch (err) {
    res.status(500).json({ error: "Brief generation failed", detail: err.message });
  }
}
