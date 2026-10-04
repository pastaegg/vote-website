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
- `scripts/stage-site.mjs`: builds `_site/` with only intended public pages and assets

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

## Security checks

After every edit, rebuild and check the security policies and auth behavior:

```sh
node scripts/build.mjs
node scripts/check-security.mjs
node --test tests/*.test.mjs
```

Every generated page has a restrictive CSP and no-referrer policy before
resources load. The only executable script is hash-pinned on `/auth/confirm/`;
its credentials must be in `#`, and its requests are limited to fixed Auth
paths. See [SECURITY.md](SECURITY.md) for verified controls, account settings
still requiring attention, and the response-header limitations of GitHub Pages.

## Verified publication

The optional `Verified Pages deployment` workflow rebuilds, checks generated
files, runs the security gate and tests, then uploads only the public `_site/`
artifact. A failed check prevents its deploy job. Source, tests, workflows and
unlisted assets are excluded; missing required files and symlinks fail staging.
GitHub Actions updates are proposed weekly by Dependabot; security checks also
run weekly on the default branch.

To activate this workflow after merging it into `main`:

1. Open [Settings → Pages](https://github.com/pastaegg/vote-website/settings/pages)
   and set **Build and deployment → Source → GitHub Actions**. This disables the
   independent branch publisher; merely adding the workflow does not disable it.
2. In [Settings → Secrets and variables → Actions → Variables](https://github.com/pastaegg/vote-website/settings/variables/actions),
   add `PAGES_ACTIONS_DEPLOY_ENABLED` with the value `true`.
3. Run **Verified Pages deployment** from the Actions tab, selecting `main`.
   Confirm deployment succeeds and homepage, legal pages and email confirmation
   load correctly. Later pushes to `main` follow the same verified deployment.
4. Protect `main` with a ruleset requiring a pull request and the `checks` status.
   Restrict the `github-pages` environment to `main`; use a maintainer-compatible
   review rule so the owner can still ship fixes.

Until steps 1–3 are completed, the new publisher is inactive and the original
branch publisher may still serve repository source files. Changing publication
does not add HTTP response headers, a WAF or native-app verified links. Those
require the account/hosting work described in `SECURITY.md`.
