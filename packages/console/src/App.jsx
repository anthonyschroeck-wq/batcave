import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════════
// BATCAVE CONSOLE v2.8 — Supabase Auth + Secrets
// ═══════════════════════════════════════════════════════════════════

// ─── Supabase Client ─────────────────────────────────────────────
let supabase = null;
const _supaUrl = import.meta.env.VITE_SUPABASE_URL || "";
const _supaKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
if (_supaUrl && _supaKey) {
  supabase = createClient(_supaUrl, _supaKey);
}

// ─── Auth Hook ───────────────────────────────────────────────────
function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    }).catch(() => setLoading(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error;
    } catch (e) {
      return { message: e?.message || "Sign in failed" };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error };
      const needsConfirmation = !data.session;
      return { error: null, needsConfirmation };
    } catch (e) {
      return { error: { message: e?.message || "Sign up failed" } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return { session, loading, signIn, signUp, signOut };
}

// ─── Brand Tokens ────────────────────────────────────────────────
const C = {
  obsidian: "#111115",
  cavern: "#1a1a20",
  stone: "#252530",
  slate: "#3a3a48",
  iron: "#5a5a6a",
  pewter: "#888898",
  fog: "#b0b0bc",
  parchment: "#e8e4db",
  cream: "#f5f1e8",
  amber: "#7B8FA3",
  amberLight: "#92A5B8",
  amberGlow: "rgba(123, 143, 163, 0.14)",
  amberSubtle: "rgba(123, 143, 163, 0.07)",
  embers: "#6A7F94",
  success: "#5a8a6a",
  caution: "#b89040",
  danger: "#9a4a4a", overdue: "#D4721A",
  // Depth palette — for ambient effects
  void: "#0a0a0e",
  abyss: "#0e0e14",
  dusk: "rgba(123, 143, 163, 0.06)",
  aurora: "rgba(123, 143, 163, 0.03)",
  glint: "rgba(245, 241, 232, 0.04)",
};

const F = {
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Source Serif 4', Georgia, serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
  sans: "'Source Sans 3', 'Helvetica Neue', sans-serif",
};

// ─── Mobile Hook ─────────────────────────────────────────────────
function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

// ─── Manifest (enriched with git + vercel data) ─────────────────
const manifest = {
  projects: [
    {
      slug: "console", name: "Batcave Console", status: "active", type: "app", migrated: true,
      notes: "Dashboard UI — the Batcave itself",
      repo: "anthonyschroeck-wq/batcave",
      version: "v2.3",
      production: { url: "https://batcave-sage.vercel.app", state: "READY" },
      staging: null,
      git: { branch: "main", sha: "cbb0c03", message: "feat: mobile-first console v2.3", date: "2026-03-08" },
      vercel: { inspector: "https://vercel.com/anthonyschroeck-wqs-projects/batcave" },
      github: "https://github.com/anthonyschroeck-wq/batcave",
    },
    {
      slug: "omote", name: "Omote", status: "active", type: "app", migrated: false,
      notes: "Demo stage designer — Supabase backend, JSX sandboxing, multi-cue system",
      repo: "anthonyschroeck-wq/omote",
      version: "mk8.4",
      production: { url: "https://omote-one.vercel.app", state: "READY" },
      staging: { url: "https://omote-one-dev.vercel.app", state: "READY" },
      git: { branch: "main", sha: "ba9f241", message: "Omote mk8.4 — Merge dev to main", date: "2026-03-08" },
      vercel: { inspector: "https://vercel.com/anthonyschroeck-wqs-projects/omote" },
      github: "https://github.com/anthonyschroeck-wq/omote",
    },
    {
      slug: "cerebro", name: "Cerebro", status: "active", type: "app", migrated: false,
      notes: "GTM intelligence dashboard — NL queries, sentiment, trend charts",
      repo: "anthonyschroeck-wq/cerebro",
      version: "mk1.1",
      production: null,
      staging: null,
      git: { branch: "main", sha: "a603815", message: "add three.js types", date: "2026-02-22" },
      vercel: { inspector: "https://vercel.com/anthonyschroeck-wqs-projects/cerebro" },
      github: "https://github.com/anthonyschroeck-wq/cerebro",
    },
    {
      slug: "run-recipes", name: "Run Recipes", status: "active", type: "app", migrated: false,
      notes: "Meal management, sidebar nav, Yes Chef scoring",
      repo: "anthonyschroeck-wq/run-recipes",
      version: null,
      production: null,
      staging: null,
      git: { branch: "main", sha: "36e4456", message: "Update App.jsx", date: "2026-02-27" },
      vercel: { inspector: "https://vercel.com/anthonyschroeck-wqs-projects/run-recipes" },
      github: "https://github.com/anthonyschroeck-wq/run-recipes",
    },
    {
      slug: "veritas", name: "Veritas", status: "incubating", type: "extension", migrated: false,
      notes: "Chrome extension — AI content detection, Manifest V3",
      repo: null, version: null, production: null, staging: null,
      git: null, vercel: null, github: null,
    },
  ],
};

// ─── Integration Registry ────────────────────────────────────────
const INTEGRATIONS = {
  finnhub: { id: "finnhub", label: "Finnhub", desc: "Stock quotes, market news, indices" },
  github: { id: "github", label: "GitHub", desc: "Repo commits, branches, PR status" },
  anthropic: { id: "anthropic", label: "Anthropic", desc: "Command prompt — Claude AI for task and project management" },
  gmail: { id: "gmail", label: "Gmail", desc: "Priority inbox, email threads" },
  gcal: { id: "gcal", label: "Google Calendar", desc: "Daily agenda, scheduling, events" },
};

// Vercel project IDs for live deploy lookup
const VERCEL_IDS = {
  console: "prj_5o6SPKonQDOvMgaK1A5vTrUy5ACh",
  omote: "prj_D9l2XVJoH7yLlkwiqDQ6S7CbfMDV",
  cerebro: "prj_GB9PR30jjMGHZRXXlk2OnK4ivJCM",
  "run-recipes": "prj_PnlNhjWnZJhyiFeG1YqatJCPeUFF",
};

const VERCEL_TEAM = "team_KhfsGH2C6La9tyHfxicteccL";

// ─── Live Data Hook ──────────────────────────────────────────────
function useLiveData() {
  const [status, setStatus] = useState(null);
  const [gitData, setGitData] = useState({});
  const [deployData, setDeployData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Check integration status
      const statusRes = await fetch("/api/status");
      if (!statusRes.ok) throw new Error("Status check failed");
      const st = await statusRes.json();
      setStatus(st);

      // 2. Fetch GitHub data if connected
      if (st.github?.connected) {
        const repos = manifest.projects.filter(p => p.repo).map(p => p.repo);
        const gitResults = {};
        await Promise.all(repos.map(async (repo) => {
          try {
            const res = await fetch(`/api/github?path=repos/${repo}/commits/main`);
            if (res.ok) {
              const d = await res.json();
              gitResults[repo] = {
                sha: d.sha?.slice(0, 7),
                message: d.commit?.message?.split("\n")[0],
                date: d.commit?.author?.date?.slice(0, 10),
                author: d.commit?.author?.name,
              };
            }
          } catch {}
        }));
        setGitData(gitResults);
      }

      // 3. Fetch Vercel data if connected
      if (st.vercel?.connected) {
        const deployResults = {};
        await Promise.all(Object.entries(VERCEL_IDS).map(async ([slug, projId]) => {
          try {
            const res = await fetch(`/api/deployments?projectId=${projId}&teamId=${VERCEL_TEAM}&limit=3`);
            if (res.ok) {
              const d = await res.json();
              const deps = d.deployments || [];
              const prod = deps.find(d => d.target === "production");
              const preview = deps.find(d => d.target !== "production");
              deployResults[slug] = { production: prod, preview };
            }
          } catch {}
        }));
        setDeployData(deployResults);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error("Live data fetch failed:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { status, gitData, deployData, loading, lastRefresh, refresh };
}

// ─── Icons ───────────────────────────────────────────────────────
const I = {
  command: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8V6a2 2 0 0 1 2-2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2-2v-2" />
      <circle cx="12" cy="12" r="2" /><path d="M12 8v2" /><path d="M12 14v2" /><path d="M8 12h2" /><path d="M14 12h2" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  workspace: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M17.5 14v7" /><path d="M14 17.5h7" />
    </svg>
  ),
  agent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  signal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" /><path d="M8 20v-6" /><path d="M16 20v-8" /><path d="M4 20v-2" /><path d="M20 20v-4" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  ),
  fitness: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="17" cy="4" r="2"/>
      <path d="M15 21l-3-6-4 3-3-4"/>
      <path d="M19 13l-2-3-5 3"/>
    </svg>
  ),
  voice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11c0 3.9 3.1 7 7 7s7-3.1 7-7" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2m0 14v2M3 12h2m14 0h2" />
      <path d="M5.6 5.6l1.4 1.4m9.9 9.9l1.4 1.4M5.6 18.4l1.4-1.4m9.9-9.9l1.4-1.4" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6" /><path d="M15.5 15.5L20 20" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
  deploy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" /><path d="M8 11l4 4 4-4" />
      <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
    </svg>
  ),
  external: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l-8 4 8 4 8-4-8-4z" /><path d="M4 12l8 4 8-4" /><path d="M4 16l8 4 8-4" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" /><path d="M6 6l12 12" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l9-8 9 8" /><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  ),
  bat: (
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M24 8 L8 28 L14 26 L18 32 L22 24 L24 30 L26 24 L30 32 L34 26 L40 28 L24 8Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="38" x2="36" y2="38" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    </svg>
  ),
};

const statusConfig = {
  active: { label: "Active", color: C.success },
  incubating: { label: "Incubating", color: C.caution },
  archived: { label: "Archived", color: C.iron },
  migrating: { label: "Migrating", color: C.amberLight },
};

const typeLabels = { app: "APP", poc: "POC", extension: "EXT", library: "LIB" };

// ─── Login Screen ────────────────────────────────────────────────
function LoginScreen({ onLogin, isMobile }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // login | signup
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        const err = await onLogin.signIn(email, password);
        setLoading(false);
        if (err) setError(err.message);
      } else {
        const result = await onLogin.signUp(email, password);
        setLoading(false);
        if (result && result.error) {
          setError(result.error.message);
        } else if (result && result.needsConfirmation) {
          setSuccess("Account created. Check your email to confirm, then sign in.");
          setMode("login");
        }
      }
    } catch (e) {
      setLoading(false);
      setError("Error: " + (e?.message || String(e)));
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(17, 17, 21, 0.6)",
    border: "1px solid rgba(60, 60, 80, 0.3)",
    borderRadius: "8px", padding: isMobile ? "14px 16px" : "12px 16px",
    fontFamily: F.sans, fontSize: isMobile ? "16px" : "14px",
    color: C.parchment, outline: "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #080810 0%, #0c0c14 25%, #111118 50%, #0e0e16 75%, #0a0a12 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      fontFamily: F.sans, WebkitFontSmoothing: "antialiased",
      position: "relative", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${C.amber}; color: ${C.obsidian}; }
        input::placeholder { color: ${C.iron}; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loginOrb {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          33% { transform: translate(10%, -5%) scale(1.1); opacity: 0.8; }
          66% { transform: translate(-5%, 8%) scale(0.9); opacity: 0.5; }
        }
        @keyframes loginPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Subtle accent line */}
      <div style={{
        position: "absolute", top: "35%", left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(123,143,163,0.1), transparent)",
      }} />

      <div style={{
        width: "100%", maxWidth: "380px", position: "relative", zIndex: 1,
        animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            width: "56px", height: "56px", color: C.amber, margin: "0 auto 20px",
            filter: "drop-shadow(0 0 16px rgba(123,143,163,0.25))",
            animation: "fadeUp 0.6s ease 0.1s both",
          }}>{I.bat}</div>
          <div style={{
            fontFamily: F.display, fontSize: "38px", color: C.cream, marginBottom: "8px",
            letterSpacing: "-0.02em", fontWeight: 300,
            animation: "fadeUp 0.6s ease 0.2s both",
          }}>Batcave</div>
          <div style={{
            fontFamily: F.mono, fontSize: "9px", letterSpacing: "0.2em",
            textTransform: "uppercase", color: C.iron,
            animation: "fadeUp 0.6s ease 0.3s both",
          }}>Command Center</div>
        </div>

        {/* Form */}
        <div style={{
          background: "rgba(22, 22, 30, 0.75)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(16px) saturate(120%)",
          border: "1px solid rgba(60, 60, 80, 0.3)",
          borderRadius: "12px",
          padding: isMobile ? "28px 22px" : "32px 28px",
          position: "relative", overflow: "hidden",
          animation: "fadeUp 0.6s ease 0.35s both",
        }}>
          {/* Top glow */}
          <div style={{
            position: "absolute", top: 0, left: "15%", right: "15%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(123,143,163,0.5), transparent)",
          }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = C.amber}
              onBlur={e => e.currentTarget.style.borderColor = C.slate}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = C.amber}
              onBlur={e => e.currentTarget.style.borderColor = C.slate}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {error && (
            <div style={{
              padding: "8px 12px", borderRadius: "4px", marginBottom: "12px",
              backgroundColor: "rgba(154,74,74,0.1)", border: "1px solid rgba(154,74,74,0.2)",
              fontFamily: F.sans, fontSize: "12px", color: C.danger,
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              padding: "8px 12px", borderRadius: "4px", marginBottom: "12px",
              backgroundColor: "rgba(90,138,106,0.1)", border: "1px solid rgba(90,138,106,0.2)",
              fontFamily: F.sans, fontSize: "12px", color: C.success,
            }}>{success}</div>
          )}

          <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
            width: "100%",
            background: loading || !email || !password ? C.stone : `linear-gradient(135deg, ${C.amber}, ${C.embers})`,
            border: "none", borderRadius: "8px",
            padding: isMobile ? "14px" : "12px",
            fontFamily: F.mono, fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: loading || !email || !password ? C.iron : C.obsidian,
            cursor: loading || !email || !password ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: loading || !email || !password ? "none" : "0 2px 16px rgba(123,143,163,0.12)",
          }}>
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: F.sans, fontSize: "12px", color: C.iron,
              }}>
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Command Bar ─────────────────────────────────────────────────
function CommandBar({ onClose, isMobile, session, onAction }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const connected = !!session?.access_token;

  const send = async () => {
    if (!input.trim() || loading || !connected) return;
    const msg = input.trim();
    setInput("");
    setLoading(true);
    setResponse(null);
    setActions([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
        setActions(data.actions || []);
        if (data.actions?.some(a => a.ok)) onAction?.();
      } else {
        setResponse(data.error || "Request failed");
      }
    } catch {
      setResponse("Network error");
    }
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(6,6,10,0.82)",
      backdropFilter: "blur(16px) saturate(120%)",
      display: "flex", alignItems: "flex-start",
      justifyContent: "center", paddingTop: isMobile ? "10vh" : "16vh",
      padding: isMobile ? "10vh 16px 0" : undefined,
      zIndex: 200, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "560px", position: "relative",
        backgroundColor: C.cavern,
        border: `1px solid ${C.slate}`,
        borderRadius: "12px", overflow: "hidden",
        boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(60,60,80,0.2)`,
        animation: "slideUp 0.25s cubic-bezier(0.22,1,0.36,1)",
      }}>
        {/* Top glow bar */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
          background: `linear-gradient(90deg, transparent, ${C.amber}40, transparent)`,
          backgroundSize: "200% 100%",
          animation: "borderFlow 4s ease infinite",
        }} />

        {/* Input */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: isMobile ? "18px 16px" : "16px 20px",
          borderBottom: `1px solid ${C.stone}`,
        }}>
          <div style={{
            width: "18px", height: "18px", flexShrink: 0,
            color: loading ? C.caution : C.amber,
            filter: loading ? "none" : "drop-shadow(0 0 4px rgba(123,143,163,0.2))",
            transition: "filter 0.3s ease",
          }}>{I.bell}</div>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={connected ? "Alfred... tasks, events, projects, anything" : "Connect Anthropic key in Integrations"}
            disabled={!connected}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontFamily: F.body, fontSize: isMobile ? "16px" : "15px", color: C.cream,
              fontWeight: 300, fontStyle: "italic",
              opacity: connected ? 1 : 0.4,
            }}
          />
          {connected && input.trim() && (
            <button onClick={send} disabled={loading} style={{
              background: `linear-gradient(135deg, ${C.amber}, ${C.embers})`,
              border: "none", borderRadius: "4px",
              padding: "5px 12px", fontFamily: F.mono, fontSize: "10px",
              color: C.obsidian, cursor: "pointer", fontWeight: 600,
              letterSpacing: "0.04em",
            }}>{loading ? "..." : "go"}</button>
          )}
          <kbd style={{
            fontFamily: F.mono, fontSize: "9px", color: C.slate,
            padding: "2px 6px", borderRadius: "3px", backgroundColor: C.void,
            border: `1px solid ${C.stone}`,
          }}>esc</kbd>
        </div>

        {/* Response area */}
        {(response || loading) && (
          <div style={{ padding: isMobile ? "16px" : "16px 20px", maxHeight: "50vh", overflowY: "auto" }}>
            {loading && (
              <div style={{
                fontFamily: F.mono, fontSize: "11px", color: C.iron,
                animation: "breathe 2s ease infinite",
              }}>thinking...</div>
            )}
            {response && (
              <div style={{
                fontFamily: F.body, fontSize: "13px", color: C.fog,
                lineHeight: 1.7, whiteSpace: "pre-wrap", fontWeight: 300,
                animation: "typeReveal 0.3s ease both",
              }}>{response}</div>
            )}
            {actions.length > 0 && (
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {actions.map((a, i) => (
                  <div key={i} style={{
                    fontFamily: F.mono, fontSize: "9px", padding: "5px 10px",
                    borderRadius: "3px", letterSpacing: "0.04em",
                    backgroundColor: a.ok ? "rgba(90,138,106,0.08)" : "rgba(154,74,74,0.08)",
                    borderLeft: `2px solid ${a.ok ? C.success : C.danger}`,
                    color: a.ok ? C.success : C.danger,
                    animation: `typeReveal 0.3s ease ${0.1 * i}s both`,
                  }}>{a.ok ? "executed" : "failed"}: {a.action}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hints */}
        {!response && !loading && connected && (
          <div style={{ padding: "10px 20px 14px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["add task", "what's overdue?", "schedule event", "brief me"].map(hint => (
              <button key={hint} onClick={() => { setInput(hint); inputRef.current?.focus(); }} style={{
                background: "transparent", border: `1px solid ${C.stone}`, borderRadius: "4px",
                padding: isMobile ? "8px 12px" : "4px 10px",
                fontFamily: F.mono, fontSize: isMobile ? "11px" : "9px",
                color: C.iron, cursor: "pointer",
                transition: "all 0.2s ease",
                letterSpacing: "0.02em",
                minHeight: isMobile ? "36px" : undefined,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.color = C.fog; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.stone; e.currentTarget.style.color = C.iron; }}
              >{hint}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Nav Item ────────────────────────────────────────────────────
function NavItem({ icon, label, active, collapsed, onClick, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const lit = active || hovered;
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: isMobile ? "14px" : "10px",
        width: "100%",
        padding: collapsed ? "9px 0" : isMobile ? "14px 20px" : "9px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        background: active ? `linear-gradient(90deg, rgba(123,143,163,0.12), transparent)` : "transparent",
        border: "none",
        borderLeft: `2px solid ${active ? C.amber : "transparent"}`,
        cursor: "pointer", borderRadius: 0,
        minHeight: isMobile ? "48px" : undefined,
        transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
        position: "relative",
      }}>
      {active && <div style={{
        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
        width: "2px", height: "60%",
        boxShadow: `0 0 6px 1px rgba(123,143,163,0.2)`,
        pointerEvents: "none",
      }} />}
      <div style={{
        width: isMobile ? "22px" : "18px", height: isMobile ? "22px" : "18px", flexShrink: 0,
        color: lit ? C.amber : C.iron,
        transition: "color 0.25s ease, filter 0.25s ease",
        filter: active ? "drop-shadow(0 0 3px rgba(123,143,163,0.2))" : "none",
      }}>{icon}</div>
      {!collapsed && (
        <span style={{
          fontFamily: F.sans, fontSize: isMobile ? "15px" : "13px", fontWeight: active ? 600 : 400,
          color: lit ? C.parchment : C.fog, transition: "color 0.25s ease", whiteSpace: "nowrap",
          letterSpacing: active ? "0.01em" : "0",
        }}>{label}</span>
      )}
    </button>
  );
}

// ─── Project Row ─────────────────────────────────────────────────
// ─── Deploy Badge ────────────────────────────────────────────────
function DeployBadge({ state }) {
  const colors = { READY: C.success, BUILDING: C.caution, QUEUED: C.caution, ERROR: C.danger };
  const labels = { READY: "live", BUILDING: "building", QUEUED: "queued", ERROR: "error" };
  const c = colors[state] || C.iron;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.04em", color: c,
    }}>
      <span style={{
        width: "6px", height: "6px", borderRadius: "50%", backgroundColor: c,
        animation: state === "READY" ? "breathe 3s ease-in-out infinite" : "none",
      }} />
      {labels[state] || state?.toLowerCase()}
    </span>
  );
}

// ─── Link Chip ──────────────────────────────────────────────────
function LinkChip({ href, label, icon }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.03em",
      color: C.amber, textDecoration: "none",
      padding: "3px 8px", borderRadius: "3px",
      backgroundColor: C.amberSubtle, border: `1px solid ${C.amberGlow}`,
      minHeight: "28px",
      transition: "background-color 0.2s ease, border-color 0.2s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.amberGlow; e.currentTarget.style.borderColor = C.amber; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.amberSubtle; e.currentTarget.style.borderColor = C.amberGlow; }}
    >
      {icon && <span style={{ width: "12px", height: "12px", display: "flex" }}>{icon}</span>}
      {label}
    </a>
  );
}

// ─── Project Card ────────────────────────────────────────────────
function ProjectCard({ project, index, isMobile, liveGit, liveDeploy }) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[project.status];
  const p = project;

  const mono = (text, color) => (
    <span style={{ fontFamily: F.mono, fontSize: isMobile ? "11px" : "10px", color: color || C.iron }}>{text}</span>
  );

  return (
    <div style={{
      backgroundColor: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
      overflow: "hidden", transition: "border-color 0.3s ease",
      animation: `fadeUp 0.35s ease ${0.06 * index}s both`,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.slate}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.stone}
    >
      {/* Header row */}
      <div onClick={() => setExpanded(!expanded)} style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: isMobile ? "16px" : "16px 20px",
        cursor: "pointer",
      }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%", backgroundColor: sc.color, flexShrink: 0,
          animation: p.status === "active" ? "breathe 3s ease-in-out infinite" : "none",
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.display, fontSize: isMobile ? "20px" : "19px", color: C.cream }}>{p.name}</div>
          <div style={{ fontFamily: F.sans, fontSize: "12px", color: C.iron, marginTop: "2px" }}>{p.notes}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {p.version && mono(p.version, C.fog)}
          <span style={{
            fontFamily: F.mono, fontSize: "9px", letterSpacing: "0.06em",
            padding: "2px 8px", border: `1px solid ${C.slate}`, borderRadius: "3px", color: C.iron,
          }}>{typeLabels[p.type]}</span>
          <span style={{
            width: "16px", height: "16px", color: C.iron,
            transform: expanded ? "rotate(90deg)" : "rotate(0)",
            transition: "transform 0.2s ease", display: "flex", flexShrink: 0,
          }}>{I.chevron}</span>
        </div>
      </div>

      {/* Quick links bar — always visible */}
      {(p.production || p.staging || p.github) && (
        <div style={{
          display: "flex", gap: "8px", flexWrap: "wrap",
          padding: isMobile ? "0 16px 14px" : "0 20px 14px",
        }}>
          {p.production && (
            <LinkChip href={p.production.url} label="production" icon={I.deploy} />
          )}
          {p.staging && (
            <LinkChip href={p.staging.url} label="staging" icon={I.deploy} />
          )}
          {p.github && (
            <LinkChip href={p.github} label="github" icon={I.external} />
          )}
          {p.vercel && (
            <LinkChip href={p.vercel.inspector} label="vercel" icon={I.layers} />
          )}
        </div>
      )}

      {/* Expanded detail panel */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${C.stone}`,
          padding: isMobile ? "14px 16px" : "16px 20px",
          animation: "fadeUp 0.2s ease both",
        }}>
          {/* Deploy status row — live data preferred */}
          {(liveDeploy || p.production || p.staging) && (
            <div style={{ display: "flex", gap: isMobile ? "16px" : "32px", marginBottom: "14px", flexWrap: "wrap" }}>
              {(liveDeploy?.production || p.production) && (
                <div>
                  <div style={{ fontFamily: F.mono, fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", color: C.iron, marginBottom: "4px" }}>Production</div>
                  <DeployBadge state={liveDeploy?.production?.state || p.production?.state} />
                  {liveDeploy?.production && (
                    <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginTop: "3px" }}>
                      {new Date(liveDeploy.production.created).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
              {(liveDeploy?.preview || p.staging) && (
                <div>
                  <div style={{ fontFamily: F.mono, fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", color: C.iron, marginBottom: "4px" }}>Preview</div>
                  <DeployBadge state={liveDeploy?.preview?.state || p.staging?.state} />
                  {liveDeploy?.preview && (
                    <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginTop: "3px" }}>
                      {liveDeploy.preview.meta?.githubCommitRef || "dev"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Git info — live data preferred */}
          {(liveGit || p.git) && (() => {
            const g = liveGit || p.git;
            return (
              <div style={{
                backgroundColor: C.obsidian, borderRadius: "4px",
                padding: isMobile ? "12px" : "12px 14px",
                fontFamily: F.mono, fontSize: isMobile ? "11px" : "10px",
                lineHeight: 1.7, color: C.fog,
              }}>
                {liveGit && <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.success, marginBottom: "4px", letterSpacing: "0.06em" }}>LIVE</div>}
                <div><span style={{ color: C.iron }}>branch:</span> <span style={{ color: C.parchment }}>{g.branch || "main"}</span></div>
                <div><span style={{ color: C.iron }}>commit:</span> <span style={{ color: C.amber }}>{g.sha}</span> <span style={{ color: C.iron }}>{g.date}</span></div>
                {g.author && <div><span style={{ color: C.iron }}>author:</span> <span style={{ color: C.fog }}>{g.author}</span></div>}
                <div style={{ color: C.fog, marginTop: "4px" }}>{g.message}</div>
              </div>
            );
          })()}

          {/* Meta row */}
          <div style={{
            display: "flex", gap: isMobile ? "12px" : "20px", flexWrap: "wrap",
            fontFamily: F.mono, fontSize: "10px", color: C.iron, marginTop: "12px",
          }}>
            <span>status: <span style={{ color: sc.color }}>{sc.label.toLowerCase()}</span></span>
            <span>slug: {p.slug}</span>
            {p.repo && <span>repo: {p.repo.split("/")[1]}</span>}
            {p.migrated && <span style={{ color: C.success }}>in-repo</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Projects Module (Dashboard) ─────────────────────────────────
function ProjectsModule({ isMobile, liveData }) {
  const { gitData, deployData, status, loading, lastRefresh, refresh } = liveData || {};
  const active = manifest.projects.filter(p => p.status === "active");
  const liveDeployed = Object.values(deployData || {}).filter(d => d.production?.state === "READY").length;

  // Collect deploy errors across all projects
  const deployErrors = [];
  if (deployData) {
    for (const [slug, data] of Object.entries(deployData)) {
      if (data.production?.state === "ERROR") {
        deployErrors.push({
          project: manifest.projects.find(p => p.slug === slug)?.name || slug,
          env: "production",
          sha: data.production.meta?.githubCommitSha?.slice(0, 7) || "unknown",
          message: data.production.meta?.githubCommitMessage || "",
          time: data.production.created,
        });
      }
      if (data.preview?.state === "ERROR") {
        deployErrors.push({
          project: manifest.projects.find(p => p.slug === slug)?.name || slug,
          env: "preview",
          sha: data.preview.meta?.githubCommitSha?.slice(0, 7) || "unknown",
          message: data.preview.meta?.githubCommitMessage || "",
          time: data.preview.created,
        });
      }
    }
  }

  return (
    <div>
      {/* Deploy error alert */}
      {deployErrors.length > 0 && (
        <div style={{
          background: "rgba(154,74,74,0.08)", border: "1px solid rgba(154,74,74,0.2)",
          borderRadius: "8px", padding: isMobile ? "14px" : "16px 20px",
          marginBottom: "20px", animation: "fadeUp 0.3s ease both",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: `linear-gradient(90deg, ${C.danger}, transparent)`,
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              backgroundColor: C.danger, animation: "breathe 2s ease infinite",
            }} />
            <span style={{
              fontFamily: F.mono, fontSize: "9px", letterSpacing: "0.08em",
              textTransform: "uppercase", color: C.danger,
            }}>{deployErrors.length} deploy error{deployErrors.length > 1 ? "s" : ""}</span>
          </div>
          {deployErrors.map((err, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "6px 0", borderTop: i > 0 ? `1px solid rgba(154,74,74,0.1)` : "none",
              fontFamily: F.mono, fontSize: "11px",
            }}>
              <span style={{ color: C.danger, fontWeight: 600 }}>{err.project}</span>
              <span style={{ color: C.iron }}>{err.env}</span>
              <span style={{ color: C.slate }}>@{err.sha}</span>
              <span style={{ color: C.iron, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "10px" }}>{err.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(5, auto)",
        gap: isMobile ? "16px" : "40px",
        marginBottom: "24px", animation: "fadeUp 0.4s ease both",
      }}>
        {[
          { label: "Total", value: manifest.projects.length },
          { label: "Active", value: active.length },
          { label: "Deployed", value: status?.vercel?.connected ? liveDeployed : "--" },
          { label: "In-Repo", value: manifest.projects.filter(p => p.migrated).length },
          { label: "Errors", value: deployErrors.length, color: deployErrors.length > 0 ? C.danger : C.success },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontFamily: F.display, fontSize: isMobile ? "28px" : "32px", color: stat.color || C.cream, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontFamily: F.mono, fontSize: isMobile ? "9px" : "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: stat.color ? stat.color : C.iron, marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Live data status bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px",
        fontFamily: F.mono, fontSize: "10px", color: C.iron, flexWrap: "wrap",
      }}>
        {loading && <span style={{ color: C.caution }}>fetching live data...</span>}
        {!loading && lastRefresh && (
          <span>live as of {lastRefresh.toLocaleTimeString()}</span>
        )}
        {!loading && !status && (
          <span>static data — connect integrations for live updates</span>
        )}
        <button onClick={refresh} style={{
          background: "none", border: `1px solid ${C.slate}`, borderRadius: "3px",
          padding: "2px 8px", fontFamily: F.mono, fontSize: "10px", color: C.amber,
          cursor: "pointer", minHeight: isMobile ? "32px" : undefined,
        }}>refresh</button>
      </div>

      {/* Project cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {manifest.projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} isMobile={isMobile}
            liveGit={p.repo ? gitData?.[p.repo] : null}
            liveDeploy={deployData?.[p.slug]}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Homepage Module ─────────────────────────────────────────────
// ─── Alfred (inline AI, for Home page) ─────────────────────────
function Alfred({ isMobile, session, triggerRefresh }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);

  const connected = !!session?.access_token;

  const send = async () => {
    if (!input.trim() || loading || !connected) return;
    const msg = input.trim();
    setInput("");
    setLoading(true);
    setResponse(null);
    setActions([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
        setActions(data.actions || []);
        if (data.actions?.some(a => a.ok)) triggerRefresh?.();
      } else {
        setResponse(data.error || "Failed");
      }
    } catch {
      setResponse("Network error");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{
        display: "flex", gap: "8px", alignItems: "stretch",
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(22,22,32,0.4)",
          border: "1px solid rgba(70,70,90,0.25)", borderRadius: "8px",
          padding: isMobile ? "10px 14px" : "8px 14px",
          transition: "border-color 0.2s ease",
        }}>
          <div style={{ width: "16px", height: "16px", color: C.iron, flexShrink: 0 }}>{I.bell}</div>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={connected ? "Alfred... add task, schedule event, ask anything" : "Connect Anthropic in Integrations"}
            disabled={!connected}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontFamily: F.sans, fontSize: isMobile ? "14px" : "13px", color: C.parchment,
              opacity: connected ? 1 : 0.4,
            }}
          />
        </div>
        {connected && input.trim() && (
          <button onClick={send} disabled={loading} style={{
            background: C.amber, border: "none", borderRadius: "6px",
            padding: isMobile ? "10px 16px" : "8px 14px",
            fontFamily: F.mono, fontSize: "11px", fontWeight: 600,
            color: C.obsidian, cursor: "pointer", whiteSpace: "nowrap",
          }}>{loading ? "..." : "go"}</button>
        )}
      </div>

      {/* Inline response */}
      {(response || loading) && (
        <div style={{
          marginTop: "8px", padding: "10px 14px", borderRadius: "6px",
          backgroundColor: C.cavern, border: `1px solid ${C.stone}`,
          animation: "fadeUp 0.2s ease both",
        }}>
          {loading && <div style={{ fontFamily: F.mono, fontSize: "11px", color: C.iron }}>thinking...</div>}
          {response && (
            <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.fog, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{response}</div>
          )}
          {actions.length > 0 && (
            <div style={{ marginTop: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {actions.map((a, i) => (
                <span key={i} style={{
                  fontFamily: F.mono, fontSize: "9px", padding: "2px 6px", borderRadius: "3px",
                  backgroundColor: a.ok ? "rgba(90,138,106,0.1)" : "rgba(154,74,74,0.1)",
                  color: a.ok ? C.success : C.danger,
                }}>{a.ok ? "done" : "fail"}: {a.action}</span>
              ))}
            </div>
          )}
          <button onClick={() => { setResponse(null); setActions([]); }} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: F.mono, fontSize: "9px", color: C.slate, marginTop: "6px",
          }}>dismiss</button>
        </div>
      )}
    </div>
  );
}


// ─── Ticker Bar (persistent, all modules) ────────────────────────
function TickerBar({ isMobile }) {
  const [markets, setMarkets] = useState(null);
  const [time, setTime] = useState(new Date());
  const [showConfig, setShowConfig] = useState(false);

  const TICKER_CATALOG = [
    { symbol: "SPY", label: "S&P 500" }, { symbol: "QQQ", label: "NASDAQ" }, { symbol: "DIA", label: "DOW" },
    { symbol: "IWM", label: "Russell" }, { symbol: "AAPL", label: "Apple" }, { symbol: "MSFT", label: "MSFT" },
    { symbol: "NVDA", label: "NVDA" }, { symbol: "TSLA", label: "Tesla" }, { symbol: "GLD", label: "Gold" },
  ];
  const CLOCK_CATALOG = [
    { label: "Nashville", tz: "America/Chicago", abbr: "CT" },
    { label: "New York", tz: "America/New_York", abbr: "ET" },
    { label: "LA", tz: "America/Los_Angeles", abbr: "PT" },
    { label: "London", tz: "Europe/London", abbr: "GMT" },
    { label: "Tokyo", tz: "Asia/Tokyo", abbr: "JST" },
    { label: "Dubai", tz: "Asia/Dubai", abbr: "GST" },
    { label: "Sydney", tz: "Australia/Sydney", abbr: "AEST" },
  ];

  const loadSetting = (key, fallback) => {
    try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  };
  const saveSetting = (key, val) => { try { window.localStorage.setItem(key, JSON.stringify(val)); } catch {} };

  const [activeClocks, setActiveClocks] = useState(() => loadSetting("bc_clocks", ["America/Chicago", "America/New_York", "America/Los_Angeles"]));
  const [activeTickers, setActiveTickers] = useState(() => loadSetting("bc_tickers", ["SPY", "QQQ", "DIA"]));

  const toggle = (arr, setArr, key, val) => {
    const next = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
    setArr(next); saveSetting(key, next);
  };

  useEffect(() => {
    fetch("/api/markets").then(r => r.ok ? r.json() : null).then(d => d && setMarkets(d)).catch(() => {});
    const t = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const getTime = (tz) => {
    try { return time.toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }); } catch { return "--"; }
  };

  const clockData = CLOCK_CATALOG.filter(c => activeClocks.includes(c.tz));
  const tickerData = markets?.indices?.filter(t => activeTickers.includes(t.symbol)) || [];

  const items = [];
  clockData.forEach(c => items.push({ type: "clock", label: c.label, value: getTime(c.tz), abbr: c.abbr }));
  tickerData.forEach(t => {
    const up = t.change >= 0;
    items.push({ type: "ticker", label: t.symbol, value: t.price?.toLocaleString(undefined, { maximumFractionDigits: 0 }), change: `${up ? "+" : ""}${t.changePct?.toFixed(1)}%`, up });
  });

  return (
    <>
      <div style={{
        height: isMobile ? "32px" : "28px", display: "flex", alignItems: "center",
        background: "rgba(14,14,20,0.92)",
        borderBottom: "1px solid rgba(50,50,65,0.3)",
        fontFamily: F.mono, fontSize: isMobile ? "11px" : "10px",
        position: isMobile ? "fixed" : "relative",
        top: isMobile ? "56px" : undefined,
        left: isMobile ? 0 : undefined, right: isMobile ? 0 : undefined,
        zIndex: isMobile ? 49 : 40, flexShrink: 0,
        overflow: "hidden",
      }}>
        {/* Scrolling content — duplicated for seamless loop */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0",
          animation: items.length > (isMobile ? 2 : 4) ? `tickerScroll ${items.length * 5}s linear infinite` : "none",
          whiteSpace: "nowrap", paddingLeft: isMobile ? "8px" : "12px",
        }}>
          {[...items, ...(items.length > (isMobile ? 2 : 4) ? items : [])].map((item, i) => (
            <div key={`${item.type}-${item.label}-${i}`} style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: isMobile ? "0 10px" : "0 12px",
              borderRight: "1px solid rgba(50,50,65,0.2)",
            }}>
              {item.type === "clock" && (
                <>
                  <span style={{ color: C.fog }}>{item.value}</span>
                  <span style={{ color: C.slate, fontSize: "8px" }}>{item.label}</span>
                </>
              )}
              {item.type === "ticker" && (
                <>
                  <span style={{ color: C.slate, fontSize: "8px" }}>{item.label}</span>
                  <span style={{ color: C.fog }}>{item.value}</span>
                  <span style={{ color: item.up ? C.success : C.danger, fontSize: "9px" }}>{item.change}</span>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && <span style={{ color: C.slate, padding: "0 12px" }}>Connect Finnhub for live data</span>}
        </div>

        {/* Config toggle */}
        <button onClick={() => setShowConfig(!showConfig)} style={{
          position: "absolute", right: isMobile ? "4px" : "6px", top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: showConfig ? C.amber : C.slate, fontSize: isMobile ? "14px" : "10px",
          padding: isMobile ? "8px" : "2px 4px",
          minWidth: isMobile ? "36px" : undefined, minHeight: isMobile ? "32px" : undefined,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{showConfig ? "x" : "..."}</button>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div style={{
          background: "rgba(14,14,20,0.95)", borderBottom: "1px solid rgba(50,50,65,0.3)",
          padding: isMobile ? "12px" : "10px 16px",
          display: "flex", flexDirection: "column", gap: "8px",
          zIndex: 39, position: "relative",
          animation: "fadeUp 0.15s ease both",
        }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: "8px", color: C.slate, letterSpacing: "0.08em", marginBottom: "4px" }}>CLOCKS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {CLOCK_CATALOG.map(c => {
                const on = activeClocks.includes(c.tz);
                return <button key={c.tz} onClick={() => toggle(activeClocks, setActiveClocks, "bc_clocks", c.tz)} style={{
                  background: on ? "rgba(123,143,163,0.15)" : "transparent", border: `1px solid ${on ? C.amber : C.stone}`,
                  borderRadius: "4px", padding: isMobile ? "6px 10px" : "3px 8px",
                  fontFamily: F.mono, fontSize: isMobile ? "11px" : "9px", color: on ? C.cream : C.iron, cursor: "pointer",
                  minHeight: isMobile ? "36px" : undefined,
                }}>{c.label}</button>;
              })}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: "8px", color: C.slate, letterSpacing: "0.08em", marginBottom: "4px" }}>TICKERS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {TICKER_CATALOG.map(t => {
                const on = activeTickers.includes(t.symbol);
                return <button key={t.symbol} onClick={() => toggle(activeTickers, setActiveTickers, "bc_tickers", t.symbol)} style={{
                  background: on ? "rgba(123,143,163,0.15)" : "transparent", border: `1px solid ${on ? C.amber : C.stone}`,
                  borderRadius: "4px", padding: isMobile ? "6px 10px" : "3px 8px",
                  fontFamily: F.mono, fontSize: isMobile ? "11px" : "9px", color: on ? C.cream : C.iron, cursor: "pointer",
                  minHeight: isMobile ? "36px" : undefined,
                }}>{t.symbol}</button>;
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Homepage Module (Briefing IS the screen) ────────────────────
function HomepageModule({ isMobile, session, refreshKey, triggerRefresh }) {
  const [brief, setBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState(null);

  const headers = session?.access_token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }
    : { "Content-Type": "application/json" };

  const fetchBrief = useCallback(async (forceNew) => {
    setBriefLoading(true);
    setBriefError(null);
    try {
      if (!forceNew) {
        const cached = await fetch("/api/brief").then(r => r.ok ? r.json() : null).catch(() => null);
        if (cached?.brief) { setBrief(cached.brief); setBriefLoading(false); return; }
      }
      const res = await fetch("/api/brief", { method: "POST", headers });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setBriefError(`${res.status}: ${errData.error || errData.detail || res.statusText}`);
      } else {
        const gen = await res.json();
        if (gen?.brief) setBrief(gen.brief);
        else setBriefError("Brief generated but returned empty");
      }
    } catch (e) {
      setBriefError(`Network error: ${e.message}`);
    }
    setBriefLoading(false);
  }, [session]);

  useEffect(() => { fetchBrief(false); }, [fetchBrief]);

  // Auto-refresh briefing at 5am, noon, 7pm CST
  useEffect(() => {
    const checkRefresh = () => {
      if (!brief?.created_at) return;
      const now = new Date();
      const cst = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
      const h = cst.getHours();
      const m = cst.getMinutes();
      const windows = [5, 12, 19]; // 5am, noon, 7pm CST
      const createdAt = new Date(brief.created_at);
      for (const w of windows) {
        const windowTime = new Date(cst);
        windowTime.setHours(w, 0, 0, 0);
        if (cst >= windowTime && createdAt < windowTime) {
          fetchBrief(true);
          return;
        }
      }
    };
    checkRefresh();
    const interval = setInterval(checkRefresh, 5 * 60 * 1000); // check every 5 min
    return () => clearInterval(interval);
  }, [brief?.created_at]);

  // Complete a task from the briefing
  const [completingId, setCompletingId] = useState(null);
  const completeBriefTask = async (taskId) => {
    setCompletingId(taskId);
    try {
      await fetch("/api/tasks", {
        method: "PATCH", headers,
        body: JSON.stringify({ id: taskId, completed: true }),
      });
      if (brief) {
        const updated = { ...brief };
        if (updated.parsed?.items) {
          updated.parsed = { ...updated.parsed, items: updated.parsed.items.filter(it => it.task_id !== taskId) };
        }
        setBrief(updated);
      }
      triggerRefresh();
    } catch {}
    setCompletingId(null);
  };

  // Parse brief — prefer server-parsed object, fallback to client parsing
  let briefItems = [];
  let briefGreeting = null;
  let briefQuote = null;
  if (brief) {
    const p = brief.parsed || null;
    if (p && p.items) {
      briefGreeting = p.greeting || null;
      if (p.quote_text) {
        briefQuote = { text: p.quote_text, author: p.quote_author || "Unknown", source: p.quote_source || null };
      }
      briefItems = Array.isArray(p.items) ? p.items : [];
    } else if (brief.content) {
      // Fallback: client-side parsing
      try {
        let raw = typeof brief.content === "object" ? JSON.stringify(brief.content) : brief.content;
        if (raw.startsWith('"')) { try { raw = JSON.parse(raw); } catch {} }
        if (typeof raw === "object" && raw.items) {
          briefGreeting = raw.greeting || null;
          briefItems = raw.items;
        } else {
          if (typeof raw !== "string") raw = String(raw);
          raw = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
          const fb = raw.indexOf("{"); const lb = raw.lastIndexOf("}");
          if (fb !== -1 && lb > fb) raw = raw.slice(fb, lb + 1);
          raw = raw.replace(/,\s*([}\]])/g, "$1");
          const parsed = JSON.parse(raw);
          if (parsed?.items) {
            briefGreeting = parsed.greeting || null;
            if (parsed.quote_text) {
              briefQuote = { text: parsed.quote_text, author: parsed.quote_author || "Unknown", source: parsed.quote_source || null };
            }
            briefItems = parsed.items;
          }
        }
      } catch {
        // Last resort: don't render garbage
        briefItems = [];
      }
    }
  }

  const moodColors = {
    urgent: C.danger,
    alert: C.caution,
    warm: "#B8924A",
    neutral: C.fog,
    positive: C.success,
    overdue: "#D4721A",
  };

  const horizonLabels = {
    now: "NOW",
    today: "TODAY",
    tomorrow: "TOMORROW",
    week: "THIS WEEK",
    fyi: "FYI",
  };

  // Simple icon renderer based on hint
  const iconFor = (hint, mood) => {
    const color = moodColors[mood] || C.fog;
    const s = { width: "20px", height: "20px", color, flexShrink: 0 };
    const h = (hint || "").toLowerCase();
    if (h.includes("laundry") || h.includes("clothes")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="13" r="4" /><path d="M8 6h2" /></svg>;
    if (h.includes("airplane") || h.includes("flight") || h.includes("travel") || h.includes("trip")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.8 19.2L16 11l3.5-3.5C20.3 6.7 20.3 5.3 19.5 4.5 18.7 3.7 17.3 3.7 16.5 4.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5L2.5 8.8c-.3.5 0 1.1.5 1.3L9 12l-2 2H4l-1 2 4-1 4-1 2.3-2.3L15 18c.2.5.8.8 1.3.5l2.1-1.2c.4-.2.6-.6.5-1.1z" /></svg>;
    if (h.includes("calendar") || h.includes("event") || h.includes("meeting")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    if (h.includes("warning") || h.includes("alert") || h.includes("overdue")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>;
    if (h.includes("gift") || h.includes("birthday") || h.includes("celebration")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="8" width="18" height="13" rx="1" /><path d="M12 8v13M3 12h18" /><path d="M12 8a4 4 0 00-4-4c-1.5 0-2 1.5 0 3l4 1M12 8a4 4 0 014-4c1.5 0 2 1.5 0 3l-4 1" /></svg>;
    if (h.includes("code") || h.includes("deploy") || h.includes("build") || h.includes("project")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
    if (h.includes("chart") || h.includes("market") || h.includes("stock") || h.includes("finance")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    if (h.includes("news") || h.includes("newspaper") || h.includes("headline")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8M18 18h-8M18 6h-8v4h8V6z" /></svg>;
    if (h.includes("sun") || h.includes("weather") || h.includes("clear")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
    if (h.includes("check") || h.includes("done") || h.includes("complete")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
    if (h.includes("run") || h.includes("shoe") || h.includes("jog") || h.includes("cardio") || h.includes("fitness")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="17" cy="4" r="2"/><path d="M15 21l-3-6-4 3-3-4"/><path d="M19 13l-2-3-5 3"/></svg>;
    if (h.includes("heart") || h.includes("health") || h.includes("pulse")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    if (h.includes("dumbbell") || h.includes("weight") || h.includes("gym")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 7v10M18 7v10M2 9v6M22 9v6M6 12h12"/></svg>;
    if (h.includes("box") || h.includes("return") || h.includes("package")) return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><path d="M12 22.08V12" /></svg>;
    // Default circle
    return <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /></svg>;
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Alfred bar */}
      <div style={{ marginBottom: "28px" }}>
        <Alfred isMobile={isMobile} session={session} triggerRefresh={triggerRefresh} />
      </div>

      {/* Alfred's greeting */}
      {(briefGreeting || briefQuote) && (
        <div style={{
          marginBottom: "28px",
          animation: "typeReveal 0.5s ease both",
        }}>
          {briefGreeting && (
            <div style={{
              fontFamily: F.display, fontSize: isMobile ? "18px" : "22px",
              color: C.cream, lineHeight: 1.5, fontWeight: 300,
              fontStyle: "italic", maxWidth: "640px",
              marginBottom: briefQuote ? "12px" : 0,
            }}>{briefGreeting}</div>
          )}
          {briefQuote && (
            <div style={{ position: "relative", display: "inline-block", maxWidth: "640px" }}
              onMouseEnter={e => {
                const tip = e.currentTarget.querySelector("[data-tip]");
                if (tip) tip.style.opacity = "1";
                if (tip) tip.style.transform = "translateY(0)";
              }}
              onMouseLeave={e => {
                const tip = e.currentTarget.querySelector("[data-tip]");
                if (tip) tip.style.opacity = "0";
                if (tip) tip.style.transform = "translateY(4px)";
              }}
              onClick={e => {
                // Mobile: toggle on tap
                const tip = e.currentTarget.querySelector("[data-tip]");
                if (tip) {
                  const showing = tip.style.opacity === "1";
                  tip.style.opacity = showing ? "0" : "1";
                  tip.style.transform = showing ? "translateY(4px)" : "translateY(0)";
                }
              }}
            >
              <span style={{
                fontFamily: F.body, fontSize: isMobile ? "14px" : "15px",
                color: C.amber, lineHeight: 1.6, fontWeight: 300,
                fontStyle: "italic",
                cursor: "pointer",
                borderBottom: "1px dotted rgba(123,143,163,0.3)",
                paddingBottom: "1px",
              }}>
                "{briefQuote.text}"
              </span>

              {/* Attribution tooltip */}
              <div data-tip="true" style={{
                position: "absolute",
                bottom: "calc(100% + 8px)", left: 0,
                background: C.cavern,
                border: `1px solid ${C.stone}`,
                borderRadius: "6px",
                padding: isMobile ? "10px 14px" : "8px 12px",
                opacity: 0,
                transform: "translateY(4px)",
                transition: "opacity 0.2s ease, transform 0.2s ease",
                pointerEvents: "none",
                zIndex: 10,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}>
                <div style={{ fontFamily: F.sans, fontSize: "12px", color: C.cream, fontWeight: 500 }}>
                  {briefQuote.author}
                </div>
                {briefQuote.source && (
                  <div style={{ fontFamily: F.mono, fontSize: "10px", color: C.iron, marginTop: "2px" }}>
                    {briefQuote.source}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brief controls */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: F.mono, fontSize: "8px", color: C.slate, letterSpacing: "0.08em" }}>
            {brief?.brief_date || ""}
          </span>
        </div>
        <button onClick={() => fetchBrief(true)} disabled={briefLoading} style={{
          background: "transparent",
          border: `1px solid ${C.stone}`, borderRadius: "4px",
          padding: isMobile ? "6px 12px" : "4px 10px",
          fontFamily: F.mono, fontSize: "9px", color: briefLoading ? C.iron : C.amber,
          cursor: "pointer",
        }}>{briefLoading ? "generating..." : briefItems.length > 0 ? "regenerate" : "generate"}</button>
      </div>

      {/* Briefing lines */}
      {briefItems.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {briefItems.map((item, i) => {
            const color = moodColors[item.mood] || C.fog;
            const isUrgent = item.horizon === "now" || item.mood === "urgent";
            const isOverdue = item.mood === "overdue";
            const isNews = item.category === "news";
            const prevIsNews = i > 0 && briefItems[i - 1].category === "news";
            const showNewsDivider = isNews && !prevIsNews;
            const bgDefault = isOverdue ? "rgba(212,114,26,0.06)" : isUrgent ? "rgba(154,74,74,0.06)" : i === 0 ? "rgba(123,143,163,0.04)" : "transparent";
            return (
              <React.Fragment key={i}>
                {showNewsDivider && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 0 6px",
                    animation: `typeReveal 0.35s ease ${0.06 * i}s both`,
                  }}>
                    <div style={{ fontFamily: F.mono, fontSize: "8px", letterSpacing: "0.1em", color: C.slate, textTransform: "uppercase", flexShrink: 0 }}>World + Markets</div>
                    <div style={{ flex: 1, height: "1px", background: C.stone }} />
                  </div>
                )}
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: isMobile ? "10px" : "16px",
                  padding: isMobile ? "12px 10px" : "14px 16px",
                  borderRadius: "6px",
                  background: bgDefault,
                  borderLeft: `2px solid ${color}`,
                  animation: `typeReveal 0.35s ease ${0.06 * i}s both`,
                  transition: "background 0.2s ease",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(123,143,163,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = bgDefault}
                >
                {/* Complete button (if task_id exists) */}
                {item.task_id ? (
                  <button onClick={() => completeBriefTask(item.task_id)} disabled={completingId === item.task_id} style={{
                    width: isMobile ? "28px" : "24px", height: isMobile ? "28px" : "24px", flexShrink: 0,
                    borderRadius: "5px", cursor: "pointer", marginTop: "1px",
                    background: completingId === item.task_id ? C.success : "rgba(90,138,106,0.08)",
                    border: `1.5px solid ${completingId === item.task_id ? C.success : "rgba(90,138,106,0.25)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s ease", padding: 0,
                  }}>
                    <svg style={{ width: isMobile ? "14px" : "12px", height: isMobile ? "14px" : "12px", color: completingId === item.task_id ? C.obsidian : C.success }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </button>
                ) : (
                  /* Icon */
                  <div style={{ marginTop: "1px" }}>
                    {iconFor(item.icon_hint, item.mood)}
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: F.sans, fontSize: isMobile ? "14px" : "14px",
                    color: isUrgent ? C.cream : C.parchment,
                    lineHeight: 1.5, fontWeight: isUrgent ? 500 : 400,
                  }}>{item.text}</div>
                </div>

                {/* Horizon tag */}
                {!isMobile && <div style={{
                  fontFamily: F.mono, fontSize: "7px", letterSpacing: "0.08em",
                  color, padding: "2px 6px", borderRadius: "2px",
                  border: `1px solid ${color}25`,
                  flexShrink: 0, marginTop: "3px",
                  whiteSpace: "nowrap",
                }}>{horizonLabels[item.horizon] || item.horizon?.toUpperCase()}</div>}
              </div>
              </React.Fragment>
            );
          })}
        </div>
      ) : !briefLoading ? (
        /* Empty state */
        <div style={{
          textAlign: "center", padding: isMobile ? "60px 20px" : "80px 40px",
        }}>
          <div style={{
            width: "32px", height: "32px", color: C.amber, margin: "0 auto 16px",
            opacity: 0.5,
          }}>{I.bell}</div>
          <div style={{
            fontFamily: F.display, fontSize: isMobile ? "20px" : "24px",
            color: C.cream, fontWeight: 300, marginBottom: "8px",
          }}>Alfred is ready</div>
          <div style={{
            fontFamily: F.sans, fontSize: "13px", color: C.iron, lineHeight: 1.6,
            maxWidth: "340px", margin: "0 auto 20px",
          }}>
            Connect your Anthropic key in Integrations, then generate your first briefing.
          </div>
          <button onClick={() => fetchBrief(true)} style={{
            background: C.amber, border: "none", borderRadius: "6px",
            padding: "10px 24px", fontFamily: F.mono, fontSize: "11px", fontWeight: 500,
            color: C.obsidian, cursor: "pointer", letterSpacing: "0.04em",
          }}>generate briefing</button>
          {briefError && (
            <div style={{
              fontFamily: F.mono, fontSize: "10px", color: C.danger,
              marginTop: "12px", padding: "8px 12px",
              background: "rgba(154,74,74,0.08)", borderRadius: "4px",
            }}>{briefError}</div>
          )}
        </div>
      ) : (
        /* Loading state */
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron, animation: "breathe 2s ease infinite" }}>
            Alfred is assembling your brief...
          </div>
        </div>
      )}

      {/* Token footer */}
      {brief?.tokens_used && briefItems.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          marginTop: "20px", paddingTop: "12px",
          borderTop: `1px solid ${C.stone}`,
        }}>
          <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: C.success, animation: "breathe 3s ease infinite" }} />
          <span style={{ fontFamily: F.mono, fontSize: "8px", color: C.slate }}>{brief.tokens_used} tokens</span>
        </div>
      )}
    </div>
  );
}

// ─── News Module ─────────────────────────────────────────────────
function NewsModule({ isMobile }) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/markets?action=news&category=general"); if (res.ok) setNews(await res.json()); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const formatTime = (unix) => {
    if (!unix) return "";
    const d = new Date(unix * 1000); const now = new Date();
    const diffH = Math.floor((now - d) / 3600000);
    if (diffH < 1) return `${Math.floor((now - d) / 60000)}m ago`;
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, letterSpacing: "0.06em" }}>{news?.articles?.length || 0} headlines</div>
        <button onClick={fetchNews} style={{ background: "none", border: `1px solid ${C.slate}`, borderRadius: "4px", padding: isMobile ? "6px 12px" : "3px 10px", fontFamily: F.mono, fontSize: "10px", color: C.amber, cursor: "pointer" }}>{loading ? "..." : "refresh"}</button>
      </div>
      {loading && !news && <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron }}>Loading headlines...</div>}
      {news?.articles && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {news.articles.map((article, i) => (
            <a key={article.id || i} href={article.url} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", gap: "14px", padding: isMobile ? "14px 0" : "12px 0", borderBottom: `1px solid ${C.stone}`,
              textDecoration: "none", color: "inherit", animation: `fadeUp 0.3s ease ${0.03*i}s both`, transition: "background-color 0.15s ease",
            }} onMouseEnter={e => e.currentTarget.style.backgroundColor = C.amberSubtle} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
              {article.image && !isMobile && <div style={{ width: "80px", height: "54px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, backgroundColor: C.stone }}>
                <img src={article.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.currentTarget.style.display="none"} />
              </div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F.sans, fontSize: isMobile ? "14px" : "13px", fontWeight: 500, color: C.parchment, lineHeight: 1.4, marginBottom: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.headline}</div>
                {article.summary && !isMobile && <div style={{ fontFamily: F.sans, fontSize: "12px", color: C.iron, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.summary}</div>}
                <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontFamily: F.mono, fontSize: "10px", color: C.iron }}>
                  <span style={{ color: C.amber }}>{article.source}</span><span>{formatTime(article.datetime)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      {!loading && !news && <div style={{ padding: "32px 20px", borderRadius: "8px", background: "rgba(22,22,32,0.4)", border: "1px solid rgba(70,70,90,0.25)", textAlign: "center" }}>
        <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron }}>Connect Finnhub in Integrations to surface news.</div>
      </div>}
    </div>
  );
}

// ─── Finance Module ──────────────────────────────────────────────
function FinanceModule({ isMobile }) {
  const [markets, setMarkets] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/markets"); if (res.ok) setMarkets(await res.json()); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchMarkets(); }, [fetchMarkets]);

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, letterSpacing: "0.06em" }}>{markets?.timestamp ? `Updated ${new Date(markets.timestamp).toLocaleTimeString()}` : ""}</div>
        <button onClick={fetchMarkets} style={{ background: "none", border: `1px solid ${C.slate}`, borderRadius: "4px", padding: isMobile ? "6px 12px" : "3px 10px", fontFamily: F.mono, fontSize: "10px", color: C.amber, cursor: "pointer" }}>{loading ? "..." : "refresh"}</button>
      </div>
      {loading && !markets && <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron }}>Loading market data...</div>}
      {markets?.indices && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px" }}>
          {markets.indices.map((idx, i) => {
            const up = idx.change >= 0;
            return (
              <div key={idx.id} style={{
                background: "rgba(22,22,32,0.5)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(70,70,90,0.25)", borderRadius: "10px", padding: isMobile ? "20px" : "24px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.15)",
                animation: `fadeUp 0.35s ease ${0.06*i}s both`, position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                  background: up ? "linear-gradient(90deg, transparent, rgba(90,138,106,0.5), transparent)" : "linear-gradient(90deg, transparent, rgba(154,74,74,0.5), transparent)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontFamily: F.sans, fontSize: "13px", fontWeight: 600, color: C.fog }}>{idx.label}</div>
                    <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate }}>{idx.symbol}</div>
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: "10px", padding: "3px 8px", borderRadius: "4px",
                    backgroundColor: up ? "rgba(90,138,106,0.12)" : "rgba(154,74,74,0.12)",
                    color: up ? C.success : C.danger, border: `1px solid ${up ? "rgba(90,138,106,0.2)" : "rgba(154,74,74,0.2)"}` }}>
                    {up ? "+" : ""}{idx.changePct?.toFixed(2)}%
                  </div>
                </div>
                <div style={{ fontFamily: F.display, fontSize: isMobile ? "32px" : "36px", color: C.cream, lineHeight: 1, marginBottom: "8px", fontWeight: 300 }}>
                  {idx.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: "11px", color: up ? C.success : C.danger, marginBottom: "12px" }}>{up ? "+" : ""}{idx.change?.toFixed(2)} today</div>
                <div style={{ display: "flex", gap: "16px", fontFamily: F.mono, fontSize: "9px", color: C.iron, borderTop: `1px solid ${C.stone}`, paddingTop: "10px" }}>
                  <span>High {idx.high?.toFixed(2)}</span><span>Low {idx.low?.toFixed(2)}</span><span>Open {idx.open?.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && !markets && <div style={{ padding: "32px 20px", borderRadius: "8px", background: "rgba(22,22,32,0.4)", border: "1px solid rgba(70,70,90,0.25)", textAlign: "center" }}>
        <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron }}>Connect Finnhub in Integrations for live markets.</div>
      </div>}
    </div>
  );
}

// ─── Integrations Module ─────────────────────────────────────────
function IntegrationsModule({ isMobile, liveData, session }) {
  const { status, loading, refresh } = liveData || {};
  const [configuring, setConfiguring] = useState(null);
  const [keyInput, setKeyInput] = useState("");
  const [configState, setConfigState] = useState(null); // null | "testing" | "done" | "error"
  const [configError, setConfigError] = useState(null);

  const icons = {
    finnhub: I.signal,
    github: I.external,
    anthropic: I.bell,
    gmail: I.layers,
    gcal: I.layers,
  };

  const setupGuides = {
    finnhub: {
      steps: [
        { text: "Create a free Finnhub account", link: "https://finnhub.io/register", linkLabel: "Sign up" },
        { text: "Copy your API key from the dashboard", link: "https://finnhub.io/dashboard", linkLabel: "Open dashboard" },
        { text: "Paste it below" },
      ],
      configurable: true,
    },
    github: {
      steps: [
        { text: "Create a fine-grained PAT", link: "https://github.com/settings/personal-access-tokens/new", linkLabel: "Create token" },
        { text: "Scope: select repos, Contents read/write, Metadata read" },
        { text: "Paste it below" },
      ],
      configurable: true,
    },
    anthropic: {
      steps: [
        { text: "Open the Anthropic Console", link: "https://console.anthropic.com/settings/keys", linkLabel: "API keys" },
        { text: "Create a key and copy it" },
        { text: "Paste it below" },
      ],
      configurable: true,
    },
    gmail: {
      steps: [{ text: "OAuth integration — coming soon" }],
      configurable: false,
    },
    gcal: {
      steps: [{ text: "OAuth integration — coming soon" }],
      configurable: false,
    },
  };

  const handleConfigure = async (serviceId) => {
    if (!keyInput.trim()) return;
    setConfigState("testing");
    setConfigError(null);
    try {
      const res = await fetch("/api/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ service: serviceId, key: keyInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfigState("error");
        setConfigError(data.error || "Configuration failed");
        return;
      }
      setConfigState("done");
      setKeyInput("");
      setTimeout(() => { refresh?.(); }, 3000);
    } catch {
      setConfigState("error");
      setConfigError("Network error");
    }
  };

  const closeConfig = () => {
    setConfiguring(null);
    setKeyInput("");
    setConfigState(null);
    setConfigError(null);
  };

  const integrationList = Object.values(INTEGRATIONS);

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <p style={{
        fontFamily: F.body, fontSize: "15px", fontWeight: 300,
        color: C.fog, marginBottom: "32px", maxWidth: "520px", lineHeight: 1.65,
      }}>
        Connect services to power live data across the Batcave. Tap Connect and follow the guided setup.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {integrationList.map((intg, i) => {
          const st = status?.[intg.id];
          const connected = st?.connected || false;
          const isOpen = configuring === intg.id;
          const guide = setupGuides[intg.id];

          return (
            <div key={intg.id} style={{
              backgroundColor: C.cavern, border: `1px solid ${isOpen ? C.amber : C.stone}`,
              borderRadius: "6px", overflow: "hidden",
              animation: `fadeUp 0.35s ease ${0.06 * i}s both`,
              transition: "border-color 0.3s ease",
            }}>
              {/* Header */}
              <div style={{
                padding: isMobile ? "16px" : "18px 20px",
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{ width: "20px", height: "20px", color: connected ? C.amber : C.iron, flexShrink: 0 }}>
                  {icons[intg.id] || I.layers}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: F.sans, fontSize: "14px", fontWeight: 600, color: C.parchment }}>{intg.label}</span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      fontFamily: F.mono, fontSize: "9px", letterSpacing: "0.06em",
                      padding: "2px 8px", borderRadius: "3px",
                      backgroundColor: connected ? "rgba(90,138,106,0.12)" : "rgba(154,74,74,0.12)",
                      color: connected ? C.success : C.danger,
                      border: `1px solid ${connected ? "rgba(90,138,106,0.2)" : "rgba(154,74,74,0.2)"}`,
                    }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: connected ? C.success : C.danger }} />
                      {connected ? "connected" : "not connected"}
                    </span>
                  </div>
                  <div style={{ fontFamily: F.sans, fontSize: "12px", color: C.iron, marginTop: "3px" }}>{intg.desc}</div>
                </div>
                {!isOpen ? (
                  <button onClick={() => { closeConfig(); setConfiguring(intg.id); }} style={{
                    background: "none", border: `1px solid ${connected ? C.slate : C.amber}`,
                    borderRadius: "4px", padding: isMobile ? "8px 14px" : "5px 12px",
                    fontFamily: F.mono, fontSize: "11px", color: connected ? C.iron : C.amber,
                    cursor: "pointer", minHeight: isMobile ? "40px" : undefined, whiteSpace: "nowrap",
                  }}>{connected ? "reconnect" : "connect"}</button>
                ) : (
                  <button onClick={closeConfig} style={{
                    background: "none", border: `1px solid ${C.slate}`, borderRadius: "4px",
                    padding: isMobile ? "8px 14px" : "5px 12px",
                    fontFamily: F.mono, fontSize: "11px", color: C.iron,
                    cursor: "pointer", minHeight: isMobile ? "40px" : undefined,
                  }}>close</button>
                )}
              </div>

              {/* Setup flow */}
              {isOpen && guide && (
                <div style={{
                  borderTop: `1px solid ${C.stone}`,
                  padding: isMobile ? "16px" : "18px 20px",
                  animation: "fadeUp 0.2s ease both",
                }}>
                  {/* Numbered steps */}
                  <div style={{ marginBottom: "16px" }}>
                    {guide.steps.map((step, j) => (
                      <div key={j} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "6px 0" }}>
                        <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.amber, minWidth: "16px", flexShrink: 0, marginTop: "2px" }}>{j + 1}.</span>
                        <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.fog, lineHeight: 1.5 }}>
                          {step.text}
                          {step.link && (
                            <a href={step.link} target="_blank" rel="noopener noreferrer" style={{
                              display: "inline-block", marginLeft: "8px",
                              fontFamily: F.mono, fontSize: "11px", color: C.amber, textDecoration: "none",
                              padding: "2px 8px", borderRadius: "3px",
                              backgroundColor: C.amberSubtle, border: `1px solid ${C.amberGlow}`,
                            }}>{step.linkLabel}</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Manual-only services */}
                  {!guide.configurable && guide.note && (
                    <div style={{
                      padding: "12px 14px", borderRadius: "4px", backgroundColor: C.obsidian,
                      fontFamily: F.sans, fontSize: "12px", color: C.iron, lineHeight: 1.6,
                    }}>
                      {guide.note}
                      {guide.manualLink && (
                        <div style={{ marginTop: "8px" }}>
                          <a href={guide.manualLink} target="_blank" rel="noopener noreferrer" style={{
                            fontFamily: F.mono, fontSize: "11px", color: C.amber, textDecoration: "none",
                          }}>Open Vercel env vars</a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key input for configurable services */}
                  {guide.configurable && (
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                        <input type="password" value={keyInput}
                          onChange={e => { setKeyInput(e.target.value); setConfigState(null); setConfigError(null); }}
                          placeholder={`Paste ${intg.label} API key...`}
                          style={{
                            flex: 1, background: C.obsidian, border: `1px solid ${C.slate}`,
                            borderRadius: "4px", padding: isMobile ? "12px" : "8px 12px",
                            fontFamily: F.mono, fontSize: isMobile ? "14px" : "12px",
                            color: C.parchment, outline: "none",
                            minHeight: isMobile ? "48px" : undefined,
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = C.amber}
                          onBlur={e => e.currentTarget.style.borderColor = C.slate}
                        />
                        <button onClick={() => handleConfigure(intg.id)}
                          disabled={!keyInput.trim() || configState === "testing"}
                          style={{
                            background: C.amber, border: "none", borderRadius: "4px",
                            padding: isMobile ? "12px 20px" : "8px 16px",
                            fontFamily: F.mono, fontSize: "12px", fontWeight: 600,
                            color: C.obsidian, cursor: "pointer",
                            minHeight: isMobile ? "48px" : undefined,
                            opacity: !keyInput.trim() || configState === "testing" ? 0.5 : 1,
                            whiteSpace: "nowrap",
                          }}>{configState === "testing" ? "validating..." : "connect"}</button>
                      </div>

                      {configState === "done" && (
                        <div style={{
                          marginTop: "12px", padding: "10px 14px", borderRadius: "4px",
                          backgroundColor: "rgba(90,138,106,0.1)", border: "1px solid rgba(90,138,106,0.2)",
                          fontFamily: F.sans, fontSize: "13px", color: C.success, lineHeight: 1.5,
                        }}>Connected. Key validated, saved, and redeploy triggered. Live data will appear in ~30 seconds.</div>
                      )}
                      {configState === "error" && (
                        <div style={{
                          marginTop: "12px", padding: "10px 14px", borderRadius: "4px",
                          backgroundColor: "rgba(154,74,74,0.1)", border: "1px solid rgba(154,74,74,0.2)",
                          fontFamily: F.sans, fontSize: "13px", color: C.danger, lineHeight: 1.5,
                        }}>{configError || "Something went wrong."}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={refresh} style={{
          background: "none", border: `1px solid ${C.slate}`, borderRadius: "4px",
          padding: isMobile ? "10px 16px" : "6px 14px", fontFamily: F.mono, fontSize: "11px",
          color: C.amber, cursor: "pointer", minHeight: isMobile ? "44px" : undefined,
        }}>{loading ? "checking..." : "refresh status"}</button>
      </div>

      {/* Usage Monitor */}
      <UsageMonitor isMobile={isMobile} session={session} />
    </div>
  );
}

// ─── Usage Monitor ──────────────────────────────────────────────
function UsageMonitor({ isMobile, session }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usage");
      if (res.ok) setUsage(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  if (!usage && !loading) return null;

  const fmt = (cents) => "$" + (cents / 100).toFixed(2);
  const fmtTokens = (n) => n > 1000000 ? (n / 1000000).toFixed(1) + "M" : n > 1000 ? (n / 1000).toFixed(1) + "K" : String(n);

  return (
    <div style={{ marginTop: "32px" }}>
      <div style={{
        fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.08em",
        textTransform: "uppercase", color: C.amber, marginBottom: "16px",
      }}>AI Usage</div>

      {loading && <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron }}>Loading usage data...</div>}

      {usage && (
        <>
          {/* Monthly summary */}
          <div style={{
            display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: "12px", marginBottom: "20px",
          }}>
            {[
              { label: "Month Cost", value: fmt(usage.month.costCents), color: C.cream },
              { label: "Today", value: fmt(usage.today.costCents), color: C.fog },
              { label: "API Calls", value: String(usage.month.calls), color: C.fog },
              { label: "Tokens", value: fmtTokens(usage.month.inputTokens + usage.month.outputTokens), color: C.fog },
            ].map(s => (
              <div key={s.label} style={{
                backgroundColor: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
                padding: isMobile ? "14px" : "14px 16px",
              }}>
                <div style={{ fontFamily: F.display, fontSize: isMobile ? "22px" : "24px", color: s.color }}>{s.value}</div>
                <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginTop: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* By endpoint */}
          {Object.keys(usage.byEndpoint || {}).length > 0 && (
            <div style={{
              backgroundColor: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
              padding: isMobile ? "14px" : "16px 20px", marginBottom: "16px",
            }}>
              <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>By Endpoint</div>
              {Object.entries(usage.byEndpoint).map(([ep, stats]) => (
                <div key={ep} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: `1px solid ${C.stone}`,
                  fontFamily: F.mono, fontSize: "11px",
                }}>
                  <span style={{ color: C.parchment }}>{ep}</span>
                  <div style={{ display: "flex", gap: "16px", color: C.iron }}>
                    <span>{stats.calls} calls</span>
                    <span>{fmtTokens(stats.inputTokens + stats.outputTokens)} tok</span>
                    <span style={{ color: C.fog }}>{fmt(stats.costCents)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent calls */}
          {usage.recent?.length > 0 && (
            <div style={{
              backgroundColor: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
              padding: isMobile ? "14px" : "16px 20px",
            }}>
              <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Recent Calls</div>
              {usage.recent.slice(0, 10).map((u, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "5px 0", borderBottom: `1px solid ${C.stone}`,
                  fontFamily: F.mono, fontSize: "10px",
                }}>
                  <span style={{ color: C.amber }}>{u.endpoint}</span>
                  <div style={{ display: "flex", gap: "12px", color: C.iron }}>
                    <span>{u.inputTokens + u.outputTokens} tok</span>
                    <span>{fmt(u.costCents)}</span>
                    <span>{new Date(u.time).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={fetchUsage} style={{
            marginTop: "12px", background: "none", border: `1px solid ${C.slate}`, borderRadius: "4px",
            padding: isMobile ? "8px 14px" : "4px 10px", fontFamily: F.mono, fontSize: "10px",
            color: C.iron, cursor: "pointer",
          }}>refresh usage</button>
        </>
      )}
    </div>
  );
}

// ─── Tasks Module (Calendar View) ────────────────────────────────
function TasksModule({ isMobile, session, refreshKey }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDue, setNewDue] = useState("");
  const [newRecurrence, setNewRecurrence] = useState("");

  const headers = session?.access_token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }
    : { "Content-Type": "application/json" };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", { headers });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch {}
    setLoading(false);
  }, [session]);

  useEffect(() => { fetchTasks(); }, [fetchTasks, refreshKey]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await fetch("/api/tasks", {
        method: "POST", headers,
        body: JSON.stringify({ title: newTitle.trim(), priority: newPriority, due_date: newDue || null, recurrence: newRecurrence || null }),
      });
      setNewTitle(""); setNewPriority("medium"); setNewDue(""); setNewRecurrence(""); setShowAdd(false);
      fetchTasks();
    } catch {}
  };

  const toggleComplete = async (task) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH", headers,
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });
      fetchTasks();
    } catch {}
  };

  const deleteTask = async (id) => {
    try {
      await fetch("/api/tasks", {
        method: "DELETE", headers,
        body: JSON.stringify({ id }),
      });
      fetchTasks();
    } catch {}
  };

  // Group tasks by day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Build 14-day calendar window
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const dayTasks = tasks.filter(t => t.due_date === key);
    days.push({
      date: d, key, dayTasks,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[d.getDay()],
      dateLabel: `${monthNames[d.getMonth()]} ${d.getDate()}`,
    });
  }

  const overdue = tasks.filter(t => t.due_date && t.due_date < today.toISOString().slice(0, 10) && !t.completed);
  const noDue = tasks.filter(t => !t.due_date);

  const priorityColors = { high: C.danger, medium: C.amber, low: C.iron };
  const priorityLabels = { high: "HIGH", medium: "MED", low: "LOW" };

  const TaskRow = ({ task, index }) => (
    <div style={{
      display: "flex", alignItems: "center", gap: isMobile ? "10px" : "12px",
      padding: isMobile ? "10px 0" : "8px 0",
      animation: `fadeUp 0.25s ease ${0.03 * index}s both`,
      opacity: task.completed ? 0.35 : 1,
      transition: "opacity 0.3s ease",
    }}>
      {/* Complete button — prominent */}
      <button onClick={() => toggleComplete(task)} style={{
        width: isMobile ? "36px" : "30px", height: isMobile ? "36px" : "30px", flexShrink: 0,
        borderRadius: "6px", cursor: "pointer",
        background: task.completed
          ? C.success
          : `linear-gradient(135deg, rgba(90,138,106,0.1), rgba(90,138,106,0.05))`,
        border: `1.5px solid ${task.completed ? C.success : "rgba(90,138,106,0.3)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.25s ease",
      }}
        onMouseEnter={e => { if (!task.completed) { e.currentTarget.style.borderColor = C.success; e.currentTarget.style.background = "rgba(90,138,106,0.15)"; }}}
        onMouseLeave={e => { if (!task.completed) { e.currentTarget.style.borderColor = "rgba(90,138,106,0.3)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(90,138,106,0.1), rgba(90,138,106,0.05))"; }}}
      >
        <svg style={{ width: isMobile ? "16px" : "14px", height: isMobile ? "16px" : "14px", color: task.completed ? C.obsidian : C.success }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>

      {/* Title */}
      <div style={{
        flex: 1, fontFamily: F.sans, fontSize: isMobile ? "14px" : "13px",
        color: task.completed ? C.iron : C.parchment,
        textDecoration: task.completed ? "line-through" : "none",
        transition: "color 0.2s ease",
      }}>{task.title}</div>

      {/* Priority badge */}
      <span style={{
        fontFamily: F.mono, fontSize: "8px", letterSpacing: "0.06em",
        padding: "2px 6px", borderRadius: "3px",
        color: priorityColors[task.priority],
        border: `1px solid ${priorityColors[task.priority]}30`,
        backgroundColor: `${priorityColors[task.priority]}10`,
      }}>{priorityLabels[task.priority]}</span>

      {/* Recurrence badge */}
      {task.recurrence && (
        <span style={{
          fontFamily: F.mono, fontSize: "7px", letterSpacing: "0.06em",
          padding: "2px 6px", borderRadius: "3px",
          color: "#6A8FA3", border: "1px solid rgba(106,143,163,0.3)",
          backgroundColor: "rgba(106,143,163,0.08)",
        }}>{task.recurrence === "daily" ? "DAILY" : "WEEKLY"}</span>
      )}

      {/* Delete */}
      <button onClick={() => deleteTask(task.id)} style={{
        background: "none", border: "none", cursor: "pointer",
        color: C.slate, fontSize: "14px", padding: "4px",
        minWidth: isMobile ? "32px" : undefined, minHeight: isMobile ? "32px" : undefined,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "color 0.2s ease",
      }}
        onMouseEnter={e => e.currentTarget.style.color = C.danger}
        onMouseLeave={e => e.currentTarget.style.color = C.slate}
      >x</button>
    </div>
  );

  const inputStyle = {
    background: C.obsidian, border: `1px solid ${C.slate}`, borderRadius: "4px",
    padding: isMobile ? "12px" : "8px 12px",
    fontFamily: F.sans, fontSize: isMobile ? "16px" : "13px",
    color: C.parchment, outline: "none", width: "100%",
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Analytics strip */}
      {tasks.length > 0 && (() => {
        const completed = tasks.filter(t => t.completed);
        const open = tasks.filter(t => !t.completed);
        const todayStr = new Date().toISOString().slice(0, 10);
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const completedThisWeek = completed.filter(t => t.updated_at && t.updated_at >= weekAgo);
        const createdThisWeek = tasks.filter(t => t.created_at && t.created_at >= weekAgo);
        const overdueTasks = open.filter(t => t.due_date && t.due_date < todayStr);
        const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

        // Average time to close (days)
        const closeTimes = completed.filter(t => t.created_at && t.updated_at).map(t => {
          const created = new Date(t.created_at).getTime();
          const closed = new Date(t.updated_at).getTime();
          return Math.max(0, Math.round((closed - created) / 86400000));
        });
        const avgClose = closeTimes.length > 0 ? (closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length).toFixed(1) : "--";

        return (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
            gap: "8px", marginBottom: "20px",
          }}>
            {[
              { label: "Open", value: open.length, color: C.cream },
              { label: "Done", value: completed.length, color: C.success },
              { label: "Rate", value: `${completionRate}%`, color: completionRate > 70 ? C.success : completionRate > 40 ? C.caution : C.danger },
              { label: "This Week", value: `+${createdThisWeek.length}/-${completedThisWeek.length}`, color: C.amber },
              { label: "Avg Close", value: `${avgClose}d`, color: C.fog },
              { label: "Overdue", value: overdueTasks.length, color: overdueTasks.length > 0 ? C.danger : C.success },
            ].map(s => (
              <div key={s.label} style={{
                background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
                padding: "10px 12px", textAlign: "center",
              }}>
                <div style={{ fontFamily: F.display, fontSize: isMobile ? "18px" : "20px", color: s.color, lineHeight: 1, fontWeight: 300 }}>{s.value}</div>
                <div style={{ fontFamily: F.mono, fontSize: "7px", color: C.iron, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontFamily: F.mono, fontSize: "10px", color: C.iron }}>
          {tasks.filter(t => !t.completed).length} open / {tasks.length} total
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          background: showAdd ? C.stone : C.amber, border: "none", borderRadius: "4px",
          padding: isMobile ? "8px 14px" : "5px 12px",
          fontFamily: F.mono, fontSize: "11px", color: showAdd ? C.iron : C.obsidian,
          cursor: "pointer", fontWeight: 600, minHeight: isMobile ? "40px" : undefined,
        }}>{showAdd ? "cancel" : "+ add task"}</button>
      </div>

      {/* Add task form */}
      {showAdd && (
        <div style={{
          backgroundColor: C.cavern, border: `1px solid ${C.amber}`, borderRadius: "6px",
          padding: isMobile ? "16px" : "16px 20px", marginBottom: "20px",
          animation: "fadeUp 0.2s ease both",
        }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="Task title..." style={{ ...inputStyle, marginBottom: "10px" }}
            onKeyDown={e => e.key === "Enter" && addTask()}
            onFocus={e => e.currentTarget.style.borderColor = C.amber}
            onBlur={e => e.currentTarget.style.borderColor = C.slate}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{
              ...inputStyle, width: "auto", cursor: "pointer",
            }}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
              style={{ ...inputStyle, width: "auto" }}
            />
            <select value={newRecurrence} onChange={e => setNewRecurrence(e.target.value)} style={{
              ...inputStyle, width: "auto", cursor: "pointer", color: newRecurrence ? "#6A8FA3" : C.iron,
            }}>
              <option value="">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <button onClick={addTask} style={{
              background: C.amber, border: "none", borderRadius: "4px",
              padding: isMobile ? "10px 16px" : "8px 14px",
              fontFamily: F.mono, fontSize: "12px", fontWeight: 600,
              color: C.obsidian, cursor: "pointer",
            }}>add</button>
          </div>
        </div>
      )}

      {loading && <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron }}>Loading tasks...</div>}

      {/* Overdue */}
      {overdue.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{
            fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.08em",
            textTransform: "uppercase", color: C.danger, marginBottom: "8px",
          }}>Overdue</div>
          <div style={{
            backgroundColor: C.cavern, border: `1px solid ${C.danger}30`, borderRadius: "6px",
            padding: isMobile ? "8px 14px" : "8px 16px",
          }}>
            {overdue.map((t, i) => <TaskRow key={t.id} task={t} index={i} />)}
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {days.map((day, i) => {
          if (day.dayTasks.length === 0 && i > 7) return null; // Hide empty far-future days
          const isToday = i === 0;
          return (
            <div key={day.key} style={{
              display: "flex", gap: isMobile ? "10px" : "16px",
              padding: isMobile ? "10px 0" : "8px 0",
              borderBottom: `1px solid ${C.stone}`,
              animation: `fadeUp 0.3s ease ${0.03 * i}s both`,
              opacity: day.dayTasks.length === 0 ? 0.5 : 1,
            }}>
              {/* Date column */}
              <div style={{
                width: isMobile ? "60px" : "80px", flexShrink: 0,
                fontFamily: F.mono, fontSize: "10px", paddingTop: "2px",
              }}>
                <div style={{ color: isToday ? C.amber : C.fog, fontWeight: isToday ? 600 : 400 }}>{day.label}</div>
                <div style={{ color: C.iron, marginTop: "2px" }}>{day.dateLabel}</div>
              </div>

              {/* Tasks column */}
              <div style={{ flex: 1 }}>
                {day.dayTasks.length > 0 ? (
                  day.dayTasks.map((t, j) => <TaskRow key={t.id} task={t} index={j} />)
                ) : (
                  <div style={{ fontFamily: F.sans, fontSize: "12px", color: C.slate, padding: "8px 0" }}>—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No-due-date tasks */}
      {noDue.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div style={{
            fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.08em",
            textTransform: "uppercase", color: C.iron, marginBottom: "8px",
          }}>No due date</div>
          <div style={{
            backgroundColor: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
            padding: isMobile ? "8px 14px" : "8px 16px",
          }}>
            {noDue.map((t, i) => <TaskRow key={t.id} task={t} index={i} />)}
          </div>
        </div>
      )}

      {/* Recently completed */}
      {tasks.filter(t => t.completed).length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <div style={{
            fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.08em",
            textTransform: "uppercase", color: C.success, marginBottom: "8px",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <svg style={{ width: "12px", height: "12px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            Completed ({tasks.filter(t => t.completed).length})
          </div>
          <div style={{
            backgroundColor: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
            padding: isMobile ? "8px 14px" : "8px 16px",
          }}>
            {tasks.filter(t => t.completed).slice(0, 10).map((t, i) => <TaskRow key={t.id} task={t} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chat Shell ──────────────────────────────────────────────────
function ChatShell({ isMobile, session, liveData, triggerRefresh }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const connected = liveData?.status?.anthropic?.connected || false;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (res.ok) {
        let responseText = data.response || "";
        // Show action results
        if (data.actions?.length > 0) {
          const actionSummary = data.actions.map(a =>
            a.ok ? `  [ok] ${a.action}` : `  [fail] ${a.action}: ${a.error}`
          ).join("\n");
          responseText += `\n\n--- actions executed ---\n${actionSummary}`;
          if (data.actions.some(a => a.ok)) triggerRefresh?.();
        }
        // Show token usage
        if (data.usage) {
          responseText += `\n\n[${data.usage.input_tokens + data.usage.output_tokens} tokens]`;
        }
        setMessages(prev => [...prev, { role: "assistant", text: responseText }]);
      } else {
        setMessages(prev => [...prev, { role: "error", text: data.error || "Request failed" }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "error", text: "Network error" }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const inputStyle = {
    flex: 1, background: C.obsidian, border: `1px solid ${C.slate}`,
    borderRadius: "4px", padding: isMobile ? "14px" : "10px 14px",
    fontFamily: F.sans, fontSize: isMobile ? "16px" : "14px",
    color: C.parchment, outline: "none",
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: isMobile ? "calc(100vh - 180px)" : "calc(100vh - 220px)",
      animation: "fadeUp 0.4s ease both",
    }}>
      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: "auto", marginBottom: "16px",
        display: "flex", flexDirection: "column", gap: "12px",
      }}>
        {!connected && messages.length === 0 && (
          <div style={{
            padding: isMobile ? "20px" : "28px", borderRadius: "6px",
            backgroundColor: C.cavern, border: `1px solid ${C.stone}`,
            textAlign: "center",
          }}>
            <div style={{ fontFamily: F.display, fontSize: "20px", color: C.cream, marginBottom: "8px" }}>Alfred</div>
            <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron, lineHeight: 1.6, marginBottom: "16px" }}>
              Connect your Anthropic API key in Integrations to enable Alfred. Once connected, you can manage tasks, query projects, and control the Batcave with natural language.
            </div>
            <div style={{
              fontFamily: F.mono, fontSize: "10px", color: C.slate,
              padding: "8px 14px", backgroundColor: C.obsidian, borderRadius: "4px",
              display: "inline-block",
            }}>ANTHROPIC KEY NOT CONNECTED</div>
          </div>
        )}

        {connected && messages.length === 0 && (
          <div style={{
            padding: isMobile ? "20px" : "28px", borderRadius: "6px",
            backgroundColor: C.cavern, border: `1px solid ${C.stone}`,
          }}>
            <div style={{ fontFamily: F.display, fontSize: "20px", color: C.cream, marginBottom: "8px" }}>Alfred</div>
            <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron, lineHeight: 1.6 }}>
              Your AI assistant. Manage tasks, query status, control your projects. Try:
            </div>
            <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.fog, marginTop: "12px", lineHeight: 2 }}>
              <div style={{ color: C.amber }}>"add task: review Q1 metrics, high priority, due friday"</div>
              <div style={{ color: C.amber }}>"what's the status of all projects?"</div>
              <div style={{ color: C.amber }}>"deploy omote to production"</div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            animation: "fadeUp 0.2s ease both",
          }}>
            <div style={{
              maxWidth: "80%", padding: isMobile ? "12px 14px" : "10px 14px", borderRadius: "6px",
              fontFamily: msg.role === "assistant" ? F.sans : F.sans,
              fontSize: "13px", lineHeight: 1.6,
              backgroundColor: msg.role === "user" ? C.amberSubtle : msg.role === "error" ? "rgba(154,74,74,0.1)" : C.cavern,
              border: `1px solid ${msg.role === "user" ? C.amberGlow : msg.role === "error" ? "rgba(154,74,74,0.2)" : C.stone}`,
              color: msg.role === "error" ? C.danger : C.parchment,
              whiteSpace: "pre-wrap",
            }}>{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div style={{
            fontFamily: F.mono, fontSize: "12px", color: C.iron,
            padding: "8px 14px",
          }}>thinking...</div>
        )}
      </div>

      {/* Input bar */}
      <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          placeholder={connected ? "Command..." : "Connect Anthropic key in Integrations"}
          disabled={!connected}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          style={{
            ...inputStyle,
            opacity: connected ? 1 : 0.4,
          }}
          onFocus={e => e.currentTarget.style.borderColor = C.amber}
          onBlur={e => e.currentTarget.style.borderColor = C.slate}
        />
        <button onClick={sendMessage} disabled={!connected || !input.trim() || loading} style={{
          background: C.amber, border: "none", borderRadius: "4px",
          padding: isMobile ? "14px 20px" : "10px 16px",
          fontFamily: F.mono, fontSize: "12px", fontWeight: 600,
          color: C.obsidian, cursor: connected ? "pointer" : "not-allowed",
          opacity: !connected || !input.trim() || loading ? 0.4 : 1,
          whiteSpace: "nowrap",
        }}>send</button>
      </div>
    </div>
  );
}

// ─── Calendar Module ─────────────────────────────────────────────
function CalendarModule({ isMobile, session, refreshKey }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newCategory, setNewCategory] = useState("personal");
  const [newLocation, setNewLocation] = useState("");

  const headers = session?.access_token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }
    : { "Content-Type": "application/json" };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const y = viewDate.getFullYear();
      const m = viewDate.getMonth();
      const from = new Date(y, m - 1, 1).toISOString().slice(0, 10);
      const to = new Date(y, m + 2, 0).toISOString().slice(0, 10);
      const res = await fetch(`/api/events?from=${from}&to=${to}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {}
    setLoading(false);
  }, [session, viewDate]);

  useEffect(() => { fetchEvents(); }, [fetchEvents, refreshKey]);

  const addEvent = async () => {
    if (!newTitle.trim() || !newStart) return;
    try {
      await fetch("/api/events", {
        method: "POST", headers,
        body: JSON.stringify({
          title: newTitle.trim(), start_date: newStart,
          end_date: newEnd || newStart, category: newCategory,
          location: newLocation || null,
        }),
      });
      setNewTitle(""); setNewStart(""); setNewEnd(""); setNewLocation(""); setShowAdd(false);
      fetchEvents();
    } catch {}
  };

  const deleteEvent = async (id) => {
    try {
      await fetch("/api/events", { method: "DELETE", headers, body: JSON.stringify({ id }) });
      fetchEvents();
    } catch {}
  };

  // Calendar math
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayLabels = isMobile ? ["S","M","T","W","T","F","S"] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Build grid cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const categoryColors = {
    personal: C.amber, professional: "#6A8FA3", travel: "#8A6FA3",
    health: C.success, project: "#A38A6F",
  };
  const categoryLabels = {
    personal: "Personal", professional: "Work", travel: "Travel",
    health: "Health", project: "Project",
  };

  // Check if event spans a given date
  const getEventsForDate = (dateStr) => {
    return events.filter(ev => {
      const s = ev.start_date;
      const e = ev.end_date || ev.start_date;
      return dateStr >= s && dateStr <= e;
    });
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date());

  const inputStyle = {
    background: C.obsidian, border: `1px solid ${C.slate}`, borderRadius: "4px",
    padding: isMobile ? "12px" : "8px 12px",
    fontFamily: F.sans, fontSize: isMobile ? "16px" : "13px",
    color: C.parchment, outline: "none", width: "100%",
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Month nav */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
      }}>
        <button onClick={prevMonth} style={{
          background: "none", border: `1px solid ${C.slate}`, borderRadius: "6px",
          padding: isMobile ? "10px 16px" : "4px 10px", cursor: "pointer",
          fontFamily: F.mono, fontSize: isMobile ? "13px" : "12px", color: C.fog,
          minHeight: isMobile ? "44px" : undefined,
        }}>prev</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontFamily: F.display, fontSize: isMobile ? "22px" : "24px", color: C.cream }}>
            {monthNames[month]}
          </span>
          <span style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron, marginLeft: "8px" }}>{year}</span>
        </div>
        <button onClick={goToday} style={{
          background: "none", border: `1px solid ${C.slate}`, borderRadius: "6px",
          padding: isMobile ? "10px 16px" : "4px 10px", cursor: "pointer",
          fontFamily: F.mono, fontSize: isMobile ? "13px" : "11px", color: C.amber,
          minHeight: isMobile ? "44px" : undefined,
        }}>today</button>
        <button onClick={nextMonth} style={{
          background: "none", border: `1px solid ${C.slate}`, borderRadius: "6px",
          padding: isMobile ? "10px 16px" : "4px 10px", cursor: "pointer",
          fontFamily: F.mono, fontSize: isMobile ? "13px" : "12px", color: C.fog,
          minHeight: isMobile ? "44px" : undefined,
        }}>next</button>
      </div>

      {/* Add event button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <span key={k} style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              fontFamily: F.mono, fontSize: "9px", color: C.iron,
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "2px", backgroundColor: categoryColors[k] }} />
              {v}
            </span>
          ))}
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          background: showAdd ? C.stone : C.amber, border: "none", borderRadius: "4px",
          padding: isMobile ? "8px 14px" : "5px 12px",
          fontFamily: F.mono, fontSize: "11px", color: showAdd ? C.iron : C.obsidian,
          cursor: "pointer", fontWeight: 600, minHeight: isMobile ? "40px" : undefined,
        }}>{showAdd ? "cancel" : "+ event"}</button>
      </div>

      {/* Add event form */}
      {showAdd && (
        <div style={{
          backgroundColor: C.cavern, border: `1px solid ${C.amber}`, borderRadius: "6px",
          padding: isMobile ? "16px" : "16px 20px", marginBottom: "16px",
          animation: "fadeUp 0.2s ease both",
        }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="Event title..." style={{ ...inputStyle, marginBottom: "10px" }}
            onKeyDown={e => e.key === "Enter" && addEvent()}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginBottom: "4px" }}>Start</div>
              <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginBottom: "4px" }}>End</div>
              <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
              {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input value={newLocation} onChange={e => setNewLocation(e.target.value)}
              placeholder="Location (optional)" style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={addEvent} style={{
              background: C.amber, border: "none", borderRadius: "4px",
              padding: isMobile ? "10px 16px" : "8px 14px",
              fontFamily: F.mono, fontSize: "12px", fontWeight: 600,
              color: C.obsidian, cursor: "pointer",
            }}>add</button>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div style={{
        backgroundColor: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
        overflow: "hidden",
      }}>
        {/* Day headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
          borderBottom: `1px solid ${C.stone}`,
        }}>
          {dayLabels.map(d => (
            <div key={d} style={{
              padding: "8px 0", textAlign: "center",
              fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.06em",
              color: C.iron, textTransform: "uppercase",
            }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} style={{ minHeight: isMobile ? "52px" : "80px", backgroundColor: C.obsidian, borderBottom: `1px solid ${C.stone}`, borderRight: `1px solid ${C.stone}` }} />;

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const dayEvents = getEventsForDate(dateStr);

            return (
              <div key={dateStr} style={{
                minHeight: isMobile ? "52px" : "80px",
                padding: isMobile ? "4px" : "4px 6px",
                borderBottom: `1px solid ${C.stone}`,
                borderRight: `1px solid ${C.stone}`,
                backgroundColor: isToday ? C.amberSubtle : "transparent",
                overflow: "hidden",
              }}>
                {/* Day number */}
                <div style={{
                  fontFamily: F.mono, fontSize: isMobile ? "11px" : "12px",
                  color: isToday ? C.amber : C.fog,
                  fontWeight: isToday ? 600 : 400,
                  marginBottom: "2px",
                }}>{day}</div>

                {/* Events */}
                {dayEvents.slice(0, isMobile ? 2 : 3).map(ev => {
                  const isStart = ev.start_date === dateStr;
                  const evColor = categoryColors[ev.category] || C.amber;
                  return (
                    <div key={ev.id} onClick={() => { if (confirm(`Delete "${ev.title}"?`)) deleteEvent(ev.id); }}
                      style={{
                        fontFamily: F.sans, fontSize: isMobile ? "9px" : "10px",
                        color: C.cream, padding: "1px 4px", marginBottom: "1px",
                        borderRadius: isStart ? "3px 0 0 3px" : "0",
                        backgroundColor: `${evColor}40`,
                        borderLeft: isStart ? `2px solid ${evColor}` : "none",
                        cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                      title={`${ev.title}${ev.location ? " — " + ev.location : ""}`}
                    >
                      {isStart ? ev.title : ""}
                    </div>
                  );
                })}
                {dayEvents.length > (isMobile ? 2 : 3) && (
                  <div style={{ fontFamily: F.mono, fontSize: "8px", color: C.iron }}>
                    +{dayEvents.length - (isMobile ? 2 : 3)} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events list */}
      <div style={{ marginTop: "24px" }}>
        <div style={{
          fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.08em",
          textTransform: "uppercase", color: C.amber, marginBottom: "12px",
        }}>Upcoming</div>

        {loading && <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron }}>Loading events...</div>}

        {events.filter(e => e.end_date >= todayStr || e.start_date >= todayStr).slice(0, 10).map((ev, i) => (
          <div key={ev.id} style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: isMobile ? "12px 0" : "10px 0",
            borderBottom: `1px solid ${C.stone}`,
            animation: `fadeUp 0.25s ease ${0.03 * i}s both`,
          }}>
            {/* Category dot */}
            <div style={{
              width: "8px", height: "8px", borderRadius: "2px", flexShrink: 0,
              backgroundColor: categoryColors[ev.category] || C.amber,
            }} />

            {/* Details */}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.sans, fontSize: isMobile ? "14px" : "13px", color: C.parchment }}>{ev.title}</div>
              <div style={{ fontFamily: F.mono, fontSize: "10px", color: C.iron, marginTop: "2px" }}>
                {ev.start_date}{ev.end_date && ev.end_date !== ev.start_date ? ` — ${ev.end_date}` : ""}
                {ev.location && <span style={{ marginLeft: "8px", color: C.fog }}>{ev.location}</span>}
              </div>
            </div>

            {/* Category label */}
            <span style={{
              fontFamily: F.mono, fontSize: "8px", letterSpacing: "0.06em",
              textTransform: "uppercase", padding: "2px 6px", borderRadius: "3px",
              color: categoryColors[ev.category] || C.amber,
              backgroundColor: `${categoryColors[ev.category] || C.amber}10`,
              border: `1px solid ${categoryColors[ev.category] || C.amber}30`,
            }}>{categoryLabels[ev.category] || ev.category}</span>

            {/* Delete */}
            <button onClick={() => deleteEvent(ev.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: C.slate, fontSize: "14px", padding: "4px",
              minWidth: isMobile ? "32px" : undefined, minHeight: isMobile ? "32px" : undefined,
            }}>x</button>
          </div>
        ))}

        {!loading && events.length === 0 && (
          <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron }}>
            No events yet. Add one above or use #batcave_calendar in chat.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Placeholder Module ──────────────────────────────────────────

// ─── Agents Module ───────────────────────────────────────────────
function AgentsModule({ isMobile, session }) {
  const [view, setView] = useState("dashboard"); // dashboard, catalog, detail
  const [catalog, setCatalog] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [selectedDep, setSelectedDep] = useState(null);
  const [runs, setRuns] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);

  const headers = session?.access_token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }
    : { "Content-Type": "application/json" };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents", { headers });
      if (res.ok) {
        const data = await res.json();
        setCatalog(data.catalog || []);
        setDeployments(data.deployments || []);
        setApprovals(data.approvals || []);
      }
    } catch {}
    setLoading(false);
  }, [session]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchDetail = async (dep) => {
    setSelectedDep(dep);
    setView("detail");
    const [runsRes, goalsRes] = await Promise.all([
      fetch(`/api/agents?action=runs&deployment_id=${dep.id}`, { headers }).then(r => r.json()).catch(() => ({ runs: [] })),
      fetch(`/api/agents?action=goals&deployment_id=${dep.id}`, { headers }).then(r => r.json()).catch(() => ({ goals: [] })),
    ]);
    setRuns(runsRes.runs || []);
    setGoals(goalsRes.goals || []);
  };

  const deployAgent = async (catalogId) => {
    const res = await fetch("/api/agents", { method: "POST", headers, body: JSON.stringify({ action: "deploy", catalog_id: catalogId }) });
    if (res.ok) { fetchAll(); setView("dashboard"); }
  };

  const runAgent = async (deploymentId) => {
    setRunningId(deploymentId);
    try {
      const res = await fetch("/api/agents", { method: "POST", headers, body: JSON.stringify({ action: "run", deployment_id: deploymentId }) });
      if (res.ok) {
        const data = await res.json();
        if (selectedDep?.id === deploymentId) fetchDetail(selectedDep);
        fetchAll();
      }
    } catch {}
    setRunningId(null);
  };

  const decideApproval = async (approvalId, decision) => {
    await fetch("/api/agents", { method: "POST", headers, body: JSON.stringify({ action: "decide", approval_id: approvalId, decision }) });
    fetchAll();
    if (selectedDep) fetchDetail(selectedDep);
  };

  const pauseAgent = async (depId, action) => {
    await fetch("/api/agents", { method: "POST", headers, body: JSON.stringify({ action, deployment_id: depId }) });
    fetchAll();
  };

  const levelColors = { 1: C.iron, 2: C.amber, 3: "#6A8FA3", 4: C.success };
  const levelLabels = { 1: "OBSERVER", 2: "ADVISOR", 3: "EXECUTOR", 4: "AUTONOMOUS" };
  const levelDescs = {
    1: "Watches and reports. Zero risk.",
    2: "Analyzes and recommends. You decide.",
    3: "Proposes actions. You approve.",
    4: "Acts within guardrails. You review after.",
  };
  const statusColors = { active: C.success, paused: C.caution, retired: C.iron };

  // ─── CATALOG VIEW ────
  if (view === "catalog") return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <button onClick={() => setView("dashboard")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: F.mono, fontSize: "10px", color: C.amber,
        }}>back to dashboard</button>
      </div>

      {/* Maturity model legend */}
      <div style={{
        display: "flex", gap: isMobile ? "8px" : "16px", flexWrap: "wrap",
        marginBottom: "24px", padding: "12px 16px",
        background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "8px",
      }}>
        {[1, 2, 3, 4].map(level => (
          <div key={level} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: levelColors[level] }} />
            <div>
              <div style={{ fontFamily: F.mono, fontSize: "8px", color: levelColors[level], letterSpacing: "0.06em" }}>L{level} {levelLabels[level]}</div>
              <div style={{ fontFamily: F.sans, fontSize: "10px", color: C.iron }}>{levelDescs[level]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {catalog.map((agent, i) => {
          const deployed = deployments.some(d => d.catalog_id === agent.id && d.status !== "retired");
          return (
            <div key={agent.id} style={{
              background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "8px",
              padding: isMobile ? "16px" : "20px", position: "relative", overflow: "hidden",
              animation: `fadeUp 0.3s ease ${0.04 * i}s both`,
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", backgroundColor: levelColors[agent.level] }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontFamily: F.sans, fontSize: isMobile ? "15px" : "14px", fontWeight: 600, color: C.cream }}>{agent.name}</span>
                    <span style={{ fontFamily: F.mono, fontSize: "7px", padding: "2px 6px", borderRadius: "3px", backgroundColor: `${levelColors[agent.level]}15`, color: levelColors[agent.level], border: `1px solid ${levelColors[agent.level]}30` }}>
                      L{agent.level} {agent.level_label?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate }}>
                    {agent.integrations?.join(" + ")} {agent.schedule_default ? `/ ${agent.schedule_default}` : "/ on-demand"}
                  </div>
                </div>
                {!deployed ? (
                  <button onClick={() => deployAgent(agent.id)} style={{
                    background: C.amber, border: "none", borderRadius: "4px",
                    padding: isMobile ? "8px 14px" : "5px 12px",
                    fontFamily: F.mono, fontSize: "10px", fontWeight: 600,
                    color: C.obsidian, cursor: "pointer",
                    minHeight: isMobile ? "36px" : undefined,
                  }}>deploy</button>
                ) : (
                  <span style={{ fontFamily: F.mono, fontSize: "9px", color: C.success }}>deployed</span>
                )}
              </div>

              <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.fog, lineHeight: 1.5 }}>{agent.description}</div>

              {agent.estimated_cost_cents > 0 && (
                <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginTop: "6px" }}>
                  ~${(agent.estimated_cost_cents / 100).toFixed(2)}/run
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── DETAIL VIEW ────
  if (view === "detail" && selectedDep) {
    const agent = selectedDep.catalog || {};
    return (
      <div style={{ animation: "fadeUp 0.4s ease both" }}>
        <button onClick={() => { setView("dashboard"); setSelectedDep(null); }} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: F.mono, fontSize: "10px", color: C.amber, marginBottom: "20px",
        }}>back to dashboard</button>

        {/* Agent header */}
        <div style={{
          background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "8px",
          padding: isMobile ? "16px" : "20px", marginBottom: "20px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", backgroundColor: levelColors[agent.level] }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <div style={{ fontFamily: F.sans, fontSize: "16px", fontWeight: 600, color: C.cream }}>{agent.name}</div>
              <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, marginTop: "2px" }}>
                {selectedDep.total_runs || 0} runs / ${(parseFloat(selectedDep.total_cost_cents || 0) / 100).toFixed(2)} spent
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => runAgent(selectedDep.id)} disabled={runningId === selectedDep.id} style={{
                background: C.amber, border: "none", borderRadius: "4px",
                padding: isMobile ? "8px 14px" : "6px 14px",
                fontFamily: F.mono, fontSize: "10px", fontWeight: 600,
                color: C.obsidian, cursor: "pointer",
                opacity: runningId === selectedDep.id ? 0.5 : 1,
                minHeight: isMobile ? "36px" : undefined,
              }}>{runningId === selectedDep.id ? "running..." : "run now"}</button>
              <button onClick={() => pauseAgent(selectedDep.id, selectedDep.status === "active" ? "pause" : "resume")} style={{
                background: "none", border: `1px solid ${C.stone}`, borderRadius: "4px",
                padding: isMobile ? "8px 10px" : "6px 10px",
                fontFamily: F.mono, fontSize: "10px", color: C.iron, cursor: "pointer",
                minHeight: isMobile ? "36px" : undefined,
              }}>{selectedDep.status === "active" ? "pause" : "resume"}</button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: statusColors[selectedDep.status] || C.iron }} />
            <span style={{ fontFamily: F.mono, fontSize: "9px", color: statusColors[selectedDep.status] || C.iron }}>{selectedDep.status}</span>
            {selectedDep.last_run_at && <span style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate }}> / last run {new Date(selectedDep.last_run_at).toLocaleString()}</span>}
          </div>
        </div>

        {/* Pending approvals for this agent */}
        {approvals.filter(a => a.deployment_id === selectedDep.id).length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.caution, letterSpacing: "0.08em", marginBottom: "8px" }}>PENDING APPROVAL</div>
            {approvals.filter(a => a.deployment_id === selectedDep.id).map(a => (
              <div key={a.id} style={{
                background: "rgba(184,146,74,0.06)", border: "1px solid rgba(184,146,74,0.2)",
                borderRadius: "6px", padding: isMobile ? "12px" : "12px 16px", marginBottom: "6px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: "10px", flexWrap: "wrap",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.parchment }}>{a.description}</div>
                  <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, marginTop: "2px" }}>{a.action_type}</div>
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button onClick={() => decideApproval(a.id, "approve")} style={{
                    background: C.success, border: "none", borderRadius: "4px",
                    padding: isMobile ? "8px 12px" : "4px 10px",
                    fontFamily: F.mono, fontSize: "10px", color: C.obsidian, cursor: "pointer",
                    fontWeight: 600, minHeight: isMobile ? "36px" : undefined,
                  }}>approve</button>
                  <button onClick={() => decideApproval(a.id, "reject")} style={{
                    background: "none", border: `1px solid ${C.stone}`, borderRadius: "4px",
                    padding: isMobile ? "8px 12px" : "4px 10px",
                    fontFamily: F.mono, fontSize: "10px", color: C.iron, cursor: "pointer",
                    minHeight: isMobile ? "36px" : undefined,
                  }}>reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Run history */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, letterSpacing: "0.08em", marginBottom: "8px" }}>RUN HISTORY</div>
          {runs.length === 0 && <div style={{ fontFamily: F.sans, fontSize: "12px", color: C.iron }}>No runs yet. Hit "run now" to start.</div>}
          {runs.map((r, i) => (
            <div key={r.id} style={{
              padding: "10px 0", borderBottom: `1px solid ${C.stone}`,
              animation: `fadeUp 0.2s ease ${0.03 * i}s both`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    backgroundColor: r.status === "completed" ? C.success : r.status === "failed" ? C.danger : r.status === "pending_approval" ? C.caution : C.iron,
                  }} />
                  <span style={{ fontFamily: F.mono, fontSize: "10px", color: C.fog }}>{r.status}</span>
                  <span style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate }}>{r.trigger_type}</span>
                </div>
                <span style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate }}>{new Date(r.started_at).toLocaleString()}</span>
              </div>
              {r.summary && <div style={{ fontFamily: F.sans, fontSize: "12px", color: C.fog, marginTop: "4px", lineHeight: 1.5 }}>{r.summary}</div>}
              {r.error && <div style={{ fontFamily: F.mono, fontSize: "11px", color: C.danger, marginTop: "4px" }}>{r.error}</div>}
            </div>
          ))}
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <div>
            <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, letterSpacing: "0.08em", marginBottom: "8px" }}>GOALS</div>
            {goals.map(g => (
              <div key={g.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: `1px solid ${C.stone}`,
              }}>
                <span style={{ fontFamily: F.sans, fontSize: "13px", color: C.parchment }}>{g.title}</span>
                <span style={{
                  fontFamily: F.mono, fontSize: "9px", padding: "2px 8px", borderRadius: "3px",
                  color: g.status === "met" ? C.success : g.status === "missed" ? C.danger : C.amber,
                  border: `1px solid ${g.status === "met" ? C.success : g.status === "missed" ? C.danger : C.amber}30`,
                }}>{g.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── DASHBOARD VIEW (default) ────
  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Stats strip */}
      <div style={{
        display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
        gap: "10px", marginBottom: "24px",
      }}>
        {[
          { label: "Active", value: deployments.filter(d => d.status === "active").length, color: C.success },
          { label: "Paused", value: deployments.filter(d => d.status === "paused").length, color: C.caution },
          { label: "Pending", value: approvals.length, color: approvals.length > 0 ? C.amber : C.iron },
          { label: "Total Runs", value: deployments.reduce((s, d) => s + (d.total_runs || 0), 0), color: C.fog },
        ].map(s => (
          <div key={s.label} style={{
            background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
            padding: "10px 12px", textAlign: "center",
          }}>
            <div style={{ fontFamily: F.display, fontSize: isMobile ? "22px" : "24px", color: s.color, lineHeight: 1, fontWeight: 300 }}>{s.value}</div>
            <div style={{ fontFamily: F.mono, fontSize: "7px", color: C.iron, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending approvals — prominent */}
      {approvals.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            fontFamily: F.mono, fontSize: "9px", letterSpacing: "0.08em", color: C.caution,
            display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.caution, animation: "breathe 2s ease infinite" }} />
            {approvals.length} ACTION{approvals.length > 1 ? "S" : ""} AWAITING YOUR APPROVAL
          </div>
          {approvals.map(a => (
            <div key={a.id} style={{
              background: "rgba(184,146,74,0.06)", border: "1px solid rgba(184,146,74,0.2)",
              borderRadius: "6px", padding: isMobile ? "12px" : "12px 16px", marginBottom: "6px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              gap: "10px", flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.parchment }}>{a.description}</div>
                <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, marginTop: "2px" }}>{a.action_type}</div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button onClick={() => decideApproval(a.id, "approve")} style={{
                  background: C.success, border: "none", borderRadius: "4px",
                  padding: isMobile ? "8px 12px" : "4px 10px",
                  fontFamily: F.mono, fontSize: "10px", color: C.obsidian, cursor: "pointer",
                  fontWeight: 600, minHeight: isMobile ? "36px" : undefined,
                }}>approve</button>
                <button onClick={() => decideApproval(a.id, "reject")} style={{
                  background: "none", border: `1px solid ${C.stone}`, borderRadius: "4px",
                  padding: isMobile ? "8px 12px" : "4px 10px",
                  fontFamily: F.mono, fontSize: "10px", color: C.iron, cursor: "pointer",
                  minHeight: isMobile ? "36px" : undefined,
                }}>reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deployed agents */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, letterSpacing: "0.08em" }}>DEPLOYED AGENTS</div>
        <button onClick={() => setView("catalog")} style={{
          background: C.amber, border: "none", borderRadius: "4px",
          padding: isMobile ? "8px 14px" : "5px 12px",
          fontFamily: F.mono, fontSize: "10px", fontWeight: 600,
          color: C.obsidian, cursor: "pointer",
          minHeight: isMobile ? "36px" : undefined,
        }}>+ browse catalog</button>
      </div>

      {deployments.length === 0 && !loading && (
        <div style={{
          textAlign: "center", padding: isMobile ? "40px 20px" : "60px 40px",
          background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "8px",
        }}>
          <div style={{ fontFamily: F.display, fontSize: isMobile ? "18px" : "22px", color: C.cream, fontWeight: 300, marginBottom: "8px" }}>No agents deployed yet</div>
          <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron, lineHeight: 1.6, maxWidth: "400px", margin: "0 auto 16px" }}>
            Agents watch your systems, analyze patterns, and propose actions on your behalf. Start with an Observer — zero risk, pure visibility.
          </div>
          <button onClick={() => setView("catalog")} style={{
            background: C.amber, border: "none", borderRadius: "6px",
            padding: "10px 24px", fontFamily: F.mono, fontSize: "11px", fontWeight: 500,
            color: C.obsidian, cursor: "pointer",
          }}>explore the catalog</button>
        </div>
      )}

      {deployments.map((dep, i) => {
        const agent = dep.catalog || {};
        const depApprovals = approvals.filter(a => a.deployment_id === dep.id);
        return (
          <div key={dep.id} onClick={() => fetchDetail(dep)} style={{
            background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "8px",
            padding: isMobile ? "14px" : "16px 20px", marginBottom: "8px",
            cursor: "pointer", position: "relative", overflow: "hidden",
            animation: `fadeUp 0.3s ease ${0.04 * i}s both`,
            transition: "border-color 0.2s ease",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.amber + "40"}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.stone}
          >
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", backgroundColor: levelColors[agent.level] }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: F.sans, fontSize: "14px", fontWeight: 500, color: C.cream }}>{agent.name || dep.catalog_id}</span>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: statusColors[dep.status] || C.iron }} />
                </div>
                <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginTop: "2px" }}>
                  {dep.total_runs || 0} runs
                  {dep.last_run_at && ` / last ${new Date(dep.last_run_at).toLocaleDateString()}`}
                  {depApprovals.length > 0 && <span style={{ color: C.caution }}> / {depApprovals.length} pending</span>}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); runAgent(dep.id); }} disabled={runningId === dep.id || dep.status !== "active"} style={{
                background: "none", border: `1px solid ${dep.status === "active" ? C.amber : C.stone}`, borderRadius: "4px",
                padding: isMobile ? "8px 12px" : "4px 10px",
                fontFamily: F.mono, fontSize: "10px",
                color: dep.status === "active" ? C.amber : C.iron,
                cursor: dep.status === "active" ? "pointer" : "not-allowed",
                opacity: runningId === dep.id ? 0.5 : 1,
                minHeight: isMobile ? "36px" : undefined,
              }}>{runningId === dep.id ? "..." : "run"}</button>
            </div>
          </div>
        );
      })}

      {loading && deployments.length === 0 && <div style={{ fontFamily: F.mono, fontSize: "11px", color: C.iron, textAlign: "center", padding: "20px" }}>Loading agents...</div>}
    </div>
  );
}


// ─── Fitness Module ──────────────────────────────────────────────
function FitnessModule({ isMobile, session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [logForm, setLogForm] = useState({ activity_type: "run", title: "", duration_minutes: "", distance_miles: "", notes: "", activity_date: new Date().toISOString().slice(0, 10) });
  const [goalForm, setGoalForm] = useState({ title: "", category: "cardio", target_type: "frequency", target_value: 1, target_unit: "sessions", target_period: "day" });

  const headers = session?.access_token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }
    : { "Content-Type": "application/json" };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fitness", { headers });
      if (res.ok) setData(await res.json());
    } catch {}
    setLoading(false);
  }, [session]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const logActivity = async () => {
    const body = { action: "log_activity", ...logForm, duration_minutes: parseInt(logForm.duration_minutes) || null, distance_miles: parseFloat(logForm.distance_miles) || null };
    await fetch("/api/fitness", { method: "POST", headers, body: JSON.stringify(body) });
    setShowLog(false);
    setLogForm({ activity_type: "run", title: "", duration_minutes: "", distance_miles: "", notes: "", activity_date: new Date().toISOString().slice(0, 10) });
    fetchData();
  };

  const createGoal = async () => {
    await fetch("/api/fitness", { method: "POST", headers, body: JSON.stringify({ action: "create_goal", ...goalForm }) });
    setShowGoal(false);
    setGoalForm({ title: "", category: "cardio", target_type: "frequency", target_value: 1, target_unit: "sessions", target_period: "day" });
    fetchData();
  };

  const activityIcons = {
    run: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: 16, height: 16 }}><circle cx="17" cy="4" r="2"/><path d="M15 21l-3-6-4 3-3-4"/><path d="M19 13l-2-3-5 3"/></svg>,
    cycle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: 16, height: 16 }}><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17L9 4h4l3 5h2"/></svg>,
    strength: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: 16, height: 16 }}><path d="M6 7v10M18 7v10M2 9v6M22 9v6M6 12h12"/></svg>,
    walk: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: 16, height: 16 }}><circle cx="12" cy="4" r="2"/><path d="M14 20l-2-6-3 3-2-3"/><path d="M10 8l2 4 4-2"/></svg>,
  };

  const inputStyle = {
    background: C.obsidian, border: `1px solid ${C.slate}`, borderRadius: "4px",
    padding: isMobile ? "12px" : "8px 12px", fontFamily: F.sans, fontSize: isMobile ? "16px" : "13px",
    color: C.parchment, outline: "none", width: "100%",
  };

  const stats = data?.stats || {};
  const goals = data?.goals || [];
  const recentLog = data?.recentLog || [];

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Status strip */}
      <div style={{
        display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(5, 1fr)",
        gap: "8px", marginBottom: "20px",
      }}>
        {[
          { label: "Today", value: stats.today || 0, color: stats.loggedToday ? C.success : C.caution },
          { label: "This Week", value: stats.thisWeek || 0, color: C.amber },
          { label: "This Month", value: stats.thisMonth || 0, color: C.fog },
          { label: "Minutes", value: stats.totalMinutes || 0, color: C.fog },
          { label: "Miles", value: stats.totalMiles || "0", color: C.fog },
        ].map(s => (
          <div key={s.label} style={{
            background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
            padding: "10px 12px", textAlign: "center",
          }}>
            <div style={{ fontFamily: F.display, fontSize: isMobile ? "20px" : "22px", color: s.color, lineHeight: 1, fontWeight: 300 }}>{s.value}</div>
            <div style={{ fontFamily: F.mono, fontSize: "7px", color: C.iron, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <button onClick={() => { setShowLog(!showLog); setShowGoal(false); }} style={{
          background: showLog ? C.stone : C.success, border: "none", borderRadius: "4px",
          padding: isMobile ? "10px 16px" : "6px 14px", fontFamily: F.mono, fontSize: "11px", fontWeight: 600,
          color: showLog ? C.iron : C.obsidian, cursor: "pointer", minHeight: isMobile ? "44px" : undefined,
        }}>{showLog ? "cancel" : "+ log activity"}</button>
        <button onClick={() => { setShowGoal(!showGoal); setShowLog(false); }} style={{
          background: "none", border: `1px solid ${C.stone}`, borderRadius: "4px",
          padding: isMobile ? "10px 16px" : "6px 14px", fontFamily: F.mono, fontSize: "11px",
          color: C.amber, cursor: "pointer", minHeight: isMobile ? "44px" : undefined,
        }}>{showGoal ? "cancel" : "+ set goal"}</button>
      </div>

      {/* Log form */}
      {showLog && (
        <div style={{
          background: C.cavern, border: `1px solid ${C.success}`, borderRadius: "6px",
          padding: isMobile ? "16px" : "16px 20px", marginBottom: "20px", animation: "fadeUp 0.2s ease both",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <select value={logForm.activity_type} onChange={e => setLogForm({...logForm, activity_type: e.target.value})} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="run">Run</option><option value="walk">Walk</option><option value="cycle">Cycle</option>
              <option value="swim">Swim</option><option value="strength">Strength</option><option value="yoga">Yoga</option><option value="other">Other</option>
            </select>
            <input value={logForm.title} onChange={e => setLogForm({...logForm, title: e.target.value})} placeholder="Title (optional)" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <input type="number" value={logForm.duration_minutes} onChange={e => setLogForm({...logForm, duration_minutes: e.target.value})} placeholder="Minutes" style={inputStyle} />
            <input type="number" step="0.1" value={logForm.distance_miles} onChange={e => setLogForm({...logForm, distance_miles: e.target.value})} placeholder="Miles" style={inputStyle} />
            <input type="date" value={logForm.activity_date} onChange={e => setLogForm({...logForm, activity_date: e.target.value})} style={inputStyle} />
          </div>
          <input value={logForm.notes} onChange={e => setLogForm({...logForm, notes: e.target.value})} placeholder="Notes (Strava link, how it felt, etc.)" style={{ ...inputStyle, marginBottom: "10px" }} />
          <button onClick={logActivity} style={{
            background: C.success, border: "none", borderRadius: "4px", padding: isMobile ? "12px 20px" : "8px 16px",
            fontFamily: F.mono, fontSize: "11px", fontWeight: 600, color: C.obsidian, cursor: "pointer",
          }}>log it</button>
        </div>
      )}

      {/* Goal form */}
      {showGoal && (
        <div style={{
          background: C.cavern, border: `1px solid ${C.amber}`, borderRadius: "6px",
          padding: isMobile ? "16px" : "16px 20px", marginBottom: "20px", animation: "fadeUp 0.2s ease both",
        }}>
          <input value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} placeholder="Goal title (e.g. Daily cardio training)" style={{ ...inputStyle, marginBottom: "10px" }} />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "10px", marginBottom: "10px" }}>
            <select value={goalForm.category} onChange={e => setGoalForm({...goalForm, category: e.target.value})} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="cardio">Cardio</option><option value="strength">Strength</option><option value="flexibility">Flexibility</option><option value="recovery">Recovery</option>
            </select>
            <input type="number" value={goalForm.target_value} onChange={e => setGoalForm({...goalForm, target_value: parseFloat(e.target.value) || 0})} placeholder="Target" style={inputStyle} />
            <select value={goalForm.target_unit} onChange={e => setGoalForm({...goalForm, target_unit: e.target.value})} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="sessions">Sessions</option><option value="minutes">Minutes</option><option value="miles">Miles</option>
            </select>
            <select value={goalForm.target_period} onChange={e => setGoalForm({...goalForm, target_period: e.target.value})} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="day">Per Day</option><option value="week">Per Week</option><option value="month">Per Month</option>
            </select>
          </div>
          <button onClick={createGoal} disabled={!goalForm.title} style={{
            background: goalForm.title ? C.amber : C.stone, border: "none", borderRadius: "4px",
            padding: isMobile ? "12px 20px" : "8px 16px", fontFamily: F.mono, fontSize: "11px", fontWeight: 600,
            color: goalForm.title ? C.obsidian : C.iron, cursor: goalForm.title ? "pointer" : "not-allowed",
          }}>create goal</button>
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, letterSpacing: "0.08em", marginBottom: "10px" }}>ACTIVE GOALS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {goals.map((g, i) => (
              <div key={g.id} style={{
                background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "8px",
                padding: isMobile ? "14px" : "16px 20px", position: "relative", overflow: "hidden",
                animation: `fadeUp 0.3s ease ${0.04 * i}s both`,
              }}>
                {/* Progress bar background */}
                <div style={{
                  position: "absolute", top: 0, left: 0, bottom: 0,
                  width: `${g.pct}%`, background: g.met ? "rgba(90,138,106,0.08)" : "rgba(123,143,163,0.05)",
                  transition: "width 0.5s ease",
                }} />

                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: F.sans, fontSize: "14px", fontWeight: 500, color: C.cream, marginBottom: "4px" }}>{g.title}</div>
                    <div style={{ fontFamily: F.mono, fontSize: "10px", color: C.iron }}>
                      {g.current}/{g.target_value} {g.target_unit} per {g.target_period}
                      {g.streak_current > 0 && <span style={{ color: C.success, marginLeft: "8px" }}>{g.streak_current}-day streak</span>}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: F.display, fontSize: isMobile ? "28px" : "32px",
                    color: g.met ? C.success : g.pct > 50 ? C.amber : C.iron,
                    fontWeight: 300, lineHeight: 1,
                  }}>{g.pct}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, letterSpacing: "0.08em", marginBottom: "10px" }}>RECENT ACTIVITY</div>
        {recentLog.length === 0 && !loading && (
          <div style={{
            textAlign: "center", padding: isMobile ? "40px 20px" : "48px 32px",
            background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "8px",
          }}>
            <div style={{ fontFamily: F.display, fontSize: "20px", color: C.cream, fontWeight: 300, marginBottom: "8px" }}>No activity logged yet</div>
            <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron, marginBottom: "16px" }}>Log your first workout or ask Alfred to set a daily cardio goal.</div>
          </div>
        )}
        {recentLog.map((entry, i) => (
          <div key={entry.id} style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: isMobile ? "12px 0" : "10px 0",
            borderBottom: `1px solid ${C.stone}`,
            animation: `fadeUp 0.25s ease ${0.03 * i}s both`,
          }}>
            {/* Icon */}
            <div style={{ color: C.amber, flexShrink: 0 }}>
              {activityIcons[entry.activity_type] || activityIcons.run}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.parchment }}>
                {entry.title || entry.activity_type.charAt(0).toUpperCase() + entry.activity_type.slice(1)}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: "9px", color: C.iron, marginTop: "2px", display: "flex", gap: "10px" }}>
                {entry.duration_minutes && <span>{entry.duration_minutes} min</span>}
                {entry.distance_miles && <span>{entry.distance_miles} mi</span>}
                <span>{entry.activity_date}</span>
                {entry.source !== "manual" && <span style={{ color: C.amber }}>{entry.source}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && !data && <div style={{ fontFamily: F.mono, fontSize: "11px", color: C.iron, textAlign: "center", padding: "20px" }}>Loading fitness data...</div>}
    </div>
  );
}

// ─── Voice Module (Alfred Voice Interface) ───────────────────────
function VoiceModule({ isMobile, session, liveData }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [ttsProvider, setTtsProvider] = useState("elevenlabs");
  const [ttsKeys, setTtsKeys] = useState({ elevenlabsKey: "", elevenlabsVoiceId: "", openaiKey: "" });
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const connected = liveData?.status?.anthropic?.connected || false;

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Waveform drawing
  useEffect(() => {
    if (!isRecording || !analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = C.obsidian;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = C.amber;
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
    draw();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isRecording]);

  // TTS playback
  const playTTS = useCallback(async (text) => {
    if (ttsProvider === "elevenlabs" && ttsKeys.elevenlabsKey && ttsKeys.elevenlabsVoiceId) {
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ttsKeys.elevenlabsVoiceId}`, {
          method: "POST",
          headers: { "xi-api-key": ttsKeys.elevenlabsKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify({
            text, model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
          }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play();
          audio.onended = () => URL.revokeObjectURL(url);
          return;
        }
      } catch (e) { console.error("[Alfred TTS] ElevenLabs failed:", e); }
    }

    if ((ttsProvider === "openai" || ttsProvider === "elevenlabs") && ttsKeys.openaiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: { Authorization: `Bearer ${ttsKeys.openaiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "tts-1", input: text, voice: "onyx", speed: 1.0, response_format: "mp3" }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play();
          audio.onended = () => URL.revokeObjectURL(url);
          return;
        }
      } catch (e) { console.error("[Alfred TTS] OpenAI failed:", e); }
    }

    // Fallback: Web Speech API
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 0.9;
    utter.rate = 0.95;
    synth.speak(utter);
  }, [ttsProvider, ttsKeys]);

  // Send transcript to existing /api/chat
  const sendToAlfred = useCallback(async (spokenText) => {
    setIsProcessing(true);
    setError(null);
    setTranscript(prev => [...prev, { role: "user", text: spokenText, ts: Date.now() }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ message: spokenText }),
      });
      const data = await res.json();
      const responseText = res.ok ? (data.response || "No response") : (data.error || "Request failed");
      const hasActions = data.actions?.some(a => a.ok);

      setTranscript(prev => [...prev, {
        role: "assistant", text: responseText, ts: Date.now(),
        actions: data.actions, confirmationRequired: hasActions,
      }]);

      playTTS(responseText);
    } catch (e) {
      setError(e.message);
      setTranscript(prev => [...prev, { role: "assistant", text: "Connection lost.", ts: Date.now() }]);
    }
    setIsProcessing(false);
  }, [session, playTTS]);

  // Audio analyser for waveform
  const startAudioAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch (e) { console.error("Mic access denied:", e); }
  }, []);

  const stopAudioAnalyser = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    analyserRef.current = null;
  }, []);

  // Push-to-talk
  const startRecording = useCallback(async () => {
    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError("Speech recognition not supported in this browser."); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    await startAudioAnalyser();

    recognition.onresult = (event) => { sendToAlfred(event.results[0][0].transcript); };
    recognition.onerror = (event) => { if (event.error !== "aborted") setError(`Recognition error: ${event.error}`); setIsRecording(false); stopAudioAnalyser(); };
    recognition.onend = () => { setIsRecording(false); stopAudioAnalyser(); };

    recognition.start();
    setIsRecording(true);
  }, [startAudioAnalyser, stopAudioAnalyser, sendToAlfred]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    stopAudioAnalyser();
  }, [stopAudioAnalyser]);

  // Keyboard: hold Space to talk
  useEffect(() => {
    let held = false;
    const down = (e) => {
      if (e.code === "Space" && !held && !showSettings && document.activeElement === document.body) {
        e.preventDefault(); held = true; startRecording();
      }
    };
    const up = (e) => { if (e.code === "Space" && held) { e.preventDefault(); held = false; stopRecording(); } };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [startRecording, stopRecording, showSettings]);

  const TTS_OPTIONS = [
    { id: "elevenlabs", label: "ElevenLabs", tier: "Premium" },
    { id: "openai", label: "OpenAI", tier: "Standard" },
    { id: "webspeech", label: "Browser", tier: "Free" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: isMobile ? "calc(100vh - 180px)" : "calc(100vh - 220px)", animation: "fadeUp 0.4s ease both" }}>

      {/* Connection check */}
      {!connected && (
        <div style={{ padding: isMobile ? "20px" : "28px", borderRadius: "6px", backgroundColor: C.cavern, border: `1px solid ${C.stone}`, textAlign: "center", marginBottom: "16px" }}>
          <div style={{ fontFamily: F.display, fontSize: "20px", color: C.cream, marginBottom: "8px" }}>Alfred Voice</div>
          <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron, lineHeight: 1.6 }}>Connect your Anthropic API key in Integrations to enable voice commands.</div>
        </div>
      )}

      {/* Settings toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {TTS_OPTIONS.map(p => (
            <button key={p.id} onClick={() => setTtsProvider(p.id)} style={{
              padding: isMobile ? "6px 12px" : "4px 10px", border: `1px solid ${ttsProvider === p.id ? C.amber : C.stone}`,
              borderRadius: "4px", background: ttsProvider === p.id ? C.amberSubtle : "transparent",
              fontFamily: F.mono, fontSize: "9px", color: ttsProvider === p.id ? C.amber : C.iron, cursor: "pointer",
              minHeight: isMobile ? "36px" : undefined,
            }}>{p.label} <span style={{ fontSize: "7px", opacity: 0.6 }}>{p.tier}</span></button>
          ))}
        </div>
        <button onClick={() => setShowSettings(!showSettings)} style={{
          background: "none", border: `1px solid ${C.stone}`, borderRadius: "4px",
          padding: isMobile ? "6px 12px" : "4px 10px", fontFamily: F.mono, fontSize: "9px",
          color: C.iron, cursor: "pointer", minHeight: isMobile ? "36px" : undefined,
        }}>{showSettings ? "close" : "keys"}</button>
      </div>

      {/* API keys panel */}
      {showSettings && (
        <div style={{
          background: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
          padding: isMobile ? "14px" : "16px 20px", marginBottom: "12px", animation: "fadeUp 0.2s ease both",
        }}>
          {[
            { key: "elevenlabsKey", label: "ElevenLabs API Key", show: ttsProvider === "elevenlabs" },
            { key: "elevenlabsVoiceId", label: "ElevenLabs Voice ID", show: ttsProvider === "elevenlabs" },
            { key: "openaiKey", label: "OpenAI API Key", show: ttsProvider === "openai" },
          ].filter(f => f.show).map(field => (
            <div key={field.key} style={{ marginBottom: "8px" }}>
              <label style={{ fontFamily: F.mono, fontSize: "8px", color: C.slate, letterSpacing: "0.08em", display: "block", marginBottom: "3px" }}>{field.label}</label>
              <input type="password" value={ttsKeys[field.key]}
                onChange={e => setTtsKeys(prev => ({ ...prev, [field.key]: e.target.value }))}
                style={{
                  width: "100%", padding: isMobile ? "10px" : "6px 10px", background: C.obsidian,
                  border: `1px solid ${C.slate}`, borderRadius: "4px", fontFamily: F.mono,
                  fontSize: isMobile ? "14px" : "11px", color: C.parchment, outline: "none",
                }}
              />
            </div>
          ))}
          {ttsProvider === "webspeech" && (
            <div style={{ fontFamily: F.mono, fontSize: "10px", color: C.iron }}>No keys needed. Uses your browser's built-in speech synthesis.</div>
          )}
        </div>
      )}

      {/* Transcript */}
      <div style={{ flex: 1, overflowY: "auto", marginBottom: "12px" }}>
        {transcript.length === 0 && connected && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.4 }}>
            <span style={{ fontFamily: F.display, fontSize: isMobile ? "22px" : "28px", color: C.cream, marginBottom: "8px" }}>Alfred is listening</span>
            <span style={{ fontFamily: F.mono, fontSize: "11px", color: C.iron }}>Hold the mic button or press Space to speak</span>
          </div>
        )}
        {transcript.map((entry, i) => {
          const isUser = entry.role === "user";
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: "12px", animation: "fadeUp 0.2s ease both" }}>
              <span style={{ fontFamily: F.mono, fontSize: "8px", color: C.slate, marginBottom: "2px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {isUser ? "You" : "Alfred"}
              </span>
              <div style={{
                background: isUser ? C.amberSubtle : C.cavern,
                border: `1px solid ${isUser ? C.amberGlow : C.stone}`,
                color: C.parchment, padding: isMobile ? "10px 14px" : "8px 14px",
                borderRadius: isUser ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                maxWidth: "85%", fontFamily: F.sans, fontSize: "13px", lineHeight: 1.5, whiteSpace: "pre-wrap",
              }}>{entry.text}</div>
              {entry.actions?.length > 0 && (
                <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
                  {entry.actions.map((a, j) => (
                    <span key={j} style={{
                      fontFamily: F.mono, fontSize: "8px", padding: "2px 6px", borderRadius: "3px",
                      backgroundColor: a.ok ? "rgba(90,138,106,0.1)" : "rgba(154,74,74,0.1)",
                      color: a.ok ? C.success : C.danger,
                    }}>{a.ok ? "done" : "fail"}: {a.action}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={transcriptEndRef} />
      </div>

      {/* Error bar */}
      {error && (
        <div style={{ padding: "6px 14px", borderRadius: "4px", marginBottom: "8px", background: "rgba(154,74,74,0.1)", border: "1px solid rgba(154,74,74,0.2)", fontFamily: F.mono, fontSize: "10px", color: C.danger }}>
          {error}
        </div>
      )}

      {/* Controls bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "16px",
        padding: "16px 0", borderTop: `1px solid ${C.stone}`,
      }}>
        <canvas ref={canvasRef} width={isMobile ? 180 : 260} height={40} style={{
          borderRadius: "4px", opacity: isRecording ? 1 : 0.15, transition: "opacity 0.3s ease",
          background: C.obsidian, border: `1px solid ${C.stone}`, borderRadius: "6px",
        }} />

        {/* Push-to-talk button */}
        <button
          onMouseDown={startRecording} onMouseUp={stopRecording}
          onMouseLeave={() => isRecording && stopRecording()}
          onTouchStart={e => { e.preventDefault(); startRecording(); }}
          onTouchEnd={e => { e.preventDefault(); stopRecording(); }}
          disabled={isProcessing || !connected}
          style={{
            width: isMobile ? 64 : 56, height: isMobile ? 64 : 56, borderRadius: "50%", border: "none",
            background: isRecording ? C.danger : isProcessing ? C.slate : `linear-gradient(135deg, ${C.amber}, ${C.embers})`,
            color: isRecording ? C.cream : C.obsidian, cursor: isProcessing || !connected ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "all 0.2s ease",
            boxShadow: isRecording ? `0 0 0 4px rgba(154,74,74,0.25)` : "none",
            opacity: !connected ? 0.3 : 1,
            animation: isRecording ? "glowPulse 1.5s ease infinite" : "none",
          }}
        >
          <div style={{ width: "22px", height: "22px" }}>{I.voice}</div>
        </button>

        <div style={{ fontFamily: F.mono, fontSize: "10px", color: C.iron, width: isMobile ? 100 : 120, textAlign: "center" }}>
          {isRecording ? "Listening..." : isProcessing ? "Processing..." : connected ? "Hold to speak" : "Not connected"}
        </div>
      </div>
    </div>
  );
}

function PlaceholderModule({ description, items, isMobile }) {
  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <p style={{
        fontFamily: F.body, fontSize: "15px", fontWeight: 300,
        color: C.fog, marginBottom: "32px", maxWidth: "520px", lineHeight: 1.65,
      }}>{description}</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "12px",
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            border: `1px dashed ${C.slate}`, borderRadius: "6px",
            padding: isMobile ? "18px 16px" : "20px 18px",
            animation: `fadeUp 0.4s ease ${0.06 * (i + 1)}s both`,
            transition: "border-color 0.3s ease, background-color 0.3s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.backgroundColor = C.amberSubtle; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.slate; e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <div style={{ fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: C.amber, marginBottom: "8px" }}>{item.label}</div>
            <div style={{ fontFamily: F.display, fontSize: "18px", color: C.cream, marginBottom: "4px" }}>{item.title}</div>
            <div style={{ fontFamily: F.sans, fontSize: "12px", fontWeight: 300, color: C.iron, lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN CONSOLE
// ═══════════════════════════════════════════════════════════════════
export default function BatcaveConsole() {
  const isMobile = useMobile();
  const auth = useAuth();
  const [activeModule, setActiveModule] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const liveData = useLiveData();

  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => { setMounted(true); }, []);

  // Close drawer on resize to desktop
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCommandOpen(o => !o); }
      if (e.key === "Escape") { setCommandOpen(false); setDrawerOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const selectModule = useCallback((id) => {
    setActiveModule(id);
    if (isMobile) setDrawerOpen(false);
  }, [isMobile]);

  // Auth gate — AFTER all hooks
  if (auth.loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: C.obsidian, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron }}>Loading...</div>
      </div>
    );
  }

  if (!auth.session && supabase) {
    return <LoginScreen onLogin={auth} isMobile={isMobile} />;
  }

  const modules = [
    { id: "home", label: "Home", icon: I.home },
    { id: "command", label: "Alfred", icon: I.bell },
    { id: "tasks", label: "Tasks", icon: I.tasks },
    { id: "calendar", label: "Calendar", icon: I.layers },
    { id: "news", label: "News", icon: I.signal },
    { id: "finance", label: "Finance", icon: I.pulse },
    { id: "projects", label: "Projects", icon: I.workspace },
    { id: "agents", label: "Agents", icon: I.agent },
    { id: "fitness", label: "Fitness", icon: I.fitness },
    { id: "voice", label: "Voice", icon: I.voice },
    { id: "integrations", label: "Integrations", icon: I.settings },
  ];

  const moduleMeta = {
    home: { title: (() => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"; })(), mono: "Alfred", subtitle: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) },
    command: { title: "Alfred", mono: "AI Assistant", subtitle: "Natural language control" },
    tasks: { title: "Tasks", mono: "Personal Ops", subtitle: "Priority-driven task management" },
    calendar: { title: "Calendar", mono: "Schedule", subtitle: "Personal, professional, and travel — one view" },
    news: { title: "News", mono: "Headlines", subtitle: "Market news and global events" },
    finance: { title: "Finance", mono: "Markets", subtitle: "Indices, quotes, and market data" },
    projects: { title: "Projects", mono: "System Registry", subtitle: `${manifest.projects.length} registered across the system` },
    agents: { title: "Agents", mono: "Autonomous Systems", subtitle: "Deploy, monitor, and govern your AI workforce" },
    fitness: { title: "Fitness", mono: "Performance", subtitle: "Goals, activity tracking, streaks" },
    voice: { title: "Voice", mono: "Alfred Voice", subtitle: "Push-to-talk voice control" },
    integrations: { title: "Integrations", mono: "Admin", subtitle: "Manage service connections" },
  };

  const placeholders = {};

  const meta = moduleMeta[activeModule];

  // ─── Sidebar content (shared between desktop nav and mobile drawer) ──
  const sidebarContent = (
    <>
      <div style={{ padding: "8px 0", flex: 1 }}>
        {modules.map((mod, i) => (
          <div key={mod.id} style={{ animation: mounted ? `fadeUp 0.3s ease ${0.04 * (i + 1)}s both` : "none" }}>
            <NavItem icon={mod.icon} label={mod.label} active={activeModule === mod.id}
              collapsed={!isMobile && collapsed} isMobile={isMobile}
              onClick={() => selectModule(mod.id)} />
          </div>
        ))}
      </div>

      {/* Command shortcut */}
      {(isMobile || !collapsed) && (
        <div onClick={() => { setCommandOpen(true); if (isMobile) setDrawerOpen(false); }} style={{
          margin: "0 12px 12px", padding: isMobile ? "12px 16px" : "8px 12px", borderRadius: "6px",
          backgroundColor: C.stone, cursor: "pointer",
          display: "flex", alignItems: "center", gap: "8px",
          minHeight: isMobile ? "48px" : undefined,
          transition: "background-color 0.2s ease",
        }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = C.slate}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = C.stone}
        >
          <div style={{ width: isMobile ? "18px" : "14px", height: isMobile ? "18px" : "14px", color: C.iron }}>{I.bell}</div>
          <span style={{ fontFamily: F.sans, fontSize: isMobile ? "14px" : "12px", color: C.iron, flex: 1 }}>Alfred</span>
          {!isMobile && (
            <kbd style={{
              fontFamily: F.mono, fontSize: "9px", color: C.iron,
              padding: "1px 5px", borderRadius: "3px",
              backgroundColor: C.cavern, border: `1px solid ${C.slate}`,
            }}>K</kbd>
          )}
        </div>
      )}

      {/* Sign out + Version */}
      {(isMobile || !collapsed) && (
        <div style={{
          padding: isMobile ? "14px 20px" : "12px 16px", borderTop: `1px solid ${C.stone}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, letterSpacing: "0.04em" }}>v5.4 // batcave</span>
          {auth.session && (
            <button onClick={auth.signOut} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: F.mono, fontSize: "9px", color: C.iron, letterSpacing: "0.04em",
            }}>sign out</button>
          )}
        </div>
      )}
    </>
  );

  return (
    <div style={{
      fontFamily: F.sans, display: "flex", flexDirection: "column",
      height: "100vh", color: C.parchment,
      overflow: "hidden", WebkitFontSmoothing: "antialiased",
      background: `linear-gradient(145deg, #08081a 0%, #0d0d1a 20%, #111120 45%, #0f1018 70%, #0a0a16 100%)`,
    }}>
      {/* Fonts + viewport */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${C.amber}; color: ${C.obsidian}; }
        input::placeholder { color: ${C.iron}; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }

        @keyframes ambientShift {
          0%, 100% { opacity: 1; transform: scale(1) translate(0, 0); }
          33% { opacity: 0.8; transform: scale(1.15) translate(3%, -2%); }
          66% { opacity: 0.9; transform: scale(0.9) translate(-2%, 3%); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(123,143,163,0); }
          50% { box-shadow: 0 0 24px 4px rgba(123,143,163,0.12); }
        }
        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gentleDrift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes typeReveal {
          from { opacity: 0; transform: translateY(6px); filter: blur(3px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(5%, -3%) scale(1.05); }
          50% { transform: translate(-2%, 5%) scale(0.95); }
          75% { transform: translate(-4%, -2%) scale(1.02); }
        }

        /* Glass card base */
        .bc-glass {
          background: rgba(24, 24, 32, 0.7);
          border: 1px solid rgba(60, 60, 75, 0.2);
          border-radius: 10px;
        }
        .bc-glass:hover {
          border-color: rgba(123, 143, 163, 0.15);
        }

/* Animated border */
        .bc-glow-border {
          position: relative;
        }
        .bc-glow-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(123,143,163,0.15), transparent, rgba(123,143,163,0.08));
          background-size: 200% 200%;
          animation: borderFlow 8s ease infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.slate}; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.iron}; }
        button { font-family: inherit; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
        html { -webkit-text-size-adjust: 100%; }
        input:focus { border-color: ${C.amber} !important; }
        select:focus { border-color: ${C.amber} !important; }
      `}</style>

      {/* Bat silhouettes drifting through the cave */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {/* Bat SVG sprite — reusable */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <symbol id="bat-s" viewBox="0 0 24 14">
              <path d="M12 8 C8 3, 2 2, 0 5 C2 4, 5 2, 8 5 L12 8 L16 5 C19 2, 22 4, 24 5 C22 2, 16 3, 12 8Z" fill="currentColor" />
              <ellipse cx="12" cy="9" rx="2" ry="3" fill="currentColor" />
              <path d="M10 7 L10.5 5.5 M14 7 L13.5 5.5" stroke="currentColor" strokeWidth="0.4" fill="none" />
            </symbol>
          </defs>
        </svg>

        {/* Bat 1 — large, slow, crosses right */}
        <div style={{
          position: "absolute", top: "15%", left: "-5%",
          width: "28px", height: "16px", color: "rgba(90, 90, 106, 0.12)",
          animation: "batFly1 45s linear infinite",
        }}>
          <svg style={{ width: "100%", height: "100%", animation: "batWingSimple 0.4s ease-in-out infinite" }}><use href="#bat-s" /></svg>
        </div>

        {/* Bat 2 — medium, crosses left from right side */}
        <div style={{
          position: "absolute", top: "35%", right: "-3%",
          width: "22px", height: "13px", color: "rgba(90, 90, 106, 0.08)",
          animation: "batFly2 55s linear infinite",
          animationDelay: "-12s",
        }}>
          <svg style={{ width: "100%", height: "100%", animation: "batWingSimple 0.35s ease-in-out infinite", animationDelay: "-0.1s" }}><use href="#bat-s" /></svg>
        </div>

        {/* Bat 3 — small, high, fast */}
        <div style={{
          position: "absolute", top: "8%", left: "-8%",
          width: "16px", height: "10px", color: "rgba(90, 90, 106, 0.06)",
          animation: "batFly3 35s linear infinite",
          animationDelay: "-20s",
        }}>
          <svg style={{ width: "100%", height: "100%", animation: "batWingSimple 0.3s ease-in-out infinite", animationDelay: "-0.2s" }}><use href="#bat-s" /></svg>
        </div>

        {/* Bat 4 — large, low, very slow */}
        <div style={{
          position: "absolute", top: "65%", left: "-6%",
          width: "32px", height: "18px", color: "rgba(90, 90, 106, 0.1)",
          animation: "batFly1 65s linear infinite",
          animationDelay: "-30s",
        }}>
          <svg style={{ width: "100%", height: "100%", animation: "batWingSimple 0.45s ease-in-out infinite" }}><use href="#bat-s" /></svg>
        </div>

        {/* Bat 5 — tiny, mid-height */}
        <div style={{
          position: "absolute", top: "50%", right: "-4%",
          width: "14px", height: "8px", color: "rgba(90, 90, 106, 0.05)",
          animation: "batFly2 40s linear infinite",
          animationDelay: "-5s",
        }}>
          <svg style={{ width: "100%", height: "100%", animation: "batWingSimple 0.28s ease-in-out infinite" }}><use href="#bat-s" /></svg>
        </div>

        {/* Bat 6 — medium, upper third */}
        <div style={{
          position: "absolute", top: "22%", left: "-10%",
          width: "20px", height: "12px", color: "rgba(90, 90, 106, 0.07)",
          animation: "batFly3 50s linear infinite",
          animationDelay: "-38s",
        }}>
          <svg style={{ width: "100%", height: "100%", animation: "batWingSimple 0.33s ease-in-out infinite", animationDelay: "-0.15s" }}><use href="#bat-s" /></svg>
        </div>
      </div>

      {/* Persistent ticker bar */}
      <TickerBar isMobile={isMobile} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── MOBILE HEADER BAR ── */}
        {isMobile && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
            height: "56px",
            background: "rgba(20, 20, 28, 0.88)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderBottom: "1px solid rgba(60, 60, 80, 0.25)",
            display: "flex", alignItems: "center", padding: "0 16px", gap: "12px",
          }}>
            {/* Hamburger */}
            <button onClick={() => setDrawerOpen(true)} style={{
              background: "none", border: "none", cursor: "pointer",
              width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center",
              color: C.parchment, marginLeft: "-8px",
            }}>
              <div style={{ width: "22px", height: "22px" }}>{I.menu}</div>
            </button>

            {/* Title */}
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: F.display, fontSize: "18px", color: C.cream }}>{activeModule === "home" ? "Batcave" : meta.title}</span>
            </div>

            {/* Command button */}
            <button onClick={() => setCommandOpen(true)} style={{
              background: "none", border: "none", cursor: "pointer",
              width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center",
              color: C.iron, marginRight: "-8px",
            }}>
              <div style={{ width: "20px", height: "20px" }}>{I.search}</div>
            </button>
          </div>
        )}

        {/* ── MOBILE DRAWER BACKDROP ── */}
        {isMobile && drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", WebkitTapHighlightColor: "transparent",
            backdropFilter: "blur(4px)", zIndex: 100,
            animation: "fadeIn 0.15s ease",
          }} />
        )}

        {/* ── SIDEBAR / DRAWER ── */}
        {isMobile ? (
          // Mobile drawer
          drawerOpen && (
            <nav style={{
              position: "fixed", top: 0, left: 0, bottom: 0, width: "280px",
              background: "rgba(20, 20, 28, 0.92)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 101,
              display: "flex", flexDirection: "column",
              animation: "slideRight 0.25s cubic-bezier(0.22,1,0.36,1)",
              borderRight: "1px solid rgba(60, 60, 80, 0.3)",
            }}>
              {/* Drawer header */}
              <div style={{
                padding: "14px 16px", display: "flex", alignItems: "center",
                gap: "10px", borderBottom: "1px solid rgba(60, 60, 80, 0.25)",
              }}>
                <div style={{
                  width: "28px", height: "28px", color: C.amber, flexShrink: 0,
                  filter: "drop-shadow(0 0 8px rgba(123,143,163,0.3))",
                }}>{I.bat}</div>
                <span style={{ fontFamily: F.display, fontSize: "19px", color: C.cream, flex: 1 }}>Batcave</span>
                <button onClick={() => setDrawerOpen(false)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.iron, marginRight: "-10px",
                }}>
                  <div style={{ width: "20px", height: "20px" }}>{I.close}</div>
                </button>
              </div>
              {sidebarContent}
            </nav>
          )
        ) : (
          // Desktop sidebar
          <nav style={{
            width: collapsed ? 56 : 200,
            background: "rgba(20, 20, 28, 0.8)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRight: "1px solid rgba(60, 60, 80, 0.25)",
            display: "flex", flexDirection: "column",
            transition: "width 0.25s cubic-bezier(0.22,1,0.36,1)",
            flexShrink: 0, overflow: "hidden",
            animation: mounted ? "fadeIn 0.4s ease" : "none",
            position: "relative",
          }}>

            <div onClick={() => setCollapsed(!collapsed)} style={{
              padding: collapsed ? "18px 14px" : "20px 16px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
              borderBottom: `1px solid ${C.stone}`,
              position: "relative", zIndex: 1,
            }}>
              <div style={{
                width: "28px", height: "28px", color: C.amber, flexShrink: 0,
                animation: "gentleDrift 6s ease-in-out infinite",
                filter: "drop-shadow(0 0 6px rgba(123,143,163,0.15))",
              }}>{I.bat}</div>
              {!collapsed && (
                <span style={{ fontFamily: F.display, fontSize: "19px", color: C.cream, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>Batcave</span>
              )}
            </div>
            {sidebarContent}
          </nav>
        )}

        {/* ── MAIN CONTENT ── */}
        <main style={{
          flex: 1, overflow: "auto", position: "relative", zIndex: 1,
          padding: isMobile
            ? (activeModule === "home" ? "92px 16px 40px" : "100px 16px 40px")
            : (activeModule === "home" ? "28px 48px" : "40px 48px"),
        }}>
          {/* Module header — hidden on Home (Alfred's greeting covers it) */}
          {activeModule !== "home" && (
            <div key={activeModule} style={{ marginBottom: isMobile ? "24px" : "40px", animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
              <div style={{
                fontFamily: F.mono, fontSize: "9px", letterSpacing: "0.16em",
                textTransform: "uppercase", color: C.amber, marginBottom: "10px",
                animation: "typeReveal 0.5s ease 0.1s both",
              }}>{meta.mono}</div>
              {!isMobile && (
                <h1 style={{
                  fontFamily: F.display, fontSize: "48px", fontWeight: 300,
                  color: C.cream, lineHeight: 1.05, marginBottom: "8px", letterSpacing: "-0.02em",
                  textShadow: "0 0 20px rgba(123,143,163,0.06)",
                  animation: "typeReveal 0.5s ease 0.15s both",
                }}>{meta.title}</h1>
              )}
              <p style={{
                fontFamily: F.body, fontSize: isMobile ? "14px" : "15px", fontWeight: 300,
                color: C.iron, fontStyle: "italic",
                animation: "typeReveal 0.5s ease 0.2s both",
              }}>{meta.subtitle}</p>
            </div>
          )}

          {/* Divider — hidden on Home */}
          {activeModule !== "home" && (
            <div style={{
              height: "1px", marginBottom: isMobile ? "24px" : "32px",
              background: `linear-gradient(90deg, ${C.amber}, ${C.amber}50, transparent 70%)`,
              backgroundSize: "200% 100%",
              animation: "borderFlow 8s ease infinite",
            }} />
          )}

          <div key={activeModule + "-content"}>
            {activeModule === "home" && <HomepageModule isMobile={isMobile} session={auth.session} refreshKey={refreshKey} triggerRefresh={triggerRefresh} />}
            {activeModule === "command" && <ChatShell isMobile={isMobile} session={auth.session} liveData={liveData} triggerRefresh={triggerRefresh} />}
            {activeModule === "tasks" && <TasksModule isMobile={isMobile} session={auth.session} refreshKey={refreshKey} />}
            {activeModule === "calendar" && <CalendarModule isMobile={isMobile} session={auth.session} refreshKey={refreshKey} />}
            {activeModule === "news" && <NewsModule isMobile={isMobile} />}
            {activeModule === "finance" && <FinanceModule isMobile={isMobile} />}
            {activeModule === "projects" && <ProjectsModule isMobile={isMobile} liveData={liveData} />}
            {activeModule === "integrations" && <IntegrationsModule isMobile={isMobile} liveData={liveData} session={auth.session} />}
            {activeModule === "agents" && <AgentsModule isMobile={isMobile} session={auth.session} />}
            {activeModule === "fitness" && <FitnessModule isMobile={isMobile} session={auth.session} />}
            {activeModule === "voice" && <VoiceModule isMobile={isMobile} session={auth.session} liveData={liveData} />}
            {!["home","command","tasks","calendar","news","finance","projects","integrations","agents","fitness","voice"].includes(activeModule) && placeholders[activeModule] && (
              <PlaceholderModule description={placeholders[activeModule].description} items={placeholders[activeModule].items} isMobile={isMobile} />
            )}
          </div>
        </main>
      </div>

      {commandOpen && <CommandBar onClose={() => setCommandOpen(false)} isMobile={isMobile} session={auth.session} onAction={triggerRefresh} />}
    </div>
  );
}
