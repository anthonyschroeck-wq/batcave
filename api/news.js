import { getSecret } from "./_supabase.js";

export default async function handler(req, res) {
  const token = (await getSecret("finnhub")) || process.env.FINNHUB_API_KEY;
  if (!token) return res.status(503).json({ error: "Finnhub not connected" });

  const { category = "general" } = req.query;
  const allowed = ["general", "forex", "crypto", "merger"];
  const cat = allowed.includes(category) ? category : "general";

  try {
    const resp = await fetch(`https://finnhub.io/api/v1/news?category=${cat}&token=${token}`);
    if (!resp.ok) throw new Error(`Finnhub returned ${resp.status}`);
    const articles = await resp.json();

    const trimmed = (articles || []).slice(0, 20).map((a) => ({
      id: a.id, headline: a.headline, summary: a.summary?.slice(0, 200),
      source: a.source, url: a.url, image: a.image,
      category: a.category, datetime: a.datetime,
    }));

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
    res.json({ articles: trimmed, category: cat, timestamp: Date.now() });
  } catch {
    res.status(500).json({ error: "News fetch failed" });
  }
}
