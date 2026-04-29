## Gameverse — One-stop gaming destination

A dark, premium, console-storefront-inspired gaming hub with news, esports, and a game directory — all powered by rich realistic mock data so the UI feels truly alive from first load.

### Visual direction — "Console Premium"

- Deep charcoal background (`#0E0E10`-ish) with layered surfaces, subtle gradients
- Bold orange/red accent (think PlayStation Plus / Xbox Game Pass energy) for CTAs, live indicators, hover states
- Large cinematic hero imagery, generous use of game key art
- Sharp typography: a strong display font for headlines, clean sans for body
- Smooth hover lifts, fade-ins, ticker animations, glowing "LIVE" pulses
- Sticky top nav, persistent live esports score ticker bar across the top

### Pages & structure

```
/              Home — hero, top stories, live ticker, featured games
/news          News Hub — filterable article feed
/news/$slug    Article detail page
/esports       Esports — live matches, upcoming, standings, player stats
/esports/$matchId   Match detail (scores, teams, stats)
/games         Game Directory — searchable library w/ filters
/games/$slug   Game detail — description, screenshots, related news
```

### Home page

- Cinematic hero carousel: 3-4 featured games / breaking stories with key art
- Live esports ticker bar (auto-scrolling) right under nav: live scores + upcoming matches
- "Top Stories" grid (6-8 articles with source logos: IGN, Kotaku, Dot Esports…)
- "Live & Upcoming Matches" rail (horizontal scroll cards)
- "Featured Games" rail with hover key art reveals
- "Trending" sidebar (most-read articles, hot teams)

### News Hub (/news)

- Sticky filter bar: source (IGN, Kotaku, Dot Esports, PC Gamer, Eurogamer…), category (Esports, Reviews, Industry, Updates, Drama), time range
- Search input
- Mixed layout: featured article up top, then masonry/grid of cards
- Each card: cover image, source badge, headline, excerpt, time-ago, category chip
- Article detail page: hero image, full mock body, related articles, source attribution link

### Esports (/esports)

- Tabs / sections: Live Now · Upcoming · Results · Standings · Player Stats
- Game filter pills: Valorant, CS2, League of Legends, Dota 2
- Live match cards: team logos, live score, current map/round, viewer count, "LIVE" pulse
- Upcoming: tournament name, teams, time, format
- Standings table per game (team, W-L, points, form streak)
- Top players leaderboard (KDA, rating, agent/champion)
- Match detail page: scoreboard, map-by-map, player stats table

### Game Directory (/games)

- Powerful search + filters: genre, platform (PC, PS5, Xbox, Switch), rating range, release year
- Sort: popularity, rating, release date, alphabetical
- Grid of game cards: cover, title, platforms, rating, genre tags
- Game detail: hero key art, description, metacritic-style score, platforms, screenshots gallery, recent related news from the news data

### Mock data approach

Curated, realistic dataset shipped as TypeScript files in `src/data/`:
- `games.ts` — ~60 real game titles with cover URLs, genres, platforms, ratings, descriptions
- `news.ts` — ~40 articles across the listed outlets with realistic headlines, excerpts, bodies, timestamps
- `matches.ts` — live + upcoming + finished matches across 4 esports titles
- `teams.ts` + `players.ts` — standings and stats
- Cross-references: each game links to related news; each match links to teams/players

Live feel via small touches: a tick interval that randomly nudges live match scores/viewers every few seconds, "time-ago" labels, "LIVE" pulse animation.

### Out of scope (this build)

- Real APIs / backend / Lovable Cloud
- AI article summaries
- User accounts, favorites, watchlists
- Comments, payments

These can be layered on later — UI is structured so swapping mock data for real fetchers is straightforward.

### Technical notes

- TanStack Start file-based routes, one file per page (proper SSR + SEO; each route gets its own `head()` metadata)
- Tailwind v4 design tokens extended in `src/styles.css` for the dark+orange palette (oklch); keep shadcn primitives, restyle via tokens
- Shared components: `TopNav`, `LiveTicker`, `ArticleCard`, `MatchCard`, `GameCard`, `Filters`, `SectionHeader`
- Mock data lives in `src/data/*.ts`; small `useLiveTicker` hook drives the score nudges with `setInterval`
- Game/news/match images sourced from public CDNs (Unsplash, IGDB-style placeholders) referenced by URL — no asset imports
