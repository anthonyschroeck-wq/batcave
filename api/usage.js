import { getServiceClient } from "./_supabase.js";

export default async function handler(req, res) {
  const supabase = getServiceClient();
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [monthRes, todayRes, recentRes] = await Promise.all([
    supabase.from("batcave_usage").select("input_tokens, output_tokens, cost_cents, endpoint")
      .gte("created_at", monthStart),
    supabase.from("batcave_usage").select("input_tokens, output_tokens, cost_cents, endpoint")
      .gte("created_at", todayStart),
    supabase.from("batcave_usage").select("*")
      .order("created_at", { ascending: false }).limit(20),
  ]);

  const sum = (arr) => ({
    calls: arr.length,
    inputTokens: arr.reduce((s, u) => s + (u.input_tokens || 0), 0),
    outputTokens: arr.reduce((s, u) => s + (u.output_tokens || 0), 0),
    costCents: arr.reduce((s, u) => s + parseFloat(u.cost_cents || 0), 0),
  });

  const monthData = monthRes.data || [];
  const todayData = todayRes.data || [];

  // Breakdown by endpoint
  const byEndpoint = {};
  for (const u of monthData) {
    const ep = u.endpoint || "unknown";
    if (!byEndpoint[ep]) byEndpoint[ep] = [];
    byEndpoint[ep].push(u);
  }

  res.setHeader("Cache-Control", "no-store");
  res.json({
    month: { ...sum(monthData), label: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
    today: sum(todayData),
    byEndpoint: Object.fromEntries(Object.entries(byEndpoint).map(([k, v]) => [k, sum(v)])),
    recent: (recentRes.data || []).map(u => ({
      endpoint: u.endpoint, model: u.model,
      inputTokens: u.input_tokens, outputTokens: u.output_tokens,
      costCents: parseFloat(u.cost_cents || 0),
      time: u.created_at,
    })),
  });
}
