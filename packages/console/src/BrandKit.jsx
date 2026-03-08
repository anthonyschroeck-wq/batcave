import { useState, useEffect, useRef } from "react";

// ─── Batcave Brand Kit ───────────────────────────────────────────
// A unified design system for the Batcave platform.
// Inspired by the duality of Wayne Manor: refined on the surface,
// powerful underneath. Traditional elegance meets quiet technology.

const BRAND = {
  colors: {
    obsidian: "#111115",
    cavern: "#1a1a20",
    stone: "#252530",
    slate: "#3a3a48",
    iron: "#5a5a6a",
    pewter: "#8888998",
    fog: "#b0b0bc",
    parchment: "#e8e4db",
    cream: "#f5f1e8",
    amber: "#c4973a",
    amberLight: "#d4aa50",
    amberGlow: "rgba(196, 151, 58, 0.12)",
    amberSubtle: "rgba(196, 151, 58, 0.06)",
    embers: "#a3783a",
    success: "#5a8a6a",
    caution: "#b89040",
    danger: "#9a4a4a",
  },
  fonts: {
    display: "'Cormorant Garamond', 'Georgia', serif",
    body: "'Source Serif 4', 'Georgia', serif",
    mono: "'IBM Plex Mono', 'Courier New', monospace",
    sans: "'Source Sans 3', 'Helvetica Neue', sans-serif",
  },
  radii: { sm: "3px", md: "6px", lg: "10px" },
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "40px", xxl: "64px" },
};

// ─── Icons (SVG line work, 24x24 viewBox) ────────────────────────
const icons = {
  command: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8V6a2 2 0 0 1 2-2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2-2v-2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 8v2" /><path d="M12 14v2" /><path d="M8 12h2" /><path d="M14 12h2" />
    </svg>
  ),
  deploy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" /><path d="M8 11l4 4 4-4" />
      <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
    </svg>
  ),
  workspace: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M17.5 14v7" /><path d="M14 17.5h7" />
    </svg>
  ),
  blueprint: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" />
      <path d="M9 4v13" /><path d="M15 7v13" />
    </svg>
  ),
  signal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" /><path d="M8 20v-6" /><path d="M16 20v-8" /><path d="M4 20v-2" /><path d="M20 20v-4" />
    </svg>
  ),
  agent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="1" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6" />
      <path d="M15.5 15.5L20 20" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
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
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l-8 4 8 4 8-4-8-4z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 16l8 4 8-4" />
    </svg>
  ),
};

// ─── Fade-in observer hook ───────────────────────────────────────
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = "" }) {
  const { ref, visible } = useFadeIn();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

// ─── Swatch Component ────────────────────────────────────────────
function Swatch({ name, hex, isLight }) {
  const [copied, setCopied] = useState(false);
  return (
    <div onClick={() => { navigator.clipboard?.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      style={{
        cursor: "pointer", display: "flex", flexDirection: "column", gap: "8px",
      }}>
      <div style={{
        width: "100%", aspectRatio: "1", borderRadius: BRAND.radii.md,
        backgroundColor: hex, border: isLight ? `1px solid ${BRAND.colors.slate}` : "1px solid rgba(255,255,255,0.04)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.4)`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"; }}
      />
      <div>
        <div style={{ fontFamily: BRAND.fonts.sans, fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: BRAND.colors.fog }}>{name}</div>
        <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "11px", color: BRAND.colors.iron }}>{copied ? "Copied" : hex}</div>
      </div>
    </div>
  );
}

// ─── Icon Card ───────────────────────────────────────────────────
function IconCard({ name, icon }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
      padding: "20px 12px", borderRadius: BRAND.radii.md,
      backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
      transition: "border-color 0.3s ease, background-color 0.3s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.colors.amber; e.currentTarget.style.backgroundColor = BRAND.colors.stone; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.colors.stone; e.currentTarget.style.backgroundColor = BRAND.colors.cavern; }}
    >
      <div style={{ width: "28px", height: "28px", color: BRAND.colors.parchment }}>{icon}</div>
      <span style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.05em", textTransform: "uppercase", color: BRAND.colors.iron }}>{name}</span>
    </div>
  );
}

