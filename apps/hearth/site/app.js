import {
  GOALS,
  HOUR,
  addMeal,
  buildIcs,
  computeStats,
  dayKey,
  dayLabel,
  defaultState,
  formatBuild,
  formatClock,
  formatDuration,
  formatTime,
  goalNotification,
  goalReachedAt,
  greetingFor,
  hasMealInMinute,
  historyGroups,
  icsFileName,
  lastMealAt,
  markNotified,
  mergeMeals,
  normalizeState,
  parseBackup,
  parseLocalInputValue,
  progress,
  removeMeal,
  setGoal,
  setReminder,
  shouldNotifyGoal,
  stageFor,
  toBackup,
  toLocalInputValue,
} from './core.js'
import { BUILD } from './version.js'

const STORAGE_KEY = 'hearth.v1'
const HISTORY_PAGE = 30
const DOUBLE_TAP_MS = 5000
const TOAST_MS = 6000
const SVG_NS = 'http://www.w3.org/2000/svg'

const $ = (id) => document.getElementById(id)

const el = {
  hero: document.querySelector('.hero'),
  greeting: $('greeting'),
  banner: $('storageBanner'),
  ringFill: $('ringFill'),
  clock: $('clock'),
  clockMain: $('clockMain'),
  clockSec: $('clockSec'),
  clockLabel: $('clockLabel'),
  stage: $('stage'),
  since: $('since'),
  goalBtn: $('goalBtn'),
  eatBtn: $('eatBtn'),
  earlierBtn: $('earlierBtn'),
  statLongest: $('statLongest'),
  statAverage: $('statAverage'),
  statCount: $('statCount'),
  history: $('history'),
  historyEmpty: $('historyEmpty'),
  moreBtn: $('moreBtn'),
  toast: $('toast'),
  toastText: $('toastText'),
  toastAction: $('toastAction'),
  earlierDialog: $('earlierDialog'),
  earlierForm: $('earlierForm'),
  earlierInput: $('earlierInput'),
  earlierError: $('earlierError'),
  goalDialog: $('goalDialog'),
  goalGrid: $('goalGrid'),
  settingsBtn: $('settingsBtn'),
  settingsDialog: $('settingsDialog'),
  settingsSummary: $('settingsSummary'),
  exportBtn: $('exportBtn'),
  importInput: $('importInput'),
  clearBtn: $('clearBtn'),
  remindersRow: $('remindersRow'),
  remindersDialog: $('remindersDialog'),
  remindToggle: $('remindToggle'),
  remindStatus: $('remindStatus'),
  calendarBtn: $('calendarBtn'),
  calendarHint: $('calendarHint'),
  aboutBtn: $('aboutBtn'),
  aboutRow: $('aboutRow'),
  aboutDialog: $('aboutDialog'),
  aboutVersion: $('aboutVersion'),
}

let state = defaultState()
let historyLimit = HISTORY_PAGE
let lastMinute = -1
let tickTimer = 0

// ---------------------------------------------------------------- storage

function load() {
  let raw
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    setStorageOk(false)
    return
  }
  if (raw == null) {
    state = defaultState()
    return
  }
  try {
    state = normalizeState(JSON.parse(raw))
  } catch {
    // Never silently overwrite a log we can't read: park a copy first.
    try {
      localStorage.setItem(`${STORAGE_KEY}.unreadable.${Date.now()}`, raw)
    } catch {
      /* nothing else we can do */
    }
    state = defaultState()
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    setStorageOk(true)
  } catch {
    setStorageOk(false)
  }
}

function setStorageOk(ok) {
  el.banner.hidden = ok
}

async function askForPersistentStorage() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    /* best effort */
  }
}

function update(nextState) {
  state = nextState
  save()
  render()
}

// ---------------------------------------------------------------- rendering

function render() {
  const now = Date.now()
  lastMinute = Math.floor(now / 60000)
  renderLive(now)
  renderSlow(now)
}

