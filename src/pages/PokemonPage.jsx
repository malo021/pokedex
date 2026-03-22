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
  const tmMoves = genMoves.filter(m => getMoveMethod(m, gen) === 'machine')
  const tutorMoves = genMoves.filter(m => getMoveMethod(m, gen) === 'tutor')
  const locations = pokemon.location_area_encounters

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        ← back
      </button>

      <div className={styles.layout}>
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

            {tab === 'level-up' && <MoveTable moves={levelMoves} gen={gen} showLevel />}
            {tab === 'tm/hm' && <MoveTable moves={tmMoves} gen={gen} />}
            {tab === 'tutor' && <MoveTable moves={tutorMoves} gen={gen} />}
            {tab === 'locations' && (
              <LocationsTab url={locations} gen={gen} pokemonName={pokemon.name} species={species} />
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
  'power-plant-area': 5, 'pokemon-tower-area': 3, 'silph-co-area': 4,
  'new-bark-town-area': 0, 'route-29-area': 0, 'route-30-area': 0,
  'route-31-area': 0, 'violet-city-area': 1, 'sprout-tower-area': 1,
  'union-cave-area': 1, 'route-32-area': 1, 'slowpoke-well-area': 2,
  'azalea-town-area': 2, 'ilex-forest-area': 2, 'route-34-area': 2,
  'goldenrod-city-area': 3, 'route-35-area': 3, 'national-park-area': 3,
  'route-36-area': 3, 'route-37-area': 3, 'ecruteak-city-area': 4,
  'burned-tower-area': 4, 'route-38-area': 4, 'route-39-area': 4,
  'olivine-city-area': 5, 'route-40-area': 5, 'whirl-islands-area': 5,
  'cianwood-city-area': 5, 'route-41-area': 5, 'route-42-area': 6,
  'mt-mortar-area': 6, 'mahogany-town-area': 7, 'lake-of-rage-area': 7,
  'route-44-area': 7, 'ice-path-area': 7, 'blackthorn-city-area': 8,
  'dragons-den-area': 8, 'victory-road-johto-area': 8,
  'littleroot-town-area': 0, 'route-101-area': 0, 'route-102-area': 0,
  'petalburg-city-area': 0, 'route-104-area': 0, 'petalburg-woods-area': 0,
  'rustboro-city-area': 1, 'route-116-area': 1, 'rusturf-tunnel-area': 1,
  'dewford-town-area': 2, 'granite-cave-area': 2, 'route-109-area': 2,
  'slateport-city-area': 2, 'route-110-area': 2, 'mauville-city-area': 3,
  'route-117-area': 3, 'verdanturf-town-area': 3, 'route-111-area': 3,
  'route-112-area': 3, 'fiery-path-area': 3, 'route-113-area': 4,
  'fallarbor-town-area': 4, 'route-114-area': 4, 'meteor-falls-area': 4,
  'lavaridge-town-area': 4, 'route-118-area': 5, 'route-119-area': 5,
  'fortree-city-area': 6, 'route-120-area': 6, 'route-121-area': 6,
  'safari-zone-hoenn-area': 6, 'lilycove-city-area': 6, 'route-122-area': 6,
  'mt-pyre-area': 6, 'route-123-area': 7, 'mossdeep-city-area': 7,
  'route-124-area': 7, 'seafloor-cavern-area': 7, 'sootopolis-city-area': 8,
  'victory-road-hoenn-area': 8,
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
  'route-216-area': 6, 'route-217-area': 6, 'acuity-lakefront-area': 6,
  'lake-acuity-area': 6, 'snowpoint-city-area': 7, 'lake-verity-area': 0,
  'lake-valor-area': 5,
  'nuvema-town-area': 0, 'route-1-unova-area': 0, 'accumula-town-area': 0,
  'route-2-unova-area': 0, 'striaton-city-area': 1, 'dreamyard-area': 1,
  'route-3-unova-area': 1, 'nacrene-city-area': 2, 'pinwheel-forest-area': 2,
  'route-4-unova-area': 2, 'castelia-city-area': 3, 'route-5-unova-area': 3,
  'route-6-unova-area': 4, 'driftveil-city-area': 4, 'cold-storage-area': 4,
  'route-7-unova-area': 5, 'mistralton-city-area': 5, 'route-8-unova-area': 5,
  'moors-of-iccirus-area': 5, 'iccirus-city-area': 6, 'dragonspiral-tower-area': 6,
  'route-9-unova-area': 6, 'opelucid-city-area': 7, 'route-10-unova-area': 7,
  'victory-road-unova-area': 8,
}

const LEGENDARY_LOCATIONS = {
  'articuno': { red: 'Seafoam Islands', blue: 'Seafoam Islands', yellow: 'Seafoam Islands', firered: 'Seafoam Islands', leafgreen: 'Seafoam Islands' },
  'zapdos':   { red: 'Power Plant', blue: 'Power Plant', yellow: 'Power Plant', firered: 'Power Plant', leafgreen: 'Power Plant' },
  'moltres':  { red: 'Victory Road', blue: 'Victory Road', yellow: 'Victory Road', firered: 'Mt. Ember', leafgreen: 'Mt. Ember' },
  'mewtwo':   { red: 'Cerulean Cave', blue: 'Cerulean Cave', yellow: 'Cerulean Cave', firered: 'Cerulean Cave', leafgreen: 'Cerulean Cave' },
  'mew':      { red: 'Event only', blue: 'Event only', yellow: 'Event only', firered: 'Event only', leafgreen: 'Event only' },
  'raikou':   { gold: 'Roaming Johto', silver: 'Roaming Johto', crystal: 'Roaming Johto', heartgold: 'Roaming Johto', soulsilver: 'Roaming Johto' },
  'entei':    { gold: 'Roaming Johto', silver: 'Roaming Johto', crystal: 'Roaming Johto', heartgold: 'Roaming Johto', soulsilver: 'Roaming Johto' },
  'suicune':  { gold: 'Roaming Johto', silver: 'Roaming Johto', crystal: 'North of Cianwood City', heartgold: 'Route 25', soulsilver: 'Roaming Johto' },
  'lugia':    { gold: 'Whirl Islands (need Silver Wing)', silver: 'Whirl Islands', crystal: 'Whirl Islands', heartgold: 'Whirl Islands (need Silver Wing)', soulsilver: 'Whirl Islands' },
  'ho-oh':    { gold: 'Tin Tower', silver: 'Tin Tower (need Rainbow Wing)', crystal: 'Tin Tower', heartgold: 'Tin Tower', soulsilver: 'Tin Tower (need Rainbow Wing)' },
  'celebi':   { gold: 'Event only', silver: 'Event only', crystal: 'Event only' },
  'regirock': { ruby: 'Desert Ruins', sapphire: 'Desert Ruins', emerald: 'Desert Ruins', 'omega-ruby': 'Desert Ruins', 'alpha-sapphire': 'Desert Ruins' },
  'regice':   { ruby: 'Island Cave', sapphire: 'Island Cave', emerald: 'Island Cave', 'omega-ruby': 'Island Cave', 'alpha-sapphire': 'Island Cave' },
  'registeel':{ ruby: 'Ancient Tomb', sapphire: 'Ancient Tomb', emerald: 'Ancient Tomb', 'omega-ruby': 'Ancient Tomb', 'alpha-sapphire': 'Ancient Tomb' },
  'latias':   { ruby: 'Roaming Hoenn', sapphire: 'Southern Island', emerald: 'Roaming Hoenn', 'omega-ruby': 'Southern Island', 'alpha-sapphire': 'Roaming Hoenn' },
  'latios':   { ruby: 'Southern Island', sapphire: 'Roaming Hoenn', emerald: 'Roaming Hoenn', 'omega-ruby': 'Roaming Hoenn', 'alpha-sapphire': 'Southern Island' },
  'kyogre':   { sapphire: 'Cave of Origin', emerald: 'Marine Cave', 'alpha-sapphire': 'Cave of Origin' },
  'groudon':  { ruby: 'Cave of Origin', emerald: 'Terra Cave', 'omega-ruby': 'Cave of Origin' },
  'rayquaza': { ruby: 'Sky Pillar', sapphire: 'Sky Pillar', emerald: 'Sky Pillar', 'omega-ruby': 'Sky Pillar', 'alpha-sapphire': 'Sky Pillar' },
  'jirachi':  { ruby: 'Event only', sapphire: 'Event only', emerald: 'Event only' },
  'deoxys':   { firered: 'Birth Island (Event)', leafgreen: 'Birth Island (Event)', emerald: 'Birth Island (Event)' },
  'uxie':     { diamond: 'Lake Acuity', pearl: 'Lake Acuity', platinum: 'Lake Acuity' },
  'mesprit':  { diamond: 'Lake Verity (then roaming)', pearl: 'Lake Verity (then roaming)', platinum: 'Lake Verity (then roaming)' },
  'azelf':    { diamond: 'Lake Valor', pearl: 'Lake Valor', platinum: 'Lake Valor' },
  'dialga':   { diamond: 'Spear Pillar', platinum: 'Spear Pillar' },
  'palkia':   { pearl: 'Spear Pillar', platinum: 'Spear Pillar' },
  'heatran':  { diamond: 'Stark Mountain', pearl: 'Stark Mountain', platinum: 'Stark Mountain' },
  'regigigas':{ diamond: 'Snowpoint Temple', pearl: 'Snowpoint Temple', platinum: 'Snowpoint Temple' },
  'giratina': { diamond: 'Turnback Cave', pearl: 'Turnback Cave', platinum: 'Distortion World' },
  'cresselia':{ diamond: 'Fullmoon Island (then roaming)', pearl: 'Fullmoon Island (then roaming)', platinum: 'Fullmoon Island (then roaming)' },
  'manaphy':  { diamond: 'Event only', pearl: 'Event only', platinum: 'Event only' },
  'darkrai':  { diamond: 'Newmoon Island (Event)', pearl: 'Newmoon Island (Event)', platinum: 'Newmoon Island (Event)' },
  'shaymin':  { diamond: 'Flower Paradise (Event)', pearl: 'Flower Paradise (Event)', platinum: 'Flower Paradise (Event)' },
  'arceus':   { diamond: 'Hall of Origin (Event)', pearl: 'Hall of Origin (Event)', platinum: 'Hall of Origin (Event)' },
  'cobalion': { black: 'Mistralton Cave', white: 'Mistralton Cave', 'black-2': 'Mistralton Cave', 'white-2': 'Mistralton Cave' },
  'terrakion':{ black: 'Victory Road', white: 'Victory Road', 'black-2': 'Victory Road', 'white-2': 'Victory Road' },
  'virizion': { black: 'Pinwheel Forest', white: 'Pinwheel Forest', 'black-2': 'Pinwheel Forest', 'white-2': 'Pinwheel Forest' },
  'tornadus': { black: 'Roaming Unova', 'white': 'Trade from Black', 'black-2': 'Trade from Black', 'white-2': 'Trade from Black' },
  'thundurus':{ white: 'Roaming Unova', 'black': 'Trade from White', 'black-2': 'Trade from White', 'white-2': 'Trade from White' },
  'reshiram': { black: 'N-Castle', white: 'Trade from Black', 'white-2': 'Dragonspiral Tower', 'black-2': 'Trade from White 2' },
  'zekrom':   { white: 'N-Castle', black: 'Trade from White', 'black-2': 'Dragonspiral Tower', 'white-2': 'Trade from Black 2' },
  'landorus': { black: 'Abundant Shrine (need Tornadus+Thundurus)', white: 'Abundant Shrine (need Tornadus+Thundurus)' },
  'kyurem':   { black: 'Giant Chasm', white: 'Giant Chasm', 'black-2': 'Giant Chasm', 'white-2': 'Giant Chasm' },
  'keldeo':   { black: 'Event only', white: 'Event only' },
  'meloetta': { black: 'Event only', white: 'Event only' },
  'genesect': { black: 'Event only', white: 'Event only' },
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
  2: ['Zephyr','Hive','Plain','Fog','Storm','Mineral','Glacier','Rising'],
  3: ['Stone','Knuckle','Dynamo','Heat','Balance','Feather','Mind','Rain'],
  4: ['Coal','Forest','Cobble','Fen','Relic','Mine','Icicle','Beacon'],
  5: ['Trio','Basic','Insect','Bolt','Quake','Jet','Freeze','Legend'],
}

function getBadgeContext(locationName, gen) {
  const badges = LOCATION_BADGE_MAP[locationName]
  if (badges === undefined) return null
  if (badges === 0) return 'from the start'
  const names = GEN_BADGE_LABELS[gen]
  if (names && names[badges - 1]) return `after ${badges}★ (${names[badges - 1]} Badge)`
  return `after ${badges} badge${badges > 1 ? 's' : ''}`
}

function LocationsTab({ url, gen, pokemonName, species }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!url) { setLoading(false); return }
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setData([]); setLoading(false) })
  }, [url])

  if (loading) return <p className={styles.empty}>Loading locations...</p>

  const versions = GEN_VERSIONS[gen] || []

  const legendaryData = LEGENDARY_LOCATIONS[pokemonName]
  if (legendaryData) {
    const genEntries = versions.map(v => ({
      version: v,
      location: legendaryData[v] || 'Trade from another game'
    }))
    const unique = [...new Map(genEntries.map(e => [e.location, e])).values()]
    return (
      <div>
        <div className={styles.earliestBox}>
          <span className={styles.earliestLabel}>static encounter</span>
          <div className={styles.earliestContent}>
            <span className={styles.earliestName}>{unique[0]?.location}</span>
          </div>
        </div>
        <div className={styles.locationList}>
          {genEntries.map(e => (
            <div key={e.version} className={styles.locationRow}>
              <div className={styles.locationLeft}>
                <span className={styles.locationName}>{e.location}</span>
              </div>
              <div className={styles.locationVersions}>
                <span className={styles.locationVersion}>{e.version}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    const prevEvo = species?.evolves_from_species?.name
    if (prevEvo) {
      return (
        <div className={styles.evolveBox}>
          <span className={styles.evolveLabel}>not found in the wild</span>
          <span className={styles.evolveName}>evolve {prevEvo.replace(/-/g, ' ')}</span>
        </div>
      )
    }
    return <p className={styles.empty}>No location data available.</p>
  }

  const filtered = data.filter(loc =>
    loc.version_details.some(vd => versions.includes(vd.version.name))
  )

  if (filtered.length === 0) {
    const prevEvo = species?.evolves_from_species?.name
    if (prevEvo) {
      return (
        <div className={styles.evolveBox}>
          <span className={styles.evolveLabel}>not found in the wild in Generation {gen}</span>
          <span className={styles.evolveName}>evolve {prevEvo.replace(/-/g, ' ')}</span>
        </div>
      )
    }
    return <p className={styles.empty}>Not found in Generation {gen} games.</p>
  }

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