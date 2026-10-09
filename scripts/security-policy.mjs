// Conservative parser for this site's generated HTML, not a general HTML5 parser.
// Unsupported or ambiguous syntax fails closed instead of guessing browser behavior.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const requiredPages = ['index.html', '404.html', 'auth/confirm/index.html', ...['privacy', 'terms', 'support', 'delete-account'].flatMap(p => [`${p}.html`, `${p}/index.html`])];
export const excludedDirectories = new Set(['.git', 'node_modules', 'src', 'scripts', 'tests', '_site']);
const site = 'https://votebettertogether.com';
// Only the two official identity links may leave the site. These are
// navigation destinations, never asset, script or API permissions.
const externalLinks = new Set([
  'https://www.linkedin.com/in/ahmetfceren',
  'https://www.linkedin.com/company/vote-better-together/'
]);
const authConnections = 'https://usuyyubmjwayrliadrax.supabase.co/auth/v1/verify https://usuyyubmjwayrliadrax.supabase.co/auth/v1/logout';
const aliases = new Map(['privacy', 'terms', 'support', 'delete-account'].map(p => [`${p}.html`, `0; url=/${p}/`]));
const tags = new Set('html head body title meta link a article b br button circle defs div em footer h1 h2 h3 header i img li main nav noscript ol p path radialgradient rect script section small span stop svg ul'.split(' '));
const voidTags = new Set(['meta', 'link', 'img', 'br']);
const svgTags = new Set(['svg', 'circle', 'defs', 'path', 'radialgradient', 'rect', 'stop']);
const resources = new Set(['link', 'img', 'script', 'svg']);
const space = /[\t\n\f\r ]/;
export const digest = value => crypto.createHash('sha256').update(value).digest('base64');

function decodeAttribute(value) {
  return value.replace(/&(#(?:[xX][0-9a-fA-F]+|[0-9]+)|[a-zA-Z][a-zA-Z0-9]*);?/g, (_, entity) => {
    if (entity.startsWith('#')) {
      const number = entity[1]?.toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      assert.ok(number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff), 'invalid numeric character reference');
      return String.fromCodePoint(number);
    }
    const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', colon: ':', sol: '/', Tab: '\t', NewLine: '\n' };
    assert.ok(Object.hasOwn(named, entity), `unsupported character reference: &${entity}`);
    return named[entity];
  });
}

