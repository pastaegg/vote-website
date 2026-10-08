#!/usr/bin/env node
/* Builds votebettertogether.com: static pages, one hash-pinned auth script,
   no third-party assets or trackers.

     node scripts/build.mjs                         rebuild from src/
     node scripts/build.mjs ../vote-bettertogether-rn
       first copies the app's canonical legal text
       (www/app/i18n/legal/en.js) into src/legal-en.js, then rebuilds

   The Privacy Policy, Terms and Support pages use the same English legal text
   the app shows, so the website and the app never say different things.
   Whenever that file changes in the app, run the second form and commit.
   Only the website sections in WEB below are written here (a summary,
   this website, contact). */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appRepo = process.argv[2];
if (appRepo) {
  const src = path.resolve(appRepo, 'www/app/i18n/legal/en.js');
  fs.copyFileSync(src, path.join(root, 'src/legal-en.js'));
  console.log(`Copied legal text from ${src}`);
}
const legal = (await import(pathToFileURL(path.join(root, 'src/legal-en.js')).href + `?t=${Date.now()}`)).default;

const SITE = 'https://votebettertogether.com';
const NAME = 'Vote: Better Together';
const EMAIL = 'support@votebettertogether.com';
const YEAR = 2026;
/* The values the app's legal text leaves open ({controllerName} …), the same
   as the app's build (mobile/eas.json in the app repo); an environment
   variable overrides one. */
