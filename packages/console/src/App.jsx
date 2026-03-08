import { useState, useEffect } from "react";
import BrandKit from "./BrandKit";

// -- Manifest data (Phase 2: fetch from GitHub API) --
const manifest = {
  projects: [
    { slug: "console", name: "Batcave Console", status: "active", type: "app", migrated: true, deploy: "https://batcave-console.vercel.app", notes: "Dashboard UI — the Batcave itself" },
    { slug: "omote", name: "Omote", status: "active", type: "app", migrated: false, deploy: null, notes: "Demo stage designer with Okta SSO, config manifest, AI insights" },
    { slug: "cerebro", name: "Cerebro", status: "active", type: "app", migrated: false, deploy: null, notes: "External repo — pending integration" },
    { slug: "fox-market", name: "Fox Market", status: "active", type: "app", migrated: false, deploy: null, notes: "AI trading simulator, Monte Carlo forecasting, Ask Fox" },
    { slug: "run-recipes", name: "Run Recipes", status: "active", type: "app", migrated: false, deploy: null, notes: "Meal management, sidebar nav, Yes Chef scoring" },
    { slug: "syndio-mockups", name: "Syndio Mockups", status: "active", type: "poc", migrated: false, deploy: null, notes: "Pay equity and HR tech multi-POC workspace" },
    { slug: "veritas", name: "Veritas", status: "incubating", type: "extension", migrated: false, deploy: null, notes: "Chrome extension — AI content detection, Manifest V3" },
  ]
};

// -- SVG Icons (line-work, 1.4px stroke, round caps) --
const Icons = {
  projects: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  agents: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  fitness: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  external: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  brandkit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  bat: (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8c-2 2-6 3-10 2 1 3 3 5 6 6-2 2-5 3-8 3 4 3 9 4 13 2v3l-1 2h1l1-1 1 1h1l-1-2v-3c4 2 9 1 13-2-3 0-6-1-8-3 3-1 5-3 6-6-4 1-8 0-10-2z" />
    </svg>
  ),
};

const statusConfig = {
  active: { label: "Active", color: "#34d399" },
  incubating: { label: "Incubating", color: "#fbbf24" },
  archived: { label: "Archived", color: "#6b7280" },
  migrating: { label: "Migrating", color: "#60a5fa" },
};

const typeLabels = { app: "APP", poc: "POC", extension: "EXT", library: "LIB" };

// -- Placeholder Module --
function PlaceholderModule({ title, description, items }) {
  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 300,
        color: "var(--color-muted)",
        marginBottom: 32,
        maxWidth: 480,
        lineHeight: 1.6
      }}>
        {description}
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 12,
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            border: "1px dashed var(--color-border)",
            borderRadius: 3,
            padding: "20px 18px",
            animation: `fadeUp 0.4s ease ${0.05 * (i + 1)}s both`,
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              marginBottom: 6
            }}>{item.label}</div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              color: "var(--color-navy)",
              marginBottom: 4
            }}>{item.title}</div>
            <div style={{
              fontSize: 12,
              fontWeight: 300,
              color: "var(--color-muted)",
              lineHeight: 1.4
            }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Projects Module --
function ProjectsModule() {
  const [expandedSlug, setExpandedSlug] = useState(null);
  const active = manifest.projects.filter(p => p.status === "active");
  const other = manifest.projects.filter(p => p.status !== "active");

  const ProjectRow = ({ project, index }) => {
    const isExpanded = expandedSlug === project.slug;
    const sc = statusConfig[project.status];
    return (
      <div
        onClick={() => setExpandedSlug(isExpanded ? null : project.slug)}
        style={{
          padding: "14px 0",
          borderBottom: "1px solid var(--color-border)",
          cursor: "pointer",
          animation: `fadeUp 0.35s ease ${0.04 * index}s both`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Status dot */}
          <div style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: sc.color,
            flexShrink: 0,
          }} />

          {/* Name */}
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 17,
            flex: 1,
            color: "var(--color-navy)",
          }}>
            {project.name}
          </div>

          {/* Type badge */}
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.06em",
            padding: "2px 8px",
            border: "1px solid var(--color-border)",
            borderRadius: 2,
            color: "var(--color-muted)",
          }}>
            {typeLabels[project.type]}
          </span>

          {/* Migration indicator */}
          {!project.migrated && (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--color-muted)",
              display: "flex",
              alignItems: "center",
              gap: 3
            }}>
              {Icons.external} ext
            </span>
          )}

          {/* Chevron */}
          <span style={{
            transform: isExpanded ? "rotate(90deg)" : "rotate(0)",
            transition: "transform 0.2s ease",
            color: "var(--color-muted)",
            display: "flex"
          }}>
            {Icons.chevron}
          </span>
        </div>

        {isExpanded && (
          <div style={{
            marginTop: 12,
            marginLeft: 19,
            paddingLeft: 12,
            borderLeft: "1.4px solid var(--color-border)",
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 300,
              color: "var(--color-muted)",
              lineHeight: 1.5,
              marginBottom: 10
            }}>
              {project.notes}
            </div>
            <div style={{
              display: "flex",
              gap: 16,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--color-muted)",
            }}>
              <span>Status: {sc.label}</span>
              <span>Slug: {project.slug}</span>
              {project.deploy && (
                <span style={{ color: "var(--color-navy)" }}>
                  Deployed
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Stats bar */}
      <div style={{
        display: "flex",
        gap: 32,
        marginBottom: 28,
        animation: "fadeUp 0.4s ease both"
      }}>
        {[
          { label: "Total", value: manifest.projects.length },
          { label: "Active", value: active.length },
          { label: "Incubating", value: other.length },
          { label: "In-Repo", value: manifest.projects.filter(p => p.migrated).length },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              color: "var(--color-navy)",
              lineHeight: 1,
            }}>{stat.value}</div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              marginTop: 4
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Project list */}
      <div>
        {manifest.projects.map((p, i) => (
          <ProjectRow key={p.slug} project={p} index={i} />
        ))}
      </div>
    </div>
  );
}

