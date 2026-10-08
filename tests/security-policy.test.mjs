import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSecurityPage, digest, discoverPages, requiredPages } from '../scripts/security-policy.mjs';

const css = 'body { color: white; }';
const authScript = 'window.example = true;';
const policy = (auth = false) => `default-src 'none'; script-src ${auth ? `'sha256-${digest(authScript)}'` : "'none'"}; script-src-attr 'none'; style-src 'self'; style-src-attr 'none'; font-src 'self'; img-src 'self'; manifest-src 'self'; connect-src ${auth ? 'https://usuyyubmjwayrliadrax.supabase.co/auth/v1/verify https://usuyyubmjwayrliadrax.supabase.co/auth/v1/logout' : "'none'"}; object-src 'none'; frame-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests`;
const csp = auth => `<meta http-equiv="Content-Security-Policy" content="${policy(auth)}">`;
const stylesheet = `<link rel="stylesheet" href="/assets/site.css" integrity="sha256-${digest(css)}" crossorigin="anonymous">`;
const page = (auth = false) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer">${csp(auth)}<title>Test</title>${auth ? `<meta name="robots" content="noindex, nofollow, noarchive"><script>${authScript}</script>` : ''}${stylesheet}</head><body><main data-vote-email-link><a href="/support/">Support</a></main></body></html>`;
const normal = page(), auth = page(true), authFile = 'auth/confirm/index.html';
const inject = markup => normal.replace('</main>', `${markup}</main>`);
const reject = (html, pattern, file = 'index.html', sheet = css) => assert.throws(() => checkSecurityPage(html, file, sheet), pattern);

test('current generated entry points pass the structural policy checks', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const actualCss = fs.readFileSync(path.join(root, 'assets/site.css'));
  for (const file of requiredPages) checkSecurityPage(fs.readFileSync(path.join(root, file), 'utf8'), file, actualCss);
});
test('canonical normal and auth fixtures pass', () => {
  checkSecurityPage(normal, 'index.html', css); checkSecurityPage(auth, authFile, css);
});
test('case-insensitive HTML attributes and harmless unquoted values remain readable', () => {
  checkSecurityPage(normal.replace('<html lang="en">', '<HTML LANG=en>').replace('</html>', '</HTML>').replace('http-equiv="Content-Security-Policy"', "HTTP-EQUIV='content-security-policy'"), 'index.html', css);
});
for (const [name, markup] of [
  ['attributed module script', '<script type="module" src="/injected.js"></script>'],
  ['uppercase external script with unquoted source', '<SCRIPT SRC=/injected.js></SCRIPT>'],
  ['inline script with whitespace in tag', '<script >alert(1)</script>'],
  ['uppercase event handler', '<img src="/image.png" ONERROR=alert(1)>'],
  ['uppercase inline style', '<span STYLE=color:red>Bad</span>'],
  ['unquoted javascript URL', '<a href=javascript:alert(1)>Bad</a>'],
  ['entity-encoded javascript scheme', '<a href="javascript&colon;alert(1)">Bad</a>'],
  ['entity-encoded control in URL', '<a href="java&#x09;script:alert(1)">Bad</a>'],
  ['external HTTPS navigation', '<a href="https://attacker.invalid/">Bad</a>'],
  ['duplicate case-insensitive attribute', '<a href="/" HREF="https://attacker.invalid/">Bad</a>'],
  ['embedding', '<iframe src="/"></iframe>'],
  ['form submission', '<form action="/"></form>'],
  ['additional meta CSP in body', `<meta http-equiv="Content-Security-Policy" content="${policy()}">`]
]) test(`rejects ${name}`, () => reject(inject(markup)));

