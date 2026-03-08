import { getServiceClient } from "./_supabase.js";

export default async function handler(req, res) {
  const supabase = getServiceClient();
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const today = new Date().toISOString().slice(0, 10);
  const weekOut = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  try {
    const [tasksRes, eventsRes, usageRes] = await Promise.all([
      supabase.from("batcave_tasks").select("*").order("due_date"),
      supabase.from("batcave_events").select("*")
        .gte("end_date", today).lte("start_date", weekOut).order("start_date"),
      supabase.from("batcave_usage")
        .select("input_tokens, output_tokens, cost_cents, created_at")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .order("created_at", { ascending: false }),
    ]);

    const tasks = tasksRes.data || [];
    const events = eventsRes.data || [];
    const usage = usageRes.data || [];

    // Compute task stats
    const openTasks = tasks.filter(t => !t.completed);
    const overdue = openTasks.filter(t => t.due_date && t.due_date < today);
    const dueToday = openTasks.filter(t => t.due_date === today);
    const dueThisWeek = openTasks.filter(t => t.due_date && t.due_date >= today && t.due_date <= weekOut);
    const highPriority = openTasks.filter(t => t.priority === "high");

    // Compute usage stats
    const monthTokensIn = usage.reduce((s, u) => s + (u.input_tokens || 0), 0);
    const monthTokensOut = usage.reduce((s, u) => s + (u.output_tokens || 0), 0);
    const monthCost = usage.reduce((s, u) => s + parseFloat(u.cost_cents || 0), 0);

    // Static project data (will be live when GitHub integration reads from Supabase)
    const projects = [
      { name: "Batcave Console", status: "active", version: "v3.1", url: "https://batcave-sage.vercel.app" },
      { name: "Omote", status: "active", version: "mk8.4", url: "https://omote-one.vercel.app" },
      { name: "Cerebro", status: "active", version: "mk1.1" },
      { name: "Run Recipes", status: "active" },
      { name: "Veritas", status: "incubating" },
    ];

    const context = {
      date: today,
      day: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),

      tasks: {
        total: tasks.length,
        open: openTasks.length,
        overdue: overdue.map(t => ({ title: t.title, priority: t.priority, due: t.due_date })),
        dueToday: dueToday.map(t => ({ title: t.title, priority: t.priority })),
        dueThisWeek: dueThisWeek.map(t => ({ title: t.title, priority: t.priority, due: t.due_date })),
        highPriority: highPriority.map(t => ({ title: t.title, due: t.due_date })),
      },

      calendar: {
        upcoming: events.map(e => ({
          title: e.title, start: e.start_date, end: e.end_date,
          category: e.category, location: e.location,
        })),
      },

      projects,

      usage: {
        monthInputTokens: monthTokensIn,
        monthOutputTokens: monthTokensOut,
        monthCostCents: Math.round(monthCost * 100) / 100,
        callsThisMonth: usage.length,
      },
    };

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.json(context);
  } catch (err) {
    res.status(500).json({ error: "Context assembly failed", detail: err.message });
  }
}