// Runs every second: the clock, the ring and the goal chip.
function renderLive(now) {
  const last = lastMealAt(state.meals, now)
  const goalLabel = `Goal ${state.goalHours}h`

  if (last == null) {
    el.hero.classList.add('idle')
    el.hero.classList.remove('done')
    el.clockMain.textContent = 'Ready when you are'
    el.clockSec.textContent = ''
    el.clockLabel.textContent = ''
    el.clock.removeAttribute('aria-label')
    el.stage.textContent = 'Tap “I ate” after your last meal.'
    el.goalBtn.textContent = goalLabel
    el.ringFill.style.strokeDashoffset = '100'
    document.title = 'Hearth'
    return
  }

  const elapsed = now - last
  const fraction = progress(elapsed, state.goalHours)
  const clock = formatClock(elapsed)
  el.hero.classList.remove('idle')
  el.hero.classList.toggle('done', fraction >= 1)
  el.clockMain.textContent = clock.main
  el.clockSec.textContent = clock.seconds
  el.clockLabel.textContent = 'hours fasted'
  el.clock.setAttribute('aria-label', `${formatDuration(elapsed)} fasted`)
  el.stage.textContent = stageFor(fraction)
  el.ringFill.style.strokeDashoffset = String(100 - Math.min(fraction, 1) * 100)

  const goalMs = state.goalHours * HOUR
  el.goalBtn.textContent =
    elapsed >= goalMs
      ? `${goalLabel} · reached, +${formatDuration(elapsed - goalMs)}`
      : `${goalLabel} · ${formatDuration(goalMs - elapsed)} to go`
  document.title = `${formatDuration(elapsed)} · Hearth`
}

// Runs on changes and once a minute: things that depend on the calendar.
function renderSlow(now) {
  el.greeting.textContent = greetingFor(new Date(now))

  const last = lastMealAt(state.meals, now)
  el.since.hidden = last == null
  if (last != null) el.since.textContent = `Last meal · ${dayLabel(last, now)} at ${formatTime(last)}`

  const stats = computeStats(state.meals, now)
  el.statLongest.textContent = stats.mealCount ? formatDuration(stats.longestMs) : '–'
  el.statAverage.textContent = stats.averageMs == null ? '–' : formatDuration(stats.averageMs)
  el.statCount.textContent = String(stats.mealCount)

  renderHistory(now)
}

function renderHistory(now) {
  const groups = historyGroups(state.meals, now, historyLimit)
  const goalMs = state.goalHours * HOUR
  const fragment = document.createDocumentFragment()

  for (const group of groups) {
    const day = document.createElement('div')
    day.className = 'day'
    const label = document.createElement('p')
    label.className = 'day-label'
    label.textContent = group.label
    day.append(label)

    for (const item of group.items) {
      const row = document.createElement('div')
      row.className = 'meal'

      const dot = document.createElement('span')
      dot.className = 'meal-dot'
      if (item.gapMs != null && item.gapMs >= goalMs) dot.classList.add('reached')

      const text = document.createElement('div')
      text.className = 'meal-text'
      const time = document.createElement('p')
      time.className = 'meal-time'
      time.textContent = formatTime(item.at)
      const gap = document.createElement('p')
      gap.className = 'meal-gap'
      gap.textContent = item.gapMs == null ? 'First meal logged' : `after a ${formatDuration(item.gapMs)} fast`
      text.append(time, gap)

      const del = document.createElement('button')
      del.type = 'button'
      del.className = 'meal-delete'
      del.setAttribute('aria-label', `Delete meal from ${group.label} at ${formatTime(item.at)}`)
      del.append(crossIcon())
      del.addEventListener('click', () => deleteMeal(item.at))

      row.append(dot, text, del)
      day.append(row)
    }
    fragment.append(day)
  }

  el.history.replaceChildren(fragment)
  el.historyEmpty.hidden = state.meals.length > 0
  el.moreBtn.hidden = state.meals.length <= historyLimit
}

function crossIcon() {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute('d', 'M7 7l10 10M17 7L7 17')
  svg.append(path)
  return svg
}

function tick() {
  const now = Date.now()
  renderLive(now)
  if (shouldNotifyGoal(state, now)) fireGoalAlarm(now)
  const minute = Math.floor(now / 60000)
  if (minute !== lastMinute) {
    lastMinute = minute
    renderSlow(now)
  }
  clearTimeout(tickTimer)
  tickTimer = setTimeout(tick, 1000 - (now % 1000) + 10)
}

