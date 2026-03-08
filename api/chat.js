import { getSecret, getUserClient } from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const apiKey = await getSecret("anthropic");
  if (!apiKey) return res.status(503).json({ error: "Anthropic API key not connected. Add it in Integrations." });

  const { message, context } = req.body || {};
  if (!message) return res.status(400).json({ error: "Message required" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are the Batcave assistant — a concise, senior engineering partner. You help manage tasks, projects, and operations. When asked to create tasks, respond with structured JSON in a code block. Current context: ${context || "none"}`,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: "Anthropic API error", detail: err });
    }

    const data = await response.json();
    const text = data.content?.map(c => c.text || "").join("") || "";
    res.json({ response: text });
  } catch (err) {
    res.status(500).json({ error: "Chat request failed" });
  }
}