export function tokenizeHtml(html) {
  assert.ok(!html.includes('\0'), 'HTML must not contain NUL');
  const tokens = [];
  let at = 0, pendingText = '';
  while (at < html.length) {
    const start = html.indexOf('<', at);
    if (start < 0) break;
    const leadingText = pendingText + html.slice(at, start);
    if (html.startsWith('<!--', start)) {
      const end = html.indexOf('-->', start + 4);
      assert.ok(end >= 0 && !html.slice(start + 4, end).includes('--'), 'ambiguous or unterminated HTML comment');
      at = end + 3;
      pendingText = leadingText;
      continue;
    }
    const declaration = /^<!doctype\s+html\s*>/i.exec(html.slice(start));
    if (declaration) {
      assert.ok(!leadingText.trim() && !tokens.length, 'doctype must precede document content');
      at = start + declaration[0].length; pendingText = ''; continue;
    }
    const opening = /^<(\/)?([a-zA-Z][a-zA-Z0-9:-]*)/.exec(html.slice(start));
    assert.ok(opening, 'unsupported HTML markup');
    const closing = !!opening[1], name = opening[2].toLowerCase(), attributes = new Map();
    at = start + opening[0].length;
    let selfClosing = false;
    while (at < html.length) {
      const beforeSpace = at;
      while (space.test(html[at] || '') && at < html.length) at++;
      if (html[at] === '>') { at++; break; }
      if (html.slice(at, at + 2) === '/>') { selfClosing = true; at += 2; break; }
      assert.ok(!closing && at > beforeSpace, 'attributes require whitespace and opening tags');
      const attribute = /^[^\t\n\f\r />="'<`]+/.exec(html.slice(at));
      assert.ok(attribute, 'invalid HTML attribute');
      const key = attribute[0].toLowerCase();
      assert.ok(!attributes.has(key), `duplicate attribute: ${key}`);
      at += attribute[0].length;
      const attributeEnd = at;
      while (space.test(html[at] || '') && at < html.length) at++;
      let value = null;
      if (html[at] === '=') {
        at++;
        while (space.test(html[at] || '') && at < html.length) at++;
        if (html[at] === '"' || html[at] === "'") {
          const quote = html[at++], end = html.indexOf(quote, at);
          assert.ok(end >= 0, 'unterminated attribute');
          value = html.slice(at, end); at = end + 1;
        } else {
          const unquoted = /^[^\t\n\f\r >]+/.exec(html.slice(at));
          assert.ok(unquoted && !/["'<`=]/.test(unquoted[0]), 'invalid unquoted attribute');
          value = unquoted[0]; at += value.length;
        }
        value = decodeAttribute(value);
      } else at = attributeEnd;
      attributes.set(key, value);
    }
    assert.ok(html[at - 1] === '>', 'unterminated tag');
    assert.ok(!closing || !selfClosing, 'invalid closing tag');
    const token = { name, attributes, start, end: at, closing, selfClosing, leadingText };
    tokens.push(token);
    pendingText = '';
    if (!closing && (name === 'script' || name === 'title')) {
      assert.ok(!selfClosing, `${name} cannot self-close`);
      const endTag = new RegExp(`</${name}(?=[\\t\\n\\f\\r />])`, 'gi');
      endTag.lastIndex = at;
      const end = endTag.exec(html);
      assert.ok(end, `unterminated ${name}`);
      const canonicalEnd = new RegExp(`^</${name}\\s*>`, 'i').exec(html.slice(end.index));
      assert.ok(canonicalEnd, `ambiguous ${name} closing tag`);
      token.text = html.slice(at, end.index);
      if (name === 'script') assert.ok(!/<!--|<script[\t\n\f\r />]/i.test(token.text), 'ambiguous script raw-text escaping');
      token.rawEnd = end.index + canonicalEnd[0].length;
      at = end.index;
    }
  }
  return tokens;
}

function safeUrl(value, file, token, attribute) {
  assert.equal(typeof value, 'string', `${file}: URLs need values`);
  assert.ok(!/[\x00-\x20\x7f\\]/.test(value), `${file}: URL whitespace, controls or backslashes`);
  assert.ok(!value.startsWith('//'), `${file}: protocol-relative URL`);
  if (value === 'mailto:support@votebettertogether.com') return;
  if (token.name === 'a' && attribute === 'href' && externalLinks.has(value)) {
    const rel = (token.attributes.get('rel') || '').toLowerCase().split(/\s+/);
    assert.ok(rel.includes('noopener') && rel.includes('noreferrer'), `${file}: external link protection required`);
    assert.ok(!token.attributes.has('target') || token.attributes.get('target') === '_blank', `${file}: unsupported external target`);
    return;
  }
  const url = new URL(value, site + '/');
  assert.ok(url.protocol === 'https:' && url.origin === site && !url.username && !url.password, `${file}: URL must remain on this HTTPS origin`);
}

export function checkSecurityPage(html, file, css) {
  const tokens = tokenizeHtml(html), starts = tokens.filter(t => !t.closing), stack = [];
  let headStart, headEnd;
  for (const token of tokens) {
    const { name, attributes, closing, selfClosing } = token;
    assert.ok(tags.has(name), `${file}: unsupported element ${name}`);
    if (!stack.length || stack.at(-1) === 'html' || stack.at(-1) === 'head') assert.ok(!token.leadingText.trim(), `${file}: unexpected text outside the body closes the document head`);
    if (closing) {
      assert.equal(stack.pop(), name, `${file}: unbalanced ${name}`);
      if (name === 'head') headEnd = token.start;
      continue;
    }
    if (name === 'html') assert.equal(stack.length, 0, `${file}: html must be the document root`);
    if (name === 'head') {
      assert.deepEqual(stack, ['html'], `${file}: head must be directly inside html`);
      assert.equal(headEnd, undefined, `${file}: head must precede body`);
      headStart = token.end;
    }
    if (name === 'body') {
      assert.deepEqual(stack, ['html'], `${file}: body must be directly inside html`);
      assert.ok(headEnd < token.start, `${file}: body follows head`);
    }
    if (stack.at(-1) === 'html') assert.ok(['head', 'body'].includes(name), `${file}: only head and body may be direct html children`);
    if (stack.at(-1) === 'head') assert.ok(['title', 'meta', 'link', 'script'].includes(name), `${file}: unsupported element in head`);
    if (name === 'meta') assert.equal(stack.at(-1), 'head', `${file}: meta must be in the head`);
    assert.ok(!selfClosing || voidTags.has(name) || svgTags.has(name), `${file}: invalid self-closing ${name}`);
    if (!selfClosing && !voidTags.has(name)) stack.push(name);
    for (const [key, value] of attributes) {
      assert.ok(key !== 'style' && !key.startsWith('on'), `${file}: inline styles or event handlers`);
      assert.ok(!['srcset', 'srcdoc', 'ping', 'action', 'formaction', 'background', 'xlink:href'].includes(key), `${file}: unsupported resource attribute ${key}`);
      if (key === 'href' || key === 'src') safeUrl(value, file, token, key);
    }
  }
  assert.equal(stack.length, 0, `${file}: unclosed elements`);
  for (const name of ['html', 'head', 'body']) assert.equal(starts.filter(t => t.name === name).length, 1, `${file}: exactly one ${name}`);
  assert.ok(headStart <= headEnd, `${file}: document head required`);
  const metas = starts.filter(t => t.name === 'meta');
  const equivalent = token => (token.attributes.get('http-equiv') || '').toLowerCase();
  const policies = metas.filter(t => equivalent(t) === 'content-security-policy');
  assert.equal(policies.length, 1, `${file}: exactly one CSP`);
  const policy = policies[0];
  assert.ok(policy.start >= headStart && policy.end <= headEnd, `${file}: CSP must be in the head`);
  const refs = metas.filter(t => (t.attributes.get('name') || '').toLowerCase() === 'referrer');
  assert.equal(refs.length, 1, `${file}: exactly one referrer policy`);
  assert.equal(refs[0].attributes.get('content'), 'no-referrer', `${file}: no-referrer`);
  assert.ok(refs[0].start >= headStart && refs[0].end <= headEnd, `${file}: referrer policy must be in the head`);
  for (const resource of starts.filter(t => resources.has(t.name))) {
    assert.ok(policy.end <= resource.start, `${file}: CSP precedes every resource`);
    assert.ok(refs[0].end <= resource.start, `${file}: referrer policy precedes every resource`);
  }
  for (const meta of metas.filter(t => t.attributes.has('http-equiv'))) {
    assert.ok(['content-security-policy', 'refresh'].includes(equivalent(meta)), `${file}: unsupported http-equiv`);
  }
  const refreshes = metas.filter(t => equivalent(t) === 'refresh');
  assert.equal(refreshes.length, aliases.has(file) ? 1 : 0, `${file}: refresh only on fixed aliases`);
  if (refreshes.length) assert.equal(refreshes[0].attributes.get('content'), aliases.get(file), `${file}: fixed internal refresh destination`);

  const scripts = starts.filter(t => t.name === 'script');
  const isAuth = file === 'auth/confirm/index.html';
  assert.equal(scripts.length, isAuth ? 1 : 0, `${file}: permitted script count`);
  if (isAuth) {
    assert.equal(scripts[0].attributes.size, 0, `${file}: auth script must be plain inline HTML`);
    assert.ok(scripts[0].start >= headStart && scripts[0].rawEnd <= headEnd, `${file}: auth script must be in the head`);
    for (const resource of starts.filter(t => resources.has(t.name) && t !== scripts[0])) assert.ok(scripts[0].rawEnd <= resource.start, `${file}: auth cleanup precedes resources`);
    assert.ok(starts.some(t => t.attributes.has('data-vote-email-link')), `${file}: email-link marker`);
    assert.ok(metas.some(t => t.attributes.get('name') === 'robots' && t.attributes.get('content') === 'noindex, nofollow, noarchive'), `${file}: auth must not be indexed`);
  }
  const expected = new Map([
    ...['default-src', 'script-src-attr', 'style-src-attr', 'object-src', 'frame-src', 'worker-src', 'base-uri', 'form-action'].map(name => [name, "'none'"]),
    ...['style-src', 'font-src', 'img-src', 'manifest-src'].map(name => [name, "'self'"]),
    ['upgrade-insecure-requests', ''],
    ['script-src', isAuth ? `'sha256-${digest(scripts[0].text)}'` : "'none'"],
    ['connect-src', isAuth ? authConnections : "'none'"]
  ]);
  const directives = new Map();
  const csp = policy.attributes.get('content');
  assert.equal(typeof csp, 'string', `${file}: CSP content required`);
  for (const part of csp.split(';').filter(p => p.trim())) {
    const [name, ...values] = part.trim().split(/\s+/), key = name.toLowerCase();
    assert.ok(!directives.has(key), `${file}: duplicate CSP directive ${key}`);
    assert.ok(expected.has(key), `${file}: unsupported CSP directive ${key}`);
    directives.set(key, values.join(' '));
  }
  assert.equal(directives.size, expected.size, `${file}: complete CSP required`);
  for (const [name, value] of expected) assert.equal(directives.get(name), value, `${file}: ${name}`);
  const styles = starts.filter(t => t.name === 'link' && (t.attributes.get('rel') || '').toLowerCase().split(/\s+/).includes('stylesheet'));
  assert.equal(styles.length, aliases.has(file) ? 0 : 1, `${file}: expected stylesheet count`);
  for (const style of styles) {
    assert.equal(style.attributes.get('href'), '/assets/site.css', `${file}: fixed stylesheet`);
    assert.equal(style.attributes.get('integrity'), `sha256-${digest(css)}`, `${file}: stylesheet integrity`);
    assert.equal(style.attributes.get('crossorigin'), 'anonymous', `${file}: stylesheet CORS`);
  }
}

export function discoverPages(root) {
  const pages = [];
  function visit(directory, relative = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.posix.join(relative, entry.name);
      assert.ok(!entry.isSymbolicLink(), `symlinks are not permitted in published input: ${file}`);
      if (entry.isDirectory() && !(relative === '' && excludedDirectories.has(entry.name))) visit(path.join(directory, entry.name), file);
      else if (entry.isFile() && /\.html?$/i.test(entry.name)) pages.push(file);
    }
  }
  visit(root);
  return pages.sort();
}
