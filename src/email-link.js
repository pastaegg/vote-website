/* The email link page (auth/confirm/). Vote's sign-up and password-reset
   emails link here with #type=signup|recovery&email=…&token=…&lang=… (the
   address and the one-time code). On a phone this hands the link to the
   app (vote-rn://login-callback, which confirms and signs in); on a
   computer a sign-up link can be confirmed here, and the person signs in
   on their phone. A reset always finishes in the app.

   The code is taken out of the address bar at once and goes only to the
   app or to Vote's sign-in service (Supabase Auth): nothing is stored, no
   cookie, nothing else is loaded. The session Supabase answers a
   confirmation with isn't wanted here and is ended straight away. */
(function () {
  'use strict';
  var STRINGS = __STRINGS__;
  var APP_LINK = 'vote-rn://login-callback';
  var AUTH = 'https://usuyyubmjwayrliadrax.supabase.co/auth/v1';
  var KEY = 'sb_publishable_SdJ_AsnJPiNjBOEczW62bg_m4fAaWZ_';

  var $ = function (id) { return document.getElementById(id); };
  var raw = (location.hash || '').replace(/^#/, '') || (location.search || '').replace(/^\?/, '');
  var params = new URLSearchParams(raw);
  if (raw && window.history && history.replaceState) history.replaceState(null, '', location.pathname);

  /* The language the email was written in, else the browser's, else English. */
  function pick(tags) {
    for (var i = 0; i < tags.length; i++) {
      var tag = String(tags[i] || '');
      if (!tag) continue;
      if (STRINGS[tag]) return tag;
      var lower = tag.toLowerCase();
      if (/^zh-(hant|tw|hk|mo)/.test(lower)) return 'zh-Hant';
      if (/^zh/.test(lower)) return 'zh-Hans';
      var base = lower.split('-')[0];
      if (STRINGS[base]) return base;
    }
    return 'en';
  }
  var lang = pick([params.get('lang')].concat(navigator.languages || [navigator.language]));
  var t = STRINGS[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  var type = params.get('type');
  var email = String(params.get('email') || '').trim().toLowerCase();
  var token = String(params.get('token') || '').trim();
  var fill = function (text) { return text.replace('{email}', email); };

  var open = $('lp-open');
  var confirm = $('lp-confirm');
  var here = $('lp-here');
  open.textContent = t.open;
  confirm.textContent = t.confirm;
  here.textContent = t.here;

  function show(title, text, buttons) {
    $('lp-title').textContent = title;
    $('lp-text').textContent = text;
    open.hidden = buttons.indexOf('open') < 0;
    confirm.hidden = buttons.indexOf('confirm') < 0;
    here.hidden = buttons.indexOf('here') < 0;
    confirm.disabled = false;
    confirm.textContent = t.confirm;
  }

  var valid = (type === 'signup' || type === 'recovery') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && /^\d{6,10}$/.test(token);
  if (!valid) return show(t.brokenTitle, t.brokenText, []);

  open.href = APP_LINK + '?type=' + type + '&email=' + encodeURIComponent(email) + '&token=' + token;

  function confirmHere() {
    confirm.disabled = true;
    confirm.textContent = t.busy;
    fetch(AUTH + '/verify', {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'signup', email: email, token: token })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (res.ok) {
          if (body && body.access_token) {
            fetch(AUTH + '/logout?scope=local', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + body.access_token } }).catch(function () {});
          }
          show(t.doneTitle, fill(t.doneText), []);
        } else if (res.status === 403 || res.status === 422 || (body && body.code === 'otp_expired')) {
          show(t.expiredTitle, t.expiredText, []);
        } else {
          show(t.confirmTitle, t.failedText, ['confirm']);
        }
      });
    }).catch(function () {
      show(t.confirmTitle, t.failedText, ['confirm']);
    });
  }
  confirm.addEventListener('click', confirmHere);
  here.addEventListener('click', function () { show(t.confirmTitle, fill(t.confirmText), ['confirm']); });

  var phone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (phone) {
    show(t.opening, t.openHint, type === 'signup' ? ['open', 'here'] : ['open']);
    // Straight on to the app, as the link in the email meant; the button stays for a second try.
    setTimeout(function () { location.href = open.href; }, 300);
  } else if (type === 'signup') {
    show(t.confirmTitle, fill(t.confirmText), ['confirm']);
  } else {
    show(t.resetTitle, t.resetText, []);
  }
})();
