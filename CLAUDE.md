# CLAUDE.md — Batcave Operating Manual

> The Batcave is a unified monorepo and central nervous system for all projects, POCs, and ideas. It is managed exclusively via mobile/messaging through Claude conversations.

## Architecture

```
batcave/
├── CLAUDE.md                     # This file — agent operating manual
├── batcave.manifest.json         # Central project registry (source of truth)
├── packages/
│   ├── console/                  # Batcave dashboard UI
│   ├── [project-slug]/           # Each project as a workspace package
│   └── ...
├── shared/
│   ├── design-tokens/            # Instrument Serif, Source Sans 3, IBM Plex Mono, navy palette
│   └── utils/                    # Shared utilities
├── scripts/
│   ├── scaffold.cjs              # Pipeline scaffold (STATE/CHANGELOG/CLAUDE.md, smoke tests, CI)
│   ├── add-project.cjs           # Register new project in manifest
│   └── status.cjs                # Report all project statuses
├── .github/workflows/ci.yml      # Per-package CI
├── pnpm-workspace.yaml
└── vercel.json
```

## Manifest

`batcave.manifest.json` is the single source of truth. Every project has an entry:

```json
{
  "slug": "fox-market",
  "name": "Fox Market",
  "status": "active | incubating | archived | migrating",
  "type": "app | poc | extension | library",
  "stack": ["react", "vite", "claude-api"],
  "deploy": { "platform": "vercel", "url": "https://..." },
  "repo_origin": "anthonyschroeck-wq/fox-market",
  "migrated": false,
  "notes": "AI-powered trading simulator with Monte Carlo forecasting"
}
```

## Message Commands

Tony manages the Batcave via conversation. When he sends a message, Claude should interpret intent and take action against the repo via GitHub API. Recognized patterns:

| Intent | Example Message | Action |
|--------|----------------|--------|
| **Status** | "Batcave status" | Read manifest, report all project statuses |
| **Add project** | "Add [name] to the Batcave" | Create workspace package, update manifest |
| **Migrate repo** | "Pull fox-market into the Batcave" | Clone origin, restructure as package, update manifest |
| **Archive** | "Archive veritas" | Set status to archived, disable CI |
| **Deploy** | "Deploy [project]" | Trigger Vercel deploy for specific package |
| **New idea** | "New POC: [description]" | Scaffold new package with incubating status |
| **Roadmap** | "What's cooking?" | Show incubating + active projects with notes |
| **Update** | "Update [project] notes: ..." | Patch manifest entry |

## Design Tokens (Shared)

All projects inherit from `shared/design-tokens/`:

- **Fonts:** Instrument Serif (display), Source Sans 3 (body), IBM Plex Mono (code)
- **Palette:** Navy (#0a1628), White (#ffffff), Black (#000000), Cream (#f5f0e8)
- **Icons:** SVG line-work, no emoji
- **Stroke:** 1.4px primary, 0.5px texture offset at 25-30% opacity, round caps/joins

## Conventions

- **Branch workflow:** `dev` → PR → `main`
- **Commits:** Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Deploys:** Vercel per-package (monorepo config in `vercel.json`)
- **GitHub org:** `anthonyschroeck-wq`
- **No emoji** in code, commits, or docs
- **Instrument Serif** for any display text in UIs

## CI/CD

GitHub Actions runs per-package:
- On push to `dev`: lint + smoke tests for changed packages only
- On PR to `main`: full test suite + Vercel preview deploy
- On merge to `main`: production deploy

Package detection uses `pnpm --filter` with changeset detection.

## Migration Protocol

When pulling an existing repo into the Batcave:

1. Add manifest entry with `status: "migrating"`
2. Clone origin repo content into `packages/[slug]/`
3. Restructure: add local `package.json`, wire shared deps
4. Update imports to use `@batcave/design-tokens` and `@batcave/utils` where applicable
5. Configure Vercel for the new package path
6. Smoke test
7. Set `migrated: true`, status to `active`
8. Add redirect or deprecation notice to origin repo

## State Tracking

Each package can optionally maintain its own `STATE.md` for granular tracking. The manifest provides the system-level view.
