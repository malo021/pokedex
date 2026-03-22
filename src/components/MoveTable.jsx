import { useState, useEffect, useRef } from 'react'
import TypeBadge from './TypeBadge'
import { getMoveLevel } from '../utils/api'
import styles from './MoveTable.module.css'

const moveCache = {}

async function fetchMoveData(url) {
  if (moveCache[url]) return moveCache[url]
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const result = {
    type: data.type?.name || null,
    category: data.damage_class?.name || null,
    power: data.power || null,
    accuracy: data.accuracy || null,
  }
  moveCache[url] = result
  return result
}

const CATEGORY_COLORS = {
  physical: { bg: '#3A1A0A', color: '#F07A3A' },
  special:  { bg: '#0A1A3A', color: '#5A9AE8' },
  status:   { bg: '#1A1A2A', color: '#8A8AB8' },
}

export default function MoveTable({ moves, gen, showLevel = false }) {
  const [moveData, setMoveData] = useState({})
  const fetching = useRef(new Set())

  useEffect(() => {
    if (!moves || moves.length === 0) return
    const toFetch = moves.filter(m => !moveData[m.move.name] && !fetching.current.has(m.move.name))
    if (toFetch.length === 0) return

    toFetch.forEach(m => fetching.current.add(m.move.name))

    const BATCH = 10
    async function fetchBatch(batch) {
      const results = await Promise.all(
        batch.map(m => fetchMoveData(m.move.url).then(data => ({ name: m.move.name, data })))
      )
      setMoveData(prev => {
        const next = { ...prev }
        results.forEach(({ name, data }) => { if (data) next[name] = data })
        return next
      })
    }

    for (let i = 0; i < toFetch.length; i += BATCH) {
      fetchBatch(toFetch.slice(i, i + BATCH))
    }
  }, [moves])

  if (!moves || moves.length === 0) {
    return <p className={styles.empty}>No moves available for this generation.</p>
  }

  return (
    <div className={styles.table}>
      <div className={styles.header}>
        {showLevel && <span className={styles.lvlHead}>lv</span>}
        <span className={styles.nameHead}>move</span>
        <span className={styles.typeHead}>type</span>
        <span className={styles.catHead}>cat</span>
        <span className={styles.pwrHead}>pwr</span>
        <span className={styles.accHead}>acc</span>
      </div>
      {moves.map(m => {
        const level = showLevel ? getMoveLevel(m, gen) : null
        const data = moveData[m.move.name]
        const cat = data?.category
        const catStyle = cat ? CATEGORY_COLORS[cat] : null

        return (
          <div key={m.move.name} className={styles.row}>
            {showLevel && <span className={styles.lvl}>{level || '—'}</span>}
            <span className={styles.moveName}>{m.move.name.replace(/-/g, ' ')}</span>
            <span className={styles.typeCell}>
              {data?.type
                ? <TypeBadge type={data.type} size="sm" />
                : <span className={styles.dash}>—</span>
              }
            </span>
            <span className={styles.catCell}>
              {catStyle
                ? <span className={styles.catBadge} style={{ background: catStyle.bg, color: catStyle.color }}>{cat}</span>
                : <span className={styles.dash}>—</span>
              }
            </span>
            <span className={styles.pwrCell}>{data?.power ?? '—'}</span>
            <span className={styles.accCell}>{data?.accuracy ? `${data.accuracy}%` : '—'}</span>
          </div>
        )
      })}
    </div>
  )
}