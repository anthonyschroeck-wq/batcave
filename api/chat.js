import { getSecret, getServiceClient, getUserClient } from "./_supabase.js";

const SONNET_INPUT_COST = 3.0;   // $ per 1M input tokens
const SONNET_OUTPUT_COST = 15.0; // $ per 1M output tokens

async function getContext() {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const today = new Date().toISOString().slice(0, 10);
  const weekOut = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [tasksRes, eventsRes] = await Promise.all([
    supabase.from("batcave_tasks").select("*").eq("completed", false).order("due_date"),
    supabase.from("batcave_events").select("*").gte("end_date", today).lte("start_date", weekOut).order("start_date"),
  ]);

  const tasks = tasksRes.data || [];
  const events = eventsRes.data || [];
  const overdue = tasks.filter(t => t.due_date && t.due_date < today);

  return `Current date: ${today}
  
OPEN TASKS (${tasks.length}):
${tasks.map(t => `- [${t.priority.toUpperCase()}] ${t.title} (due: ${t.due_date || "no date"}) id:${t.id}`).join("\n")}
${overdue.length > 0 ? `\nOVERDUE: ${overdue.map(t => t.title).join(", ")}` : ""}

UPCOMING EVENTS (next 7 days):
${events.map(e => `- ${e.title}: ${e.start_date} to ${e.end_date || e.start_date} [${e.category}]${e.location ? " @ " + e.location : ""} id:${e.id}`).join("\n") || "None"}

PROJECTS: Batcave Console (v3.1, active), Omote (mk8.4, active), Cerebro (mk1.1, active), Run Recipes (active), Veritas (incubating)`;
}

async function logUsage(supabase, inputTokens, outputTokens, model, endpoint) {
  const costCents = (inputTokens / 1000000 * SONNET_INPUT_COST + outputTokens / 1000000 * SONNET_OUTPUT_COST) * 100;
  try {
    await supabase.from("batcave_usage").insert({
      service: "anthropic",
      endpoint: endpoint || "chat",
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model,
      cost_cents: Math.round(costCents * 10000) / 10000,
    });
  } catch {}
}

