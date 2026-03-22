import { formatStatName, getStatPercent, STAT_COLORS } from '../utils/api'
import styles from './StatBar.module.css'

export default function StatBar({ name, value, showName = true }) {
  const pct = getStatPercent(value)
  const color = STAT_COLORS[name] || 'var(--accent)'

  return (
    <div className={styles.row}>
      {showName && <span className={styles.label}>{formatStatName(name)}</span>}
      <span className={styles.value}>{value}</span>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
