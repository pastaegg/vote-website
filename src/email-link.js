/* This script runs in the head, before any resources. Only fragments carry
   credentials: queries have already reached server logs and are rejected.
   No session is persisted; a temporary signup session is logged out locally.
   Logout revokes refresh tokens, not an already-issued access token. */
(function () {
  'use strict';
  var STRINGS = __STRINGS__;
  var APP_LINK = 'vote-rn://login-callback';
  var AUTH = 'https://usuyyubmjwayrliadrax.supabase.co/auth/v1';
  var KEY = 'sb_publishable_SdJ_AsnJPiNjBOEczW62bg_m4fAaWZ_';
  var raw = (location.hash || '').replace(/^#/, '');
  var hadQuery = !!location.search;
  var safeContext = window.isSecureContext && window.self === window.top;
  try {
    if (location.hash || location.search) history.replaceState(null, '', location.pathname);
  } catch (_) { safeContext = false; }
  var params = new URLSearchParams(raw.length <= 2048 ? raw : '');
  var allowed = ['type', 'email', 'token', 'lang'];
  var validParams = raw.length <= 2048 && !hadQuery;
  params.forEach(function (_, key) {
    if (allowed.indexOf(key) < 0 || params.getAll(key).length !== 1) validParams = false;
  });
  raw = '';
  var own = function (tag) { return Object.prototype.hasOwnProperty.call(STRINGS, tag); };
  function pick(tags) {
    for (var i = 0; i < tags.length; i++) {
      var tag = String(tags[i] || '');
      if (own(tag)) return tag;
      var lower = tag.toLowerCase();
      if (/^zh-(hant|tw|hk|mo)/.test(lower)) return 'zh-Hant';
      if (/^zh/.test(lower)) return 'zh-Hans';
      var base = lower.split('-')[0];
      if (own(base)) return base;
    }
    return 'en';
  }
  var lang = pick([params.get('lang')].concat(navigator.languages || [navigator.language]));
  var t = STRINGS[lang];
  var type = params.get('type');
  var email = String(params.get('email') || '').trim().toLowerCase();
  var token = String(params.get('token') || '').trim();
  params = null;
  var valid = safeContext && validParams && (type === 'signup' || type === 'recovery') &&
    email.length <= 254 && /^[^\s@<>\x00-\x1f\x7f]+@[^\s@<>\x00-\x1f\x7f]+\.[^\s@<>\x00-\x1f\x7f]+$/.test(email) && /^\d{6,10}$/.test(token);
  if (!valid) { email = ''; token = ''; }

  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    var open = $('lp-open');
    var confirm = $('lp-confirm');
    var here = $('lp-here');
    var busy = false, finished = false, leftPage = false, openTimer;
    var fill = function (text) { return text.replace('{email}', email); };
    open.textContent = t.open;
    confirm.textContent = t.confirm;
    here.textContent = t.here;
    function show(title, text, buttons) {
      $('lp-title').textContent = title;
      $('lp-text').textContent = text;
      open.hidden = buttons.indexOf('open') < 0;
      confirm.hidden = buttons.indexOf('confirm') < 0;
      here.hidden = buttons.indexOf('here') < 0;
      confirm.disabled = busy;
      confirm.textContent = busy ? t.busy : t.confirm;
    }
    function forget() {
      token = ''; email = ''; finished = true;
      open.removeAttribute('href');
      clearTimeout(openTimer);
    }
    window.addEventListener('pagehide', function () { leftPage = true; forget(); });
    // Browsers may restore a page from their back-forward cache. Never revive
    // a discarded code or leave apparently active controls on that page.
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) show(t.brokenTitle, t.brokenText, []);
    });
    if (!valid) return show(t.brokenTitle, t.brokenText, []);
    open.href = APP_LINK + '?type=' + type + '&email=' + encodeURIComponent(email) + '&token=' + token;

    function request(endpoint, headers, body) {
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 10000);
      return fetch(AUTH + endpoint, {
        method: 'POST', headers: headers, body: body,
        credentials: 'omit', cache: 'no-store', redirect: 'error',
        referrerPolicy: 'no-referrer', signal: controller.signal
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, status: res.status, body: data };
        });
      }).finally(function () { clearTimeout(timeout); });
    }
    function confirmHere() {
      if (busy || finished || type !== 'signup' || !token) return;
      busy = true;
      show(t.confirmTitle, t.busy, ['confirm']);
      request('/verify', { apikey: KEY, 'Content-Type': 'application/json' },
        JSON.stringify({ type: 'signup', email: email, token: token }))
      .then(function (res) {
        if (res.ok) {
          var doneText = fill(t.doneText);
          forget();
          var accessToken = res.body && res.body.access_token;
          // Discard refresh tokens and user data immediately. Do not store
          // them, put them in a URL, or log the response on failure.
          res.body = null;
          var logout = accessToken ? request('/logout?scope=local',
            { apikey: KEY, Authorization: 'Bearer ' + accessToken }).catch(function () {}) : Promise.resolve();
          accessToken = '';
          return logout.then(function () {
            if (!leftPage) show(t.doneTitle, doneText, []);
          });
        }
        // A pending request may finish after a back-forward cache restore.
        // Keep its discarded UI, but still clean up successful sessions above.
        if (leftPage) return;
        if (res.status === 403 || res.status === 422 || (res.body && res.body.code === 'otp_expired')) {
          forget();
          show(t.expiredTitle, t.expiredText, []);
        } else {
          busy = false;
          show(t.confirmTitle, t.failedText, ['confirm']);
        }
      }).catch(function () {
        if (!finished) { busy = false; show(t.confirmTitle, t.failedText, ['confirm']); }
      });
    }
    confirm.addEventListener('click', confirmHere);
    here.addEventListener('click', function () {
      if (!finished) show(t.confirmTitle, fill(t.confirmText), ['confirm']);
    });
    var phone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (phone) {
      show(t.opening, t.openHint, type === 'signup' ? ['open', 'here'] : ['open']);
      openTimer = setTimeout(function () {
        if (!finished && !open.hidden) location.href = open.href;
      }, 300);
    } else if (type === 'signup') {
      show(t.confirmTitle, fill(t.confirmText), ['confirm']);
    } else {
      show(t.resetTitle, t.resetText, []);
    }
  }, { once: true });
})();
