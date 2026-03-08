#!/usr/bin/env node

/**
 * status.cjs — Report all Batcave project statuses
 * 
 * Usage: node scripts/status.cjs [--filter active|incubating|archived|migrating]
 */

const fs = require('fs');
const path = require('path');

const filter = process.argv.includes('--filter')
  ? process.argv[process.argv.indexOf('--filter') + 1]
  : null;

const manifestPath = path.join(__dirname, '..', 'batcave.manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

let projects = manifest.projects;
if (filter) {
  projects = projects.filter(p => p.status === filter);
}

const statusIcons = {
  active: '[ACTIVE]',
  incubating: '[INCUB]',
  archived: '[ARCHV]',
  migrating: '[MIGRT]'
};

console.log('');
console.log('BATCAVE STATUS REPORT');
console.log('='.repeat(60));
console.log(`Total projects: ${manifest.projects.length}`);
console.log(`Active: ${manifest.projects.filter(p => p.status === 'active').length}`);
console.log(`Incubating: ${manifest.projects.filter(p => p.status === 'incubating').length}`);
console.log(`Archived: ${manifest.projects.filter(p => p.status === 'archived').length}`);
console.log('-'.repeat(60));

projects.forEach(p => {
  const icon = statusIcons[p.status] || '[????]';
  const migrated = p.migrated ? 'in-repo' : 'external';
  console.log(`${icon} ${p.name} (${p.slug})`);
  console.log(`       Type: ${p.type} | Location: ${migrated}`);
  if (p.deploy?.url) console.log(`       URL: ${p.deploy.url}`);
  if (p.notes) console.log(`       ${p.notes}`);
  console.log('');
});
