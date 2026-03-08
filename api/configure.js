import { getUserClient } from "./_supabase.js";

const VALIDATORS = {
  finnhub: async (key) => {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${key}`);
    if (!r.ok) return false;
    const d = await r.json();
    return typeof d.c === "number" && d.c > 0;
  },
  github: async (key) => {
    const r = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${key}` },
    });
    return r.ok;
  },
  anthropic: async (key) => {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    return r.ok;
  },
};

const SERVICE_LABELS = { finnhub: "Finnhub", github: "GitHub", anthropic: "Anthropic" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const jwt = authHeader.slice(7);

  const { service, key } = req.body || {};
  if (!service || !key) return res.status(400).json({ error: "Missing service or key" });

  const validator = VALIDATORS[service];
  if (!validator) return res.status(400).json({ error: `Unknown service: ${service}` });

  try {
    const valid = await validator(key);
    if (!valid) return res.status(400).json({ error: "Invalid API key — validation failed" });
  } catch {
    return res.status(400).json({ error: "Key validation request failed" });
  }

  const supabase = getUserClient(jwt);
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const { error } = await supabase
    .from("batcave_secrets")
    .upsert(
      { service_id: service, api_key: key, label: SERVICE_LABELS[service] || service },
      { onConflict: "service_id" }
    );

  if (error) return res.status(500).json({ error: "Failed to save key", detail: error.message });

  res.json({ ok: true, service, message: "Key validated and saved." });
}
