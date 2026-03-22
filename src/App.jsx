import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import SearchPage from './pages/SearchPage'
import PokemonPage from './pages/PokemonPage'
import ComparePage from './pages/ComparePage'
import FavouritesPage from './pages/FavouritesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SearchPage />} />
          <Route path="pokemon/:nameOrId" element={<PokemonPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="favourites" element={<FavouritesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
