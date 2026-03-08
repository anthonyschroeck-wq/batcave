#!/usr/bin/env node

/**
 * add-project.cjs — Register a new project in the Batcave manifest
 * 
 * Usage: node scripts/add-project.cjs <slug> <name> <type> [notes]
 * Example: node scripts/add-project.cjs my-poc "My POC" poc "Exploring a new idea"
 */

const fs = require('fs');
const path = require('path');

const [,, slug, name, type, notes] = process.argv;

if (!slug || !name || !type) {
  console.error('Usage: node add-project.cjs <slug> <name> <type> [notes]');
  console.error('Types: app | poc | extension | library');
  process.exit(1);
}

const manifestPath = path.join(__dirname, '..', 'batcave.manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Check for duplicates
if (manifest.projects.some(p => p.slug === slug)) {
  console.error(`Project "${slug}" already exists in manifest.`);
  process.exit(1);
}

const entry = {
  slug,
  name,
  status: 'incubating',
  type,
  stack: ['react', 'vite'],
  deploy: { platform: 'vercel', url: null },
  repo_origin: null,
  migrated: false,
  notes: notes || ''
};

manifest.projects.push(entry);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// Create package directory
const pkgDir = path.join(__dirname, '..', 'packages', slug);
if (!fs.existsSync(pkgDir)) {
  fs.mkdirSync(pkgDir, { recursive: true });
}

// Create package.json
const pkgJson = {
  name: `@batcave/${slug}`,
  version: '0.1.0',
  private: true,
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview'
  }
};
fs.writeFileSync(
  path.join(pkgDir, 'package.json'),
  JSON.stringify(pkgJson, null, 2) + '\n'
);

console.log(`Added "${name}" (${slug}) to manifest as ${type} [incubating]`);
console.log(`Created packages/${slug}/package.json`);
console.log(`\nNext: run "node scripts/scaffold.cjs ${slug}" to generate pipeline files`);
