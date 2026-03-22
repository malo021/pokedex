import { useState } from 'react'
import { fetchPokemon } from '../utils/api'
import TypeBadge from '../components/TypeBadge'
import StatBar from '../components/StatBar'
import GenFilter from '../components/GenFilter'
import { filterMovesByGen, getMoveMethod, getMoveLevel } from '../utils/api'
import styles from './ComparePage.module.css'

export default function ComparePage() {
  const [queryA, setQueryA] = useState('')
  const [queryB, setQueryB] = useState('')
  const [pokeA, setPokeA] = useState(null)
  const [pokeB, setPokeB] = useState(null)
  const [genA, setGenA] = useState(4)
  const [genB, setGenB] = useState(4)
  const [errorA, setErrorA] = useState('')
  const [errorB, setErrorB] = useState('')
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [moveTab, setMoveTab] = useState('level-up')

  async function searchA(e) {
    e.preventDefault()
    const q = queryA.trim().toLowerCase()
    if (!q) return
    setLoadingA(true); setErrorA('')
    try { setPokeA(await fetchPokemon(q)) }
    catch { setErrorA('Not found') }
    setLoadingA(false)
  }

  async function searchB(e) {
    e.preventDefault()
    const q = queryB.trim().toLowerCase()
    if (!q) return
    setLoadingB(true); setErrorB('')
    try { setPokeB(await fetchPokemon(q)) }
    catch { setErrorB('Not found') }
    setLoadingB(false)
  }

  const statsA = pokeA ? Object.fromEntries(pokeA.stats.map(s => [s.stat.name, s.base_stat])) : {}
  const statsB = pokeB ? Object.fromEntries(pokeB.stats.map(s => [s.stat.name, s.base_stat])) : {}
  const statKeys = ['hp','attack','defense','special-attack','special-defense','speed']

  const movesA = pokeA ? filterMovesByGen(pokeA.moves, genA)
    .filter(m => getMoveMethod(m, genA) === (moveTab === 'level-up' ? 'level-up' : moveTab === 'tm/hm' ? 'machine' : 'tutor'))
    .sort((a,b) => (getMoveLevel(a,genA)||0) - (getMoveLevel(b,genA)||0)) : []

  const movesB = pokeB ? filterMovesByGen(pokeB.moves, genB)
    .filter(m => getMoveMethod(m, genB) === (moveTab === 'level-up' ? 'level-up' : moveTab === 'tm/hm' ? 'machine' : 'tutor'))
    .sort((a,b) => (getMoveLevel(a,genB)||0) - (getMoveLevel(b,genB)||0)) : []

  const moveNamesA = new Set(movesA.map(m => m.move.name))
  const moveNamesB = new Set(movesB.map(m => m.move.name))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>compare</h1>
        <p className={styles.sub}>Side-by-side stats and moves. Mix generations for cross-gen analysis.</p>
      </div>

      <div className={styles.searchRow}>
        <SearchPanel
          label="Pokémon A"
          query={queryA}
          setQuery={setQueryA}
          onSearch={searchA}
          loading={loadingA}
          error={errorA}
        />
        <div className={styles.vs}>vs</div>
        <SearchPanel
          label="Pokémon B"
          query={queryB}
          setQuery={setQueryB}
          onSearch={searchB}
          loading={loadingB}
          error={errorB}
        />
      </div>

      {(pokeA || pokeB) && (
        <>
          {/* Identity row */}
          <div className={styles.identityRow}>
            <PokemonIdentity pokemon={pokeA} gen={genA} setGen={setGenA} side="a" />
            <PokemonIdentity pokemon={pokeB} gen={genB} setGen={setGenB} side="b" />
          </div>

          {/* Stats comparison */}
          {pokeA && pokeB && (
            <div className={styles.card}>
              <p className={styles.cardLabel}>stat comparison</p>
              <div className={styles.statCompare}>
                {statKeys.map(key => {
                  const a = statsA[key] || 0
                  const b = statsB[key] || 0
                  const max = Math.max(a, b, 1)
                  return (
                    <div key={key} className={styles.statCompareRow}>
                      <span className={`${styles.statVal} ${a > b ? styles.statWin : ''}`}>{a}</span>
                      <div className={styles.statBarsWrap}>
                        <div className={styles.statBarLeft}>
                          <div
                            className={`${styles.statBarFill} ${styles.fillA}`}
                            style={{ width: `${Math.round((a/max)*100)}%` }}
                          />
                        </div>
                        <span className={styles.statKey}>{formatStat(key)}</span>
                        <div className={styles.statBarRight}>
                          <div
                            className={`${styles.statBarFill} ${styles.fillB}`}
                            style={{ width: `${Math.round((b/max)*100)}%` }}
                          />
                        </div>
                      </div>
                      <span className={`${styles.statVal} ${b > a ? styles.statWin : ''}`}>{b}</span>
                    </div>
                  )
                })}
                <div className={styles.totalRow}>
                  <span className={`${styles.totalVal} ${
                    Object.values(statsA).reduce((s,v)=>s+v,0) > Object.values(statsB).reduce((s,v)=>s+v,0) ? styles.statWin : ''
                  }`}>
                    {Object.values(statsA).reduce((s,v)=>s+v,0)}
                  </span>
                  <span className={styles.totalLabel}>total</span>
                  <span className={`${styles.totalVal} ${
                    Object.values(statsB).reduce((s,v)=>s+v,0) > Object.values(statsA).reduce((s,v)=>s+v,0) ? styles.statWin : ''
                  }`}>
                    {Object.values(statsB).reduce((s,v)=>s+v,0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Move comparison */}
          <div className={styles.card}>
            <div className={styles.movesHeader}>
              <p className={styles.cardLabel}>move comparison</p>
              <div className={styles.moveTabs}>
                {['level-up','tm/hm','tutor'].map(t => (
                  <button
                    key={t}
                    className={`${styles.moveTab} ${moveTab === t ? styles.moveTabActive : ''}`}
                    onClick={() => setMoveTab(t)}
                  >{t}</button>
                ))}
              </div>
            </div>
            <div className={styles.moveCols}>
              <MoveCol moves={movesA} gen={genA} showLevel={moveTab==='level-up'} highlight={moveNamesB} exclusive highlightLabel="shared" />
              <MoveCol moves={movesB} gen={genB} showLevel={moveTab==='level-up'} highlight={moveNamesA} exclusive highlightLabel="shared" />
            </div>
          </div>
        </>
      )}

      {!pokeA && !pokeB && (
        <div className={styles.empty}>
          <p>Search for two Pokémon above to start comparing.</p>
        </div>
      )}
    </div>
  )
}

function SearchPanel({ label, query, setQuery, onSearch, loading, error }) {
  return (
    <form className={styles.searchPanel} onSubmit={onSearch}>
      <span className={styles.panelLabel}>{label}</span>
      <div className={styles.searchBox}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Name or number..."
          className={styles.searchInput}
        />
        <button className={styles.searchBtn} disabled={loading}>
          {loading ? '...' : 'go'}
        </button>
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </form>
  )
}

function PokemonIdentity({ pokemon, gen, setGen, side }) {
  if (!pokemon) return <div className={styles.emptyPanel}><p className={styles.emptyText}>—</p></div>
  const sprite = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default
  const id = String(pokemon.id).padStart(4,'0')
  return (
    <div className={`${styles.identityCard} ${styles[side]}`}>
      <div className={styles.identityTop}>
        {sprite && <img src={sprite} alt={pokemon.name} className={styles.identitySprite} />}
        <div>
          <p className={styles.identityNum}>#{id}</p>
          <p className={styles.identityName}>{pokemon.name}</p>
          <div className={styles.identityTypes}>
            {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name} size="sm" />)}
          </div>
        </div>
      </div>
      <div className={styles.identityGen}>
        <span className={styles.genLabel}>generation</span>
        <GenFilter value={gen} onChange={setGen} />
      </div>
    </div>
  )
}

function MoveCol({ moves, gen, showLevel, highlight }) {
  if (!moves || moves.length === 0) return (
    <div className={styles.moveColEmpty}>No moves for this generation.</div>
  )
  return (
    <div className={styles.moveCol}>
      {moves.map(m => {
        const isShared = highlight?.has(m.move.name)
        const level = showLevel ? getMoveLevel(m, gen) : null
        return (
          <div key={m.move.name} className={`${styles.moveRow} ${isShared ? styles.sharedMove : ''}`}>
            {showLevel && <span className={styles.moveLvl}>{level || '—'}</span>}
            <span className={styles.moveName}>{m.move.name.replace(/-/g,' ')}</span>
            {isShared && <span className={styles.sharedBadge}>shared</span>}
          </div>
        )
      })}
    </div>
  )
}

function formatStat(name) {
  const map = {'hp':'HP','attack':'ATK','defense':'DEF','special-attack':'SPA','special-defense':'SPD','speed':'SPE'}
  return map[name] || name
}
