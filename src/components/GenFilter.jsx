import styles from './GenFilter.module.css'

const GENS = [1,2,3,4,5,6,7,8,9]

export default function GenFilter({ value, onChange }) {
  return (
    <div className={styles.container}>
      {GENS.map(g => (
        <button
          key={g}
          className={`${styles.tab} ${value === g ? styles.active : ''}`}
          onClick={() => onChange(g)}
        >
          {toRoman(g)}
        </button>
      ))}
    </div>
  )
}

function toRoman(n) {
  const map = {1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX'}
  return map[n] || n
}
