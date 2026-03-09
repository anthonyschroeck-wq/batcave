import { getSecret } from "./_supabase.js";

export default async function handler(req, res) {
  const token = (await getSecret("finnhub")) || process.env.FINNHUB_API_KEY;
  if (!token) return res.status(503).json({ error: "Finnhub not connected" });

  const action = req.query.action || "markets";

  // News
  if (action === "news") {
    const { category = "general" } = req.query;
    const allowed = ["general", "forex", "crypto", "merger"];
    const cat = allowed.includes(category) ? category : "general";
    try {
      const resp = await fetch(`https://finnhub.io/api/v1/news?category=${cat}&token=${token}`);
      if (!resp.ok) throw new Error(`Finnhub ${resp.status}`);
      const articles = await resp.json();
      const trimmed = (articles || []).slice(0, 20).map(a => ({
        id: a.id, headline: a.headline, summary: a.summary?.slice(0, 200),
        source: a.source, url: a.url, image: a.image, category: a.category, datetime: a.datetime,
      }));
      res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
      return res.json({ articles: trimmed, category: cat, timestamp: Date.now() });
    } catch { return res.status(500).json({ error: "News fetch failed" }); }
  }

  // Markets (default)
  const symbols = [
    { symbol: "SPY", label: "S&P 500", id: "sp500" },
    { symbol: "QQQ", label: "NASDAQ", id: "nasdaq" },
    { symbol: "DIA", label: "DOW", id: "dow" },
  ];
  try {
    const results = await Promise.all(symbols.map(async ({ symbol, label, id }) => {
      const resp = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`);
      if (!resp.ok) return { id, label, symbol, error: true };
      const d = await resp.json();
      return { id, label, symbol, price: d.c, change: d.d, changePct: d.dp, high: d.h, low: d.l, open: d.o, prevClose: d.pc };
    }));
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.json({ indices: results, timestamp: Date.now() });
  } catch { res.status(500).json({ error: "Market data fetch failed" }); }
}