const VALUES = {
  controllerName: process.env.LEGAL_CONTROLLER_NAME || 'VOTEBT',
  controllerAddress: process.env.LEGAL_CONTROLLER_ADDRESS || 'Toronto, Ontario, Canada',
  contact: process.env.SUPPORT_CONTACT || EMAIL,
  hostingRegion: process.env.LEGAL_HOSTING_REGION || 'Canada (Central)'
};
const fill = t => String(t).replace(/\{(controllerName|controllerAddress|contact|hostingRegion)\}/g, (_, k) => VALUES[k]);
/* A section's text: blank lines part paragraphs, single line breaks stay. */
const toHtml = t => fill(t).split(/\n{2,}/).map(par => `<p>${linkEmail(esc(par)).replaceAll('\n', '<br>')}</p>`).join('');
const rowsOf = doc => Object.values(doc.sections).map(([h, t]) => [fill(h), toHtml(t)]);

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[‘’“”"']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const linkEmail = s => s.replaceAll(EMAIL, `<a href="mailto:${EMAIL}">${EMAIL}</a>`);
const read = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');

const MARK = `<svg viewBox="0 0 48 32" aria-hidden="true"><circle cx="17" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="31" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;

const digest = value => crypto.createHash('sha256').update(value).digest('base64');
const cssIntegrity = `sha256-${digest(fs.readFileSync(path.join(root, 'assets/site.css')))}`;
// GitHub Pages does not apply custom response headers from this repository.
// Put the policies before *any* resource; header-only controls are documented
// in SECURITY.md rather than represented by ineffective http-equiv tags.
const policy = (script = "'none'", connect = "'none'") =>
  `default-src 'none'; script-src ${script}; script-src-attr 'none'; style-src 'self'; style-src-attr 'none'; font-src 'self'; img-src 'self'; manifest-src 'self'; connect-src ${connect}; object-src 'none'; frame-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests`;
const securityHead = csp => `<meta name="referrer" content="no-referrer">\n<meta http-equiv="Content-Security-Policy" content="${esc(csp).replaceAll('&#39;', "'")}">\n`;

function layout({ file, title, description, current = '', body, head = '', csp = policy() }) {
  const url = SITE + '/' + file.replace(/index\.html$/, '');
  const fullTitle = title ? `${title} · ${NAME}` : `${NAME} · People help people find people`;
  const link = (href, label, cls = '') =>
    `<a href="${href}"${cls ? ` class="${cls}"` : ''}${current === href ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${securityHead(csp)}${head}<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0B0A0F">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${NAME}">
<meta property="og:title" content="${esc(title || NAME)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css" integrity="${cssIntegrity}" crossorigin="anonymous">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="sky" aria-hidden="true"><div class="stars"></div></div>
<header class="top">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${NAME}, home"><img src="/assets/img/icon-192.png" alt="" width="32" height="32"><span>Vote<small>Better Together</small></span></a>
    <nav class="nav" aria-label="Main">
      ${link('/#how', 'How it works', 'hide-sm')}
      ${link('/privacy/', 'Privacy')}
      ${link('/terms/', 'Terms')}
      ${link('/support/', 'Support')}
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="wrap">
    <div>© ${YEAR} ${NAME}${file === 'index.html' ? '<br>Founded by Ahmet Fatih Ceren<br>Toronto, Canada<br>Operated by VOTEBT<br>' : ' · '}<a href="mailto:${EMAIL}">${EMAIL}</a></div>
    <nav aria-label="Footer">
      <a href="/">Home</a>
      <a href="/privacy/">Privacy Policy</a>
      <a href="/terms/">Terms of Use</a>
      <a href="/support/">Support</a>
      <a href="/delete-account/">Delete your account</a>${file === 'index.html' ? `
      <a href="https://www.linkedin.com/in/ahmetfceren" rel="noopener noreferrer">Founder LinkedIn</a>
      <a href="https://www.linkedin.com/company/vote-better-together/" rel="noopener noreferrer">Company LinkedIn</a>` : ''}
    </nav>
  </div>
</footer>
</body>
</html>
`;
}

/* A document page: header, table of contents, then parts of sections. */
function docPage({ file, title, description, lead, current, intro = '', parts, after = '' }) {
  const used = new Set();
  const id = h => { let s = slug(h) || 'section', n = s, i = 2; while (used.has(n)) n = `${s}-${i++}`; used.add(n); return n; };
  const toc = [];
  const html = parts.map(part => {
    const rows = part.rows.map(([h, p]) => {
      const sid = id(h);
      toc.push([sid, h]);
      return `<section id="${sid}"><h2>${esc(h)}</h2>${p.startsWith('<') ? p : `<p>${linkEmail(esc(p))}</p>`}</section>`;
    }).join('\n');
    return `${part.title ? `<h2 class="part">${esc(part.title)}</h2>` : ''}${part.lead ? `<p class="part-lead">${esc(part.lead)}</p>` : ''}\n${rows}`;
  }).join('\n');
  const body = `<header class="doc-head"><div class="wrap">
  <p class="eyebrow">${NAME}</p>
  <h1>${esc(title)}</h1>
  <p class="lead">${lead}</p>
  <div class="meta"><span>Version ${esc(legal.version)}</span><span>Same text as in the app</span><span>For people 18 and older</span></div>
</div></header>
<div class="doc"><div class="wrap">
${intro}
<nav class="toc" aria-label="On this page"><b>On this page</b><ol>${toc.map(([sid, h]) => `<li><a href="#${sid}">${esc(h)}</a></li>`).join('')}</ol></nav>
${html}
${after}
</div></div>`;
  return layout({ file, title, description, current, body });
}

/* Website-only sections. Everything else on these pages is the app's text. */
const WEB = {
  privacyIntro: [
    ['In short', `<ul><li>Vote shows your city, never your coordinates, and keeps location on a grid of about 5&nbsp;km.</li><li>No ads, no advertising identifiers, no tracking across other apps or websites, and no analytics companies.</li><li>Nobody sees who read, proposed or followed them: only anonymous counts.</li><li>Photos are private, and each link to one expires within minutes.</li><li>You can export your data or delete your account at any time from Settings.</li></ul>`]
  ],
  privacyOutro: [
    ['This website', '<p>votebettertogether.com sets no cookies and uses no analytics, ads or trackers. It is hosted on GitHub Pages, which may keep technical logs such as IP addresses to keep the service secure.</p>']
  ],
  termsOutro: [
    ['Privacy', '<p>How Vote handles your information is described in the <a href="/privacy/">Privacy Policy</a>.</p>'],
    ['Contact', `<p>Questions about these terms: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`]
  ]
};

const pages = {};

pages['index.html'] = layout({
  file: 'index.html',
  description: 'Vote is a dating app where the community reads pairs of people. When enough people see the same thing, it can become an introduction, and nobody is connected unless both say yes.',
  body: read('home.html').replaceAll('{{MARK}}', MARK)
});

pages['privacy/index.html'] = docPage({
  file: 'privacy/index.html',
  title: 'Privacy Policy',
  current: '/privacy/',
  description: 'What Vote stores, who can see it, and how you export or delete your data.',
  lead: 'What Vote stores, who can see it, and how you stay in control.',
  parts: [
    { rows: WEB.privacyIntro },
    { title: 'The policy', rows: rowsOf(legal.docs.privacy) },
    { title: 'More about your privacy', rows: WEB.privacyOutro }
  ]
});

pages['terms/index.html'] = docPage({
  file: 'terms/index.html',
  title: 'Terms of Use',
  current: '/terms/',
  description: 'The terms for using Vote: Better Together, including subscriptions and the community guidelines.',
  lead: 'The terms for using Vote, and the community guidelines everyone agrees to.',
  parts: [
    { title: 'Terms', rows: rowsOf(legal.docs.terms) },
    { title: legal.docs.guidelines.title, rows: rowsOf(legal.docs.guidelines) },
    { title: 'Also', rows: WEB.termsOutro }
  ]
});

pages['support/index.html'] = docPage({
  file: 'support/index.html',
  title: 'Support',
  current: '/support/',
  description: 'Get help with Vote: account, sign-in, safety, reporting someone, appeals and deleting your account.',
  lead: 'The fastest way to reach a person is in the app. If you can’t open it, write to us.',
  intro: `<div class="cards">
  <a href="mailto:${EMAIL}"><b>E-mail us</b><span>${EMAIL}</span></a>
  <a href="/delete-account/"><b>Delete your account</b><span>In the app, or by e-mail</span></a>
  <a href="/privacy/"><b>Privacy Policy</b><span>What Vote stores and who sees it</span></a>
  <a href="/terms/"><b>Terms of Use</b><span>Including subscriptions and refunds</span></a>
</div>`,
  parts: [
    { rows: rowsOf(legal.docs.support) },
    { title: 'Staying safe', rows: [
      ['Keep it on Vote', 'Chat here until you’re comfortable. Be wary of anyone who rushes you off the app.'],
      ['Meet in public', 'For first dates, choose a public place and tell a friend where you’ll be.'],
      ['Never send money', 'Report anyone who asks for money, gift cards or crypto.'],
      ['Trust your instincts', 'You can unmatch, block or report at any time. We never tell the other person who reported them.']
    ] },
    { title: 'Contact', rows: [
      ['If you can’t use the app', `<p>Write to <a href="mailto:${EMAIL}">${EMAIL}</a>. Send it from the e-mail address of your Vote account if you can, or tell us how you sign in (Apple, Google or e-mail), so we can find your account.</p>`]
    ] }
  ]
});

pages['delete-account/index.html'] = docPage({
  file: 'delete-account/index.html',
  title: legal.docs.deletion.title,
  current: '',
  description: 'How to delete your Vote: Better Together account and data, in the app or by e-mail, and what is deleted or kept.',
  lead: 'In the app at any time, or by e-mail if you can’t sign in.',
  parts: [{ rows: rowsOf(legal.docs.deletion) }]
});

/* The page Vote's sign-up and password-reset emails link to (the app
   repo's supabase/templates): it hands the link to the app, or confirms a
   sign-up here on a computer (src/email-link.js, words in
   src/email-link.json). The site's one script: inline, pinned by its hash
   in a Content-Security-Policy that lets it talk only to Vote's sign-in
   service (Supabase Auth). Not indexed; the app repo's deploy checks it is
   published before the emails point here (data-vote-email-link). */
const linkWords = JSON.parse(read('email-link.json'));
// JSON in an inline script must not be able to close its HTML script element.
const scriptJson = value => JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
const linkScript = read('email-link.js').replace('__STRINGS__', () => scriptJson(linkWords));
const linkHash = digest(linkScript);
pages['auth/confirm/index.html'] = layout({
  file: 'auth/confirm/index.html',
  title: 'Email link',
  description: 'Opens Vote to confirm your email or choose a new password.',
  csp: policy(`'sha256-${linkHash}'`, 'https://usuyyubmjwayrliadrax.supabase.co/auth/v1/verify https://usuyyubmjwayrliadrax.supabase.co/auth/v1/logout'),
  head: `<meta name="robots" content="noindex, nofollow, noarchive">
<script>${linkScript}</script>
`,
  body: `<section class="closing linkpage" data-vote-email-link><div class="wrap">
<div class="mark">${MARK}</div>
<h1 id="lp-title">${esc(linkWords.en.opening)}</h1>
<p class="lead" id="lp-text">${esc(linkWords.en.openHint)}</p>
<div class="cta"><a class="btn solid" id="lp-open" href="/" hidden>${esc(linkWords.en.open)}</a><button class="btn solid" id="lp-confirm" type="button" hidden>${esc(linkWords.en.confirm)}</button><button class="btn" id="lp-here" type="button" hidden>${esc(linkWords.en.here)}</button></div>
<noscript><p class="lead">Open this email on your phone, in Vote.</p></noscript>
</div></section>`
});

/* The flat addresses (privacy.html …) some listings and older builds use
   lead to the pages. */
const moved = to => `<!doctype html><html lang="en"><head><meta charset="utf-8">${securityHead(policy())}<title>${NAME}</title><link rel="canonical" href="${SITE}${to}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p><a href="${to}">${SITE}${to}</a></p></body></html>\n`;
for (const p of ['privacy', 'terms', 'support', 'delete-account']) pages[`${p}.html`] = moved(`/${p}/`);

pages['404.html'] = layout({
  file: '404.html',
  title: 'Page not found',
  description: 'This page doesn’t exist.',
  body: `<section class="closing no-border"><div class="wrap"><div class="mark">${MARK}</div><h2>Nothing here.</h2><p class="lead">This page doesn’t exist, or it moved.</p><div class="cta"><a class="btn solid" href="/">Go home</a><a class="btn" href="/support/">Support</a></div></div></section>`
});

for (const [file, html] of Object.entries(pages)) {
  const out = path.join(root, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

const urls = ['', 'privacy/', 'terms/', 'support/', 'delete-account/'];
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}/${u}</loc></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(root, 'site.webmanifest'), JSON.stringify({
  name: NAME, short_name: 'Vote', start_url: '/', display: 'browser', background_color: '#0B0A0F', theme_color: '#0B0A0F',
  icons: [{ src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' }]
}, null, 2) + '\n');

const securityTxt = `Contact: mailto:${EMAIL}
Expires: 2027-04-04T00:00:00Z
Preferred-Languages: en, tr
Canonical: ${SITE}/.well-known/security.txt
Policy: https://github.com/pastaegg/vote-website/blob/main/SECURITY.md
`;
fs.mkdirSync(path.join(root, '.well-known'), { recursive: true });
fs.writeFileSync(path.join(root, '.well-known/security.txt'), securityTxt);
fs.writeFileSync(path.join(root, 'security.txt'), securityTxt);

console.log(`Built ${Object.keys(pages).length} pages (legal text version ${legal.version})`);
