import { getServiceClient, getUserClient, getSecret } from "./_supabase.js";

// ─── Strava token refresh ─────────────────────────────────────
async function getStravaToken(supabase) {
  const accessToken = await getSecret("strava_access_token");
  const refreshToken = await getSecret("strava_refresh_token");
  const clientId = await getSecret("strava_client_id");
  const clientSecret = await getSecret("strava_client_secret");

  if (!refreshToken || !clientId || !clientSecret) return null;

  // Try existing token first — refresh if expired
  if (accessToken) {
    // Test it
    const test = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (test.ok) return accessToken;
  }

  // Refresh the token
  try {
    const resp = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId, client_secret: clientSecret,
        refresh_token: refreshToken, grant_type: "refresh_token",
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();

    // Save new tokens
    await supabase.from("batcave_secrets").upsert(
      { service_id: "strava_access_token", api_key: data.access_token, label: "Strava Access Token" },
      { onConflict: "service_id" }
    );
    if (data.refresh_token) {
      await supabase.from("batcave_secrets").upsert(
        { service_id: "strava_refresh_token", api_key: data.refresh_token, label: "Strava Refresh Token" },
        { onConflict: "service_id" }
      );
    }
    return data.access_token;
  } catch { return null; }
}

export default async function handler(req, res) {
  const supabase = getServiceClient();
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const action = req.query.action;

  // ─── Strava Webhook (no auth — Strava calls this directly) ──
  if (action === "strava_webhook") {
    // GET = subscription verification
    if (req.method === "GET") {
      const VERIFY_TOKEN = "batcave_strava_verify";
      if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === VERIFY_TOKEN) {
        return res.json({ "hub.challenge": req.query["hub.challenge"] });
      }
      return res.status(403).json({ error: "Verification failed" });
    }

    // POST = activity event
    if (req.method === "POST") {
      const { object_type, aspect_type, object_id } = req.body || {};
      if (object_type !== "activity" || aspect_type !== "create") {
        return res.json({ ok: true, skipped: true });
      }

      // Fetch activity details from Strava
      const token = await getStravaToken(supabase);
      if (!token) return res.json({ ok: false, error: "No Strava token" });

      try {
        const actResp = await fetch(`https://www.strava.com/api/v3/activities/${object_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!actResp.ok) return res.json({ ok: false, error: `Strava API ${actResp.status}` });
        const act = await actResp.json();

        // Map Strava activity to our schema
        const typeMap = { Run: "run", Ride: "cycle", Walk: "walk", Swim: "swim", WeightTraining: "strength", Yoga: "yoga" };
        const actType = typeMap[act.type] || "other";
        const durationMin = Math.round((act.moving_time || 0) / 60);
        const distanceMi = act.distance ? parseFloat((act.distance / 1609.34).toFixed(2)) : null;
        const calories = act.calories || null;
        const actDate = act.start_date_local ? act.start_date_local.slice(0, 10) : new Date().toISOString().slice(0, 10);

        // Find the user (single-user app — get the first user with fitness data or first user)
        let userId = null;
        try {
          const { data: users } = await supabase.from("batcave_fitness_goals").select("user_id").limit(1);
          userId = users?.[0]?.user_id;
        } catch {}
        if (!userId) {
          try {
            const { data: users } = await supabase.from("batcave_tasks").select("user_id").limit(1);
            userId = users?.[0]?.user_id;
          } catch {}
        }

        if (userId) {
          await supabase.from("batcave_fitness_log").insert({
            user_id: userId,
            activity_type: actType,
            title: act.name || `${act.type} via Strava`,
            duration_minutes: durationMin,
            distance_miles: distanceMi,
            calories,
            source: "strava",
            activity_date: actDate,
            notes: `strava:${object_id}`,
          });
        }

        return res.json({ ok: true, logged: act.name });
      } catch (err) {
        return res.json({ ok: false, error: err.message });
      }
    }
    return res.status(405).json({ error: "GET or POST" });
  }

  // ─── Authenticated endpoints below ─────────────────────────
  const jwt = req.headers.authorization?.replace("Bearer ", "");
  const userClient = jwt ? getUserClient(jwt) : null;
  if (!userClient) return res.status(401).json({ error: "Auth required" });

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const authAction = action || (req.method === "GET" ? "summary" : null);

  // ─── GET ──────────────────────────────────────────────────
  if (req.method === "GET") {
    if (authAction === "goals") {
      const { data } = await userClient.from("batcave_fitness_goals").select("*").order("created_at");
      return res.json({ goals: data || [] });
    }

    if (authAction === "log") {
      const days = parseInt(req.query.days) || 30;
      const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
      const { data } = await userClient.from("batcave_fitness_log")
        .select("*").gte("activity_date", since).order("activity_date", { ascending: false });
      return res.json({ log: data || [], days });
    }

    if (authAction === "weight") {
      const days = parseInt(req.query.days) || 90;
      const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
      const { data } = await userClient.from("batcave_weight_log")
        .select("*").gte("logged_date", since).order("logged_date", { ascending: true });
      return res.json({ weight: data || [], days });
    }

    // Default: summary — goals + recent log + stats + weight trend
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const ninetyAgo = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);

    // Each query wrapped individually — one failure can't kill the whole endpoint
    let goals = [], weekLog = [], monthLog = [], todayLog = [], weightData = [];
    try { const r = await userClient.from("batcave_fitness_goals").select("*").eq("status", "active").order("created_at"); goals = r.data || []; } catch {}
    try { const r = await userClient.from("batcave_fitness_log").select("*").gte("activity_date", weekAgo).order("activity_date", { ascending: false }); weekLog = r.data || []; } catch {}
    try { const r = await userClient.from("batcave_fitness_log").select("*").gte("activity_date", monthAgo); monthLog = r.data || []; } catch {}
    try { const r = await userClient.from("batcave_fitness_log").select("*").eq("activity_date", today); todayLog = r.data || []; } catch {}
    try { const r = await userClient.from("batcave_weight_log").select("*").gte("logged_date", ninetyAgo).order("logged_date", { ascending: true }); weightData = r.data || []; } catch {}

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

    // Weight trend
    const latestWeight = weightData.length > 0 ? weightData[weightData.length - 1] : null;
    const weightTrend = weightData.map(w => ({ date: w.logged_date, lbs: parseFloat(w.weight_lbs) }));

    return res.json({ goals: goalProgress, recentLog: weekLog.slice(0, 10), stats, today, weight: { latest: latestWeight, trend: weightTrend, count: weightData.length } });
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

    if (body.action === "log_weight") {
      if (!body.weight_lbs) return res.status(400).json({ error: "weight_lbs required" });
      const { data, error } = await userClient.from("batcave_weight_log").insert({
        user_id: user.id,
        weight_lbs: parseFloat(body.weight_lbs),
        notes: body.notes || null,
        logged_date: body.logged_date || new Date().toISOString().slice(0, 10),
      }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ entry: data });
    }

    if (body.action === "delete_weight") {
      await userClient.from("batcave_weight_log").delete().eq("id", body.id);
      return res.json({ deleted: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).json({ error: "GET or POST" });
}
