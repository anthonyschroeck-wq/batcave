export default async function handler(req, res) {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return res.status(503).json({ error: "Vercel not connected" });

  const { projectId, teamId, limit = "3" } = req.query;
  if (!projectId || !teamId) return res.status(400).json({ error: "Missing projectId or teamId" });

  try {
    const url = `https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=${limit}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(response.status).json(data);
  } catch {
    res.status(500).json({ error: "Vercel API request failed" });
  }
}