// ---------------------------------------------------------------- reminders
//
// The alarm is a system notification, so it also arrives while Hearth sits in
// the background. Nothing can wake a closed web app, which is what the calendar
// event is for: the phone owns that alarm.

const canNotify = 'Notification' in window && 'serviceWorker' in navigator
const permission = () => (canNotify ? Notification.permission : 'unsupported')

async function fireGoalAlarm(now) {
  const last = lastMealAt(state.meals, now)
  // Mark it first: whatever happens next, the alarm never repeats for this meal.
  update(markNotified(state, last))
  const { title, body } = goalNotification(state)
  toast(title + '.')
  navigator.vibrate?.([120, 60, 120])
  if (permission() !== 'granted') return
  try {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, {
      body,
      tag: 'hearth-goal',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      data: { url: location.href },
    })
  } catch {
    /* the in-app toast already told them */
  }
}

function renderReminders() {
  const now = Date.now()
  const perm = permission()
  const on = state.remindAtGoal && perm === 'granted'
  el.remindToggle.setAttribute('aria-checked', String(on))
  el.remindStatus.textContent =
    perm === 'unsupported'
      ? "This browser can't show notifications. Use the calendar below."
      : perm === 'denied'
        ? 'Blocked. Allow notifications for this site in your browser settings.'
        : on
          ? 'On. Alerts while Hearth is open or in the background.'
          : 'Off. Tap to turn the alarm on.'

  const reachedAt = goalReachedAt(state, now)
  const running = reachedAt != null && reachedAt > now
  el.calendarBtn.disabled = !running
  el.calendarHint.textContent =
    reachedAt == null
      ? 'Tap “I ate” first — a calendar alarm needs a fast in progress.'
      : running
        ? `Alarm at ${formatTime(reachedAt)}, ${dayLabel(reachedAt, now).toLowerCase()}. It rings even with Hearth closed.`
        : 'You already reached this goal.'
}

el.remindersRow.addEventListener('click', () => {
  closeDialog(el.settingsDialog)
  renderReminders()
  openDialog(el.remindersDialog)
})

el.remindToggle.addEventListener('click', async () => {
  if (state.remindAtGoal) {
    update(setReminder(state, false))
    renderReminders()
    return
  }
  if (!canNotify) {
    toast("This browser can't show notifications.")
    return
  }
  let granted = Notification.permission === 'granted'
  if (!granted && Notification.permission !== 'denied') {
    try {
      granted = (await Notification.requestPermission()) === 'granted'
    } catch {
      granted = false
    }
  }
  if (!granted) {
    renderReminders()
    toast(
      Notification.permission === 'denied'
        ? 'Notifications are blocked for this site. Allow them in your browser settings.'
        : 'Allow notifications to hear the alarm.',
    )
    return
  }
  let next = setReminder(state, true)
  // Turning it on mid-fast that already passed the goal must not alarm at once.
  const now = Date.now()
  if (shouldNotifyGoal(next, now)) next = markNotified(next, lastMealAt(next.meals, now))
  update(next)
  renderReminders()
  toast(`Alarm on. You'll hear it at ${state.goalHours}h.`)
})

el.calendarBtn.addEventListener('click', async () => {
  const now = Date.now()
  if (goalReachedAt(state, now) == null) return
  const name = icsFileName(state, now)
  const file = new File([buildIcs(state, now)], name, { type: 'text/calendar' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Fasting goal' })
      return
    }
  } catch (error) {
    if (error?.name === 'AbortError') return
  }
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
  toast('Open the file to add the alarm to your calendar.')
})

// ---------------------------------------------------------------- toast

let toastTimer = 0
let toastHandler = null

function toast(message, actionLabel, onAction) {
  clearTimeout(toastTimer)
  el.toastText.textContent = message
  toastHandler = onAction || null
  el.toastAction.hidden = !onAction
  if (actionLabel) el.toastAction.textContent = actionLabel
  el.toast.classList.add('show')
  toastTimer = setTimeout(hideToast, TOAST_MS)
}

function hideToast() {
  el.toast.classList.remove('show')
  toastHandler = null
}

el.toastAction.addEventListener('click', () => {
  const handler = toastHandler
  hideToast()
  if (handler) handler()
})

// ---------------------------------------------------------------- actions

