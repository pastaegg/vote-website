#!/usr/bin/env node
// Dependency-free build gate for generated site inputs; not a browser audit.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSecurityPage, discoverPages, requiredPages, excludedDirectories } from './security-policy.mjs';

const root = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const pages = discoverPages(root);
for (const file of requiredPages) assert.ok(pages.includes(file), `missing required entry point: ${file}`);
const css = fs.readFileSync(path.join(root, 'assets/site.css'));
for (const file of pages) checkSecurityPage(fs.readFileSync(path.join(root, file), 'utf8'), file, css);
const auth = fs.readFileSync(path.join(root, 'src/email-link.js'), 'utf8');
assert.ok(!/innerHTML|outerHTML|document\.write|localStorage|sessionStorage|document\.cookie|console\./.test(auth), 'no dangerous sinks, stored sessions or credential logging');
assert.ok(!/sb_secret_|service_role|PRIVATE KEY/.test(auth), 'public auth key only');
console.log(`Security policies, script/CSS hashes and credential handling verified for all ${pages.length} site HTML files.`);
console.log(`Source/tool/build directories excluded: ${[...excludedDirectories].join(', ')}. A branch-based Pages deployment can still publish source files; this check does not certify those files as protected pages.`);
