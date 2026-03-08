import { getUserClient } from "./_supabase.js";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const jwt = authHeader.slice(7);
  const supabase = getUserClient(jwt);
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  // GET — list tasks
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("batcave_tasks")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("priority", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ tasks: data });
  }

  // POST — create task
  if (req.method === "POST") {
    const { title, priority, due_date, notes } = req.body || {};
    if (!title) return res.status(400).json({ error: "Title required" });
    const { data, error } = await supabase
      .from("batcave_tasks")
      .insert({ title, priority: priority || "medium", due_date: due_date || null, notes: notes || null })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ task: data });
  }

  // PATCH — update task
  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) return res.status(400).json({ error: "Task id required" });
    const { data, error } = await supabase
      .from("batcave_tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ task: data });
  }

  // DELETE — delete task
  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "Task id required" });
    const { error } = await supabase
      .from("batcave_tasks")
      .delete()
      .eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
