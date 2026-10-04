# Website security

Scope: the public website in `pastaegg/vote-website`, including the email
confirmation bridge. This does not certify the native app, its database,
Supabase policies, or the owner's accounts.

Report a vulnerability privately to **support@votebettertogether.com**.
Send the affected URL, impact and minimal reproduction. Do not send passwords,
real login codes, private user data or access tokens. Please do not test by
flooding the service or accessing other people's accounts.

## Controls in the published pages

- All 11 HTML entry points, including aliases and the custom 404, apply CSP
  before resources load. Normal pages allow no JavaScript, network API calls,
  forms, workers or embedded content. Images, CSS, fonts and the manifest
  come from this origin only. No `unsafe-inline` or `unsafe-eval`.
- No-referrer policy precedes resources. The CSS is checked with SHA-256
  Subresource Integrity. Inline styles were moved into the local stylesheet.
- The email page permits exactly one inline script by its exact SHA-256 hash.
  Its only allowed API destinations are the fixed Auth verify and logout paths.
  Translations are escaped for safe inclusion in an HTML script element.
- Email credentials must be in the fragment (`#`), never the query (`?`).
  Existing app email templates already use fragments. A query containing a
  code has already reached the server before JavaScript runs; rejecting and
  clearing it cannot undo that earlier disclosure.
- The email script runs before assets, clears credentials from the address bar,
  and rejects malformed, duplicate, unexpected or oversized parameters.
  Unsafe transport, framing and failed history cleanup disable all auth actions.
- Confirmation requires a deliberate button click. Recovery finishes in the
  app. Requests omit cookies, reject redirects, avoid caching/referrers and time
  out after 10 seconds. Duplicate clicks cannot submit concurrent requests.
- Leaving the page discards its credentials. Pending responses cannot revive
  controls after navigation or back-forward restoration; successful pending
  responses still attempt local logout of the newly issued temporary session.
- The website never persists an Auth session. It attempts local logout of the
  temporary session issued for signup confirmation and discards its response.
  Logout revokes refresh tokens; an already-issued access token remains valid
  until its expiry. Logout can fail during a network outage. This website does
  not claim instant access-token revocation.
- The app destination is fixed. Custom URL schemes can be registered by other
  apps; verified Universal Links/App Links need a coordinated native-app change.
  Site-side validation does not solve that platform limitation.
- Published source contains a Supabase **publishable** key, which is intended
  for clients. It is not a privileged secret. API authorization must be enforced
  by Supabase; hiding that key is not an access-control measure.

## Verification and maintenance

```sh
node scripts/build.mjs
node scripts/check-security.mjs
node --test tests/*.test.mjs
```

`Website security` runs the same checks on pushes and pull requests. Its token
has read-only contents permission, checkout does not keep credentials, actions
are pinned to verified full commit hashes, and no third-party npm dependency is
installed. CI also checks that generated pages match their sources.

A passing workflow is not a deployment gate until a repository ruleset requires
it. The existing GitHub Pages branch deployment can still publish a direct
commit. Do not claim CI prevents publication until the account controls below
are configured. The dependency-free build has no package audit to run.

Do not edit generated HTML. Edit `src/`, `assets/site.css` or `scripts/build.mjs`,
then rebuild and run the checks. `scripts/check-security.mjs` fails when the
page policies, script hashes or stylesheet integrity drift. Keep security.txt's
expiry current. Ignore rules reduce accidental secret commits but are not a
secret scanner or a substitute for push protection.

The security gate checks additional HTML outside source/tool directories as well
as the required entry points. It rejects duplicate CSP directives/attributes,
unapproved policy overrides, external or disguised scripts, and policy tags that
follow resources. The gate covers generated site HTML; `src/home.html` is a
template, not a protected page. Branch publication can nevertheless expose it.

