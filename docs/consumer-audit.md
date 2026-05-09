# Gameverse — Data Consumer Audit

Every file that imports from `src/data/*`, what it uses, and what server function will replace it.

---

## Route Files

### `src/routes/index.tsx` — Home Page

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `articles, featuredArticles` | `@/data/news` | All `Article` fields | `getHomepageData().featuredArticles`, `.topStories`, `.trendingArticles` |
| `featuredGames, trendingGames` | `@/data/games` | All `Game` fields | `getHomepageData().featuredGames`, `.trendingGames` |
| `liveMatches, upcomingMatches` | `@/data/esports` | All `Match` fields | `getHomepageData().upcomingMatches` |

**Migration:** Add a route loader calling the composite `getHomepageData()` server function. Remove all 3 data imports.

---

### `src/routes/news.tsx` — News Hub

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `articles` | `@/data/news` | Full array, client-side `useMemo` filter | `listArticles(filters)` server function |
| `categories` | `@/data/news` | `NewsCategory[]` for filter chips | Keep as static constant (no backend needed) |
| `sources` | `@/data/news` | `NewsSource[]` for filter chips | Keep as static constant (no backend needed) |
| `type NewsCategory` | `@/data/news` | Type only | Re-export from `@/server/types` or keep from `@/data/news` |
| `type NewsSource` | `@/data/news` | Type only | Re-export from `@/server/types` or keep from `@/data/news` |

**Migration:** Add a route loader with `ArticleFilters`. Replace `useMemo` filtering with server-side query. Keep `sources` and `categories` arrays as static constants (can live in the types module or stay in `news.ts`).

---

### `src/routes/news.$slug.tsx` — Article Detail

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `articles, getArticle` | `@/data/news` | `getArticle(slug)`, `articles.filter(category)` | `getArticleBySlug(slug)` → returns `ArticleDetailData` |
| `getGame` | `@/data/games` | `getGame(relatedGameSlug)` | Included in `ArticleDetailData.relatedGame` |

**Migration:** Replace loader to call `getArticleBySlug(slug)` which returns article + relatedGame + relatedArticles in one query.

---

### `src/routes/games.tsx` — Game Directory

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `games` | `@/data/games` | Full array, client-side `useMemo` filter | `listGames(filters)` server function |
| `type Genre` | `@/data/games` | Type only | Keep |
| `type Platform` | `@/data/games` | Type only | Keep |

**Migration:** Add route loader with `GameFilters`. Replace client-side filtering with server-side query.

---

### `src/routes/games.$slug.tsx` — Game Detail

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `getGame, games as allGames` | `@/data/games` | `getGame(slug)`, `allGames.filter(genre match)` | `getGameBySlug(slug)` → returns `GameDetailData` |
| `articlesByGame` | `@/data/news` | `articlesByGame(slug)` | Included in `GameDetailData.relatedNews` |

**Migration:** Replace loader to call `getGameBySlug(slug)` which returns game + relatedNews + similarGames in one query.

---

### `src/routes/esports.tsx` — Esports Hub

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `esportsGames` | `@/data/esports` | `EsportsGame[]` for filter tabs | Keep as static constant |
| `liveMatches` | `@/data/esports` | `Match[]` filtered by game | `listEsports(filters).liveMatches` |
| `upcomingMatches` | `@/data/esports` | `Match[]` filtered by game | `listEsports(filters).upcomingMatches` |
| `finishedMatches` | `@/data/esports` | `Match[]` filtered by game | `listEsports(filters).finishedMatches` |
| `teamsByGame` | `@/data/esports` | `Team[]` sorted by points | `listEsports(filters).teamsByGame` |
| `playersByGame` | `@/data/esports` | `Player[]` sorted by rating | `listEsports(filters).playersByGame` |
| `type EsportsGame` | `@/data/esports` | Type only | Keep |

**Migration:** Add route loader with `EsportsFilters`. One server call returns all match/team/player data grouped by game.

---