// -- Main App --
export default function BatcaveConsole() {
  const [activeModule, setActiveModule] = useState("projects");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const modules = [
    { id: "projects", label: "Projects", icon: Icons.projects },
    { id: "agents", label: "Agents", icon: Icons.agents },
    { id: "tasks", label: "Tasks", icon: Icons.tasks },
    { id: "fitness", label: "Fitness", icon: Icons.fitness },
    { id: "calendar", label: "Calendar", icon: Icons.calendar },
    { id: "brandkit", label: "Brand Kit", icon: Icons.brandkit },
  ];

  const placeholders = {
    agents: {
      description: "Build and manage autonomous agents that run scheduled code pushes, monitor repos, and execute workflows on your behalf.",
      items: [
        { label: "Scheduled", title: "Code Deployer", desc: "Automated pushes on cron schedule" },
        { label: "Monitor", title: "Repo Watcher", desc: "Track changes across downstream repos" },
        { label: "Pipeline", title: "CI Orchestrator", desc: "Cross-package build coordination" },
        { label: "Research", title: "Scout", desc: "Surface relevant signals from feeds" },
      ]
    },
    tasks: {
      description: "Personal task list with priority levels, project tagging, and completion tracking.",
      items: [
        { label: "Inbox", title: "Capture", desc: "Quick-add tasks from anywhere" },
        { label: "Active", title: "Focus Queue", desc: "Today's priority stack" },
        { label: "Backlog", title: "Someday", desc: "Parked ideas and deferred work" },
        { label: "Review", title: "Weekly Review", desc: "Reflect, reprioritize, archive" },
      ]
    },
    fitness: {
      description: "Track workouts, nutrition, and recovery with weekly summaries and trend analysis.",
      items: [
        { label: "Log", title: "Workout Log", desc: "Exercises, sets, reps, duration" },
        { label: "Nutrition", title: "Fuel Tracker", desc: "Meals, macros, hydration" },
        { label: "Recovery", title: "Recovery Score", desc: "Sleep, soreness, readiness" },
        { label: "Trends", title: "Progress", desc: "Weekly and monthly trend lines" },
      ]
    },
    calendar: {
      description: "Unified view of calendar events and email threads, connected via Google Calendar and Gmail integrations.",
      items: [
        { label: "Today", title: "Daily Agenda", desc: "Meetings, blocks, and open time" },
        { label: "Email", title: "Priority Inbox", desc: "Flagged threads and pending replies" },
        { label: "Week", title: "Week View", desc: "Availability and scheduling" },
        { label: "Digest", title: "Morning Brief", desc: "AI summary of upcoming day" },
      ]
    },
  };

  const moduleTitle = {
    projects: "Projects",
    agents: "Agents",
    tasks: "Tasks",
    fitness: "Fitness",
    calendar: "Calendar",
    brandkit: "Brand Kit",
  };

  const moduleSubtitle = {
    projects: `${manifest.projects.length} registered across the system`,
    agents: "Autonomous workflows — coming soon",
    tasks: "Personal task management — coming soon",
    fitness: "Health and performance tracking — coming soon",
    calendar: "Calendar and email integration — coming soon",
    brandkit: "Batcave design system and brand guidelines",
  };

  return (
    <div style={{
      fontFamily: "var(--font-body)",
      display: "flex",
      height: "100vh",
      background: "var(--color-cream)",
      color: "var(--color-navy)",
      overflow: "hidden",
    }}>
      <style>{`
        :root {
          --font-display: 'Instrument Serif', Georgia, serif;
          --font-body: 'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif;
          --font-mono: 'IBM Plex Mono', 'SF Mono', Consolas, monospace;
          --color-navy: #0a1628;
          --color-navy-light: #1a2a44;
          --color-navy-muted: #2a3a54;
          --color-cream: #f5f0e8;
          --color-cream-dark: #ebe5db;
          --color-muted: #7a8494;
          --color-border: rgba(10, 22, 40, 0.1);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(10, 22, 40, 0.15); border-radius: 2px; }

        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Sidebar */}
      <nav style={{
        width: sidebarCollapsed ? 56 : 200,
        background: "var(--color-navy)",
        color: "var(--color-cream)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        flexShrink: 0,
        overflow: "hidden",
        animation: mounted ? "fadeIn 0.5s ease" : "none",
      }}>
        {/* Logo */}
        <div
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            padding: sidebarCollapsed ? "20px 16px" : "20px 20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid rgba(245, 240, 232, 0.06)",
          }}
        >
          <span style={{ flexShrink: 0, display: "flex", opacity: 0.9 }}>
            {Icons.bat}
          </span>
          {!sidebarCollapsed && (
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            }}>
              Batcave
            </span>
          )}
        </div>

        {/* Nav items */}
        <div style={{ padding: "12px 0", flex: 1 }}>
          {modules.map((mod, i) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: sidebarCollapsed ? "10px 19px" : "10px 20px",
                  background: isActive ? "rgba(245, 240, 232, 0.08)" : "transparent",
                  border: "none",
                  borderRight: isActive ? "2px solid var(--color-cream)" : "2px solid transparent",
                  color: isActive ? "var(--color-cream)" : "rgba(245, 240, 232, 0.45)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  animation: mounted ? `slideIn 0.3s ease ${0.05 * (i + 1)}s both` : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "rgba(245, 240, 232, 0.7)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "rgba(245, 240, 232, 0.45)";
                }}
              >
                <span style={{ flexShrink: 0, display: "flex" }}>{mod.icon}</span>
                {!sidebarCollapsed && <span>{mod.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(245, 240, 232, 0.06)",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "rgba(245, 240, 232, 0.25)",
            letterSpacing: "0.04em",
          }}>
            v2.0.0 // dev
          </div>
        )}
      </nav>

      {/* Main */}
      <main style={{
        flex: 1,
        overflow: "auto",
        padding: activeModule === "brandkit" ? 0 : "40px 48px",
      }}>
        {activeModule === "brandkit" ? (
          <BrandKit />
        ) : (
        <>
        {/* Page header */}
        <div style={{
          marginBottom: 32,
          animation: "fadeUp 0.35s ease both",
        }} key={activeModule}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            marginBottom: 6,
          }}>
            {activeModule === "projects" ? "System Registry" :
             activeModule === "agents" ? "Autonomous Systems" :
             activeModule === "tasks" ? "Personal Ops" :
             activeModule === "fitness" ? "Performance" :
             "Integrations"}
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 36,
            fontWeight: 400,
            lineHeight: 1.15,
            marginBottom: 4,
          }}>
            {moduleTitle[activeModule]}
          </h1>
          <p style={{
            fontSize: 14,
            fontWeight: 300,
            color: "var(--color-muted)",
          }}>
            {moduleSubtitle[activeModule]}
          </p>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "var(--color-border)",
          marginBottom: 28,
        }} />

        {/* Content */}
        <div key={activeModule}>
          {activeModule === "projects" && <ProjectsModule />}
          {activeModule !== "projects" && placeholders[activeModule] && (
            <PlaceholderModule
              title={moduleTitle[activeModule]}
              description={placeholders[activeModule].description}
              items={placeholders[activeModule].items}
            />
          )}
        </div>
        </>
        )}
      </main>
    </div>
  );
}
