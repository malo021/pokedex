import { formatStatName, getStatPercent } from '../utils/api'
import styles from './StatBar.module.css'

function getStatColor(value) {
  if (value < 30)  return '#FF0000'
  if (value < 50)  return '#F34444'
  if (value < 60)  return '#FF7F0F'
  if (value < 70)  return '#FFDD57'
  if (value < 80)  return '#A0E515'
  if (value < 90)  return '#23CD5E'
  if (value < 110) return '#00C2B8'
  if (value < 130) return '#00A8FF'
  return '#0070F3'
}

export default function StatBar({ name, value, showName = true }) {
  const pct = getStatPercent(value)
  const color = getStatColor(value)

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