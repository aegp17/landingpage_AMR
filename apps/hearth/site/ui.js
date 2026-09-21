// Bits both tabs share: the toast and the dialogs.
const TOAST_MS = 6000

const toastEl = document.getElementById('toast')
const toastText = document.getElementById('toastText')
const toastAction = document.getElementById('toastAction')

let toastTimer = 0
let toastHandler = null

export function toast(message, actionLabel, onAction) {
  clearTimeout(toastTimer)
  toastText.textContent = message
  toastHandler = onAction || null
  toastAction.hidden = !onAction
  if (actionLabel) toastAction.textContent = actionLabel
  toastEl.classList.add('show')
  toastTimer = setTimeout(hideToast, TOAST_MS)
}

export function hideToast() {
  toastEl.classList.remove('show')
  toastHandler = null
}

toastAction.addEventListener('click', () => {
  const handler = toastHandler
  hideToast()
  if (handler) handler()
})

const closedListeners = []

// So the update logic can wait for an open dialog without reaching in here.
export function onDialogClosed(listener) {
  closedListeners.push(listener)
}

const announceClosed = () => closedListeners.forEach((listener) => listener())

export function openDialog(dialog) {
  if (typeof dialog.showModal === 'function') dialog.showModal()
  else dialog.setAttribute('open', '')
}

export function closeDialog(dialog) {
  if (typeof dialog.close === 'function') dialog.close()
  else dialog.removeAttribute('open')
  announceClosed()
}

export function anyDialogOpen() {
  return Boolean(document.querySelector('dialog[open]'))
}

for (const dialog of document.querySelectorAll('dialog')) {
  // Escape closes a dialog without going through closeDialog.
  dialog.addEventListener('close', announceClosed)
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-close]')) return closeDialog(dialog)
    // A click on the backdrop lands on the <dialog> itself, outside its box.
    if (event.target !== dialog) return
    const box = dialog.getBoundingClientRect()
    const inside =
      event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom
    if (!inside) closeDialog(dialog)
  })
}