for (const [name, directive] of [
  ['first-wins duplicate script policy', "script-src 'self'; script-src 'none';"],
  ['case-insensitive duplicate script policy', "SCRIPT-SRC 'self'; script-src 'none';"],
  ['script element override', "script-src 'none'; script-src-elem 'self';"],
  ['unrestricted inline script', "script-src 'unsafe-inline';"]
]) test(`rejects ${name}`, () => reject(normal.replace("script-src 'none';", directive), /CSP directive|script-src/));
test('rejects a duplicate first-wins connect policy', () => reject(normal.replace("connect-src 'none';", "connect-src https://attacker.invalid; connect-src 'none';"), /duplicate CSP directive/));
test('requires every CSP directive', () => reject(normal.replace("worker-src 'none'; ", ''), /complete CSP/));
test('rejects conflicting duplicate CSP elements', () => reject(normal.replace(csp(false), csp(false) + csp(false)), /exactly one CSP/));
test('CSP must precede image resources, including before any link', () => reject(normal.replace(csp(false), `<img src="/image.png">${csp(false)}`), /unsupported element in head|CSP precedes/));
test('CSP must precede all stylesheet resources', () => reject(normal.replace(csp(false), '').replace(stylesheet, stylesheet + csp(false)), /CSP precedes/));
test('CSP in a misplaced head cannot pass as a browser policy', () => reject(normal.replace('<head>', '<body><head>').replace('</head><body>', '</head>'), /head must be directly inside html|body follows head/));
test('head after body is rejected', () => reject(normal.replace('<head>', '<body></body><head>').replace('</head><body>', '</head><body>'), /body follows head/));
test('non-whitespace before the head is rejected', () => reject(normal.replace('<head>', 'unexpected<head>'), /unexpected text/));
test('text hidden before a comment cannot force the browser out of head', () => reject(normal.replace(csp(false), `unexpected<!-- comment -->${csp(false)}`), /unexpected text/));
test('direct resource child of html is rejected', () => reject(normal.replace('<head>', '<img src="/image.png"><head>'), /only head and body/));
test('rejects stylesheet integrity mismatch and missing integrity', () => {
  reject(normal, /stylesheet integrity/, 'index.html', css + 'changed');
  reject(normal.replace(/ integrity="[^"]+"/, ''), /stylesheet integrity/);
});
test('auth has exactly one plain inline script with its own content hash', () => {
  reject(auth.replace('<script>', '<script type="module">'), /plain inline/, authFile);
  reject(auth.replace(authScript, authScript + 'window.changed=true;'), /script-src/, authFile);
  reject(auth.replace('</script>', '</script><SCRIPT SRC=/injected.js></SCRIPT>'), /permitted script count/, authFile);
});
test('auth cleanup must precede stylesheet and image resources', () => reject(auth.replace(`<script>${authScript}</script>`, '').replace(stylesheet, stylesheet + `<script>${authScript}</script>`), /auth cleanup precedes/, authFile));
test('auth script privileges do not follow a copied page to another route', () => reject(auth, /permitted script count/, 'unexpected/index.html'));
test('ambiguous raw script closing syntax cannot hide later HTML elements', () => reject(auth.replace('</script>', '</script unexpected><script>bad()</script>'), /ambiguous script closing tag/, authFile));
test('HTML comment escaping inside scripts must not change tokenizer boundaries', () => reject(auth.replace(authScript, '<!--<script>bad()</script>'), /ambiguous script raw-text escaping/, authFile));
test('text before a doctype cannot make the browser enter the body first', () => reject('unexpected' + normal, /doctype must precede/));
test('boolean attributes can precede other attributes safely', () => checkSecurityPage(inject('<button hidden type=button>Button</button>'), 'index.html', css));
test('official footer links are allowed only as protected homepage navigation', () => {
  for (const url of ['https://www.linkedin.com/in/ahmetfceren', 'https://www.linkedin.com/company/vote-better-together/']) {
    const html = inject(`<a href="${url}" rel="noopener noreferrer">LinkedIn</a>`);
    checkSecurityPage(html, 'index.html', css);
    reject(html, /this HTTPS origin/, 'privacy/index.html');
    reject(inject(`<a href="${url}">LinkedIn</a>`), /link protection/);
    reject(inject(`<img src="${url}">`), /this HTTPS origin/);
    reject(inject(`<a href="${url}?redirect=other" rel="noopener noreferrer">LinkedIn</a>`));
  }
});
test('meta refresh is limited to the fixed internal aliases', () => {
  const alias = `<!doctype html><html><head><meta name="referrer" content="no-referrer">${csp(false)}<meta http-equiv="refresh" content="0; url=/privacy/"></head><body><a href="/privacy/">Privacy</a></body></html>`;
  checkSecurityPage(alias, 'privacy.html', css);
  reject(alias.replace('0; url=/privacy/', '0; url=https://attacker.invalid/'), /fixed internal/, 'privacy.html');
  reject(alias, /refresh only/, 'other.html');
});
test('recursive discovery includes new HTML and excludes source/tool/build directories', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vote-policy-'));
  try {
    for (const file of ['index.html', 'new/nested/EXTRA.HTML', 'new/legacy.htm', 'new/src/page.html', 'src/home.html', 'scripts/debug.html', 'tests/fixture.html', '_site/index.html']) {
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), normal);
    }
    assert.deepEqual(discoverPages(root), ['index.html', 'new/legacy.htm', 'new/nested/EXTRA.HTML', 'new/src/page.html']);
    fs.writeFileSync(path.join(root, 'new/nested/EXTRA.HTML'), '<html><head></head><body>Unprotected</body></html>');
    for (const file of discoverPages(root)) {
      if (file !== 'new/nested/EXTRA.HTML') checkSecurityPage(fs.readFileSync(path.join(root, file), 'utf8'), file, css);
      else reject(fs.readFileSync(path.join(root, file), 'utf8'), /exactly one CSP/, file);
    }
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
