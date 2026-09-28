// The food table, fetched once and shared by every tab that needs it. The
// service worker keeps a copy, so it is there offline too.
let FOODS = []
let pending = null
const listeners = []

export const STARTERS = ['white-rice', 'chicken-breast', 'boiled-egg', 'banana', 'white-bread', 'coffee']

export function getFoods() {
  return FOODS
}

export function foodById(id) {
  return FOODS.find((food) => food.id === id)
}

// Anything that draws a food list re-renders once the table arrives.
export function onFoodsLoaded(listener) {
  listeners.push(listener)
  if (FOODS.length) listener(FOODS)
}

export function loadFoods() {
  pending ??= fetch('./foods.json')
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status))
      return response.json()
    })
    .then((data) => {
      FOODS = Array.isArray(data.foods) ? data.foods : []
    })
    .catch(() => {
      // Without the table you can still type the number by hand.
      FOODS = []
    })
    .then(() => {
      for (const listener of listeners) listener(FOODS)
      return FOODS
    })
  return pending
}
