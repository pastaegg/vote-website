# votebettertogether.com

The website for **Vote: Better Together**: a homepage plus the Privacy Policy, Terms of Use, Support and Delete account pages, served by GitHub Pages.

| Page | URL | Used for |
| --- | --- | --- |
| Home | https://votebettertogether.com/ | App homepage (Google OAuth consent screen, store listings) |
| Privacy Policy | https://votebettertogether.com/privacy/ | App Store Connect, Google Play Console, Google OAuth |
| Terms of Use | https://votebettertogether.com/terms/ | App Store (EULA link for subscriptions), Google OAuth |
| Support | https://votebettertogether.com/support/ | App Store "Support URL" |
| Delete account | https://votebettertogether.com/delete-account/ | Google Play "Delete account URL" (Data safety) |

## Editing

The pages are static HTML, but they're generated: edit `src/` or `scripts/build.mjs`, then run the build. Don't edit the generated `*.html` files directly.

```sh
node scripts/build.mjs                          # rebuild from src/
node scripts/build.mjs ../vote-bettertogether-rn  # also pull the latest legal text from the app first
```

The Privacy Policy, Terms and Support text comes from the app's canonical legal file (`www/app/i18n/legal/en.js`, copied here as `src/legal-en.js`), so the website and the app always say the same thing. Whenever that file changes in the app, run the second command and commit.

- `src/home.html`: homepage body
- `src/delete-account.html`: delete account page body
- `scripts/build.mjs`: layout, website-only legal sections, sitemap, manifest
- `assets/site.css`: styles; fonts are the app's Fraunces and Inter (SIL OFL, `assets/fonts/OFL.txt`)

No JavaScript, cookies, analytics or external requests.
