import { getServiceClient } from "./_supabase.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const services = {
    github: { connected: false, label: "GitHub" },
    finnhub: { connected: false, label: "Finnhub" },
    anthropic: { connected: false, label: "Anthropic" },
    gmail: { connected: false, label: "Gmail" },
    gcal: { connected: false, label: "Google Calendar" },
  };

  const supabase = getServiceClient();
  if (supabase) {
    const { data } = await supabase.from("batcave_secrets").select("service_id");
    if (data) {
      for (const row of data) {
        if (services[row.service_id]) services[row.service_id].connected = true;
      }
    }
    services.supabase = { connected: true, label: "Supabase" };
  } else {
    services.supabase = { connected: false, label: "Supabase" };
  }

  res.json(services);
}
