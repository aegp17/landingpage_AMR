# Hearth

A cozy intermittent fasting timer, with a calorie tab. Private and unlisted: it is not linked from the landing page and asks search engines not to index it.

- **Published at:** `https://agentic-amr.com/hearth-ac5490/` (the folder name is set in `.github/workflows/deploy.yml`).
- **Front end only:** plain HTML, CSS and ES modules, no build step and no dependencies. Nothing leaves the device. Meals live in `localStorage` under `hearth.v1`, on the device and browser where they were logged.
- **PWA:** installable, works offline. The service worker's scope is this folder, so it cannot affect the rest of the site.

## Layout

```
site/          published as-is
  index.html
  styles.css
  app.js       the Fasting tab, the tab bar, settings and updates
  core.js      pure logic for fasting (time math, stats, backup format), no DOM
  calories.js  the Calories tab: its own screen and its own storage key
  nutrition.js pure logic for calories (BMR, targets, day budget), no DOM
  ui.js        the toast and the dialog helpers, shared by both tabs
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
node --test apps/hearth/test/*.test.mjs           # logic tests
node apps/hearth/test/browser/app.mjs             # flows in a real browser
node apps/hearth/test/browser/update.mjs          # a deploy landing on an open app
node apps/hearth/test/browser/reminders.mjs       # the alarm and the calendar file
node apps/hearth/test/browser/calories.mjs        # the calorie tab, and the two tabs apart
python3 -m http.server -d apps/hearth/site 8080   # then open http://localhost:8080/
node apps/hearth/scripts/build-icons.mjs          # after editing icons/icon.svg
```

The browser suites drive Chromium through the Playwright install already on the machine (`PLAYWRIGHT_CORE` and `CHROMIUM` override the paths). Each one serves its own copy of the app on a random port and deletes it afterwards.

Every path in the app is relative (`./`), so it works from any folder name.

## The two tabs

They share the page, the backup and nothing else. Fasting keeps its state under `hearth.v1`, Calories under `hearth.calories.v1`, and each module owns its own DOM. The last tab you used is remembered in `hearth.tab`.

**Calories.** You fill in sex, age, height, weight and how active you are; `nutrition.js` estimates what you burn in a day with Mifflin-St Jeor times an activity factor, subtracts the deficit your weekly goal implies (1 kg a week = 7,700 kcal = 1,100 kcal a day), and suggests a daily target. You can override it with your own number. Food spends the day's budget, exercise gives it back, and days roll over on the local calendar.

Two rules the code keeps: the suggested target never goes below 1,200 kcal for women or 1,500 for men — it clamps and says so — and the dialog states in small print that these are estimates, not medical advice.

## Reminders

Two separate things, because the web has no way to wake a closed app:

- **The alarm** (`Alert me at my goal` in Settings → Reminders) is a system notification. It needs the browser's notification permission, and fires while Hearth is open or in the background, on a tick of the same one-second loop that drives the clock — no long `setTimeout` to be throttled. `notifiedFor` in the stored state holds the meal it already alarmed for, so it fires once per fast, survives a reload, and never goes off retroactively when you switch it on after the goal.
- **The calendar event** (`Add this goal to my calendar`) hands the phone an `.ics` with a `VALARM` at the goal. That one rings with Hearth closed, and it is the only option on iOS.

Anything better (a push notification to a closed app) needs a server to send it, which this app does not have.

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
