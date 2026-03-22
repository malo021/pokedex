import { useState, useEffect } from 'react'
import { getFavourites, removeFavourite } from '../utils/favourites'
import { fetchPokemon } from '../utils/api'
import PokemonCard from '../components/PokemonCard'
import styles from './FavouritesPage.module.css'

export default function FavouritesPage() {
  const [pokemon, setPokemon] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    const favs = getFavourites()
    if (favs.length === 0) { setPokemon([]); setLoading(false); return }
    setLoading(true)
    Promise.all(favs.map(name => fetchPokemon(name).catch(() => null)))
      .then(data => { setPokemon(data.filter(Boolean)); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  function handleRemove(name) {
    removeFavourite(name)
    setPokemon(prev => prev.filter(p => p.name !== name))
  }

  if (loading) return <div className={styles.state}>Loading...</div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>favourites</h1>
        {pokemon.length > 0 && (
          <p className={styles.count}>{pokemon.length} saved</p>
        )}
      </div>

      {pokemon.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Nothing saved yet.</p>
          <p className={styles.emptySub}>Search for a Pokémon and hit the save button on its page.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {pokemon.map(p => (
            <div key={p.name} className={styles.cardWrap}>
              <PokemonCard pokemon={p} />
              <button
                className={styles.removeBtn}
                onClick={() => handleRemove(p.name)}
              >
                remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
