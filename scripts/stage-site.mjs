#!/usr/bin/env node
// Stage only intended public files. Source, tests, workflows and accidental
// credential/config files must never enter the Pages artifact.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, '_site');
const files = [
  'index.html', '404.html', 'auth/confirm/index.html',
  ...['privacy', 'terms', 'support', 'delete-account'].flatMap(p => [`${p}.html`, `${p}/index.html`]),
  '.nojekyll', 'CNAME', 'robots.txt', 'sitemap.xml', 'site.webmanifest',
  'security.txt', '.well-known/security.txt', 'apple-touch-icon.png',
  'favicon-32.png', 'favicon.ico', 'assets/site.css', 'assets/fonts/OFL.txt',
  'assets/fonts/fraunces-italic-latin.woff2', 'assets/fonts/fraunces-latin-ext.woff2',
  'assets/fonts/fraunces-latin.woff2', 'assets/fonts/inter-latin-ext.woff2',
  'assets/fonts/inter-latin.woff2', 'assets/email/vote-icon-144.png',
  'assets/img/icon-192.png', 'assets/img/icon-512.png', 'assets/img/og.jpg'
];

// Check every source and parent before copying: following a symlink could
// accidentally package a private file outside the repository.
for (const file of files) {
  const parts = file.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const entry = path.join(root, ...parts.slice(0, i));
    const stat = fs.lstatSync(entry);
    assert.ok(!stat.isSymbolicLink(), `${file}: symlinks cannot be published`);
    assert.ok(i === parts.length ? stat.isFile() : stat.isDirectory(), `${file}: invalid file type`);
  }
}
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const file of files) {
  const target = path.join(out, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}
console.log(`Staged ${files.length} public files in _site/.`);
