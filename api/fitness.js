import { getServiceClient, getUserClient } from "./_supabase.js";

export default async function handler(req, res) {
  const supabase = getServiceClient();
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const jwt = req.headers.authorization?.replace("Bearer ", "");
  const userClient = jwt ? getUserClient(jwt) : null;
  if (!userClient) return res.status(401).json({ error: "Auth required" });

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const action = req.query.action || (req.method === "GET" ? "summary" : null);

  // ─── GET ──────────────────────────────────────────────────
  if (req.method === "GET") {
    if (action === "goals") {
      const { data } = await userClient.from("batcave_fitness_goals").select("*").order("created_at");
      return res.json({ goals: data || [] });
    }

    if (action === "log") {
      const days = parseInt(req.query.days) || 30;
      const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
      const { data } = await userClient.from("batcave_fitness_log")
        .select("*").gte("activity_date", since).order("activity_date", { ascending: false });
      return res.json({ log: data || [], days });
    }

    // Default: summary — goals + recent log + stats
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    const [goalsRes, weekLogRes, monthLogRes, todayLogRes] = await Promise.all([
      userClient.from("batcave_fitness_goals").select("*").eq("status", "active").order("created_at"),
      userClient.from("batcave_fitness_log").select("*").gte("activity_date", weekAgo).order("activity_date", { ascending: false }),
      userClient.from("batcave_fitness_log").select("*").gte("activity_date", monthAgo),
      userClient.from("batcave_fitness_log").select("*").eq("activity_date", today),
    ]);

    const goals = goalsRes.data || [];
    const weekLog = weekLogRes.data || [];
    const monthLog = monthLogRes.data || [];
    const todayLog = todayLogRes.data || [];

    // Calculate goal progress
    const goalProgress = goals.map(g => {
      let periodLog;
      if (g.target_period === "day") periodLog = todayLog;
      else if (g.target_period === "week") periodLog = weekLog;
      else periodLog = monthLog;

      const relevant = periodLog.filter(l => !g.id || l.goal_id === g.id || g.category === l.activity_type);
      let current = 0;
      if (g.target_type === "frequency") current = relevant.length;
      else if (g.target_type === "duration") current = relevant.reduce((s, l) => s + (l.duration_minutes || 0), 0);
      else if (g.target_type === "distance") current = relevant.reduce((s, l) => s + parseFloat(l.distance_miles || 0), 0);

      const pct = g.target_value > 0 ? Math.min(100, Math.round((current / g.target_value) * 100)) : 0;
      return { ...g, current, pct, met: pct >= 100 };
    });

    // Streak calc for daily goals
    for (const gp of goalProgress) {
      if (gp.target_period === "day") {
        let streak = 0;
        const d = new Date();
        for (let i = 0; i < 60; i++) {
          const dateStr = d.toISOString().slice(0, 10);
          const dayLogs = monthLog.filter(l => l.activity_date === dateStr && (l.goal_id === gp.id || gp.category === l.activity_type));
          if (dayLogs.length > 0) { streak++; d.setDate(d.getDate() - 1); }
          else if (i === 0) { d.setDate(d.getDate() - 1); continue; } // today might not be done yet
          else break;
        }
        gp.streak_current = streak;
      }
    }

    const stats = {
      today: todayLog.length,
      thisWeek: weekLog.length,
      thisMonth: monthLog.length,
      totalMinutes: monthLog.reduce((s, l) => s + (l.duration_minutes || 0), 0),
      totalMiles: monthLog.reduce((s, l) => s + parseFloat(l.distance_miles || 0), 0).toFixed(1),
      loggedToday: todayLog.length > 0,
    };

    return res.json({ goals: goalProgress, recentLog: weekLog.slice(0, 10), stats, today });
  }

  // ─── POST ─────────────────────────────────────────────────
  if (req.method === "POST") {
    const body = req.body || {};

    if (body.action === "create_goal") {
      const { data, error } = await userClient.from("batcave_fitness_goals").insert({
        user_id: user.id,
        title: body.title,
        category: body.category || "cardio",
        target_type: body.target_type || "frequency",
        target_value: body.target_value || 1,
        target_unit: body.target_unit || "sessions",
        target_period: body.target_period || "week",
      }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ goal: data });
    }

    if (body.action === "update_goal") {
      const { data, error } = await userClient.from("batcave_fitness_goals")
        .update({ title: body.title, target_value: body.target_value, target_unit: body.target_unit, target_period: body.target_period, status: body.status, updated_at: new Date().toISOString() })
        .eq("id", body.id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ goal: data });
    }

    if (body.action === "log_activity") {
      const { data, error } = await userClient.from("batcave_fitness_log").insert({
        user_id: user.id,
        goal_id: body.goal_id || null,
        activity_type: body.activity_type || "run",
        title: body.title || null,
        duration_minutes: body.duration_minutes || null,
        distance_miles: body.distance_miles || null,
        calories: body.calories || null,
        source: body.source || "manual",
        activity_date: body.activity_date || new Date().toISOString().slice(0, 10),
        notes: body.notes || null,
      }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ entry: data });
    }

    if (body.action === "delete_log") {
      await userClient.from("batcave_fitness_log").delete().eq("id", body.id);
      return res.json({ deleted: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).json({ error: "GET or POST" });
}
