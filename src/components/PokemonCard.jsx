import { useNavigate } from 'react-router-dom'
import TypeBadge from './TypeBadge'
import styles from './PokemonCard.module.css'

export default function PokemonCard({ pokemon }) {
  const navigate = useNavigate()
  const sprite =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default

  const id = String(pokemon.id).padStart(4, '0')

  return (
    <div className={styles.card} onClick={() => navigate(`/pokemon/${pokemon.name}`)}>
      <div className={styles.imgWrap}>
        {sprite
          ? <img src={sprite} alt={pokemon.name} className={styles.img} />
          : <div className={styles.noImg} />
        }
      </div>
      <div className={styles.info}>
        <span className={styles.num}>#{id}</span>
        <span className={styles.name}>{pokemon.name}</span>
        <div className={styles.types}>
          {pokemon.types.map(t => (
            <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
          ))}
        </div>
      </div>
    </div>
  )
}
