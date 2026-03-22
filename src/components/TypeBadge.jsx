import styles from './TypeBadge.module.css'

export default function TypeBadge({ type, size = 'md' }) {
  return (
    <span className={`${styles.badge} ${styles[size]} type-${type}`}>
      {type}
    </span>
  )
}
