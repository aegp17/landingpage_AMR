# Hearth

A cozy intermittent fasting timer. Private and unlisted: it is not linked from the landing page and asks search engines not to index it.

- **Published at:** `https://agentic-amr.com/hearth-ac5490/` (the folder name is set in `.github/workflows/deploy.yml`).
- **Front end only:** plain HTML, CSS and ES modules, no build step and no dependencies. Nothing leaves the device. Meals live in `localStorage` under `hearth.v1`, on the device and browser where they were logged.
- **PWA:** installable, works offline. The service worker's scope is this folder, so it cannot affect the rest of the site.

## Layout

```
site/          published as-is
  index.html
  styles.css
  app.js       DOM, storage, dialogs
  core.js      pure logic (time math, stats, backup format), no DOM
  version.js   build id and date, stamped at deploy
  version.json the same, read by the app to notice a new deploy
  sw.js        offline cache and updates
  manifest.webmanifest
  icons/
test/          node:test suite for core.js
scripts/       stamp-build.mjs (run by the deploy workflow) and build-icons.mjs
```

## Working on it

```bash
node --test apps/hearth/test/*.test.mjs      # logic tests
python3 -m http.server -d apps/hearth/site 8080   # then open http://localhost:8080/
node apps/hearth/scripts/build-icons.mjs     # after editing icons/icon.svg
```

Every path in the app is relative (`./`), so it works from any folder name.

## Updates

Pushing a change to `main` is enough: installed copies update themselves.

1. The deploy workflow runs `scripts/stamp-build.mjs`, which writes the short commit sha and date into `version.js` and `version.json`. It fails the deploy if the placeholders are missing, because an unstamped app never updates.
2. The app compares its build id with `version.json` (fetched with `no-store`) when it opens, when it comes back to the foreground, and every 30 minutes.
3. On a new id it registers `sw.js?v=<new id>`. Because the URL is new, the browser installs it right away, even though Cloudflare tells browsers to keep `.js` files for 4 hours. The worker downloads every file with `?v=<new id>` and `cache: 'reload'`, which skips both the CDN and the browser cache, and refuses to install if `version.js` isn't the expected build.
4. The new worker takes over and the page reloads itself, waiting for any open dialog to close, then shows "Hearth was updated". The About dialog shows the version.

When you add a file, list it in `ASSETS` in `sw.js`. Running locally the placeholders stay in place, the About dialog says "Development build" and no update check runs. After editing files, reload twice or unregister the worker in DevTools.

## Data

The state is `{ version: 1, goalHours, meals: [{ at }] }`, where `at` is epoch milliseconds. The export adds each meal's local ISO time with its offset (`2026-09-17T20:42:00-05:00`) so it can be read by a person. Importing merges by timestamp and never deletes. If the stored JSON can't be read, a copy is parked under `hearth.v1.unreadable.<timestamp>` before starting fresh.

On iPhone, add it to the Home Screen. Safari may clear the storage of sites that go unused for a while, and installed web apps are exempt from that.
