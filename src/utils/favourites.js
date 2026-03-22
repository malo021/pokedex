const KEY = 'pokedex_favourites'

export function getFavourites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch { return [] }
}

export function addFavourite(name) {
  const favs = getFavourites()
  if (!favs.includes(name)) {
    localStorage.setItem(KEY, JSON.stringify([...favs, name]))
  }
}

export function removeFavourite(name) {
  const favs = getFavourites().filter(f => f !== name)
  localStorage.setItem(KEY, JSON.stringify(favs))
}

export function isFavourite(name) {
  return getFavourites().includes(name)
}

export function toggleFavourite(name) {
  if (isFavourite(name)) removeFavourite(name)
  else addFavourite(name)
}
