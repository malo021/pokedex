import { useNavigate } from 'react-router-dom'
import styles from './EvolutionChain.module.css'

export default function EvolutionChain({ chain, currentName }) {
  const navigate = useNavigate()
  const stages = []
  flatten(chain, stages)

  if (stages.length <= 1) return <p className={styles.none}>Does not evolve.</p>

  return (
    <div className={styles.chain}>
      {stages.map((stage, i) => (
        <div key={stage.name} className={styles.stageWrap}>
          {i > 0 && <span className={styles.arrow}>→</span>}
          <div
            className={`${styles.stage} ${stage.name === currentName ? styles.current : ''}`}
            onClick={() => navigate(`/pokemon/${stage.name}`)}
          >
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${stage.id}.png`}
              alt={stage.name}
              className={styles.img}
              onError={e => { e.target.style.display = 'none' }}
            />
            <span className={styles.name}>{stage.name}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function flatten(node, result) {
  const parts = node.species.url.split('/')
  const id = parts[parts.length - 2]
  result.push({ name: node.species.name, id })
  node.evolves_to.forEach(child => flatten(child, result))
}
