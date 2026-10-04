import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const words = JSON.parse(fs.readFileSync(new URL('../src/email-link.json', import.meta.url)));
const script = fs.readFileSync(new URL('../src/email-link.js', import.meta.url), 'utf8').replace('__STRINGS__', () => JSON.stringify(words));
const fragment = '#type=signup&email=test%40example.com&token=123456';
function boot({ hash = fragment, search = '', phone = false, secure = true, framed = false, historyFails = false, fetchImpl, lang = 'en' } = {}) {
  const listeners = {}, events = {}, requests = [], timers = new Map();
  const elements = Object.fromEntries(['lp-open', 'lp-confirm', 'lp-here', 'lp-title', 'lp-text'].map(id => [id, { hidden: true, href: '/', textContent: '', disabled: false, addEventListener(name, fn) { this[name] = fn; }, removeAttribute(name) { delete this[name]; } }]));
  const location = { hash, search, pathname: '/auth/confirm/', href: 'https://votebettertogether.com/auth/confirm/' + search + hash };
  const document = { documentElement: {}, getElementById: id => elements[id], addEventListener: (event, fn) => { events[event] = fn; } };
  const window = { isSecureContext: secure, document, addEventListener: (event, fn) => { listeners[event] = fn; } };
  window.self = window; window.top = framed ? {} : window;
  const context = { window, document, location, navigator: { userAgent: phone ? 'iPhone' : 'Desktop', languages: [lang], language: lang }, history: { replaceState(_, __, pathname) { if (historyFails) throw Error('blocked'); location.hash = ''; location.search = ''; location.href = 'https://votebettertogether.com' + pathname; } }, URLSearchParams, AbortController,
    setTimeout(fn) { const id = timers.size + 1; timers.set(id, fn); return id; }, clearTimeout(id) { timers.delete(id); },
    fetch(url, options) { requests.push({ url, options }); return fetchImpl ? fetchImpl(url, options) : Promise.resolve({ ok: true, status: 200, json: async () => ({ access_token: 'test-access', refresh_token: 'test-refresh' }) }); }
  };
  vm.runInNewContext(script, context);
  const early = { hash: location.hash, search: location.search, href: location.href };
  events.DOMContentLoaded();
  return { elements, location, early, requests, timers, listeners, document, click: id => elements[id].click() };
}
const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
test('clears fragment before DOM ready; signup waits for an explicit click', () => {
  const b = boot(); assert.equal(b.early.hash, ''); assert.equal(b.requests.length, 0); assert.equal(b.elements['lp-confirm'].hidden, false);
});
for (const [name, options] of [
  ['query credentials', { hash: '', search: fragment.replace('#', '?') }],
  ['query plus fragment', { search: '?tracking=1' }],
  ['duplicate token', { hash: fragment + '&token=654321' }],
  ['unexpected parameter', { hash: fragment + '&redirect=https%3A%2F%2Fevil.example' }],
  ['HTML in email', { hash: '#type=signup&email=%3Csvg%3E%40example.com&token=123456' }],
  ['invalid token', { hash: fragment.replace('123456', 'ABCDEF') }],
  ['unsupported type', { hash: fragment.replace('signup', 'magiclink') }],
  ['oversized input', { hash: fragment + '&lang=' + 'x'.repeat(2048) }],
  ['insecure context', { secure: false }],
  ['framed context', { framed: true, phone: true }],
  ['history cleanup failure', { historyFails: true }]
]) test(`rejects ${name} without auth requests or app navigation`, () => {
  const b = boot(options); assert.equal(b.requests.length, 0); assert.equal(b.timers.size, 0);
  for (const id of ['lp-open', 'lp-confirm', 'lp-here']) assert.equal(b.elements[id].hidden, true);
  assert.equal(b.elements['lp-title'].textContent, words.en.brokenTitle);
});
for (const lang of Object.keys(words)) test(`renders ${lang} safely`, () => {
  const b = boot({ hash: fragment + '&lang=' + encodeURIComponent(lang) });
  assert.equal(b.document.documentElement.lang, lang);
  assert.equal(b.elements['lp-title'].textContent, words[lang].confirmTitle);
  assert.equal(b.document.documentElement.dir, lang === 'ar' ? 'rtl' : 'ltr');
});
test('prototype property locale cannot select a non-language object', () => {
  const b = boot({ hash: fragment + '&lang=__proto__' }); assert.equal(b.document.documentElement.lang, 'en');
});
test('signup success posts to the fixed service and ends only its temporary session', async () => {
  const b = boot(); b.click('lp-confirm'); b.click('lp-confirm'); await settle();
  assert.equal(b.requests.length, 2);
  assert.equal(b.requests[0].url, 'https://usuyyubmjwayrliadrax.supabase.co/auth/v1/verify');
  assert.deepEqual(JSON.parse(b.requests[0].options.body), { type: 'signup', email: 'test@example.com', token: '123456' });
  assert.equal(b.requests[1].url, 'https://usuyyubmjwayrliadrax.supabase.co/auth/v1/logout?scope=local');
  assert.equal(b.requests[1].options.headers.Authorization, 'Bearer test-access');
  for (const r of b.requests) { assert.equal(r.options.credentials, 'omit'); assert.equal(r.options.cache, 'no-store'); assert.equal(r.options.redirect, 'error'); assert.equal(r.options.referrerPolicy, 'no-referrer'); }
  assert.equal(b.elements['lp-title'].textContent, words.en.doneTitle);
  assert.equal(b.elements['lp-open'].href, undefined);
  b.click('lp-confirm'); assert.equal(b.requests.length, 2);
});
test('recovery cannot verify signup even by firing the hidden control', () => {
  const b = boot({ hash: fragment.replace('signup', 'recovery') }); b.click('lp-confirm'); assert.equal(b.requests.length, 0); assert.equal(b.elements['lp-title'].textContent, words.en.resetTitle);
});
test('expired code becomes unusable', async () => {
  const b = boot({ fetchImpl: async () => ({ ok: false, status: 403, json: async () => ({ code: 'otp_expired' }) }) });
  b.click('lp-confirm'); await settle(); b.click('lp-confirm');
  assert.equal(b.requests.length, 1); assert.equal(b.elements['lp-title'].textContent, words.en.expiredTitle); assert.equal(b.elements['lp-open'].href, undefined);
});
test('network failure permits a deliberate retry', async () => {
  const b = boot({ fetchImpl: async () => { throw Error('offline'); } });
  b.click('lp-confirm'); await settle(); assert.equal(b.elements['lp-confirm'].disabled, false);
  b.click('lp-confirm'); await settle(); assert.equal(b.requests.length, 2);
});
test('a mobile link always opens the fixed app URI', () => {
  const b = boot({ phone: true }); assert.equal(b.requests.length, 0);
  assert.equal(b.elements['lp-open'].href, 'vote-rn://login-callback?type=signup&email=test%40example.com&token=123456');
  [...b.timers.values()][0](); assert.equal(b.location.href, b.elements['lp-open'].href);
});
test('leaving the page discards credentials and cancels automatic app opening', () => {
  const b = boot({ phone: true }); b.listeners.pagehide(); b.click('lp-confirm');
  assert.equal(b.requests.length, 0); assert.equal(b.timers.size, 0); assert.equal(b.elements['lp-open'].href, undefined);
  b.listeners.pageshow({ persisted: true }); assert.equal(b.elements['lp-open'].hidden, true);
});
