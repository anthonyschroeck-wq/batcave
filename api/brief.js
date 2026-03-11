import { getSecret, getServiceClient } from "./_supabase.js";

function safeParseBrief(content) {
  if (!content) return null;
  if (typeof content === "object" && content !== null && content.items) return content;
  let raw = typeof content === "string" ? content : String(content);
  if (raw.startsWith('"')) { try { raw = JSON.parse(raw); } catch {} }
  if (typeof raw === "object" && raw !== null && raw.items) return raw;
  if (typeof raw !== "string") raw = String(raw);
  raw = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const fb = raw.indexOf("{"); const lb = raw.lastIndexOf("}");
  if (fb === -1 || lb <= fb) return null;
  raw = raw.slice(fb, lb + 1).replace(/,\s*([}\]])/g, "$1");
  try { const p = JSON.parse(raw); if (p && p.items) return p; } catch {}
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") return res.status(405).json({ error: "GET or POST" });

  const supabase = getServiceClient();
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const today = new Date().toISOString().slice(0, 10);

  // GET — return today's cached brief
  if (req.method === "GET") {
    try {
      const { data } = await supabase.from("batcave_briefs").select("*").eq("brief_date", today).single();
      if (data) {
        const parsed = safeParseBrief(data.content);
        return res.json({ brief: { ...data, parsed }, cached: true });
      }
    } catch {}
    return res.json({ brief: null, cached: false });
  }

  // POST — generate new brief
  let apiKey;
  try { apiKey = await getSecret("anthropic"); } catch {}
  if (!apiKey) return res.status(503).json({ error: "Anthropic key not found in batcave_secrets" });

  // Gather context — each query wrapped individually so one failure doesn't kill all
  let tasks = [], events = [], fitnessGoals = [], fitnessToday = [], monthCost = 0, headlines = [];

  try { const r = await supabase.from("batcave_tasks").select("*").eq("completed", false).order("due_date").limit(10); tasks = r.data || []; } catch {}
  try { const r = await supabase.from("batcave_events").select("*").gte("end_date", today).order("start_date").limit(7); events = r.data || []; } catch {}
  try { const r = await supabase.from("batcave_fitness_goals").select("*").eq("status", "active"); fitnessGoals = r.data || []; } catch {}
  try { const r = await supabase.from("batcave_fitness_log").select("*").eq("activity_date", today); fitnessToday = r.data || []; } catch {}
  try {
    const r = await supabase.from("batcave_usage").select("cost_cents").gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
    monthCost = (r.data || []).reduce((s, u) => s + parseFloat(u.cost_cents || 0), 0);
  } catch {}

  // Finnhub news — optional
  try {
    const fk = await getSecret("finnhub");
    if (fk) {
      const nr = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${fk}`);
      if (nr.ok) { const a = await nr.json(); headlines = (a || []).slice(0, 6).map(x => `${x.headline} (${x.source})`); }
    }
  } catch {}

  const overdue = tasks.filter(t => t.due_date && t.due_date < today);

  const cstTime = new Date().toLocaleString("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit", hour12: true });
  const cstHour = parseInt(new Date().toLocaleString("en-US", { timeZone: "America/Chicago", hour: "numeric", hour12: false }));

  const context = `Date: ${new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago", weekday: "long", month: "long", day: "numeric", year: "numeric" })}
Current time (CST): ${cstTime} (hour: ${cstHour})
TASKS (${tasks.length} open):
${tasks.map(t => `- [${t.priority?.toUpperCase() || "MED"}]${t.recurrence ? ` [${t.recurrence.toUpperCase()}]` : ""} ${t.title} (id:${t.id}, due:${t.due_date || "none"})`).join("\n") || "None"}
${overdue.length > 0 ? `OVERDUE: ${overdue.map(t => `${t.title} (id:${t.id})`).join(", ")}` : ""}
CALENDAR:
${events.map(e => `- ${e.title}: ${e.start_date} [${e.category}]`).join("\n") || "Nothing scheduled"}
FITNESS:
${fitnessGoals.map(g => `- GOAL: ${g.title} (${g.target_value} ${g.target_unit}/${g.target_period})`).join("\n") || "No goals"}
${fitnessToday.length > 0 ? `Logged today: ${fitnessToday.map(l => l.activity_type).join(", ")}` : "No activity today"}
NEWS:
${headlines.length > 0 ? headlines.map(h => `- ${h}`).join("\n") : "No news feed"}
COST: $${(monthCost / 100).toFixed(2)} this month`;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 700,
        temperature: 0,
        system: `You are Alfred, Tony's AI butler. Generate a daily briefing as a JSON object. Your ENTIRE response must be ONLY valid JSON. No text before or after. Start with { end with }.

Format: {"greeting":"Good [Morning/Afternoon/Evening], Master Tony.","quote_text":"...","quote_author":"...","quote_source":"title of work or speech","quote_url":"https://public-link-about-the-quote-or-author","items":[{"text":"...","horizon":"now|today|tomorrow|week|fyi","mood":"urgent|warm|neutral|positive|alert|overdue","category":"task|event|health|news|personal","icon_hint":"...","task_id":"uuid or null"}]}

Rules: Address as "Master Tony". The greeting MUST match CST (Central Standard Time / America/Chicago): before noon = "Good Morning", noon-5pm = "Good Afternoon", after 5pm = "Good Evening". 6-8 items max. Overdue tasks use mood "overdue". Include task UUIDs as task_id. End with 2 news items (category "news"). quote_url should link to a public page about the quote (Goodreads, Wikipedia, BrainyQuote, etc). Today: ${today}`,
        messages: [{ role: "user", content: context }],
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => "");
      return res.status(502).json({ error: `Anthropic API ${resp.status}`, detail: errBody.slice(0, 200) });
    }

    const data = await resp.json();
    let content = (data.content || []).map(c => c.text || "").join("");

    // Clean JSON
    const parsed = safeParseBrief(content);
    if (parsed) content = JSON.stringify(parsed);

    // Track usage
    const inTok = data.usage?.input_tokens || 0;
    const outTok = data.usage?.output_tokens || 0;
    const cost = (inTok / 1e6 * 1.0 + outTok / 1e6 * 5.0) * 100;
    try {
      await supabase.from("batcave_usage").insert({ service: "anthropic", endpoint: "brief", input_tokens: inTok, output_tokens: outTok, model: "claude-haiku-4-5-20251001", cost_cents: Math.round(cost * 1e4) / 1e4 });
    } catch {}

    // Save brief
    const now = new Date().toISOString();
    try {
      await supabase.from("batcave_briefs").upsert({ brief_date: today, content, context_snapshot: { tasks: tasks.length, events: events.length }, tokens_used: inTok + outTok, created_at: now }, { onConflict: "brief_date" });
    } catch {}

    return res.json({ brief: { brief_date: today, content, parsed, tokens_used: inTok + outTok, created_at: now }, cached: false });
  } catch (err) {
    return res.status(500).json({ error: "Brief generation failed", detail: err.message });
  }
}
