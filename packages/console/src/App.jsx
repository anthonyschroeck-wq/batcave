import { useState, useEffect, useRef, useCallback } from "react";
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
  danger: "#9a4a4a",
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
    width: "100%", background: C.obsidian, border: `1px solid ${C.slate}`,
    borderRadius: "4px", padding: isMobile ? "14px" : "10px 14px",
    fontFamily: F.sans, fontSize: isMobile ? "16px" : "14px",
    color: C.parchment, outline: "none",
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: C.obsidian, display: "flex",
      alignItems: "center", justifyContent: "center", padding: "20px",
      fontFamily: F.sans, WebkitFontSmoothing: "antialiased",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${C.amber}; color: ${C.obsidian}; }
        input::placeholder { color: ${C.iron}; }
      `}</style>

      <div style={{
        width: "100%", maxWidth: "360px",
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "48px", height: "48px", color: C.amber, margin: "0 auto 16px" }}>{I.bat}</div>
          <div style={{ fontFamily: F.display, fontSize: "32px", color: C.cream, marginBottom: "6px" }}>Batcave</div>
          <div style={{ fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.iron }}>Command Center</div>
        </div>

        {/* Form */}
        <div style={{
          backgroundColor: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "8px",
          padding: isMobile ? "24px 20px" : "28px 24px",
        }}>
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
            width: "100%", background: C.amber, border: "none", borderRadius: "4px",
            padding: isMobile ? "14px" : "10px",
            fontFamily: F.mono, fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em",
            color: C.obsidian, cursor: "pointer",
            opacity: loading || !email || !password ? 0.5 : 1,
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
function CommandBar({ onClose, isMobile }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const commands = [
    { label: "Deploy Omote", hint: "push to production", icon: I.deploy },
    { label: "Check build status", hint: "all projects", icon: I.pulse },
    { label: "Open Cerebro", hint: "GTM dashboard", icon: I.signal },
    { label: "View agents", hint: "3 active", icon: I.agent },
    { label: "New project", hint: "scaffold from template", icon: I.workspace },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.hint.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start",
      justifyContent: "center", paddingTop: isMobile ? "12vh" : "18vh",
      padding: isMobile ? "12vh 16px 0" : undefined,
      zIndex: 200, animation: "fadeIn 0.15s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "520px",
        backgroundColor: C.cavern, border: `1px solid ${C.slate}`,
        borderRadius: "10px", overflow: "hidden",
        boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${C.stone}`,
        animation: "slideUp 0.2s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: isMobile ? "16px" : "14px 18px",
          borderBottom: `1px solid ${C.stone}`,
        }}>
          <div style={{ width: "18px", height: "18px", color: C.amber, flexShrink: 0 }}>{I.search}</div>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, projects..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontFamily: F.sans, fontSize: isMobile ? "16px" : "15px", color: C.parchment,
            }}
          />
          <kbd style={{
            fontFamily: F.mono, fontSize: "10px", color: C.iron,
            padding: "2px 6px", borderRadius: "3px", backgroundColor: C.obsidian,
            border: `1px solid ${C.slate}`,
          }}>esc</kbd>
        </div>

        <div style={{ padding: "6px 0", maxHeight: isMobile ? "50vh" : "320px", overflowY: "auto" }}>
          {filtered.map((cmd, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: isMobile ? "14px 16px" : "10px 18px",
              cursor: "pointer", minHeight: isMobile ? "48px" : undefined,
              transition: "background-color 0.15s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = C.stone}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <div style={{ width: "18px", height: "18px", color: C.iron, flexShrink: 0 }}>{cmd.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.sans, fontSize: "14px", color: C.parchment }}>{cmd.label}</div>
                <div style={{ fontFamily: F.mono, fontSize: "11px", color: C.iron, marginTop: "2px" }}>{cmd.hint}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "20px 16px", fontFamily: F.sans, fontSize: "14px", color: C.iron, textAlign: "center" }}>
              No matching commands
            </div>
          )}
        </div>
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
        background: active ? C.amberSubtle : "transparent",
        border: "none",
        borderLeft: `2px solid ${active ? C.amber : "transparent"}`,
        cursor: "pointer", borderRadius: 0,
        minHeight: isMobile ? "48px" : undefined,
        transition: "all 0.2s ease",
      }}>
      <div style={{
        width: isMobile ? "22px" : "18px", height: isMobile ? "22px" : "18px", flexShrink: 0,
        color: lit ? C.amber : C.iron, transition: "color 0.2s ease",
      }}>{icon}</div>
      {!collapsed && (
        <span style={{
          fontFamily: F.sans, fontSize: isMobile ? "15px" : "13px", fontWeight: active ? 600 : 400,
          color: lit ? C.parchment : C.fog, transition: "color 0.2s ease", whiteSpace: "nowrap",
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

  return (
    <div>
      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(4, auto)",
        gap: isMobile ? "16px" : "40px",
        marginBottom: "24px", animation: "fadeUp 0.4s ease both",
      }}>
        {[
          { label: "Total", value: manifest.projects.length },
          { label: "Active", value: active.length },
          { label: "Deployed", value: status?.vercel?.connected ? liveDeployed : "—" },
          { label: "In-Repo", value: manifest.projects.filter(p => p.migrated).length },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontFamily: F.display, fontSize: isMobile ? "28px" : "32px", color: C.cream, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontFamily: F.mono, fontSize: isMobile ? "9px" : "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: C.iron, marginTop: "4px" }}>{stat.label}</div>
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
function HomepageModule({ isMobile }) {
  const [markets, setMarkets] = useState(null);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mkts, nws] = await Promise.all([
        fetch("/api/markets").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/news?category=general").then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      setMarkets(mkts);
      setNews(nws);
      if (!mkts && !nws) setError("Connect Finnhub in Integrations to enable live data.");
    } catch {
      setError("Failed to fetch data.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatTime = (unix) => {
    if (!unix) return "";
    const d = new Date(unix * 1000);
    const now = new Date();
    const diffH = Math.floor((now - d) / 3600000);
    if (diffH < 1) return `${Math.floor((now - d) / 60000)}m ago`;
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>

      {/* Market Indices */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{
          fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.08em",
          textTransform: "uppercase", color: C.amber, marginBottom: "16px",
        }}>Markets</div>

        {loading && !markets && (
          <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron }}>Loading market data...</div>
        )}

        {error && !markets && (
          <div style={{
            padding: isMobile ? "16px" : "20px", borderRadius: "6px",
            backgroundColor: C.cavern, border: `1px solid ${C.stone}`,
            fontFamily: F.sans, fontSize: "13px", color: C.fog, lineHeight: 1.6,
          }}>{error}</div>
        )}

        {markets?.indices && (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "12px",
          }}>
            {markets.indices.map((idx, i) => {
              const up = idx.change >= 0;
              return (
                <div key={idx.id} style={{
                  backgroundColor: C.cavern, border: `1px solid ${C.stone}`, borderRadius: "6px",
                  padding: isMobile ? "16px" : "20px",
                  animation: `fadeUp 0.35s ease ${0.06 * i}s both`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontFamily: F.sans, fontSize: "12px", fontWeight: 600, color: C.fog }}>{idx.label}</div>
                      <div style={{ fontFamily: F.mono, fontSize: "10px", color: C.iron }}>{idx.symbol}</div>
                    </div>
                    <div style={{
                      fontFamily: F.mono, fontSize: "10px", padding: "2px 8px", borderRadius: "3px",
                      backgroundColor: up ? "rgba(90,138,106,0.12)" : "rgba(154,74,74,0.12)",
                      color: up ? C.success : C.danger,
                    }}>
                      {up ? "+" : ""}{idx.changePct?.toFixed(2)}%
                    </div>
                  </div>
                  <div style={{
                    fontFamily: F.display, fontSize: isMobile ? "28px" : "32px",
                    color: C.cream, lineHeight: 1, marginBottom: "6px",
                  }}>
                    {idx.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: "10px", color: up ? C.success : C.danger }}>
                    {up ? "+" : ""}{idx.change?.toFixed(2)}
                  </div>
                  <div style={{
                    display: "flex", gap: "12px", marginTop: "8px",
                    fontFamily: F.mono, fontSize: "9px", color: C.iron,
                  }}>
                    <span>H {idx.high?.toFixed(2)}</span>
                    <span>L {idx.low?.toFixed(2)}</span>
                    <span>O {idx.open?.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* News */}
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "16px",
        }}>
          <div style={{
            fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.08em",
            textTransform: "uppercase", color: C.amber,
          }}>Top News</div>
          <button onClick={fetchData} style={{
            background: "none", border: `1px solid ${C.slate}`, borderRadius: "3px",
            padding: isMobile ? "6px 12px" : "2px 8px",
            fontFamily: F.mono, fontSize: "10px", color: C.amber,
            cursor: "pointer", minHeight: isMobile ? "32px" : undefined,
          }}>
            {loading ? "..." : "refresh"}
          </button>
        </div>

        {loading && !news && (
          <div style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron }}>Loading headlines...</div>
        )}

        {news?.articles && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {news.articles.map((article, i) => (
              <a key={article.id || i} href={article.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", gap: "14px", padding: isMobile ? "14px 0" : "12px 0",
                  borderBottom: `1px solid ${C.stone}`,
                  textDecoration: "none", color: "inherit",
                  minHeight: isMobile ? "60px" : undefined,
                  animation: `fadeUp 0.3s ease ${0.03 * i}s both`,
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.amberSubtle}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {/* Thumbnail */}
                {article.image && !isMobile && (
                  <div style={{
                    width: "80px", height: "54px", borderRadius: "4px", overflow: "hidden",
                    flexShrink: 0, backgroundColor: C.stone,
                  }}>
                    <img src={article.image} alt="" style={{
                      width: "100%", height: "100%", objectFit: "cover",
                    }} onError={e => e.currentTarget.style.display = "none"} />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: F.sans, fontSize: isMobile ? "14px" : "13px", fontWeight: 500,
                    color: C.parchment, lineHeight: 1.4, marginBottom: "4px",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{article.headline}</div>
                  {article.summary && !isMobile && (
                    <div style={{
                      fontFamily: F.sans, fontSize: "12px", color: C.iron, lineHeight: 1.4,
                      display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{article.summary}</div>
                  )}
                  <div style={{
                    display: "flex", gap: "10px", marginTop: "4px",
                    fontFamily: F.mono, fontSize: "10px", color: C.iron,
                  }}>
                    <span style={{ color: C.amber }}>{article.source}</span>
                    <span>{formatTime(article.datetime)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && !news && !error && (
          <div style={{
            padding: isMobile ? "24px 16px" : "32px 20px", borderRadius: "6px",
            backgroundColor: C.cavern, border: `1px solid ${C.stone}`,
            textAlign: "center",
          }}>
            <div style={{ fontFamily: F.display, fontSize: "22px", color: C.cream, marginBottom: "8px" }}>No data yet</div>
            <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron, lineHeight: 1.6 }}>
              Add your Finnhub API key in Integrations to surface live markets and news.
            </div>
          </div>
        )}
      </div>
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
    anthropic: I.command,
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
    </div>
  );
}

// ─── Tasks Module (Calendar View) ────────────────────────────────
function TasksModule({ isMobile, session }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDue, setNewDue] = useState("");

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

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await fetch("/api/tasks", {
        method: "POST", headers,
        body: JSON.stringify({ title: newTitle.trim(), priority: newPriority, due_date: newDue || null }),
      });
      setNewTitle(""); setNewPriority("medium"); setNewDue(""); setShowAdd(false);
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
      display: "flex", alignItems: "center", gap: "10px",
      padding: isMobile ? "10px 0" : "8px 0",
      animation: `fadeUp 0.25s ease ${0.03 * index}s both`,
      opacity: task.completed ? 0.4 : 1,
    }}>
      {/* Checkbox */}
      <button onClick={() => toggleComplete(task)} style={{
        width: isMobile ? "24px" : "20px", height: isMobile ? "24px" : "20px", flexShrink: 0,
        borderRadius: "4px", cursor: "pointer",
        background: task.completed ? C.success : "transparent",
        border: `1.5px solid ${task.completed ? C.success : C.slate}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: task.completed ? C.obsidian : "transparent", fontSize: "12px",
      }}>
        {task.completed && "✓"}
      </button>

      {/* Title */}
      <div style={{
        flex: 1, fontFamily: F.sans, fontSize: isMobile ? "14px" : "13px",
        color: task.completed ? C.iron : C.parchment,
        textDecoration: task.completed ? "line-through" : "none",
      }}>{task.title}</div>

      {/* Priority badge */}
      <span style={{
        fontFamily: F.mono, fontSize: "8px", letterSpacing: "0.06em",
        padding: "2px 6px", borderRadius: "3px",
        color: priorityColors[task.priority],
        border: `1px solid ${priorityColors[task.priority]}30`,
        backgroundColor: `${priorityColors[task.priority]}10`,
      }}>{priorityLabels[task.priority]}</span>

      {/* Delete */}
      <button onClick={() => deleteTask(task.id)} style={{
        background: "none", border: "none", cursor: "pointer",
        color: C.slate, fontSize: "14px", padding: "4px",
        minWidth: isMobile ? "32px" : undefined, minHeight: isMobile ? "32px" : undefined,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>x</button>
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
    </div>
  );
}

// ─── Chat Shell ──────────────────────────────────────────────────
function ChatShell({ isMobile, session, liveData }) {
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
        setMessages(prev => [...prev, { role: "assistant", text: data.response }]);
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
            <div style={{ fontFamily: F.display, fontSize: "20px", color: C.cream, marginBottom: "8px" }}>Command Prompt</div>
            <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron, lineHeight: 1.6, marginBottom: "16px" }}>
              Connect your Anthropic API key in Integrations to enable the command prompt. Once connected, you can manage tasks, query projects, and control the Batcave with natural language.
            </div>
            <div style={{
              fontFamily: F.mono, fontSize: "10px", color: C.slate,
              padding: "8px 14px", backgroundColor: C.obsidian, borderRadius: "4px",
              display: "inline-block",
            }}>ANTHROPIC_API_KEY not connected</div>
          </div>
        )}

        {connected && messages.length === 0 && (
          <div style={{
            padding: isMobile ? "20px" : "28px", borderRadius: "6px",
            backgroundColor: C.cavern, border: `1px solid ${C.stone}`,
          }}>
            <div style={{ fontFamily: F.display, fontSize: "20px", color: C.cream, marginBottom: "8px" }}>Command Prompt</div>
            <div style={{ fontFamily: F.sans, fontSize: "13px", color: C.iron, lineHeight: 1.6 }}>
              Manage tasks, query status, control your projects. Try:
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
function CalendarModule({ isMobile, session }) {
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

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

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
          background: "none", border: `1px solid ${C.slate}`, borderRadius: "4px",
          padding: isMobile ? "8px 12px" : "4px 10px", cursor: "pointer",
          fontFamily: F.mono, fontSize: "12px", color: C.fog,
          minHeight: isMobile ? "40px" : undefined,
        }}>prev</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontFamily: F.display, fontSize: isMobile ? "22px" : "24px", color: C.cream }}>
            {monthNames[month]}
          </span>
          <span style={{ fontFamily: F.mono, fontSize: "12px", color: C.iron, marginLeft: "8px" }}>{year}</span>
        </div>
        <button onClick={goToday} style={{
          background: "none", border: `1px solid ${C.slate}`, borderRadius: "4px",
          padding: isMobile ? "8px 12px" : "4px 10px", cursor: "pointer",
          fontFamily: F.mono, fontSize: "11px", color: C.amber,
          minHeight: isMobile ? "40px" : undefined,
        }}>today</button>
        <button onClick={nextMonth} style={{
          background: "none", border: `1px solid ${C.slate}`, borderRadius: "4px",
          padding: isMobile ? "8px 12px" : "4px 10px", cursor: "pointer",
          fontFamily: F.mono, fontSize: "12px", color: C.fog,
          minHeight: isMobile ? "40px" : undefined,
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
            if (day === null) return <div key={`empty-${i}`} style={{ minHeight: isMobile ? "60px" : "80px", backgroundColor: C.obsidian, borderBottom: `1px solid ${C.stone}`, borderRight: `1px solid ${C.stone}` }} />;

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const dayEvents = getEventsForDate(dateStr);

            return (
              <div key={dateStr} style={{
                minHeight: isMobile ? "60px" : "80px",
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
  const liveData = useLiveData();

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
    { id: "command", label: "Command", icon: I.command },
    { id: "tasks", label: "Tasks", icon: I.tasks },
    { id: "projects", label: "Projects", icon: I.workspace },
    { id: "agents", label: "Agents", icon: I.agent },
    { id: "fitness", label: "Fitness", icon: I.pulse },
    { id: "calendar", label: "Calendar", icon: I.layers },
    { id: "integrations", label: "Integrations", icon: I.settings },
  ];

  const moduleMeta = {
    home: { title: "Briefing", mono: "Command Center", subtitle: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) },
    command: { title: "Command", mono: "Prompt", subtitle: "Natural language control" },
    tasks: { title: "Tasks", mono: "Personal Ops", subtitle: "Priority-driven task management" },
    projects: { title: "Projects", mono: "System Registry", subtitle: `${manifest.projects.length} registered across the system` },
    agents: { title: "Agents", mono: "Autonomous Systems", subtitle: "Build and manage autonomous workflows" },
    fitness: { title: "Fitness", mono: "Performance", subtitle: "Workouts, nutrition, recovery tracking" },
    calendar: { title: "Calendar", mono: "Schedule", subtitle: "Personal, professional, and travel — one view" },
    integrations: { title: "Integrations", mono: "Admin", subtitle: "Manage service connections" },
  };

  const placeholders = {
    agents: {
      description: "Autonomous agents that run scheduled code pushes, monitor repos, and execute workflows. Governed through intent, not interruption.",
      items: [
        { label: "Scheduled", title: "Code Deployer", desc: "Automated pushes on cron" },
        { label: "Monitor", title: "Repo Watcher", desc: "Track downstream changes" },
        { label: "Pipeline", title: "CI Orchestrator", desc: "Cross-package builds" },
        { label: "Research", title: "Scout", desc: "Surface signals from feeds" },
      ],
    },
    fitness: {
      description: "Track workouts, nutrition, and recovery with weekly summaries and trend analysis. The body is infrastructure too.",
      items: [
        { label: "Log", title: "Workout Log", desc: "Exercises, sets, duration" },
        { label: "Nutrition", title: "Fuel Tracker", desc: "Meals, macros, hydration" },
        { label: "Recovery", title: "Recovery Score", desc: "Sleep, soreness, readiness" },
        { label: "Trends", title: "Progress", desc: "Weekly and monthly trends" },
      ],
    },
  };

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
          <div style={{ width: isMobile ? "18px" : "14px", height: isMobile ? "18px" : "14px", color: C.iron }}>{I.search}</div>
          <span style={{ fontFamily: F.sans, fontSize: isMobile ? "14px" : "12px", color: C.iron, flex: 1 }}>Command</span>
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
          <span style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, letterSpacing: "0.04em" }}>v3.1 // batcave</span>
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
      height: "100vh", backgroundColor: C.obsidian, color: C.parchment,
      overflow: "hidden", WebkitFontSmoothing: "antialiased",
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
        @keyframes breathe { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.slate}; border-radius: 2px; }
        button { font-family: inherit; }
        html { -webkit-text-size-adjust: 100%; }
      `}</style>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── MOBILE HEADER BAR ── */}
        {isMobile && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
            height: "56px", backgroundColor: C.cavern,
            borderBottom: `1px solid ${C.stone}`,
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
              <span style={{ fontFamily: F.display, fontSize: "18px", color: C.cream }}>{meta.title}</span>
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
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
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
              backgroundColor: C.cavern, zIndex: 101,
              display: "flex", flexDirection: "column",
              animation: "slideRight 0.25s cubic-bezier(0.22,1,0.36,1)",
              borderRight: `1px solid ${C.stone}`,
            }}>
              {/* Drawer header */}
              <div style={{
                padding: "14px 16px", display: "flex", alignItems: "center",
                gap: "10px", borderBottom: `1px solid ${C.stone}`,
              }}>
                <div style={{ width: "28px", height: "28px", color: C.amber, flexShrink: 0 }}>{I.bat}</div>
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
            width: collapsed ? 56 : 200, backgroundColor: C.cavern,
            borderRight: `1px solid ${C.stone}`,
            display: "flex", flexDirection: "column",
            transition: "width 0.25s cubic-bezier(0.22,1,0.36,1)",
            flexShrink: 0, overflow: "hidden",
            animation: mounted ? "fadeIn 0.4s ease" : "none",
          }}>
            <div onClick={() => setCollapsed(!collapsed)} style={{
              padding: collapsed ? "18px 14px" : "18px 16px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
              borderBottom: `1px solid ${C.stone}`,
            }}>
              <div style={{ width: "28px", height: "28px", color: C.amber, flexShrink: 0 }}>{I.bat}</div>
              {!collapsed && (
                <span style={{ fontFamily: F.display, fontSize: "19px", color: C.cream, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>Batcave</span>
              )}
            </div>
            {sidebarContent}
          </nav>
        )}

        {/* ── MAIN CONTENT ── */}
        <main style={{
          flex: 1, overflow: "auto",
          padding: isMobile ? "72px 20px 32px" : "40px 48px",
        }}>
          <div key={activeModule} style={{ marginBottom: isMobile ? "24px" : "32px", animation: "fadeUp 0.35s ease both" }}>
            <div style={{
              fontFamily: F.mono, fontSize: "10px", letterSpacing: "0.1em",
              textTransform: "uppercase", color: C.amber, marginBottom: "8px",
            }}>{meta.mono}</div>
            {!isMobile && (
              <h1 style={{
                fontFamily: F.display, fontSize: "38px", fontWeight: 300,
                color: C.cream, lineHeight: 1.1, marginBottom: "6px", letterSpacing: "-0.01em",
              }}>{meta.title}</h1>
            )}
            <p style={{ fontFamily: F.body, fontSize: isMobile ? "14px" : "15px", fontWeight: 300, color: C.iron }}>{meta.subtitle}</p>
          </div>

          <div style={{
            height: "1px", marginBottom: isMobile ? "20px" : "28px",
            background: `linear-gradient(to right, ${C.amber}40, ${C.stone}, transparent)`,
          }} />

          <div key={activeModule + "-content"}>
            {activeModule === "home" && <HomepageModule isMobile={isMobile} />}
            {activeModule === "command" && <ChatShell isMobile={isMobile} session={auth.session} liveData={liveData} />}
            {activeModule === "tasks" && <TasksModule isMobile={isMobile} session={auth.session} />}
            {activeModule === "calendar" && <CalendarModule isMobile={isMobile} session={auth.session} />}
            {activeModule === "projects" && <ProjectsModule isMobile={isMobile} liveData={liveData} />}
            {activeModule === "integrations" && <IntegrationsModule isMobile={isMobile} liveData={liveData} session={auth.session} />}
            {!["home","command","tasks","calendar","projects","integrations"].includes(activeModule) && placeholders[activeModule] && (
              <PlaceholderModule description={placeholders[activeModule].description} items={placeholders[activeModule].items} isMobile={isMobile} />
            )}
          </div>
        </main>
      </div>

      {commandOpen && <CommandBar onClose={() => setCommandOpen(false)} isMobile={isMobile} />}
    </div>
  );
}
