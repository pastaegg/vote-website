import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = fs.readFileSync(new URL('../scripts/stage-site.mjs', import.meta.url), 'utf8');
// This fixture describes the complete public website independently of the
// copy implementation. Forbidden files exercise the publication boundary.
const publicFiles = [
  'index.html', '404.html', 'auth/confirm/index.html',
  ...['privacy', 'terms', 'support', 'delete-account'].flatMap(p => [`${p}.html`, `${p}/index.html`]),
  '.nojekyll', 'CNAME', 'robots.txt', 'sitemap.xml', 'site.webmanifest',
  'security.txt', '.well-known/security.txt', 'apple-app-site-association',
  '.well-known/apple-app-site-association', 'apple-touch-icon.png',
  'favicon-32.png', 'favicon.ico', 'assets/site.css', 'assets/fonts/OFL.txt',
  'assets/fonts/fraunces-italic-latin.woff2', 'assets/fonts/fraunces-latin-ext.woff2',
  'assets/fonts/fraunces-latin.woff2', 'assets/fonts/inter-latin-ext.woff2',
  'assets/fonts/inter-latin.woff2', 'assets/email/vote-icon-144.png',
  'assets/img/icon-192.png', 'assets/img/icon-512.png', 'assets/img/og.jpg'
];
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vote-artifact-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file, content = 'public fixture') => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  };
  write('scripts/stage-site.mjs', script);
  for (const file of new Set(publicFiles)) write(file);
  return { root, write, run: () => spawnSync(process.execPath, [path.join(root, 'scripts/stage-site.mjs')], { encoding: 'utf8' }) };
}
function list(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? list(path.join(dir, e.name), prefix + e.name + '/') : [prefix + e.name]).sort();
}
test('Pages artifact contains public pages/assets and excludes source and secrets', t => {
  const f = fixture(t);
  for (const file of ['.env', 'assets/private.key', 'assets/config.json', 'src/home.html', 'tests/private.html', '.git/config', 'unexpected.html']) f.write(file, 'must not publish');
  f.write('_site/old-private.txt', 'stale artifact must be removed');
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  const published = list(path.join(f.root, '_site'));
  assert.deepEqual(published, [...new Set(publicFiles)].sort());
  assert.ok(published.includes('auth/confirm/index.html'));
  assert.ok(published.includes('assets/email/vote-icon-144.png'));
});
test('a symlinked public file cannot copy a private file into the artifact', t => {
  const f = fixture(t);
  f.write('private-config', 'sensitive fixture');
  fs.unlinkSync(path.join(f.root, 'favicon.ico'));
  fs.symlinkSync(path.join(f.root, 'private-config'), path.join(f.root, 'favicon.ico'));
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /symlinks cannot be published/);
  assert.equal(fs.existsSync(path.join(f.root, '_site')), false);
});
test('symlinked asset directories cannot escape the public-file boundary', t => {
  const f = fixture(t);
  fs.renameSync(path.join(f.root, 'assets'), path.join(f.root, 'outside-assets'));
  fs.symlinkSync(path.join(f.root, 'outside-assets'), path.join(f.root, 'assets'));
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /symlinks cannot be published/);
});
test('a missing required public file prevents upload of a partial site', t => {
  const f = fixture(t);
  fs.unlinkSync(path.join(f.root, 'assets/email/vote-icon-144.png'));
  const result = f.run();
  assert.notEqual(result.status, 0);
  assert.equal(fs.existsSync(path.join(f.root, '_site')), false);
});