### `src/routes/esports.$matchId.tsx` — Match Detail

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `getMatch` | `@/data/esports` | `getMatch(matchId)` | `getMatchById(id)` → returns `MatchDetailData` |
| `getTeam` | `@/data/esports` | `getTeam(teamAId)`, `getTeam(teamBId)` | Included in `MatchDetailData.teamA`, `.teamB` |
| `playersByGame` | `@/data/esports` | `playersByGame(game).filter(teamId)` | Included in `MatchDetailData.playersA`, `.playersB` |
| `matchesByGame` | `@/data/esports` | Other matches from same tournament | Included in `MatchDetailData.relatedMatches` |

**Migration:** Replace loader to call `getMatchById(id)` which returns match + both teams + both rosters + related tournament matches.

---

## Component Files

### `src/components/LiveTicker.tsx` — Global Live Ticker

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `liveMatches` | `@/data/esports` | `Match[]` (status=live) | `getTickerData().matches` |
| `upcomingMatches` | `@/data/esports` | `Match[]` (status=upcoming) | Included in `getTickerData().matches` |
| `getTeam` | `@/data/esports` | `Team` for each match | `getTickerData().teams` (pre-resolved map) |
| `type Match` | `@/data/esports` | Type only | Keep |

**Migration:** This runs in the root layout on every page. Options:
1. Root layout loader fetches `getTickerData()` and passes via context
2. React Query client-side fetch with 5-min stale time
3. KV-cached endpoint called on mount

Recommendation: Option 1 (root loader) for SSR, with KV-cached backing query.

---

### `src/components/SearchDialog.tsx` — Global Search (⌘K)

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `games` | `@/data/games` | Full array, client-side filter by title/developer/genre | `search(query).games` |
| `articles` | `@/data/news` | Full array, client-side filter by title/excerpt/category/source | `search(query).articles` |
| `matches, getTeam` | `@/data/esports` | Full array + team lookup, filter by tournament/game/team name | `search(query).matches` |

**Migration:** Replace all 3 array imports + `useMemo` filters with a debounced call to `search(query)` server function. The server does `LIKE '%query%'` across all 3 tables and returns top-N per domain.

---

### `src/components/MatchCard.tsx` — Match Card

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `type Match` | `@/data/esports` | Type only | Keep (or re-export from types) |
| `getTeam` | `@/data/esports` | Resolves team by ID for display | **Change component to accept `teamA` and `teamB` as props** instead of calling `getTeam` internally |

**Migration:** The parent already has team data from its loader. Pass `teamA`/`teamB` props down instead of having the component import and call `getTeam`. This is a small refactor.

---

### `src/components/ArticleCard.tsx` — Article Card

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `type Article` | `@/data/news` | Type only | Keep |

**No migration needed** — type-only import.

---

### `src/components/GameCard.tsx` — Game Card

| Import | From | Fields Used | Replacement |
|---|---|---|---|
| `type Game` | `@/data/games` | Type only | Keep |

**No migration needed** — type-only import.

---

## Reference Routes (will be removed after backend integration)

| File | Imports | Status |
|---|---|---|
| `routes/reference.news.tsx` | `type Article` | Delete after backend is live |
| `routes/reference.games.tsx` | `type Game, Genre, Platform` | Delete after backend is live |
| `routes/reference.esports.tsx` | `getTeam`, `type Match, Player, Team` | Delete after backend is live |

---

## Summary — Required Server Functions

| Server Function | Serves | Called From |
|---|---|---|
| `getHomepageData()` | Home page composite loader | `routes/index.tsx` |
| `listArticles(ArticleFilters)` | News list with server-side filtering | `routes/news.tsx` |
| `getArticleBySlug(slug)` | Article detail + related game + related articles | `routes/news.$slug.tsx` |
| `listGames(GameFilters)` | Game directory with server-side filtering | `routes/games.tsx` |
| `getGameBySlug(slug)` | Game detail + related news + similar games | `routes/games.$slug.tsx` |
| `listEsports(EsportsFilters)` | Matches + standings + players by game | `routes/esports.tsx` |
| `getMatchById(id)` | Match detail + teams + players + related matches | `routes/esports.$matchId.tsx` |
| `getTickerData()` | LiveTicker global component | `components/LiveTicker.tsx` via root layout |
| `search(query)` | SearchDialog cross-domain search | `components/SearchDialog.tsx` |

**Total: 9 server functions** to replace all mock data imports.