function logMealNow() {
  const now = Date.now()
  const last = lastMealAt(state.meals, now)
  if (last != null && now - last < DOUBLE_TAP_MS) {
    toast('Already logged. Enjoy your meal.')
    return
  }
  update(addMeal(state, now))
  askForPersistentStorage()
  navigator.vibrate?.(15)

  el.eatBtn.classList.remove('pop')
  void el.eatBtn.offsetWidth // restart the animation
  el.eatBtn.classList.add('pop')

  const message =
    last == null
      ? `Logged at ${formatTime(now)}. The clock is running.`
      : `Logged at ${formatTime(now)} after a ${formatDuration(now - last)} fast.`
  toast(message, 'Undo', () => update(removeMeal(state, now)))
}

function deleteMeal(at) {
  update(removeMeal(state, at))
  toast(`Removed the ${formatTime(at)} meal.`, 'Undo', () => update(addMeal(state, at)))
}

// ---------------------------------------------------------------- dialogs

function openDialog(dialog) {
  if (typeof dialog.showModal === 'function') dialog.showModal()
  else dialog.setAttribute('open', '')
}

function closeDialog(dialog) {
  if (typeof dialog.close === 'function') dialog.close()
  else dialog.removeAttribute('open')
  applyPendingUpdate()
}

for (const dialog of document.querySelectorAll('dialog')) {
  // Escape closes a dialog without going through closeDialog.
  dialog.addEventListener('close', applyPendingUpdate)
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-close]')) return closeDialog(dialog)
    // A click on the backdrop lands on the <dialog> itself, outside its box.
    if (event.target !== dialog) return
    const r = dialog.getBoundingClientRect()
    const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom
    if (!inside) closeDialog(dialog)
  })
}

// Earlier meal

el.earlierBtn.addEventListener('click', () => {
  const now = Date.now()
  el.earlierInput.max = toLocalInputValue(now)
  el.earlierInput.value = toLocalInputValue(now - HOUR)
  el.earlierError.textContent = ''
  openDialog(el.earlierDialog)
})

el.earlierForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const at = parseLocalInputValue(el.earlierInput.value)
  const now = Date.now()
  let error = ''
  if (at == null) error = 'Pick a date and a time.'
  else if (at > now) error = "That's still in the future."
  else if (hasMealInMinute(state.meals, at)) error = 'You already logged a meal at that minute.'
  if (error) {
    el.earlierError.textContent = error
    return
  }
  closeDialog(el.earlierDialog)
  update(addMeal(state, at))
  askForPersistentStorage()
  const day = dayLabel(at, now)
  const when = day === 'Today' || day === 'Yesterday' ? day.toLowerCase() : day
  toast(`Added a meal from ${when} at ${formatTime(at)}.`, 'Undo', () => update(removeMeal(state, at)))
})

// Goal

function renderGoalOptions() {
  const buttons = GOALS.map((hours) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'goal-option'
    button.setAttribute('role', 'radio')
    button.setAttribute('aria-checked', String(hours === state.goalHours))
    button.dataset.hours = String(hours)
    const eatingWindow = document.createElement('small')
    eatingWindow.textContent = `${hours}:${24 - hours}`
    button.append(`${hours}h`, eatingWindow)
    button.addEventListener('click', () => {
      update(setGoal(state, hours))
      renderGoalOptions()
    })
    return button
  })
  el.goalGrid.replaceChildren(...buttons)
}

el.goalBtn.addEventListener('click', () => {
  renderGoalOptions()
  openDialog(el.goalDialog)
})

// About

function openAbout() {
  el.aboutVersion.textContent = formatBuild(BUILD)
  openDialog(el.aboutDialog)
}

el.aboutBtn.addEventListener('click', openAbout)
el.aboutRow.addEventListener('click', () => {
  closeDialog(el.settingsDialog)
  openAbout()
})

// Settings and backup

let clearArmedTimer = 0

function disarmClear() {
  clearTimeout(clearArmedTimer)
  el.clearBtn.classList.remove('armed')
  el.clearBtn.querySelector('strong').textContent = 'Erase everything'
}

