// Configure integration — validate key, persist as Vercel env var, redeploy
const VERCEL_PROJECT_ID = "prj_5o6SPKonQDOvMgaK1A5vTrUy5ACh";
const VERCEL_TEAM_ID = "team_KhfsGH2C6La9tyHfxicteccL";

// Service definitions: env key name + validation endpoint
const SERVICES = {
  finnhub: {
    envKey: "FINNHUB_API_KEY",
    validate: async (key) => {
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${key}`);
      if (!r.ok) return false;
      const d = await r.json();
      return typeof d.c === "number" && d.c > 0;
    },
    signupUrl: "https://finnhub.io/register",
    keyUrl: "https://finnhub.io/dashboard",
  },
  github: {
    envKey: "GH_TOKEN",
    validate: async (key) => {
      const r = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${key}` },
      });
      return r.ok;
    },
    signupUrl: "https://github.com/settings/personal-access-tokens/new",
    keyUrl: "https://github.com/settings/personal-access-tokens",
  },
  vercel_token: {
    envKey: "VERCEL_API_TOKEN",
    validate: async (key) => {
      const r = await fetch("https://api.vercel.com/v2/user", {
        headers: { Authorization: `Bearer ${key}` },
      });
      return r.ok;
    },
    signupUrl: "https://vercel.com/account/tokens",
    keyUrl: "https://vercel.com/account/tokens",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const vercelToken = process.env.VERCEL_API_TOKEN;
  if (!vercelToken) return res.status(503).json({ error: "Vercel API token not configured. Set VERCEL_API_TOKEN first." });

  const { service, key } = req.body || {};
  if (!service || !key) return res.status(400).json({ error: "Missing service or key" });

  const svc = SERVICES[service];
  if (!svc) return res.status(400).json({ error: `Unknown service: ${service}` });

  // 1. Validate the key against the real API
  try {
    const valid = await svc.validate(key);
    if (!valid) return res.status(400).json({ error: "Invalid key — validation failed", step: "validate" });
  } catch (err) {
    return res.status(400).json({ error: "Key validation request failed", step: "validate" });
  }

  // 2. Check if env var already exists
  try {
    const existing = await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    );
    const data = await existing.json();
    const found = (data.envs || []).find((e) => e.key === svc.envKey);

    if (found) {
      // Update existing
      const update = await fetch(
        `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env/${found.id}?teamId=${VERCEL_TEAM_ID}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ value: key }),
        }
      );
      if (!update.ok) {
        const err = await update.text();
        return res.status(500).json({ error: "Failed to update env var", detail: err, step: "env" });
      }
    } else {
      // Create new
      const create = await fetch(
        `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env?teamId=${VERCEL_TEAM_ID}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            key: svc.envKey,
            value: key,
            type: "encrypted",
            target: ["production", "preview", "development"],
          }),
        }
      );
      if (!create.ok) {
        const err = await create.text();
        return res.status(500).json({ error: "Failed to create env var", detail: err, step: "env" });
      }
    }
  } catch (err) {
    return res.status(500).json({ error: "Env var operation failed", step: "env" });
  }

  // 3. Trigger redeploy
  try {
    // Get latest production deployment
    const deps = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&teamId=${VERCEL_TEAM_ID}&limit=1&target=production`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    );
    const depData = await deps.json();
    const latest = depData.deployments?.[0];

    if (latest) {
      await fetch(
        `https://api.vercel.com/v13/deployments?teamId=${VERCEL_TEAM_ID}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "batcave",
            deploymentId: latest.id,
            target: "production",
          }),
        }
      );
    }
  } catch {
    // Redeploy is best-effort — env var is already saved
  }

  res.json({ ok: true, service, envKey: svc.envKey, message: "Key validated, saved, and redeploy triggered." });
}
