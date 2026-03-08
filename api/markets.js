export default async function handler(req, res) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) return res.status(503).json({ error: "Finnhub not connected" });

  // Major indices via their ETF proxies (Finnhub free tier uses these)
  const symbols = [
    { symbol: "SPY", label: "S&P 500", id: "sp500" },
    { symbol: "QQQ", label: "NASDAQ", id: "nasdaq" },
    { symbol: "DIA", label: "DOW", id: "dow" },
  ];

  try {
    const results = await Promise.all(
      symbols.map(async ({ symbol, label, id }) => {
        const resp = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`
        );
        if (!resp.ok) return { id, label, symbol, error: true };
        const d = await resp.json();
        return {
          id,
          label,
          symbol,
          price: d.c,       // current
          change: d.d,      // change
          changePct: d.dp,  // change percent
          high: d.h,        // high
          low: d.l,         // low
          open: d.o,        // open
          prevClose: d.pc,  // previous close
        };
      })
    );

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.json({ indices: results, timestamp: Date.now() });
  } catch (err) {
    res.status(500).json({ error: "Market data fetch failed" });
  }
}