el.settingsBtn.addEventListener('click', () => {
  const count = state.meals.length
  el.settingsSummary.textContent =
    count === 0
      ? 'Nothing logged yet. Everything you log stays in this browser, on this device.'
      : `${count} ${count === 1 ? 'meal' : 'meals'} since ${dayLabel(state.meals[0].at, Date.now())}. They live only in this browser, so export a backup now and then.`
  disarmClear()
  openDialog(el.settingsDialog)
})

el.exportBtn.addEventListener('click', async () => {
  const now = Date.now()
  const json = JSON.stringify(toBackup(state, now), null, 2)
  const name = `hearth-backup-${dayKey(now)}.json`
  const file = new File([json], name, { type: 'application/json' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Hearth backup' })
      return
    }
  } catch (error) {
    if (error?.name === 'AbortError') return
    // Fall through to a regular download.
  }
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
  toast(`Saved ${name}.`)
})

el.importInput.addEventListener('change', async () => {
  const file = el.importInput.files?.[0]
  el.importInput.value = ''
  if (!file) return
  try {
    const imported = parseBackup(await file.text())
    const { state: merged, added } = mergeMeals(state, imported)
    update(merged)
    closeDialog(el.settingsDialog)
    toast(added === 0 ? 'Those meals were already here.' : `Imported ${added} ${added === 1 ? 'meal' : 'meals'}.`)
  } catch (error) {
    toast(error instanceof Error ? error.message : "Couldn't read that file.")
  }
})

el.clearBtn.addEventListener('click', () => {
  if (!el.clearBtn.classList.contains('armed')) {
    el.clearBtn.classList.add('armed')
    el.clearBtn.querySelector('strong').textContent = 'Tap again to erase every meal'
    clearArmedTimer = setTimeout(disarmClear, 4000)
    return
  }
  disarmClear()
  const previous = state
  update({ ...defaultState(), goalHours: state.goalHours })
  closeDialog(el.settingsDialog)
  toast('All meals erased.', 'Undo', () => update(previous))
})

// ---------------------------------------------------------------- boot

el.eatBtn.addEventListener('click', logMealNow)
el.moreBtn.addEventListener('click', () => {
  historyLimit += HISTORY_PAGE
  renderHistory(Date.now())
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') tick()
})

// Another tab of the app changed the log.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return
  load()
  render()
})

load()
render()
tick()

// ---------------------------------------------------------------- updates
//
// Every deploy stamps a new build id into version.js and version.json. The app
// compares its own id with the one on the server and, when they differ,
// registers the worker for the new build, which downloads it and takes over.
// The page then reloads itself, unless a dialog is open.

const UPDATED_FLAG = 'hearth.updatedFrom'
const UPDATE_CHECK_MS = 30 * 60 * 1000
const isStamped = (id) => typeof id === 'string' && /^[0-9a-f]{7,40}$/.test(id)
let updatePending = false
let reloading = false

function applyPendingUpdate() {
  if (!updatePending || reloading || document.querySelector('dialog[open]')) return
  reloading = true
  try {
    sessionStorage.setItem(UPDATED_FLAG, BUILD.id)
  } catch {
    /* the toast after reloading is only a nicety */
  }
  location.reload()
}

function registerWorker(buildId) {
  return navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(buildId)}`)
}

async function checkForUpdate() {
  if (!isStamped(BUILD.id) || !navigator.onLine) return
  try {
    const response = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) return
    const remote = await response.json()
    if (isStamped(remote.id) && remote.id !== BUILD.id) await registerWorker(remote.id)
  } catch {
    /* offline or mid-deploy: try again later */
  }
}

function startUpdates() {
  if (!('serviceWorker' in navigator)) return
  let controlled = Boolean(navigator.serviceWorker.controller)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // The very first install also fires this; only a replacement needs a reload.
    if (controlled) {
      updatePending = true
      applyPendingUpdate()
    }
    controlled = true
  })
  registerWorker(BUILD.id).catch(() => {
    /* the app works without offline support */
  })
  checkForUpdate()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate()
  })
  setInterval(checkForUpdate, UPDATE_CHECK_MS)
}

function announceUpdate() {
  let from = null
  try {
    from = sessionStorage.getItem(UPDATED_FLAG)
    sessionStorage.removeItem(UPDATED_FLAG)
  } catch {
    return
  }
  if (from && from !== BUILD.id) toast(`Hearth updated to ${BUILD.id}.`)
}

announceUpdate()
startUpdates()
