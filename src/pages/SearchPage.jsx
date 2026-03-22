import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PokemonCard from '../components/PokemonCard'
import { fetchPokemon } from '../utils/api'
import styles from './SearchPage.module.css'

const POPULAR = [
  'pikachu','charizard','mewtwo','gengar','eevee','snorlax',
  'lucario','garchomp','flygon','togekiss','umbreon','gardevoir',
  'dragonite','tyranitar','blaziken','greninja'
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [popular, setPopular] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all(POPULAR.map(name => fetchPokemon(name).catch(() => null)))
      .then(data => setPopular(data.filter(Boolean)))
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    const q = query.trim().toLowerCase()
    if (!q) return
    setLoading(true)
    setError('')
    try {
      const poke = await fetchPokemon(q)
      navigate(`/pokemon/${poke.name}`)
    } catch {
      setError(`No Pokémon found for "${query}"`)
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Every Pokémon.<br />
          <span>Every generation.</span>
        </h1>
        <p className={styles.sub}>Search stats, moves, locations and compare across generations.</p>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <svg className={styles.icon} viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Name or number..."
            className={styles.input}
            autoFocus
          />
          <button className={styles.btn} disabled={loading}>
            {loading ? '...' : 'search'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>popular</p>
        <div className={styles.grid}>
          {popular.map(p => <PokemonCard key={p.name} pokemon={p} />)}
        </div>
      </div>
    </div>
  )
}
