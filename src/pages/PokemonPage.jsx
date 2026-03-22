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
      {/* Back */}
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

  const filtered = data.filter(loc =>
    loc.version_details.some(vd =>
      vd.version.name.includes(gen === 1 ? 'red' : gen === 2 ? 'gold' : gen === 3 ? 'ruby' :
        gen === 4 ? 'diamond' : gen === 5 ? 'black' : gen === 6 ? 'x' :
        gen === 7 ? 'sun' : gen === 8 ? 'sword' : 'scarlet')
    )
  )

  if (filtered.length === 0) return <p className={styles.empty}>Not found in this generation.</p>

  return (
    <div className={styles.locationList}>
      {filtered.map(loc => (
        <div key={loc.location_area.name} className={styles.locationRow}>
          <span className={styles.locationName}>
            {loc.location_area.name.replace(/-/g, ' ')}
          </span>
        </div>
      ))}
    </div>
  )
}
