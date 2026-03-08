import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════════
// BATCAVE CONSOLE v2.8 — Supabase Auth + Secrets
// ═══════════════════════════════════════════════════════════════════

// ─── Supabase Client ─────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ─── Auth Hook ───────────────────────────────────────────────────
function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  };

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error;
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

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const err = mode === "login"
      ? await onLogin.signIn(email, password)
      : await onLogin.signUp(email, password);
    setLoading(false);
    if (err) setError(err.message);
    else if (mode === "signup") setError(null);
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

  // Auth gate
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

  const modules = [
    { id: "home", label: "Home", icon: I.home },
    { id: "projects", label: "Projects", icon: I.workspace },
    { id: "agents", label: "Agents", icon: I.agent },
    { id: "tasks", label: "Tasks", icon: I.tasks },
    { id: "fitness", label: "Fitness", icon: I.pulse },
    { id: "calendar", label: "Calendar", icon: I.layers },
    { id: "integrations", label: "Integrations", icon: I.settings },
  ];

  const moduleMeta = {
    home: { title: "Briefing", mono: "Command Center", subtitle: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) },
    projects: { title: "Projects", mono: "System Registry", subtitle: `${manifest.projects.length} registered across the system` },
    agents: { title: "Agents", mono: "Autonomous Systems", subtitle: "Build and manage autonomous workflows" },
    tasks: { title: "Tasks", mono: "Personal Ops", subtitle: "Priority-driven task management" },
    fitness: { title: "Fitness", mono: "Performance", subtitle: "Workouts, nutrition, recovery tracking" },
    calendar: { title: "Calendar", mono: "Scheduling", subtitle: "Unified calendar and email view" },
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
    tasks: {
      description: "Personal task list with priority levels, project tagging, and completion tracking. Capture fast, focus deep.",
      items: [
        { label: "Inbox", title: "Capture", desc: "Quick-add from anywhere" },
        { label: "Active", title: "Focus Queue", desc: "Today's priority stack" },
        { label: "Backlog", title: "Someday", desc: "Parked ideas, deferred work" },
        { label: "Review", title: "Weekly Review", desc: "Reflect and reprioritize" },
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
    calendar: {
      description: "Unified view of calendar events and email threads. Connected via Google Calendar and Gmail. Your morning brief, automated.",
      items: [
        { label: "Today", title: "Daily Agenda", desc: "Meetings, blocks, open time" },
        { label: "Email", title: "Priority Inbox", desc: "Flagged threads, pending replies" },
        { label: "Week", title: "Week View", desc: "Availability and scheduling" },
        { label: "Digest", title: "Morning Brief", desc: "AI summary of upcoming day" },
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
          <span style={{ fontFamily: F.mono, fontSize: "9px", color: C.slate, letterSpacing: "0.04em" }}>v2.8 // batcave</span>
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
            {activeModule === "projects" && <ProjectsModule isMobile={isMobile} liveData={liveData} />}
            {activeModule === "integrations" && <IntegrationsModule isMobile={isMobile} liveData={liveData} session={auth.session} />}
            {!["home","projects","integrations"].includes(activeModule) && placeholders[activeModule] && (
              <PlaceholderModule description={placeholders[activeModule].description} items={placeholders[activeModule].items} isMobile={isMobile} />
            )}
          </div>
        </main>
      </div>

      {commandOpen && <CommandBar onClose={() => setCommandOpen(false)} isMobile={isMobile} />}
    </div>
  );
}
