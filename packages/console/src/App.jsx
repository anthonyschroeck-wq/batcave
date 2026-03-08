import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
// BATCAVE CONSOLE v2.3 — Mobile-first Command Surface
// ═══════════════════════════════════════════════════════════════════

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

// ─── Manifest ────────────────────────────────────────────────────
const manifest = {
  projects: [
    { slug: "console", name: "Batcave Console", status: "active", type: "app", migrated: true, deploy: "https://batcave-sage.vercel.app", notes: "Dashboard UI — the Batcave itself" },
    { slug: "omote", name: "Omote", status: "active", type: "app", migrated: false, deploy: "https://omote-one.vercel.app", notes: "Demo stage designer — Supabase backend, JSX sandboxing, multi-cue system" },
    { slug: "cerebro", name: "Cerebro", status: "active", type: "app", migrated: false, deploy: null, notes: "GTM intelligence dashboard — NL queries, sentiment, trend charts" },
    { slug: "run-recipes", name: "Run Recipes", status: "active", type: "app", migrated: false, deploy: null, notes: "Meal management, sidebar nav, Yes Chef scoring" },
    { slug: "veritas", name: "Veritas", status: "incubating", type: "extension", migrated: false, deploy: null, notes: "Chrome extension — AI content detection, Manifest V3" },
  ],
};

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
function ProjectRow({ project, index, isMobile }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const sc = statusConfig[project.status];

  return (
    <div style={{ animation: `fadeUp 0.35s ease ${0.04 * index}s both` }}>
      <div onClick={() => setExpanded(!expanded)}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: isMobile ? "10px" : "12px",
          padding: isMobile ? "16px 0" : "14px 0",
          borderBottom: `1px solid ${C.stone}`,
          cursor: "pointer", minHeight: isMobile ? "52px" : undefined,
        }}>
        <div style={{
          width: "7px", height: "7px", borderRadius: "50%",
          backgroundColor: sc.color, flexShrink: 0,
          animation: project.status === "active" ? "breathe 3s ease-in-out infinite" : "none",
        }} />
        <div style={{
          fontFamily: F.display, fontSize: isMobile ? "19px" : "18px", flex: 1,
          color: hovered ? C.cream : C.parchment, transition: "color 0.2s ease",
        }}>{project.name}</div>

        {/* Type badge - hide on very small screens to save space */}
        {!isMobile && (
          <span style={{
            fontFamily: F.mono, fontSize: "9px", letterSpacing: "0.06em",
            padding: "2px 8px", border: `1px solid ${C.slate}`, borderRadius: "3px", color: C.iron,
          }}>{typeLabels[project.type]}</span>
        )}

        {!project.migrated && !isMobile && (
          <span style={{ width: "12px", height: "12px", color: C.iron, display: "flex" }}>{I.external}</span>
        )}

        <span style={{
          width: "16px", height: "16px", color: hovered ? C.amber : C.iron,
          transform: expanded ? "rotate(90deg)" : "rotate(0)",
          transition: "transform 0.2s ease, color 0.2s ease", display: "flex", flexShrink: 0,
        }}>{I.chevron}</span>
      </div>

      {expanded && (
        <div style={{
          padding: isMobile ? "14px 0 14px 16px" : "14px 0 14px 19px",
          borderBottom: `1px solid ${C.stone}`,
          borderLeft: `2px solid ${C.amber}`, paddingLeft: "16px",
          animation: "fadeUp 0.2s ease both",
        }}>
          <div style={{
            fontFamily: F.body, fontSize: "14px", fontWeight: 300,
            color: C.fog, lineHeight: 1.6, marginBottom: "12px",
          }}>{project.notes}</div>
          <div style={{
            display: "flex", gap: isMobile ? "12px" : "20px", flexWrap: "wrap",
            fontFamily: F.mono, fontSize: isMobile ? "11px" : "10px", color: C.iron,
          }}>
            <span>status: <span style={{ color: sc.color }}>{sc.label.toLowerCase()}</span></span>
            {isMobile && <span style={{
              fontFamily: F.mono, fontSize: "10px", padding: "1px 6px",
              border: `1px solid ${C.slate}`, borderRadius: "3px", color: C.iron,
            }}>{typeLabels[project.type]}</span>}
            <span>slug: {project.slug}</span>
            {project.deploy && (
              <a href={project.deploy} target="_blank" rel="noopener noreferrer"
                style={{ color: C.amber, textDecoration: "none" }}>deployed</a>
            )}
            {project.migrated && <span style={{ color: C.success }}>in-repo</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Projects Module ─────────────────────────────────────────────
function ProjectsModule({ isMobile }) {
  const active = manifest.projects.filter(p => p.status === "active");
  const incubating = manifest.projects.filter(p => p.status !== "active");

  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(4, auto)",
        gap: isMobile ? "16px" : "40px",
        marginBottom: "32px", animation: "fadeUp 0.4s ease both",
      }}>
        {[
          { label: "Total", value: manifest.projects.length },
          { label: "Active", value: active.length },
          { label: "Incubating", value: incubating.length },
          { label: "In-Repo", value: manifest.projects.filter(p => p.migrated).length },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontFamily: F.display, fontSize: isMobile ? "28px" : "32px", color: C.cream, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontFamily: F.mono, fontSize: isMobile ? "9px" : "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: C.iron, marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>
      {manifest.projects.map((p, i) => <ProjectRow key={p.slug} project={p} index={i} isMobile={isMobile} />)}
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
  const [activeModule, setActiveModule] = useState("projects");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    { id: "projects", label: "Projects", icon: I.workspace },
    { id: "agents", label: "Agents", icon: I.agent },
    { id: "tasks", label: "Tasks", icon: I.tasks },
    { id: "fitness", label: "Fitness", icon: I.pulse },
    { id: "calendar", label: "Calendar", icon: I.layers },
  ];

  const moduleMeta = {
    projects: { title: "Projects", mono: "System Registry", subtitle: `${manifest.projects.length} registered across the system` },
    agents: { title: "Agents", mono: "Autonomous Systems", subtitle: "Build and manage autonomous workflows" },
    tasks: { title: "Tasks", mono: "Personal Ops", subtitle: "Priority-driven task management" },
    fitness: { title: "Fitness", mono: "Performance", subtitle: "Workouts, nutrition, recovery tracking" },
    calendar: { title: "Calendar", mono: "Integrations", subtitle: "Unified calendar and email view" },
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
        <div style={{ height: "1px", backgroundColor: C.stone, margin: "8px 12px" }} />
        <div style={{ animation: mounted ? "fadeUp 0.3s ease 0.3s both" : "none" }}>
          <NavItem icon={I.settings} label="Settings" collapsed={!isMobile && collapsed}
            isMobile={isMobile} onClick={() => {}} />
        </div>
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

      {/* Version */}
      {(isMobile || !collapsed) && (
        <div style={{
          padding: isMobile ? "14px 20px" : "12px 16px", borderTop: `1px solid ${C.stone}`,
          fontFamily: F.mono, fontSize: "9px", color: C.slate, letterSpacing: "0.04em",
        }}>v2.3 // batcave</div>
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
            {activeModule === "projects" && <ProjectsModule isMobile={isMobile} />}
            {activeModule !== "projects" && placeholders[activeModule] && (
              <PlaceholderModule description={placeholders[activeModule].description} items={placeholders[activeModule].items} isMobile={isMobile} />
            )}
          </div>
        </main>
      </div>

      {commandOpen && <CommandBar onClose={() => setCommandOpen(false)} isMobile={isMobile} />}
    </div>
  );
}
