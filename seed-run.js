#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const stage = process.argv[2] || 'dev';

// find outputs.json in the project root
const outputsPath = path.resolve(process.cwd(), '.sst', 'outputs.json');
if (!fs.existsSync(outputsPath)) {
  console.error(
    `Missing ${outputsPath}. Run "pnpm sst deploy --stage ${stage}" once to generate it.`,
  );
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));
const out = raw[stage] ?? raw;

const env = {
  ...process.env,
  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-1',
  AWS_PROFILE: process.env.AWS_PROFILE || 'pocket-somme',
  WINES_TABLE: out.winesTable,
  RETAILERS_TABLE: out.retailersTable,
  LISTINGS_TABLE: out.listingsTable,
};

if (!env.WINES_TABLE || !env.RETAILERS_TABLE || !env.LISTINGS_TABLE) {
  console.error(`Missing table outputs for stage "${stage}". Got:`, out);
  process.exit(1);
}

const jobsDir = path.resolve(process.cwd(), 'services', 'jobs');

// Use pnpm exec so tsx resolves from workspace root devDeps
execSync('pnpm exec tsx src/seed.ts', {
  stdio: 'inherit',
  cwd: jobsDir, // << run inside services/jobs
  env,
});
