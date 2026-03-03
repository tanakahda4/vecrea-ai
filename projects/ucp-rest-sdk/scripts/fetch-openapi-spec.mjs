#!/usr/bin/env node
/**
 * Fetches UCP OpenAPI spec from GitHub, adds fulfillment schema, and extends checkout.
 * Output: openapi-spec/ (mirrors UCP repo structure for $ref resolution).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SPEC_DIR = join(ROOT, 'openapi-spec');
const BRANCH = 'release/2026-01-23';
const REPO = 'https://github.com/Universal-Commerce-Protocol/ucp.git';

const main = () => {
  console.log('Fetching UCP OpenAPI spec...');
  rmSync(SPEC_DIR, { recursive: true, force: true });
  mkdirSync(SPEC_DIR, { recursive: true });

  execSync(`git init ${SPEC_DIR}`, { stdio: 'inherit' });
  execSync(`git remote add origin ${REPO}`, { cwd: SPEC_DIR, stdio: 'inherit' });
  execSync('git config core.sparseCheckout true', { cwd: SPEC_DIR, stdio: 'inherit' });
  mkdirSync(join(SPEC_DIR, '.git', 'info'), { recursive: true });
  writeFileSync(join(SPEC_DIR, '.git', 'info', 'sparse-checkout'), 'source\n');
  execSync(`git fetch --depth 1 origin ${BRANCH}`, { cwd: SPEC_DIR, stdio: 'inherit' });
  execSync('git checkout FETCH_HEAD', { cwd: SPEC_DIR, stdio: 'inherit' });

  const openapiPath = join(SPEC_DIR, 'source', 'services', 'shopping', 'openapi.json');
  const spec = JSON.parse(readFileSync(openapiPath, 'utf-8'));

  spec.components.schemas.fulfillment = {
    $ref: 'https://ucp.dev/2026-01-23/schemas/shopping/fulfillment.json',
  };
  spec.components.schemas.discount = {
    $ref: 'https://ucp.dev/2026-01-23/schemas/shopping/discount.json',
  };
  // Keep checkout as base only. Extensions (fulfillment, discount) are composed
  // via zRoot.and(z.object({...})) in post-process based on capabilities.

  writeFileSync(openapiPath, JSON.stringify(spec, null, 2));
  console.log('OpenAPI spec ready at', openapiPath);
};

main();
