import TypeBadge from './TypeBadge'
import { getMoveLevel } from '../utils/api'
import styles from './MoveTable.module.css'

export default function MoveTable({ moves, gen, showLevel = false }) {
  if (!moves || moves.length === 0) {
    return <p className={styles.empty}>No moves available for this generation.</p>
  }

  return (
    <div className={styles.table}>
      <div className={styles.header}>
        {showLevel && <span className={styles.lvlHead}>lv</span>}
        <span className={styles.nameHead}>move</span>
        <span className={styles.typeHead}>type</span>
      </div>
      {moves.map(m => {
        const level = showLevel ? getMoveLevel(m, gen) : null
        return (
          <div key={m.move.name} className={styles.row}>
            {showLevel && (
              <span className={styles.lvl}>{level || '—'}</span>
            )}
            <span className={styles.moveName}>{m.move.name.replace(/-/g, ' ')}</span>
            <span className={styles.type}>—</span>
          </div>
        )
      })}
    </div>
  )
}
