import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import styles from './Layout.module.css'

export default function Layout() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim().toLowerCase()
    if (q) { navigate(`/pokemon/${q}`); setQuery('') }
  }

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>
          pokè<span>dex</span>
        </NavLink>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Pokémon..."
            className={styles.searchInput}
          />
        </form>

        <div className={styles.navLinks}>
          <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>search</NavLink>
          <NavLink to="/compare" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>compare</NavLink>
          <NavLink to="/favourites" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>favourites</NavLink>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
