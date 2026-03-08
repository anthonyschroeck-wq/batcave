#!/usr/bin/env node

/**
 * scaffold.cjs — Batcave Pipeline Scaffold
 * 
 * Generates: STATE.md, CHANGELOG.md, CLAUDE.md (per-package),
 * smoke tests, deploy scripts, and CI workflow.
 * 
 * Usage: node scripts/scaffold.cjs [package-slug]
 * If no slug provided, scaffolds the root.
 */

const fs = require('fs');
const path = require('path');

const slug = process.argv[2];
const targetDir = slug
  ? path.join(__dirname, '..', 'packages', slug)
  : path.join(__dirname, '..');

if (slug && !fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created package directory: packages/${slug}`);
}

// STATE.md
const stateContent = `# STATE.md — ${slug || 'Batcave Root'}

## Current Phase
> Scaffolded — awaiting first iteration

## Active Work
- [ ] Initial setup

## Blocked
(none)

## Decisions Log
| Date | Decision | Context |
|------|----------|---------|
| ${new Date().toISOString().split('T')[0]} | Package scaffolded | Initial creation via scaffold.cjs |
`;

// CHANGELOG.md
const changelogContent = `# CHANGELOG — ${slug || 'Batcave Root'}

## [Unreleased]

### Added
- Initial scaffold via scaffold.cjs
`;

// Per-package CLAUDE.md
const packageClaudeContent = slug ? `# CLAUDE.md — ${slug}

> Package-level operating manual. See root CLAUDE.md for system-level docs.

## Overview
(describe this package)

## Local Dev
\`\`\`bash
cd packages/${slug}
pnpm install
pnpm dev
\`\`\`

## Key Files
(list important files and their purpose)

## Notes
(anything Claude should know when working on this package)
` : null;

// Smoke test
const smokeTestContent = `/**
 * Smoke test — ${slug || 'root'}
 * Validates that the package builds without errors.
 */

const { execSync } = require('child_process');
const path = require('path');

const pkgDir = path.resolve(__dirname, '..');

try {
  execSync('pnpm build', { cwd: pkgDir, stdio: 'pipe' });
  console.log('PASS: Build completed successfully');
  process.exit(0);
} catch (err) {
  console.error('FAIL: Build failed');
  console.error(err.stderr?.toString() || err.message);
  process.exit(1);
}
`;

// Deploy script
const deployContent = `#!/usr/bin/env node

/**
 * deploy.cjs — Trigger Vercel deploy for ${slug || 'root'}
 */

const { execSync } = require('child_process');

const target = '${slug || '.'}';
console.log(\`Deploying \${target} to Vercel...\`);

try {
  execSync(\`vercel --prod\`, { stdio: 'inherit' });
  console.log('Deploy complete.');
} catch (err) {
  console.error('Deploy failed:', err.message);
  process.exit(1);
}
`;

// Write files
const files = [
  ['STATE.md', stateContent],
  ['CHANGELOG.md', changelogContent],
];

if (packageClaudeContent) {
  files.push(['CLAUDE.md', packageClaudeContent]);
}

// Create test and scripts dirs
const testDir = path.join(targetDir, '__tests__');
const scriptsDir = slug
  ? path.join(targetDir, 'scripts')
  : path.join(targetDir, 'scripts');

if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

files.push([path.join('__tests__', 'smoke.test.cjs'), smokeTestContent]);

if (slug) {
  if (!fs.existsSync(scriptsDir)) fs.mkdirSync(scriptsDir, { recursive: true });
  files.push([path.join('scripts', 'deploy.cjs'), deployContent]);
}

files.forEach(([filePath, content]) => {
  const fullPath = path.join(targetDir, filePath);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content);
    console.log(`  + ${filePath}`);
  } else {
    console.log(`  ~ ${filePath} (exists, skipped)`);
  }
});

// CI workflow (root only)
if (!slug) {
  const ciDir = path.join(targetDir, '.github', 'workflows');
  if (!fs.existsSync(ciDir)) fs.mkdirSync(ciDir, { recursive: true });

  const ciContent = `name: Batcave CI

on:
  push:
    branches: [dev]
  pull_request:
    branches: [main]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      packages: \${{ steps.filter.outputs.changes }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            console: 'packages/console/**'
            fox-market: 'packages/fox-market/**'
            run-recipes: 'packages/run-recipes/**'
            omote: 'packages/omote/**'
            veritas: 'packages/veritas/**'
            shared: 'shared/**'

  build-and-test:
    needs: detect-changes
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: \${{ fromJson(needs.detect-changes.outputs.packages) }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter \${{ matrix.package }} build
      - run: pnpm --filter \${{ matrix.package }} test --if-present
`;

  const ciPath = path.join(ciDir, 'ci.yml');
  if (!fs.existsSync(ciPath)) {
    fs.writeFileSync(ciPath, ciContent);
    console.log('  + .github/workflows/ci.yml');
  }
}

console.log('\\nScaffold complete.');
