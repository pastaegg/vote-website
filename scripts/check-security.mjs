#!/usr/bin/env node
// Dependency-free build gate. Browser enforcement is tested separately.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', '404.html', 'auth/confirm/index.html', ...['privacy', 'terms', 'support', 'delete-account'].flatMap(p => [`${p}.html`, `${p}/index.html`])];
const hash = value => crypto.createHash('sha256').update(value).digest('base64');
const decode = text => text.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
for (const file of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const metas = [...html.matchAll(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/g)];
  assert.equal(metas.length, 1, `${file}: exactly one CSP`);
  const csp = decode(metas[0][1]);
  const directives = new Map(csp.split(';').map(d => d.trim().split(/\s+/)).map(([name, ...values]) => [name, values.join(' ')]));
  for (const name of ['default-src', 'script-src-attr', 'style-src-attr', 'object-src', 'frame-src', 'worker-src', 'base-uri', 'form-action']) {
    assert.equal(directives.get(name), "'none'", `${file}: ${name}`);
  }
  for (const name of ['style-src', 'font-src', 'img-src', 'manifest-src']) assert.equal(directives.get(name), "'self'", `${file}: ${name}`);
  assert.ok(directives.has('upgrade-insecure-requests'), `${file}: resource upgrades`);
  assert.ok(!/unsafe-inline|unsafe-eval|\*/.test(csp), `${file}: no CSP escape hatches`);
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
  assert.ok(metas[0].index < html.search(/<(?:link|script)\b/), `${file}: CSP precedes resources`);
  assert.ok(!/\s(?:style|on[a-z]+)\s*=|<(?:base|iframe|object|embed|form)\b/i.test(html), `${file}: no inline styles, handlers, embedding or forms`);
  assert.ok(!/\b(?:href|src|action)\s*=\s*["'](?:javascript:|data:|http:|\/\/)/i.test(html), `${file}: safe URL schemes`);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (file === 'auth/confirm/index.html') {
    assert.equal(scripts.length, 1);
    assert.equal(directives.get('script-src'), `'sha256-${hash(scripts[0][1])}'`);
    assert.equal(directives.get('connect-src'), 'https://usuyyubmjwayrliadrax.supabase.co/auth/v1/verify https://usuyyubmjwayrliadrax.supabase.co/auth/v1/logout');
    assert.ok(scripts[0].index < html.indexOf('<link'), 'credentials cleared before resources');
    assert.match(html, /data-vote-email-link/);
    assert.match(html, /noindex, nofollow, noarchive/);
  } else {
    assert.equal(scripts.length, 0);
    assert.equal(directives.get('script-src'), "'none'");
    assert.equal(directives.get('connect-src'), "'none'");
  }
  if (html.includes('/assets/site.css')) assert.match(html, new RegExp(`integrity="sha256-${hash(fs.readFileSync(path.join(root, 'assets/site.css'))).replace(/[+]/g, '\\+')}"`));
}
const auth = fs.readFileSync(path.join(root, 'src/email-link.js'), 'utf8');
assert.ok(!/innerHTML|outerHTML|document\.write|localStorage|sessionStorage|document\.cookie|console\./.test(auth), 'no dangerous sinks, stored sessions or credential logging');
assert.ok(!/sb_secret_|service_role|PRIVATE KEY/.test(auth), 'public auth key only');
console.log(`Security policies, script/CSS hashes and credential handling verified for ${pages.length} pages.`);
