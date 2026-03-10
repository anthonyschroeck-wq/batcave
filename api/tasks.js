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
    const { title, priority, due_date, notes, recurrence } = req.body || {};
    if (!title) return res.status(400).json({ error: "Title required" });
    const recurrenceGroup = recurrence ? crypto.randomUUID() : null;
    const { data, error } = await supabase
      .from("batcave_tasks")
      .insert({ title, priority: priority || "medium", due_date: due_date || null, notes: notes || null, recurrence: recurrence || null, recurrence_group: recurrenceGroup })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ task: data });
  }

  // PATCH — update task (auto-spawn next occurrence for recurring tasks)
  if (req.method === "PATCH") {
    const { id, ...updates } = req.body || {};
    if (!id) return res.status(400).json({ error: "Task id required" });

    // If completing a recurring task, spawn the next occurrence
    if (updates.completed === true) {
      const { data: existing } = await supabase.from("batcave_tasks").select("*").eq("id", id).single();
      if (existing?.recurrence) {
        const nextDate = new Date(existing.due_date || new Date());
        if (existing.recurrence === "daily") nextDate.setDate(nextDate.getDate() + 1);
        else if (existing.recurrence === "weekly") nextDate.setDate(nextDate.getDate() + 7);

        await supabase.from("batcave_tasks").insert({
          title: existing.title,
          priority: existing.priority,
          due_date: nextDate.toISOString().slice(0, 10),
          recurrence: existing.recurrence,
          recurrence_group: existing.recurrence_group,
          notes: existing.notes,
        });
      }
    }

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
