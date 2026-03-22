Pokédex
A clean, modern Pokédex built with React. Search any Pokémon, explore stats, moves, and locations filtered by generation, and compare two Pokémon side by side.
Live at pokedex-zeta-blue.vercel.app

Features
Search

Search any Pokémon by name or number
Landing page with a curated grid of popular Pokémon

Pokémon detail view

Base stats with colour-coded bars (red → orange → yellow → green → blue based on value)
Typing, abilities (with hidden ability indicator), height, weight, catch rate
Flavour text and evolution chain
Save to favourites (stored in localStorage)

Moves

Level-up, TM/HM, and Move Tutor tabs
Filtered by generation — only shows moves available in the selected gen
Displays move type, damage category (physical / special / status), power, and accuracy
HMs distinguished from TMs with a separate colour badge

Locations

Wild encounter locations filtered by generation and game version
Badge progress context for Gens 1–5 (e.g. "after 2★ (Forest Badge)")
Earliest obtainable location highlighted at the top
Legendary Pokémon show their static encounter location per game, or "Trade from another game" if unavailable
Pokémon only obtainable by evolution show "evolve [pre-evolution]"

Compare

Side-by-side stat comparison with visual bars highlighting the winner
Individual generation filter per Pokémon (cross-gen comparison supported)
Move comparison with shared move detection across all three move categories

Favourites

Save and remove Pokémon from a persistent favourites list
