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
  sw.js        offline cache
  manifest.webmanifest
  icons/
test/          node:test suite for core.js
scripts/       build-icons.mjs, renders the PNG icons from icons/icon.svg
```

## Working on it

```bash
node --test apps/hearth/test/*.test.mjs      # logic tests
python3 -m http.server -d apps/hearth/site 8080   # then open http://localhost:8080/
node apps/hearth/scripts/build-icons.mjs     # after editing icons/icon.svg
```

Every path in the app is relative (`./`), so it works from any folder name.

**Service worker:** files are served from cache and refreshed in the background, so an edit shows up on the second launch after deploying. When you **add or remove** a file, list it in `ASSETS` in `sw.js` and bump `VERSION`.

## Data

The state is `{ version: 1, goalHours, meals: [{ at }] }`, where `at` is epoch milliseconds. The export adds each meal's local ISO time with its offset (`2026-09-17T20:42:00-05:00`) so it can be read by a person. Importing merges by timestamp and never deletes. If the stored JSON can't be read, a copy is parked under `hearth.v1.unreadable.<timestamp>` before starting fresh.

On iPhone, add it to the Home Screen. Safari may clear the storage of sites that go unused for a while, and installed web apps are exempt from that.
