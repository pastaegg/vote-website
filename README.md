# votebettertogether.com

The website for **Vote: Better Together**: a homepage plus the Privacy Policy, Terms of Use, Support and Delete account pages, served by GitHub Pages.

| Page | URL | Used for |
| --- | --- | --- |
| Home | https://votebettertogether.com/ | App homepage (Google OAuth consent screen, store listings) |
| Privacy Policy | https://votebettertogether.com/privacy/ | App Store Connect, Google Play Console, Google OAuth |
| Terms of Use | https://votebettertogether.com/terms/ | App Store (EULA link for subscriptions), Google OAuth |
| Support | https://votebettertogether.com/support/ | App Store "Support URL" |
| Delete account | https://votebettertogether.com/delete-account/ | Google Play "Delete account URL" (Data safety) |
| Email link | https://votebettertogether.com/auth/confirm/ | Where the app's sign-up and password-reset emails link (not indexed) |

## Editing

The pages are static HTML, but they're generated: edit `src/` or `scripts/build.mjs`, then run the build. Don't edit the generated `*.html` files directly.

```sh
node scripts/build.mjs                          # rebuild from src/
node scripts/build.mjs ../vote-bettertogether-rn  # also pull the latest legal text from the app first
```

The Privacy Policy, Terms and Support text comes from the app's canonical legal file (`www/app/i18n/legal/en.js`, copied here as `src/legal-en.js`), so the website and the app always say the same thing. Whenever that file changes in the app, run the second command and commit.

- `src/home.html`: homepage body
- `src/delete-account.html`: delete account page body
- `src/email-link.js`, `src/email-link.json`: the email link page's script and its words in the app's 13 languages
- `scripts/build.mjs`: layout, website-only legal sections, sitemap, manifest
- `assets/site.css`: styles; fonts are the app's Fraunces and Inter (SIL OFL, `assets/fonts/OFL.txt`)
- `assets/email/`: images the app's emails load (the logo, `vote-icon-144.png`)

No cookies, analytics or trackers. One page has JavaScript: the email link
page (`auth/confirm/`). The app's emails (the app repo's `supabase/templates`)
link there with the address and a one-time code after `#`, which never
reaches this server. On a phone it opens the app
(`vote-rn://login-callback?…`, where the app confirms the email and signs
in); on a computer it can confirm a sign-up there, with one request to
Vote's sign-in service (Supabase Auth) and nothing kept. The script is
inline and pinned by its hash in the page's Content-Security-Policy, which
allows no other request. The app repo's deploy checks this page and the
logo are published before it points the emails here, so publish this site
first.
