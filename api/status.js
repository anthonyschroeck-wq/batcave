export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    github: { connected: !!process.env.GH_TOKEN, label: "GitHub" },
    vercel: { connected: !!process.env.VERCEL_API_TOKEN, label: "Vercel" },
    gmail: { connected: !!process.env.GMAIL_TOKEN, label: "Gmail" },
    gcal: { connected: !!process.env.GCAL_TOKEN, label: "Google Calendar" },
  });
}