The optional `Verified Pages deployment` workflow gives its build job read-only
permissions and its isolated deploy job only Pages/OIDC write permissions.
Checks and tests must pass before a strictly allowlisted `_site/` artifact is
uploaded. Source, tests, workflows and accidental files under `assets/` are not
copied. All required assets must exist and symlinks are rejected. See the
activation steps in [README.md](README.md#verified-publication). This workflow
does not protect publication until Pages is switched to Actions and
`PAGES_ACTIONS_DEPLOY_ENABLED=true` is configured. Restrict deployment to `main`.

## Account and hosting controls still requiring administrative access

The initial live audit on 2026-10-04 UTC observed:

- `http://votebettertogether.com/` returned **200**, not an HTTPS redirect.
- HTTPS worked, but responses did not include CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options or Permissions-Policy response headers.
- The repository rulesets API returned an empty list. Legacy branch protection
  was not verified; an empty ruleset list alone does not prove it is absent.
- Authoritative DNS is operated by GoDaddy (`ns65/66.domaincontrol.com`). No
  DNSSEC delegation (`DS`) or CAA record was returned by the public resolver.
  The GitHub Pages verification TXT name returned NXDOMAIN. A missing TXT does
  not prove a domain was never verified; check the account's verified domains.
- `.git/config` and `.env` returned 404. A scan of the 15 available commits
  found no matches for selected private-key and provider-secret patterns. This
  is a limited pattern scan, not proof the history contains no secrets.

Required follow-through:

1. Repository **Settings → Pages → Enforce HTTPS**. Check that both apex and
   www HTTP URLs redirect through HTTPS with no final HTTP landing page.
2. In the GitHub account's **Settings → Pages**, verify ownership of
   `votebettertogether.com`; copy the account-generated TXT record into DNS.
   Do not invent its verification code.
3. Protect `main`: require a pull request and the `checks` status, block force
   pushes and deletion. Choose a solo-maintainer-compatible rule so publication
   is possible. Check security alerts, secret scanning and push protection in
   the repository's security settings.
4. GitHub and domain-registrar accounts need phishing-resistant MFA/passkeys,
   stored recovery codes, registrar transfer lock and domain auto-renewal.
   These settings were not inspected. Credential entry must be done securely.
5. Enable DNSSEC through the registrar's supported flow when available; assess
   all certificate users before adding CAA restrictions. Do not break mail or
   subdomain certificates by allowing only one issuer without checking them.
6. An edge service or host with response-header control is needed for full
   header protection and customer-configurable WAF/rate limits. GitHub Pages
   does **not** apply a repository `_headers` file. HTML meta tags cannot enforce
   HSTS, X-Frame-Options, `frame-ancestors` or Permissions-Policy.

### Follow-up account audit on 2026-10-04 UTC

The connected GitHub API confirmed `main` has `protected=false` and no active
repository rulesets. The existing security check and branch Pages deployment
both succeeded for commit `a4b3d8f7962a22ef939d010d3ba24194f11451c4`, but were
independent. New workflow files cannot change Pages settings or branch rules by
themselves. Enable the verified publisher and required checks using the linked
repository settings before treating these checks as a publication barrier.

The connected Supabase security advisor for this website's Auth project
(`usuyyubmjwayrliadrax`) reported **leaked password protection disabled**. Enable
it in [Supabase Auth settings](https://supabase.com/dashboard/project/usuyyubmjwayrliadrax/auth/settings)
if supported by the project's plan; consult [password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
This is a live Auth configuration change, not something an HTML policy can fix.

The same advisor reported 51 RLS-enabled tables without policies and 123
authenticated-callable `SECURITY DEFINER` functions. RLS without policies denies
ordinary row access; it does not by itself imply a data leak. Intentional RPC
access must instead enforce ownership/admin authorization within each function.
An advisor warning alone is not proof of unauthorized access, and indiscriminate
policy creation or revocation can expose data or break the app. A full native
app/database authorization audit is separate from this website change.

Direct live HTTP/header checks could not be repeated from this execution
workspace because its network proxy was unreachable. The earlier HTTP/DNS
observations above are historical findings, not fresh verification of the
deployed site. No production database or account setting was changed here.

For a future header-capable host/edge, use the **same per-page CSP** as the
built HTML, and additionally set the following response headers:

```http
Content-Security-Policy: <the page's policy>; frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

Set `Cache-Control: no-store` specifically on `/auth/confirm/` and its index
alias. Introduce HSTS only after every affected hostname is HTTPS-ready. Start
with a short max-age; do not add `includeSubDomains` or submit for preload until
all subdomains have been checked. Preserve public cross-origin loading of
`assets/email/vote-icon-144.png`: email clients use that logo.

No stress/DoS test, credential guessing, user-data extraction, full TLS-version
scan, mobile binary audit or live account mutation was performed by this code
change. The static pages have no server-side SQL or file-upload handler; that
reduces exposure but does not make the product invulnerable.

## References

- [GitHub Pages HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [GitHub Pages domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
- [MDN frame-ancestors: header only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors)
- [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use)
- [Supabase sign-out limits](https://supabase.com/docs/reference/javascript/auth-signout)