// ─── Animated Pulse Line ─────────────────────────────────────────
function PulseLine() {
  return (
    <svg width="100%" height="40" viewBox="0 0 600 40" preserveAspectRatio="none" style={{ opacity: 0.3 }}>
      <defs>
        <linearGradient id="pulseGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="40%" stopColor={BRAND.colors.amber} />
          <stop offset="60%" stopColor={BRAND.colors.amber} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d="M0 20 L150 20 L170 8 L190 32 L210 12 L230 28 L250 20 L600 20" fill="none" stroke="url(#pulseGrad)" strokeWidth="1.2">
        <animate attributeName="stroke-dashoffset" from="800" to="0" dur="3s" repeatCount="indefinite" />
        <animate attributeName="stroke-dasharray" values="0 800;400 400;800 0" dur="3s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

// ─── Section Header ──────────────────────────────────────────────
function SectionHeader({ number, title, subtitle }) {
  return (
    <FadeIn>
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
          <span style={{ fontFamily: BRAND.fonts.mono, fontSize: "11px", color: BRAND.colors.amber, letterSpacing: "0.08em" }}>{number}</span>
          <h2 style={{ fontFamily: BRAND.fonts.display, fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 400, color: BRAND.colors.cream, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
        </div>
        {subtitle && <p style={{ fontFamily: BRAND.fonts.sans, fontSize: "14px", color: BRAND.colors.iron, margin: 0, marginLeft: "38px", lineHeight: 1.6, maxWidth: "560px" }}>{subtitle}</p>}
      </div>
    </FadeIn>
  );
}

// ─── Animation Demo Cards ────────────────────────────────────────
function AnimationDemo({ title, description, children }) {
  return (
    <div style={{
      padding: "28px", borderRadius: BRAND.radii.md,
      backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
      display: "flex", flexDirection: "column", gap: "16px",
    }}>
      <div>
        <div style={{ fontFamily: BRAND.fonts.sans, fontSize: "13px", fontWeight: 600, color: BRAND.colors.parchment, marginBottom: "4px" }}>{title}</div>
        <div style={{ fontFamily: BRAND.fonts.sans, fontSize: "12px", color: BRAND.colors.iron, lineHeight: 1.5 }}>{description}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Sample Component: Command Bar ───────────────────────────────
function SampleCommandBar() {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      width: "100%", maxWidth: "480px", margin: "0 auto",
      padding: "10px 16px", borderRadius: BRAND.radii.md,
      backgroundColor: focused ? BRAND.colors.stone : BRAND.colors.cavern,
      border: `1px solid ${focused ? BRAND.colors.amber : BRAND.colors.slate}`,
      display: "flex", alignItems: "center", gap: "10px",
      transition: "all 0.3s ease",
      boxShadow: focused ? `0 0 0 3px ${BRAND.colors.amberGlow}, 0 8px 32px rgba(0,0,0,0.3)` : "0 2px 8px rgba(0,0,0,0.2)",
    }}>
      <div style={{ width: "18px", height: "18px", color: focused ? BRAND.colors.amber : BRAND.colors.iron, transition: "color 0.3s ease", flexShrink: 0 }}>{icons.search}</div>
      <input
        placeholder="Search commands, projects, agents…"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, background: "none", border: "none", outline: "none",
          fontFamily: BRAND.fonts.sans, fontSize: "14px", color: BRAND.colors.parchment,
        }}
      />
      <kbd style={{
        fontFamily: BRAND.fonts.mono, fontSize: "10px", color: BRAND.colors.iron,
        padding: "2px 6px", borderRadius: "3px", backgroundColor: BRAND.colors.obsidian,
        border: `1px solid ${BRAND.colors.slate}`,
      }}>⌘K</kbd>
    </div>
  );
}

// ─── Sample Component: Project Card ──────────────────────────────
function SampleProjectCard({ name, status, agents, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const statusColors = { active: BRAND.colors.success, building: BRAND.colors.caution, idle: BRAND.colors.iron };
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "20px", borderRadius: BRAND.radii.md,
          backgroundColor: hovered ? BRAND.colors.stone : BRAND.colors.cavern,
          border: `1px solid ${hovered ? BRAND.colors.slate : BRAND.colors.stone}`,
          transition: "all 0.35s ease",
          cursor: "pointer",
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <div style={{ fontFamily: BRAND.fonts.display, fontSize: "18px", color: BRAND.colors.cream, marginBottom: "2px" }}>{name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: statusColors[status] }} />
              <span style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", color: BRAND.colors.iron }}>{status}</span>
            </div>
          </div>
          <div style={{
            width: "20px", height: "20px", color: BRAND.colors.iron,
            transform: hovered ? "translateX(3px)" : "translateX(0)",
            transition: "transform 0.3s ease, color 0.3s ease",
            ...(hovered && { color: BRAND.colors.amber }),
          }}>{icons.chevron}</div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {agents.map((a, i) => (
            <span key={i} style={{
              fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.04em",
              padding: "3px 8px", borderRadius: BRAND.radii.sm,
              backgroundColor: BRAND.colors.obsidian, color: BRAND.colors.fog,
              border: `1px solid ${BRAND.colors.slate}`,
            }}>{a}</span>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Sample Component: Nav Item ──────────────────────────────────
function NavItem({ icon, label, active }) {
  const [hovered, setHovered] = useState(false);
  const isActive = active || hovered;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "8px 12px", borderRadius: BRAND.radii.sm,
        backgroundColor: isActive ? BRAND.colors.amberSubtle : "transparent",
        cursor: "pointer", transition: "all 0.25s ease",
      }}>
      <div style={{ width: "18px", height: "18px", color: isActive ? BRAND.colors.amber : BRAND.colors.iron, transition: "color 0.25s ease" }}>{icon}</div>
      <span style={{ fontFamily: BRAND.fonts.sans, fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? BRAND.colors.parchment : BRAND.colors.fog, transition: "color 0.25s ease" }}>{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Brand Kit
// ═══════════════════════════════════════════════════════════════════
export default function BatcaveBrandKit() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: BRAND.colors.obsidian, color: BRAND.colors.parchment,
      fontFamily: BRAND.fonts.sans, WebkitFontSmoothing: "antialiased",
    }}>
      {/* ── Google Fonts ── */}
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${BRAND.colors.amber}; color: ${BRAND.colors.obsidian}; }
        input::placeholder { color: ${BRAND.colors.iron}; }
        @keyframes breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes drawLine { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
        @keyframes gentleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
          .flex-responsive { flex-direction: column !important; }
        }
      `}</style>

      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <header style={{
        padding: "clamp(60px, 12vw, 120px) clamp(24px, 6vw, 80px) clamp(40px, 8vw, 80px)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "-20%", right: "-10%", width: "500px", height: "500px",
          borderRadius: "50%", background: `radial-gradient(circle, ${BRAND.colors.amberGlow} 0%, transparent 70%)`,
          filter: "blur(80px)", pointerEvents: "none",
        }} />

        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
            {/* Batcave logomark — a geometric bat silhouette, line-work style */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 8 L8 28 L14 26 L18 32 L22 24 L24 30 L26 24 L30 32 L34 26 L40 28 L24 8Z"
                stroke={BRAND.colors.amber} strokeWidth="1.4" strokeLinejoin="round" fill="none">
                <animate attributeName="stroke-dasharray" from="0 200" to="200 0" dur="2s" fill="freeze" />
              </path>
              <line x1="12" y1="38" x2="36" y2="38" stroke={BRAND.colors.amber} strokeWidth="0.8" opacity="0.4" />
            </svg>
            <div>
              <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.15em", color: BRAND.colors.amber, textTransform: "uppercase" }}>Brand System</div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 style={{
            fontFamily: BRAND.fonts.display, fontWeight: 300,
            fontSize: "clamp(48px, 8vw, 88px)", lineHeight: 0.95,
            color: BRAND.colors.cream, letterSpacing: "-0.02em",
            marginBottom: "24px",
          }}>
            Batcave
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p style={{
            fontFamily: BRAND.fonts.body, fontSize: "clamp(16px, 2vw, 19px)",
            color: BRAND.colors.fog, lineHeight: 1.65, maxWidth: "600px",
            fontWeight: 300,
          }}>
            A unified command surface for project management, personal orchestration,
            and agentic deployments — governed through a single intelligent interface.
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <div style={{ marginTop: "40px" }}>
            <PulseLine />
          </div>
        </FadeIn>
      </header>

      {/* ═══ CONTENT ═══════════════════════════════════════════════ */}
      <main style={{ padding: "0 clamp(24px, 6vw, 80px) clamp(60px, 10vw, 120px)" }}>

        {/* ── 01 COLOR ─────────────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <SectionHeader number="01" title="Color" subtitle="A palette drawn from cave stone and ember light. Dark foundations create depth; amber provides warmth and focus without aggression." />

          <FadeIn delay={0.1}>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontFamily: BRAND.fonts.sans, fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "16px" }}>Foundations</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }} className="grid-responsive">
                <Swatch name="Obsidian" hex="#111115" />
                <Swatch name="Cavern" hex="#1a1a20" />
                <Swatch name="Stone" hex="#252530" />
                <Swatch name="Slate" hex="#3a3a48" />
                <Swatch name="Iron" hex="#5a5a6a" />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontFamily: BRAND.fonts.sans, fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "16px" }}>Surfaces & Text</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }} className="grid-responsive">
                <Swatch name="Pewter" hex="#888898" isLight />
                <Swatch name="Fog" hex="#b0b0bc" isLight />
                <Swatch name="Parchment" hex="#e8e4db" isLight />
                <Swatch name="Cream" hex="#f5f1e8" isLight />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div>
              <div style={{ fontFamily: BRAND.fonts.sans, fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "16px" }}>Accent & Semantic</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }} className="grid-responsive">
                <Swatch name="Amber" hex="#c4973a" />
                <Swatch name="Amber Light" hex="#d4aa50" />
                <Swatch name="Embers" hex="#a3783a" />
                <Swatch name="Success" hex="#5a8a6a" />
                <Swatch name="Danger" hex="#9a4a4a" />
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ── 02 TYPOGRAPHY ────────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <SectionHeader number="02" title="Typography" subtitle="Traditional faces that signal permanence over trend. Cormorant for display, Source Serif for reading, IBM Plex Mono for data." />

          <FadeIn delay={0.1}>
            <div style={{
              padding: "40px", borderRadius: BRAND.radii.lg,
              backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
              marginBottom: "24px",
            }}>
              <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "24px" }}>Display — Cormorant Garamond</div>
              <div style={{ fontFamily: BRAND.fonts.display, color: BRAND.colors.cream }}>
                <div style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 300, lineHeight: 1.1, marginBottom: "12px", letterSpacing: "-0.02em" }}>The cave knows what the manor forgets.</div>
                <div style={{ fontSize: "24px", fontWeight: 400, fontStyle: "italic", color: BRAND.colors.fog }}>Light 300 · Regular 400 · Medium 500 · Semibold 600 · Italic</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{
              padding: "40px", borderRadius: BRAND.radii.lg,
              backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
              marginBottom: "24px",
            }}>
              <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "24px" }}>Body — Source Serif 4</div>
              <div style={{ fontFamily: BRAND.fonts.body, color: BRAND.colors.parchment }}>
                <div style={{ fontSize: "18px", fontWeight: 400, lineHeight: 1.7, marginBottom: "12px", maxWidth: "540px" }}>
                  Every deployment, every agent, every workspace converges here.
                  Not as noise, but as a quiet orchestration — managed through intent, not interruption.
                </div>
                <div style={{ fontSize: "14px", fontWeight: 300, color: BRAND.colors.iron }}>Light 300 · Regular 400 · Semibold 600 · Italic</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="flex-responsive">
              <div style={{
                padding: "32px", borderRadius: BRAND.radii.lg,
                backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
              }}>
                <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "20px" }}>Mono — IBM Plex Mono</div>
                <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "14px", color: BRAND.colors.fog, lineHeight: 1.8 }}>
                  <div>deploy:omote → v2.4.1</div>
                  <div style={{ color: BRAND.colors.success }}>✓ build passed 2.3s</div>
                  <div style={{ color: BRAND.colors.iron }}>agents: 3 active</div>
                </div>
              </div>

              <div style={{
                padding: "32px", borderRadius: BRAND.radii.lg,
                backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
              }}>
                <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "20px" }}>Sans — Source Sans 3</div>
                <div style={{ fontFamily: BRAND.fonts.sans, color: BRAND.colors.fog }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", color: BRAND.colors.parchment }}>UI labels and navigation</div>
                  <div style={{ fontSize: "13px", lineHeight: 1.6 }}>Used for interface chrome, buttons, form labels, metadata, and any functional text that must be scanned quickly.</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ── 03 ICONOGRAPHY ───────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <SectionHeader number="03" title="Iconography" subtitle="Line-work icons at 1.2px stroke weight. Rounded caps and joins. Geometric clarity with organic warmth. Never filled — always drawn." />

          <FadeIn delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }} className="grid-responsive">
              {Object.entries(icons).map(([name, icon]) => (
                <IconCard key={name} name={name} icon={icon} />
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{
              marginTop: "32px", padding: "24px", borderRadius: BRAND.radii.md,
              backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
              display: "flex", gap: "40px", alignItems: "center", flexWrap: "wrap",
            }}>
              <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, flexShrink: 0 }}>Spec</div>
              <div style={{ fontFamily: BRAND.fonts.sans, fontSize: "12px", color: BRAND.colors.fog, display: "flex", gap: "28px", flexWrap: "wrap" }}>
                <span>24×24 viewBox</span>
                <span>1.2px stroke</span>
                <span>round cap / join</span>
                <span>no fill</span>
                <span>2px optical padding</span>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ── 04 ANIMATION ─────────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <SectionHeader number="04" title="Motion" subtitle="Subtle, purposeful movement. Animations suggest life without demanding attention — like candlelight in a stone corridor." />

          <FadeIn delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="flex-responsive">
              <AnimationDemo title="Breathe" description="Status indicators pulse gently to signal liveness.">
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: BRAND.colors.success, animation: "breathe 3s ease-in-out infinite" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: BRAND.colors.caution, animation: "breathe 3s ease-in-out infinite 0.5s" }} />
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: BRAND.colors.amber, animation: "breathe 3s ease-in-out infinite 1s" }} />
                </div>
              </AnimationDemo>

              <AnimationDemo title="Slide In" description="Elements enter from the left with a fade, 0.4s ease-out.">
                <div style={{ display: "flex", gap: "8px" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "48px", height: "6px", borderRadius: "3px",
                      backgroundColor: BRAND.colors.amber, opacity: 1 - i * 0.25,
                      animation: `slideIn 0.6s ease-out ${i * 0.12}s both`,
                    }} />
                  ))}
                </div>
              </AnimationDemo>

              <AnimationDemo title="Gentle Float" description="Ambient elements hover softly, 4s cycle.">
                <div style={{ animation: "gentleFloat 4s ease-in-out infinite" }}>
                  <div style={{ width: "28px", height: "28px", color: BRAND.colors.amber }}>{icons.agent}</div>
                </div>
              </AnimationDemo>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{
              marginTop: "24px", padding: "28px", borderRadius: BRAND.radii.md,
              backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
            }}>
              <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "16px" }}>Easing Principles</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", fontFamily: BRAND.fonts.sans, fontSize: "13px", color: BRAND.colors.fog }} className="flex-responsive">
                <div><span style={{ color: BRAND.colors.parchment, fontWeight: 600 }}>Enter:</span> cubic-bezier(0.22, 1, 0.36, 1) — decelerate in</div>
                <div><span style={{ color: BRAND.colors.parchment, fontWeight: 600 }}>Exit:</span> cubic-bezier(0.55, 0, 1, 0.45) — accelerate out</div>
                <div><span style={{ color: BRAND.colors.parchment, fontWeight: 600 }}>Ambient:</span> ease-in-out, 3–5s cycle, never above 0.5 opacity</div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ── 05 COMPONENTS ────────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <SectionHeader number="05" title="Components" subtitle="Interface primitives that demonstrate the system in action. Warm amber focus states, staggered reveals, and quiet chrome." />

          <FadeIn delay={0.1}>
            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "16px" }}>Command Bar</div>
              <SampleCommandBar />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "16px" }}>Navigation</div>
              <div style={{
                width: "220px", padding: "12px",
                backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
                borderRadius: BRAND.radii.md,
                display: "flex", flexDirection: "column", gap: "2px",
              }}>
                <NavItem icon={icons.command} label="Command" active />
                <NavItem icon={icons.workspace} label="Workspaces" />
                <NavItem icon={icons.blueprint} label="Blueprints" />
                <NavItem icon={icons.deploy} label="Deploys" />
                <NavItem icon={icons.agent} label="Agents" />
                <NavItem icon={icons.signal} label="Signals" />
                <div style={{ height: "1px", backgroundColor: BRAND.colors.stone, margin: "8px 4px" }} />
                <NavItem icon={icons.settings} label="Settings" />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div>
              <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.amber, marginBottom: "16px" }}>Project Cards</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} className="flex-responsive">
                <SampleProjectCard name="Omote" status="active" agents={["claude", "vercel"]} delay={0.1} />
                <SampleProjectCard name="Cerebro" status="building" agents={["claude", "supabase"]} delay={0.2} />
                <SampleProjectCard name="Fox Market" status="idle" agents={["claude"]} delay={0.3} />
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ── 06 VOICE ─────────────────────────────────────────── */}
        <section style={{ marginBottom: "100px" }}>
          <SectionHeader number="06" title="Voice & Tone" subtitle="The interface speaks like a well-organized butler — precise, anticipatory, never verbose." />

          <FadeIn delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="flex-responsive">
              {[
                { label: "Do", color: BRAND.colors.success, items: [
                  '"3 deploys completed this morning."',
                  '"Omote needs your attention."',
                  '"Agent paused — awaiting approval."',
                ] },
                { label: "Don't", color: BRAND.colors.danger, items: [
                  '"Hey! 🎉 Great news — your deploys are done!"',
                  '"Uh oh, looks like something went wrong!"',
                  '"Click here to learn more about this feature."',
                ] },
              ].map(col => (
                <div key={col.label} style={{
                  padding: "28px", borderRadius: BRAND.radii.md,
                  backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
                }}>
                  <div style={{
                    fontFamily: BRAND.fonts.sans, fontSize: "11px", fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase", color: col.color,
                    marginBottom: "16px",
                  }}>{col.label}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {col.items.map((item, i) => (
                      <div key={i} style={{
                        fontFamily: BRAND.fonts.body, fontSize: "14px",
                        color: BRAND.colors.fog, fontStyle: "italic", lineHeight: 1.5,
                      }}>{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ── 07 LAYOUT PHILOSOPHY ─────────────────────────────── */}
        <section style={{ marginBottom: "80px" }}>
          <SectionHeader number="07" title="Principles" />

          <FadeIn delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="flex-responsive">
              {[
                { title: "Depth, not decoration", body: "Every visual layer serves hierarchy. Shadows imply space; borders define territory. Nothing ornamental." },
                { title: "Warmth in the dark", body: "Amber is warmth — used for focus, status, and human attention. It never overwhelms; it guides." },
                { title: "Quiet until needed", body: "Motion, color, and density emerge with context. The resting state is calm. The active state is alive." },
              ].map((p, i) => (
                <div key={i} style={{
                  padding: "28px", borderRadius: BRAND.radii.md,
                  backgroundColor: BRAND.colors.cavern, border: `1px solid ${BRAND.colors.stone}`,
                }}>
                  <div style={{ fontFamily: BRAND.fonts.display, fontSize: "20px", color: BRAND.colors.cream, marginBottom: "10px" }}>{p.title}</div>
                  <div style={{ fontFamily: BRAND.fonts.sans, fontSize: "13px", color: BRAND.colors.iron, lineHeight: 1.6 }}>{p.body}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer style={{
          padding: "40px 0", borderTop: `1px solid ${BRAND.colors.stone}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px",
        }}>
          <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.colors.iron }}>
            Batcave Design System · v1.0
          </div>
          <div style={{ fontFamily: BRAND.fonts.mono, fontSize: "10px", color: BRAND.colors.slate }}>
            Confidential — Internal Use
          </div>
        </footer>
      </main>
    </div>
  );
}
