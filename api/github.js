import { getSecret } from "./_supabase.js";

export default async function handler(req, res) {
  // Supabase first, then env var fallback
  const token = (await getSecret("github")) || process.env.GH_TOKEN;
  if (!token) return res.status(503).json({ error: "GitHub not connected" });

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path parameter" });

  const allowed = /^repos\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/(commits|branches|contents)/;
  if (!allowed.test(path)) return res.status(403).json({ error: "Endpoint not allowed" });

  try {
    const response = await fetch(`https://api.github.com/${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(response.status).json(data);
  } catch {
    res.status(500).json({ error: "GitHub API request failed" });
  }
}
