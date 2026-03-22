const BASE = 'https://pokeapi.co/api/v2'

export async function fetchPokemon(nameOrId) {
  const res = await fetch(`${BASE}/pokemon/${nameOrId}`)
  if (!res.ok) throw new Error('Pokemon not found')
  return res.json()
}

export async function fetchSpecies(nameOrId) {
  const res = await fetch(`${BASE}/pokemon-species/${nameOrId}`)
  if (!res.ok) throw new Error('Species not found')
  return res.json()
}

export async function fetchEvolutionChain(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Evolution chain not found')
  return res.json()
}

export async function fetchMoveDetail(url) {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

// Generation to version groups mapping
export const GEN_VERSION_GROUPS = {
  1: ['red-blue', 'yellow'],
  2: ['gold-silver', 'crystal'],
  3: ['ruby-sapphire', 'emerald', 'firered-leafgreen'],
  4: ['diamond-pearl', 'platinum', 'heartgold-soulsilver'],
  5: ['black-white', 'black-2-white-2'],
  6: ['x-y', 'omega-ruby-alpha-sapphire'],
  7: ['sun-moon', 'ultra-sun-ultra-moon'],
  8: ['sword-shield', 'brilliant-diamond-and-shining-pearl', 'legends-arceus'],
  9: ['scarlet-violet'],
}

export function filterMovesByGen(moves, gen) {
  const validGroups = GEN_VERSION_GROUPS[gen] || []
  return moves.filter(m =>
    m.version_group_details.some(vgd =>
      validGroups.includes(vgd.version_group.name)
    )
  )
}

export function getMoveMethod(move, gen) {
  const validGroups = GEN_VERSION_GROUPS[gen] || []
  const detail = move.version_group_details.find(vgd =>
    validGroups.includes(vgd.version_group.name)
  )
  return detail ? detail.move_learn_method.name : null
}

export function getMoveLevel(move, gen) {
  const validGroups = GEN_VERSION_GROUPS[gen] || []
  const detail = move.version_group_details.find(vgd =>
    validGroups.includes(vgd.version_group.name) &&
    vgd.move_learn_method.name === 'level-up'
  )
  return detail ? detail.level_learned_at : null
}

export function getStatPercent(value) {
  return Math.min(100, Math.round((value / 255) * 100))
}

export function formatStatName(name) {
  const map = {
    'hp': 'HP', 'attack': 'ATK', 'defense': 'DEF',
    'special-attack': 'SP.A', 'special-defense': 'SP.D', 'speed': 'SPD'
  }
  return map[name] || name.toUpperCase()
}

export function getEnglishFlavorText(species) {
  const entry = species?.flavor_text_entries?.find(e => e.language.name === 'en')
  return entry ? entry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') : ''
}

export function flattenEvolutionChain(chain) {
  const result = []
  function walk(node) {
    result.push(node.species.name)
    node.evolves_to.forEach(walk)
  }
  walk(chain)
  return result
}

export const STAT_COLORS = {
  'hp': '#E85A5A',
  'attack': '#F0943A',
  'defense': '#F5C842',
  'special-attack': '#5A9AE8',
  'special-defense': '#5AC4E8',
  'speed': '#3DBE7A',
}
