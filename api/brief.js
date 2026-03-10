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

  const [tasksRes, eventsRes, usageRes, fitnessGoalsRes, fitnessTodayRes] = await Promise.all([
    supabase.from("batcave_tasks").select("*").eq("completed", false).order("due_date"),
    supabase.from("batcave_events").select("*").gte("end_date", today).order("start_date").limit(15),
    supabase.from("batcave_usage")
      .select("cost_cents")
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from("batcave_fitness_goals").select("*").eq("status", "active"),
    supabase.from("batcave_fitness_log").select("*").eq("activity_date", today),
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
  const fitnessGoals = fitnessGoalsRes.data || [];
  const fitnessToday = fitnessTodayRes.data || [];
  const monthCost = (usageRes.data || []).reduce((s, u) => s + parseFloat(u.cost_cents || 0), 0);
  const overdue = tasks.filter(t => t.due_date && t.due_date < today);

  const contextStr = `Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}

TASKS (${tasks.length} open):
${tasks.slice(0, 15).map(t => `- [${t.priority.toUpperCase()}]${t.recurrence ? ` [${t.recurrence.toUpperCase()}]` : ""} ${t.title} (id: ${t.id}, due: ${t.due_date || "no date"})`).join("\n") || "None"}
${overdue.length > 0 ? `OVERDUE: ${overdue.map(t => `${t.title} (id: ${t.id}, was due ${t.due_date})`).join(", ")}` : ""}

CALENDAR (upcoming):
${events.slice(0, 10).map(e => `- ${e.title}: ${e.start_date}${e.end_date !== e.start_date ? " to " + e.end_date : ""} [${e.category}]${e.location ? " @ " + e.location : ""}`).join("\n") || "Nothing scheduled"}

FITNESS:
${fitnessGoals.length > 0 ? fitnessGoals.map(g => `- GOAL: ${g.title} (${g.target_value} ${g.target_unit} per ${g.target_period})`).join("\n") : "No fitness goals set"}
${fitnessToday.length > 0 ? `Today's activity: ${fitnessToday.map(l => `${l.activity_type}${l.duration_minutes ? ` ${l.duration_minutes}min` : ""}${l.distance_miles ? ` ${l.distance_miles}mi` : ""}`).join(", ")}` : "No activity logged today"}

TOP NEWS HEADLINES:
${headlines.length > 0 ? headlines.map(h => `- ${h}`).join("\n") : "No news feed connected"}

PROJECTS: Batcave Console (v5.0), Omote (mk8.5), Cerebro (mk1.1), Run Recipes, Veritas (incubating)

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
        max_tokens: 1024,
        system: `You are Alfred — Tony's AI butler and chief of staff inside the Batcave command center. Generate a daily briefing as a JSON object.

CRITICAL: Your entire response must be ONLY a valid JSON object. No thinking, no explanation, no markdown, no backticks, no preamble, no trailing text. Start with { and end with }. Nothing else.

The object structure:
{
  "greeting": "The greeting text WITHOUT the quote. Example: 'Good evening, Master Tony. Seattle awaits you Monday — make sure the house is in order before wheels up.'",
  "quote_text": "The quote itself, without quotation marks. Example: 'Luck is what happens when preparation meets opportunity.'",
  "quote_author": "The person who said/wrote it. Example: 'Seneca'",
  "quote_source": "The work or context it comes from, if known. Example: 'Letters to Lucilius'. Use null if it's a widely attributed saying with no specific source.",
  "items": [
    {
      "text": "Concise, direct, actionable line.",
      "horizon": "now|today|tomorrow|week|fyi",
      "mood": "urgent|warm|neutral|positive|alert|overdue",
      "category": "task|event|travel|project|news|finance|health|personal",
      "icon_hint": "1-2 word icon description e.g. 'laundry basket', 'airplane', 'calendar', 'warning', 'gift', 'code', 'chart', 'newspaper'",
      "task_id": "If this item corresponds to a specific task, include the task UUID from context. Otherwise omit or null."
    }
  ]
}

GREETING RULES:
- Always address as "Master Tony"
- The greeting field should NOT include the quote — keep them separate
- The quote should feel earned, not forced. It should connect to the day's actual content.
- Vary the source: philosophers, writers, entrepreneurs, athletes, film, original wit
- Keep greeting under 35 words, quote under 25 words

ITEM RULES:
- "now" = overdue or happening today. "today" = do today. "tomorrow" = tomorrow. "week" = this week. "fyi" = awareness only.
- mood drives color: urgent=red, warm=amber, neutral=default, positive=green, alert=yellow, overdue=deep orange (for tasks past their due date — distinct from urgent)
- For overdue tasks, ALWAYS use mood "overdue" — this is distinct from "urgent" which is for things due today.
- Write like a chief of staff: "Pack for Seattle — flight Monday." not "You have a trip..."
- When an item corresponds to a task from the TASKS context, include the task's UUID in the "task_id" field. This enables 1-touch completion from the briefing.
- For recurring (DAILY/WEEKLY) tasks, note the recurrence in the text naturally: "Daily cardio — not yet logged today."
- Write like a chief of staff: "Pack for Seattle — flight Monday." not "You have a trip..."
- 8-14 items. Most urgent first, FYI last.
- FITNESS: If fitness goals exist, include a fitness item early in the list. If no activity logged today and there's a daily goal, mark it as mood "alert" with horizon "today" and category "health" with icon_hint "running shoe". If activity was logged, mark it "positive". Track streaks in the text.
- NEWS: Always include exactly 3 news items at the end as FYI items. Focus on world news and economics/markets. Each should be a single, punchy headline in your voice. Use category "news" and icon_hint "newspaper" or "chart" as appropriate. If live headlines are provided in the context, synthesize from those. If the context says "No news feed connected", generate 3 current world/economics awareness items from your own knowledge — major ongoing stories, market trends, or geopolitical developments. Mark these with mood "neutral".
- Today's date is ${new Date().toISOString().slice(0, 10)}. Current hour: ${new Date().getHours()}.`,
        messages: [{ role: "user", content: contextStr }],
      }),
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Brief generation failed" });
    }

    const data = await response.json();
    let content = data.content?.map(c => c.text || "").join("") || "";
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;

    // Clean the AI response — extract pure JSON, strip preamble/fences/thinking
    try {
      let cleaned = content.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
      const fb = cleaned.indexOf("{");
      const lb = cleaned.lastIndexOf("}");
      if (fb !== -1 && lb > fb) cleaned = cleaned.slice(fb, lb + 1);
      JSON.parse(cleaned); // validate it's actual JSON
      content = cleaned; // store only the clean JSON
    } catch {}

    // Log usage
    const costCents = (inputTokens / 1000000 * SONNET_INPUT_COST + outputTokens / 1000000 * SONNET_OUTPUT_COST) * 100;
    await supabase.from("batcave_usage").insert({
      service: "anthropic", endpoint: "brief",
      input_tokens: inputTokens, output_tokens: outputTokens,
      model: "claude-sonnet-4-20250514",
      cost_cents: Math.round(costCents * 10000) / 10000,
    });

    // Upsert brief
    const now = new Date().toISOString();
    await supabase.from("batcave_briefs").upsert({
      brief_date: today, content,
      context_snapshot: { tasks: tasks.length, events: events.length, overdue: overdue.length },
      tokens_used: inputTokens + outputTokens,
      created_at: now,
    }, { onConflict: "brief_date" });

    res.json({ brief: { brief_date: today, content, tokens_used: inputTokens + outputTokens, created_at: now }, cached: false });
  } catch (err) {
    res.status(500).json({ error: "Brief generation failed", detail: err.message });
  }
}
