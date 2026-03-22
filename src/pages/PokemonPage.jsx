import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'
import GenFilter from '../components/GenFilter'
import MoveTable from '../components/MoveTable'
import EvolutionChain from '../components/EvolutionChain'
import {
  fetchPokemon, fetchSpecies, fetchEvolutionChain,
  filterMovesByGen, getMoveMethod, getMoveLevel,
  getEnglishFlavorText
} from '../utils/api'
import { toggleFavourite, isFavourite } from '../utils/favourites'
import styles from './PokemonPage.module.css'

const TABS = ['level-up', 'tm/hm', 'tutor', 'locations']

export default function PokemonPage() {
  const { nameOrId } = useParams()
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState(null)
  const [species, setSpecies] = useState(null)
  const [evoChain, setEvoChain] = useState(null)
  const [gen, setGen] = useState(4)
  const [tab, setTab] = useState('level-up')
  const [fav, setFav] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchPokemon(nameOrId)
      .then(async p => {
        setPokemon(p)
        setFav(isFavourite(p.name))
        const sp = await fetchSpecies(p.name).catch(() => null)
        setSpecies(sp)
        if (sp?.evolution_chain?.url) {
          const evo = await fetchEvolutionChain(sp.evolution_chain.url).catch(() => null)
          setEvoChain(evo)
        }
        setLoading(false)
      })
      .catch(() => { setError('Pokémon not found.'); setLoading(false) })
  }, [nameOrId])

  function handleFav() {
    toggleFavourite(pokemon.name)
    setFav(isFavourite(pokemon.name))
  }

  if (loading) return <div className={styles.state}>Loading...</div>
  if (error) return <div className={styles.state}>{error}</div>
  if (!pokemon) return null

  const sprite =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default

  const id = String(pokemon.id).padStart(4, '0')
  const flavorText = getEnglishFlavorText(species)

  const genMoves = filterMovesByGen(pokemon.moves, gen)
  const levelMoves = genMoves
    .filter(m => getMoveMethod(m, gen) === 'level-up')
    .sort((a, b) => (getMoveLevel(a, gen) || 0) - (getMoveLevel(b, gen) || 0))
  const tmMoves = genMoves.filter(m => {
    const method = getMoveMethod(m, gen)
    return method === 'machine'
  })
  const tutorMoves = genMoves.filter(m => getMoveMethod(m, gen) === 'tutor')

  const locations = pokemon.location_area_encounters

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        ← back
      </button>

      <div className={styles.layout}>
        {/* Left panel */}
        <aside className={styles.aside}>
          <div className={styles.spriteCard}>
            <div className={styles.spriteWrap}>
              {sprite
                ? <img src={sprite} alt={pokemon.name} className={styles.sprite} />
                : <div className={styles.noSprite} />
              }
            </div>
            <span className={styles.num}>#{id}</span>
            <h1 className={styles.name}>{pokemon.name}</h1>
            <div className={styles.types}>
              {pokemon.types.map(t => (
                <TypeBadge key={t.type.name} type={t.type.name} size="lg" />
              ))}
            </div>
            {flavorText && <p className={styles.flavor}>{flavorText}</p>}
            <button
              className={`${styles.favBtn} ${fav ? styles.favActive : ''}`}
              onClick={handleFav}
            >
              {fav ? '♥ saved' : '♡ save'}
            </button>
          </div>

          <div className={styles.card}>
            <p className={styles.sectionLabel}>base stats</p>
            {pokemon.stats.map(s => (
              <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
            ))}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>total</span>
              <span className={styles.totalVal}>
                {pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)}
              </span>
            </div>
          </div>

          <div className={styles.card}>
            <p className={styles.sectionLabel}>abilities</p>
            {pokemon.abilities.map(a => (
              <div key={a.ability.name} className={styles.abilityRow}>
                <span className={styles.abilityName}>{a.ability.name.replace(/-/g,' ')}</span>
                {a.is_hidden && <span className={styles.hiddenTag}>hidden</span>}
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <p className={styles.sectionLabel}>profile</p>
            <div className={styles.profileGrid}>
              <span className={styles.profileKey}>height</span>
              <span className={styles.profileVal}>{(pokemon.height / 10).toFixed(1)} m</span>
              <span className={styles.profileKey}>weight</span>
              <span className={styles.profileVal}>{(pokemon.weight / 10).toFixed(1)} kg</span>
              {species?.base_happiness != null && <>
                <span className={styles.profileKey}>happiness</span>
                <span className={styles.profileVal}>{species.base_happiness}</span>
              </>}
              {species?.capture_rate != null && <>
                <span className={styles.profileKey}>catch rate</span>
                <span className={styles.profileVal}>{species.capture_rate}</span>
              </>}
            </div>
          </div>

          {evoChain && (
            <div className={styles.card}>
              <p className={styles.sectionLabel}>evolution</p>
              <EvolutionChain chain={evoChain.chain} currentName={pokemon.name} />
            </div>
          )}
        </aside>

        {/* Right panel */}
        <div className={styles.main}>
          <div className={styles.genRow}>
            <p className={styles.sectionLabel}>generation</p>
            <GenFilter value={gen} onChange={setGen} />
          </div>

          <div className={styles.card}>
            <div className={styles.tabs}>
              {TABS.map(t => (
                <button
                  key={t}
                  className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'level-up' && (
              <MoveTable moves={levelMoves} gen={gen} showLevel />
            )}
            {tab === 'tm/hm' && (
              <MoveTable moves={tmMoves} gen={gen} />
            )}
            {tab === 'tutor' && (
              <MoveTable moves={tutorMoves} gen={gen} />
            )}
            {tab === 'locations' && (
              <LocationsTab url={locations} gen={gen} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const LOCATION_BADGE_MAP = {
  'pallet-town-area': 0, 'route-1-area': 0, 'route-2-area': 0,
  'viridian-forest-area': 0, 'pewter-city-area': 1, 'route-3-area': 1,
  'mt-moon-area': 1, 'cerulean-city-area': 2, 'route-4-area': 2,
  'route-24-area': 2, 'route-25-area': 2, 'vermilion-city-area': 3,
  'diglett-cave-area': 3, 'rock-tunnel-area': 3, 'lavender-town-area': 3,
  'celadon-city-area': 4, 'safari-zone-area': 4, 'fuchsia-city-area': 5,
  'seafoam-islands-area': 5, 'cinnabar-island-area': 7, 'victory-road-kanto-area': 8,
  'twinleaf-town-area': 0, 'route-201-area': 0, 'route-202-area': 0,
  'sandgem-town-area': 0, 'jubilife-city-area': 0, 'route-203-area': 0,
  'oreburgh-gate-area': 0, 'oreburgh-city-area': 1, 'route-207-area': 1,
  'route-204-area': 1, 'floaroma-town-area': 1, 'route-205-area': 2,
  'eterna-forest-area': 2, 'eterna-city-area': 2, 'route-211-area': 2,
  'mt-coronet-area': 2, 'route-206-area': 3, 'wayward-cave-area': 3,
  'route-208-area': 3, 'hearthome-city-area': 4, 'route-209-area': 4,
  'solaceon-town-area': 4, 'solaceon-ruins-area': 4, 'route-210-area': 4,
  'celestic-town-area': 4, 'route-212-area': 5, 'pastoria-city-area': 5,
  'great-marsh-area': 5, 'route-213-area': 5, 'route-214-area': 5,
  'valor-lakefront-area': 5, 'route-215-area': 5, 'route-222-area': 6,
  'sunyshore-city-area': 7, 'route-223-area': 7, 'victory-road-sinnoh-area': 8,
}

const GEN_VERSIONS = {
  1: ['red','blue','yellow'],
  2: ['gold','silver','crystal'],
  3: ['ruby','sapphire','emerald','firered','leafgreen'],
  4: ['diamond','pearl','platinum','heartgold','soulsilver'],
  5: ['black','white','black-2','white-2'],
  6: ['x','y','omega-ruby','alpha-sapphire'],
  7: ['sun','moon','ultra-sun','ultra-moon'],
  8: ['sword','shield','brilliant-diamond','shining-pearl','legends-arceus'],
  9: ['scarlet','violet'],
}

const GEN_BADGE_LABELS = {
  1: ['Boulder','Cascade','Thunder','Rainbow','Soul','Marsh','Volcano','Earth'],
  4: ['Coal','Forest','Cobble','Fen','Relic','Mine','Icicle','Beacon'],
}

function getBadgeContext(locationName, gen) {
  const badges = LOCATION_BADGE_MAP[locationName]
  if (badges === undefined) return null
  if (badges === 0) return 'from the start'
  const names = GEN_BADGE_LABELS[gen]
  if (names && names[badges - 1]) return `after ${badges}★ (${names[badges - 1]} Badge)`
  return `after ${badges} badge${badges > 1 ? 's' : ''}`
}

function LocationsTab({ url, gen }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!url) return
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [url])

  if (loading) return <p className={styles.empty}>Loading locations...</p>
  if (!data || data.length === 0) return <p className={styles.empty}>No location data available.</p>

  const versions = GEN_VERSIONS[gen] || []
  const filtered = data.filter(loc =>
    loc.version_details.some(vd => versions.includes(vd.version.name))
  )

  if (filtered.length === 0) return <p className={styles.empty}>Not found in Generation {gen} games.</p>

  const sorted = [...filtered].sort((a, b) => {
    const ba = LOCATION_BADGE_MAP[a.location_area.name] ?? 99
    const bb = LOCATION_BADGE_MAP[b.location_area.name] ?? 99
    return ba - bb
  })

  const earliest = sorted[0]
  const hasEarliestData = LOCATION_BADGE_MAP[earliest.location_area.name] !== undefined

  return (
    <div>
      {hasEarliestData && (
        <div className={styles.earliestBox}>
          <span className={styles.earliestLabel}>earliest obtainable</span>
          <div className={styles.earliestContent}>
            <span className={styles.earliestName}>{earliest.location_area.name.replace(/-/g, ' ')}</span>
            <span className={styles.earliestBadge}>{getBadgeContext(earliest.location_area.name, gen)}</span>
          </div>
        </div>
      )}
      <div className={styles.locationList}>
        {sorted.map(loc => {
          const badgeCtx = getBadgeContext(loc.location_area.name, gen)
          const locVersions = loc.version_details
            .filter(vd => versions.includes(vd.version.name))
            .map(vd => vd.version.name)
          return (
            <div key={loc.location_area.name} className={styles.locationRow}>
              <div className={styles.locationLeft}>
                <span className={styles.locationName}>{loc.location_area.name.replace(/-/g, ' ')}</span>
                {badgeCtx && <span className={styles.locationBadgeCtx}>{badgeCtx}</span>}
              </div>
              <div className={styles.locationVersions}>
                {locVersions.map(v => (
                  <span key={v} className={styles.locationVersion}>{v}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}