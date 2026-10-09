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

The legal text originated in the app's canonical legal file (`www/app/i18n/legal/en.js`, copied here as `src/legal-en.js`). The website copy now contains the factual corrections described below. Importing the app's master replaces that copy: review the complete legal diff, retain verified website corrections, and obtain legal review for changes to obligations before committing. Do not copy website edits back into the mobile app.

- `src/home.html`: homepage body
- `src/legal-en.js`: reviewed website copy of the English legal drafts, including deletion instructions
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

## Website review, 2026-10-08

Reviewed website `main` at `4cc0573e96eef7317ec4f2acfb68fc3b91f9bf76` and
native app `react-native-migration` at `3390bb90b190f97c51d7a4b7ad13adca29660a1f`.
The current app is in `mobile/`, not the retired Capacitor screens. Native
screens, eligibility rules, plan gates, English words, the account deletion
handler and relevant backend source were inspected. No mobile or backend
change was made, and deployed database state was not inspected.

Implemented:

- About section with the public brand, VOTEBT operator, founder, Toronto,
  founding year, official LinkedIn links and support address. Organization
  microdata describes these facts without adding executable JavaScript.
- Shared footer and navigation expose About, both legal policies, support,
  deletion, email and both LinkedIn profiles. Only the two exact official
  LinkedIn URLs are allowed as external navigation by the security gate.
  External resources and API permissions remain restricted.
- Product copy explains voting-only participation, Discover eligibility,
  mutual likes, two accepted introduction decisions and chat permissions.
  Community results are opinions, never compatibility scores. The current
  native reveal uses qualitative bands; the website makes no claim about
  second-round comparisons or friendship features. Proposals and following
  are qualified by availability and member permissions.
- Unsupported absolute security claims and release/pricing assumptions were
  removed from marketing. The concept illustration is identified as such,
  and no longer shows distances to community readers.
- Increased muted-text contrast, navigation/footer touch targets, wrapping,
  keyboard skip-link focus, reduced-motion support, social preview metadata
  and the error page's heading/indexing. Existing canonical URLs, sitemap,
  robots, icons, local fonts and brand palette were retained.

Files: `src/home.html` contains product/About copy; `assets/site.css` contains
responsive/accessibility adjustments; `scripts/build.mjs` generates the shared
layout and metadata; `src/legal-en.js` contains the factual corrections below;
`scripts/security-policy.mjs` and its tests enforce the narrow link exception;
`tests/site-content.test.mjs` checks routes, fragments, assets, metadata and
operator links. Generated HTML is committed for the existing publication flow.

### Legal changes and review boundaries

The original legal documents are explicitly described as **unreviewed drafts**
in the app's source and `docs/LEGAL.md`. The website's source version
`2026-10-14` is later than this review date; the app's newer master is
`2026-10-18`. These are source identifiers, not verified effective dates.
They were not silently replaced or presented as legal approval.

Corrections in the website copy address the obsolete community opt-in menu,
helper/pause behaviour, community result presentation, connection consent,
availability of following, and harmful-language checks. Deletion wording now
describes successful completion rather than promising instantaneous deletion;
the source handler performs several operations and can fail partway through.
Hash and location wording no longer promises impossible re-identification.
Routing and fraud-prevention details were replaced with descriptions of the
data processed and its purpose. This requires review alongside the app's
canonical notices before public launch.

Legal bases, consumer rights, governing law, subscription conditions, response
deadlines and retention periods were preserved and compared with the original.
Preservation is not verification. Counsel and the operator must confirm:

- Final effective/version dates and the coordinated app/site legal revision.
- International transfer contracts, jurisdiction-specific notices and the
  appointed privacy contact's responsibilities; no compliance certification
  or legal review has been asserted by this change.
- Backup expiry, retention jobs, open-report/legal-hold exceptions and the
  30-day email deletion undertaking against actual operations. Source review
  cannot prove deployed schedules or the hosting provider's retention.
- That support mail receives messages and deletion requests are handled.
  No email was sent and mailbox delivery was not verified.

### Screenshots and languages

Neither repository contained approved product screenshots. The native image
assets are app/launch icons, not screen captures. To replace the preserved
concept illustration, provide approved captures of the current native build:
Vote before/after a read; Discover; Connections with a consented introduction
or mutual match; and the helper participation flow. Use consenting test
profiles, no private conversations, and specify build, language and platform.

Public website documents are English. `/auth/confirm/` retains all 13 existing
language dictionaries and Arabic RTL handling. No new legal translation or
language route was created; no full multilingual website coverage is claimed.

### Verification and limits

Executed locally with Node 24: build, security gate, all four test files,
`node --test --test-isolation=none tests/*.test.mjs` (90 assertions passed),
artifact staging (34 allowlisted files), internal route/fragment/asset checks,
diff whitespace review, selected added-line secret patterns and a comparison
of the unchanged auth script, 13 auth dictionaries, Apple association files,
CNAME, deployment workflows and email logo. The revised muted text has
6.76:1 or better contrast against the four solid site backgrounds.

The connected GitHub API reported `main` protected and the latest verified
Pages deployment and security workflows successful. Four open Dependabot PRs
were left untouched. Pages settings (including HTTPS enforcement and the
publication source), DNS, live response headers, public store listings and
external link availability could not be verified here: shell networking
required an unavailable grant, and the web fetch could not access the domain.
Chromium launch was blocked by the sandbox (`setsockopt: Operation not
permitted`). Desktop/mobile rendering, screen reader behaviour and live
LCP/CLS/interaction timings remain to be checked before release.

No production deployment or merge is part of this review. Before launch,
review the PR, resolve the legal items, check HTTPS/support links on the live
domain and test rendering at 320, 375, 390, 430, 768 and 1440 CSS pixels.
