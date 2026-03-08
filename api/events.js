import { getUserClient } from "./_supabase.js";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const jwt = authHeader.slice(7);
  const supabase = getUserClient(jwt);
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  // GET — list events (optionally filter by date range)
  if (req.method === "GET") {
    const { from, to } = req.query;
    let query = supabase.from("batcave_events").select("*").order("start_date", { ascending: true });
    if (from) query = query.gte("start_date", from);
    if (to) query = query.lte("start_date", to);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ events: data });
  }

  // POST — create event
  if (req.method === "POST") {
    const { title, start_date, end_date, all_day, start_time, end_time, category, location, notes, color } = req.body || {};
    if (!title || !start_date) return res.status(400).json({ error: "Title and start_date required" });
    const { data, error } = await supabase
      .from("batcave_events")
      .insert({
        title, start_date, end_date: end_date || start_date,
        all_day: all_day !== false, start_time: start_time || null, end_time: end_time || null,
        category: category || "personal", location: location || null,
        notes: notes || null, color: color || null,
      })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ event: data });
  }

  // PATCH — update event
  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) return res.status(400).json({ error: "Event id required" });
    const { data, error } = await supabase
      .from("batcave_events").update(updates).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ event: data });
  }

  // DELETE
  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "Event id required" });
    const { error } = await supabase.from("batcave_events").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
