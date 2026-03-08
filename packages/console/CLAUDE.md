# CLAUDE.md — Batcave Console

> The dashboard UI for the Batcave. Visual counterpart to the messaging control plane.

## Overview

Single-page React app that provides a visual interface for managing all Batcave projects, agents, tasks, fitness tracking, and calendar/email integrations. Currently in Phase 1 (static manifest). Phase 2 will wire to GitHub API for live data.

## Local Dev

```bash
cd packages/console
pnpm install
pnpm dev
```

Runs on http://localhost:5173

## Architecture

- `src/App.jsx` — Main app component with sidebar nav and all module views
- `index.html` — Entry point with font preloads
- Static manifest data is embedded in App.jsx (Phase 1)

## Phases

1. **Static UI** (current) — Manifest hardcoded, all modules visible, Projects functional, others placeholder
2. **Live data** — Fetch manifest from GitHub API at runtime, show recent commits, deploy status
3. **Action layer** — Write back to manifest via GitHub API, trigger deploys from UI

## Modules

| Module | Status | Notes |
|--------|--------|-------|
| Projects | Functional | Reads manifest, expandable rows, stats |
| Agents | Shell | Placeholder cards for scheduled pushes, watchers, CI |
| Tasks | Shell | Placeholder cards for capture, focus, backlog, review |
| Fitness | Shell | Placeholder cards for workout log, nutrition, recovery, trends |
| Calendar | Shell | Placeholder cards for agenda, email, week view, morning brief |
