import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requiredPages, tokenizeHtml } from '../scripts/security-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://votebettertogether.com';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const parsed = new Map(requiredPages.map(file => [file, tokenizeHtml(read(file)).filter(t => !t.closing)]));
const attrs = (file, tag) => parsed.get(file).filter(t => t.name === tag).map(t => t.attributes);
const route = pathname => pathname.endsWith('/') ? pathname.slice(1) + 'index.html' : pathname.slice(1);

test('every internal navigation and asset URL resolves, including fragments and legacy aliases', () => {
  for (const [file, tokens] of parsed) {
    for (const token of tokens) {
      for (const key of ['href', 'src']) {
        if (!token.attributes.has(key)) continue;
        const url = new URL(token.attributes.get(key), `${site}/${file}`);
        if (url.origin !== site) continue;
        const target = route(url.pathname);
        assert.ok(fs.existsSync(path.join(root, target)), `${file}: missing ${target}`);
        if (url.hash) assert.ok(parsed.get(target)?.some(t => t.attributes.get('id') === decodeURIComponent(url.hash.slice(1))), `${file}: missing fragment ${url}`);
      }
    }
  }
  for (const match of read('assets/site.css').matchAll(/url\(([^)]+)\)/g)) {
    assert.ok(fs.existsSync(path.join(root, 'assets', match[1])), `missing CSS asset ${match[1]}`);
  }
});

test('public pages have unique headings, accurate canonical URLs and social previews', () => {
  const titles = new Set();
  for (const file of requiredPages.filter(f => f === 'index.html' || f.endsWith('/index.html') || f === '404.html')) {
    const tokens = parsed.get(file);
    assert.equal(tokens.filter(t => t.name === 'h1').length, 1, `${file}: one h1`);
    const ids = tokens.map(t => t.attributes.get('id')).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length, `${file}: unique IDs`);
    const title = tokens.find(t => t.name === 'title').text;
    assert.ok(!titles.has(title), `${file}: duplicate title`); titles.add(title);
    assert.equal(attrs(file, 'link').find(a => a.get('rel') === 'canonical').get('href'), `${site}/${file.replace(/index\.html$/, '')}`);
    const metas = attrs(file, 'meta');
    for (const name of ['description', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) assert.ok(metas.some(a => a.get('name') === name && a.get('content')), `${file}: ${name}`);
    for (const image of attrs(file, 'img')) assert.ok(image.has('alt') && image.has('width') && image.has('height'), `${file}: accessible image with reserved dimensions`);
  }
});

test('sitemap indexes public documents and excludes auth, errors and duplicate aliases', () => {
  const urls = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual(urls, ['', 'privacy/', 'terms/', 'support/', 'delete-account/', 'child-safety/', 'kvkk/', 'acik-riza/'].map(p => `${site}/${p}`));
  for (const file of ['auth/confirm/index.html', '404.html']) assert.ok(attrs(file, 'meta').some(a => a.get('name') === 'robots' && a.get('content').includes('noindex')));
  assert.ok(read('robots.txt').includes(`Sitemap: ${site}/sitemap.xml`));
  // AdMob's authorized seller: exactly the owner's publisher account, DIRECT, Google's certification id.
  assert.equal(read('app-ads.txt'), 'google.com, pub-8547648770010342, DIRECT, f08c47fec0942fa0\n');
});

test('footer identifies the operator and exposes required support and identity destinations', () => {
  for (const file of requiredPages.filter(f => f === 'index.html' || f.endsWith('/index.html') || f === '404.html')) {
    const footer = read(file).split('<footer class="foot">')[1];
    assert.ok(footer.includes('Made in Toronto by <span itemprop="legalName">VOTEBT</span>'), file);
    for (const url of ['/#about', '/privacy/', '/terms/', '/support/', '/delete-account/', '/child-safety/', '/kvkk/', 'mailto:support@votebettertogether.com', 'https://www.linkedin.com/in/ahmetfceren', 'https://www.linkedin.com/company/vote-better-together/']) assert.ok(footer.includes(`href="${url}"`), `${file}: footer ${url}`);
  }
  // The operator is named in every footer (the owner, 26 Oct 2026: no
  // founder block on the homepage, "Made in Toronto by VOTEBT" is enough).
  const home = read('index.html');
  assert.ok(home.includes('itemtype="https://schema.org/Organization"'));
  assert.ok(home.includes('itemprop="legalName">VOTEBT'));
  assert.ok(home.includes('itemprop="foundingDate">2026'));
});

test('all published pages use the current App Store artwork and link to the iOS listing', () => {
  const icon = '/assets/img/app-store-icon.png';
  assert.ok(fs.existsSync(path.join(root, icon.slice(1))), 'official iOS icon file is present');
  for (const file of requiredPages.filter(f => f === 'index.html' || f.endsWith('/index.html') || f === '404.html')) {
    const html = read(file);
    assert.ok(html.includes('href="' + icon + '" type="image/png"'), file + ': current favicon');
    assert.ok(html.includes('src="' + icon + '"'), file + ': current brand');
    assert.ok(!html.includes('/assets/img/og.jpg'), file + ': old social artwork no longer referenced');
  }
  const home = read('index.html');
  assert.ok(home.includes('src="' + icon + '" width="112"'), 'download section uses current iOS icon');
  assert.ok(home.includes('href="https://apps.apple.com/app/id6817733699"'), 'official App Store link');
  assert.ok(!home.includes('The Vote app icon: two overlapping circles'), 'obsolete icon description removed');
  const manifest = JSON.parse(read('site.webmanifest'));
  assert.ok(manifest.icons.every(iconEntry => iconEntry.src === icon), 'manifest icon stays current');
});