async function executeActions(actions, jwt) {
  const supabase = getUserClient(jwt);
  if (!supabase) return [];
  const results = [];

  // Get user ID for inserts that need it
  let userId = null;
  try { const { data } = await supabase.auth.getUser(); userId = data?.user?.id; } catch {}

  for (const action of actions) {
    try {
      if (action.type === "create_task") {
        const recurrenceGroup = action.recurrence ? crypto.randomUUID() : null;
        const { data } = await supabase.from("batcave_tasks")
          .insert({ title: action.title, priority: action.priority || "medium", due_date: action.due_date || null, recurrence: action.recurrence || null, recurrence_group: recurrenceGroup })
          .select().single();
        results.push({ action: "create_task", ok: true, task: data });
      } else if (action.type === "complete_task") {
        await supabase.from("batcave_tasks").update({ completed: true }).eq("id", action.id);
        results.push({ action: "complete_task", ok: true, id: action.id });
      } else if (action.type === "update_task") {
        const updates = {};
        if (action.title) updates.title = action.title;
        if (action.priority) updates.priority = action.priority;
        if (action.due_date !== undefined) updates.due_date = action.due_date;
        if (action.completed !== undefined) updates.completed = action.completed;
        await supabase.from("batcave_tasks").update(updates).eq("id", action.id);
        results.push({ action: "update_task", ok: true, id: action.id });
      } else if (action.type === "delete_task") {
        await supabase.from("batcave_tasks").delete().eq("id", action.id);
        results.push({ action: "delete_task", ok: true, id: action.id });
      } else if (action.type === "create_event") {
        const { data } = await supabase.from("batcave_events")
          .insert({
            title: action.title, start_date: action.start_date,
            end_date: action.end_date || action.start_date,
            category: action.category || "personal",
            location: action.location || null,
          })
          .select().single();
        results.push({ action: "create_event", ok: true, event: data });
      } else if (action.type === "update_event") {
        const updates = {};
        if (action.title) updates.title = action.title;
        if (action.start_date) updates.start_date = action.start_date;
        if (action.end_date) updates.end_date = action.end_date;
        if (action.category) updates.category = action.category;
        if (action.location !== undefined) updates.location = action.location;
        await supabase.from("batcave_events").update(updates).eq("id", action.id);
        results.push({ action: "update_event", ok: true, id: action.id });
      } else if (action.type === "delete_event") {
        await supabase.from("batcave_events").delete().eq("id", action.id);
        results.push({ action: "delete_event", ok: true, id: action.id });
      } else if (action.type === "create_fitness_goal") {
        const { data } = await supabase.from("batcave_fitness_goals")
          .insert({
            user_id: userId,
            title: action.title,
            category: action.category || "cardio",
            target_type: action.target_type || "frequency",
            target_value: action.target_value || 1,
            target_unit: action.target_unit || "sessions",
            target_period: action.target_period || "day",
          }).select().single();
        results.push({ action: "create_fitness_goal", ok: true, goal: data });
      } else if (action.type === "log_activity") {
        const { data } = await supabase.from("batcave_fitness_log")
          .insert({
            user_id: userId,
            activity_type: action.activity_type || "run",
            title: action.title || null,
            duration_minutes: action.duration_minutes || null,
            distance_miles: action.distance_miles || null,
            calories: action.calories || null,
            activity_date: action.activity_date || new Date().toISOString().slice(0, 10),
            source: "alfred",
          }).select().single();
        results.push({ action: "log_activity", ok: true, entry: data });
      } else if (action.type === "log_weight") {
        const { data } = await supabase.from("batcave_weight_log")
          .insert({
            user_id: userId,
            weight_lbs: parseFloat(action.weight_lbs),
            notes: action.notes || null,
            logged_date: action.logged_date || new Date().toISOString().slice(0, 10),
          }).select().single();
        results.push({ action: "log_weight", ok: true, entry: data });
      }
    } catch (e) {
      results.push({ action: action.type, ok: false, error: e.message });
    }
  }
  return results;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });
  const jwt = authHeader.slice(7);

  const apiKey = await getSecret("anthropic");
  if (!apiKey) return res.status(503).json({ error: "Anthropic API key not connected. Add it in Integrations." });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Message required" });

  const context = await getContext();
  const supabase = getServiceClient();

  const systemPrompt = `You are Alfred — Tony's AI assistant inside the Batcave command center. You are concise, direct, and senior-level. You have full awareness of Tony's tasks, calendar, projects, and fitness goals.

${context || "No context available."}

CAPABILITIES — you can take actions by including a JSON block in your response:
\`\`\`actions
[
  {"type": "create_task", "title": "...", "priority": "high|medium|low", "due_date": "YYYY-MM-DD", "recurrence": "null|daily|weekly"},
  {"type": "complete_task", "id": "task-uuid"},
  {"type": "update_task", "id": "task-uuid", "title": "...", "priority": "...", "due_date": "..."},
  {"type": "delete_task", "id": "task-uuid"},
  {"type": "create_event", "title": "...", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "category": "personal|professional|travel|health|project", "location": "..."},
  {"type": "update_event", "id": "event-uuid", "title": "...", "start_date": "...", "end_date": "...", "category": "...", "location": "..."},
  {"type": "delete_event", "id": "event-uuid"},
  {"type": "create_fitness_goal", "title": "...", "category": "cardio|strength|flexibility|recovery", "target_type": "frequency|duration|distance", "target_value": 1, "target_unit": "sessions|minutes|miles", "target_period": "day|week|month"},
  {"type": "log_activity", "activity_type": "run|walk|cycle|swim|strength|yoga|other", "title": "...", "duration_minutes": 30, "distance_miles": 3.1, "calories": 250, "activity_date": "YYYY-MM-DD"},
  {"type": "log_weight", "weight_lbs": 185.5, "notes": "...", "logged_date": "YYYY-MM-DD"}
]
\`\`\`

RULES:
- Be concise. No filler.
- When asked to create/modify/delete/reschedule tasks, events, or fitness goals, include the actions block AND a brief confirmation.
- When asked questions, answer from context. Don't guess.
- Use the task/event IDs from context when referencing existing items.
- For updates, only include the fields that are changing.
- For fitness: "set a daily cardio goal" = create_fitness_goal. Any mention of completing exercise = log_activity.
- IMPORTANT: Parse natural language into structured fitness data. Examples:
  - "I did my run today, 2 miles at 15m/mile" → log_activity with activity_type:"run", distance_miles:2, duration_minutes:30 (2 miles * 15 min/mile), title:"Run — 2mi @ 15:00/mi"
  - "ran 5k this morning in 28 minutes" → log_activity with activity_type:"run", distance_miles:3.1, duration_minutes:28, title:"Morning 5K"
  - "30 minute walk" → log_activity with activity_type:"walk", duration_minutes:30
  - "hit the gym, chest and tris, 45 min" → log_activity with activity_type:"strength", duration_minutes:45, title:"Chest and triceps"
  - "log my cardio" (no details) → log_activity with activity_type:"run", title:"Cardio session"
- Always calculate duration from pace+distance if given (e.g. 3 miles at 10min/mile = 30 minutes).
- "I weigh 185" or "weight 185.5" or "log weight 190" → log_weight with weight_lbs. Parse the number from natural language.
- Today's date is ${new Date().toISOString().slice(0, 10)}.
- Dates like "friday", "next tuesday" should resolve to actual YYYY-MM-DD dates.`;

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
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: "Anthropic API error", detail: err });
    }

    const data = await response.json();
    const text = data.content?.map(c => c.text || "").join("") || "";
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;

    // Log usage
    if (supabase) {
      await logUsage(supabase, inputTokens, outputTokens, "claude-sonnet-4-20250514", "chat");
    }

    // Parse and execute actions
    let actionResults = [];
    const actionsMatch = text.match(/```actions\s*\n([\s\S]*?)\n```/);
    if (actionsMatch) {
      try {
        const actions = JSON.parse(actionsMatch[1]);
        if (Array.isArray(actions)) {
          actionResults = await executeActions(actions, jwt);
        }
      } catch {}
    }

    // Clean the response text (remove the actions block from display)
    const cleanText = text.replace(/```actions\s*\n[\s\S]*?\n```/g, "").trim();

    res.json({
      response: cleanText,
      actions: actionResults,
      usage: { input_tokens: inputTokens, output_tokens: outputTokens },
    });
  } catch (err) {
    res.status(500).json({ error: "Chat request failed", detail: err.message });
  }
}
