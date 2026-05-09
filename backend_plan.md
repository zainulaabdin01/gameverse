# Gameverse Backend — Aligned to Current Frontend

## What This Is

A data aggregation backend that serves your **existing** React/TanStack Start frontend without changing component props or route structure. Every table, field, and endpoint maps directly to a TypeScript interface or component already in `src/`.

No AI features, no user tracking, no real-time live polling.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  External Sources (Cron)                                 │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐              │
│  │ RSS     │  │ RAWG API │  │ PandaScore │              │
│  │ (News)  │  │ (Games)  │  │ (Esports)  │              │
│  └────┬────┘  └────┬─────┘  └─────┬──────┘              │
│       │            │              │                      │
│       ▼            ▼              ▼                      │
│  ┌─────────────────────────────────────┐                 │
│  │  Ingestion Workers (Cron Triggers)  │                 │
│  └──────────────┬──────────────────────┘                 │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────┐                            │
│  │  Cloudflare D1 (SQLite)  │                            │
│  │  7 tables                │                            │
│  └────────────┬─────────────┘                            │
│               │                                          │
│               ▼                                          │
│  ┌──────────────────────────┐                            │
│  │  Cloudflare KV (Cache)   │                            │
│  └────────────┬─────────────┘                            │
│               │                                          │
│               ▼                                          │
│  ┌──────────────────────────────────────┐                │
│  │  Server Functions / Query Layer      │                │
│  │  (TanStack Start server-entry)       │                │
│  └──────────────┬───────────────────────┘                │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────────┐                │
│  │  Frontend (unchanged components)     │                │
│  │  Route loaders → same props          │                │
│  └──────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

---

## Database — Cloudflare D1

Seven tables, each mapped directly to an existing TypeScript interface.

### `articles` → serves `Article` from `src/data/news.ts`

| Column | Type | Maps to | Source |
|--------|------|---------|--------|
| `id` | INTEGER PK | — | auto |
| `slug` | TEXT UNIQUE | `Article.slug` | generated from title |
| `title` | TEXT | `Article.title` | RSS `<title>` |
| `excerpt` | TEXT | `Article.excerpt` | RSS `<description>` or first ~200 chars |
| `body` | TEXT (JSON array) | `Article.body` | fetched from article URL, split into paragraphs |
| `source` | TEXT | `Article.source` | feed origin (IGN, Kotaku, etc.) |
| `category` | TEXT | `Article.category` | keyword/tag classification |
| `author` | TEXT | `Article.author` | RSS `<author>` or `<dc:creator>` |
| `published_at` | TEXT (ISO) | `Article.publishedAt` | RSS `<pubDate>` |
| `cover` | TEXT | `Article.cover` | RSS `<media:thumbnail>` or `<enclosure>` |
| `related_game_slug` | TEXT | `Article.relatedGameSlug` | matched by game title keywords |
| `featured` | INTEGER (0/1) | `Article.featured` | set by editorial flag or scoring heuristic |
| `reads` | INTEGER | `Article.reads` | estimated or placeholder |
| `external_url` | TEXT UNIQUE | — | dedupe key |
| `fetched_at` | TEXT (ISO) | — | ingestion timestamp |
| `updated_at` | TEXT (ISO) | — | last refresh |

**Why `body` is required:** The detail page at `/news/$slug` renders `article.body` as multiple paragraphs. Without it, detail pages are empty. The old plan explicitly dropped this — that was wrong.

### `games` → serves `Game` from `src/data/games.ts`

| Column | Type | Maps to | Source (RAWG field) |
|--------|------|---------|---------------------|
| `id` | INTEGER PK | — | auto |
| `slug` | TEXT UNIQUE | `Game.slug` | `slug` |
| `title` | TEXT | `Game.title` | `name` |
| `developer` | TEXT | `Game.developer` | `developers[0].name` |
| `publisher` | TEXT | `Game.publisher` | `publishers[0].name` |
| `release_year` | INTEGER | `Game.releaseYear` | `released` (extract year) |
| `rating` | INTEGER | `Game.rating` | `metacritic` (0–100) |
| `user_score` | REAL | `Game.userScore` | `rating` × 2 (RAWG 0–5 → 0–10) |
| `genres` | TEXT (JSON array) | `Game.genres` | `genres[].name`, mapped to app genre set |
| `platforms` | TEXT (JSON array) | `Game.platforms` | `platforms[].platform.name`, mapped to PC/PS5/Xbox/Switch |
| `cover` | TEXT | `Game.cover` | `background_image` |
| `hero` | TEXT | `Game.hero` | `background_image` (larger size) or `background_image_additional` |
| `screenshots` | TEXT (JSON array) | `Game.screenshots` | `/games/{id}/screenshots` endpoint |
| `short_description` | TEXT | `Game.shortDescription` | first sentence of `description_raw` |
| `description` | TEXT | `Game.description` | `description_raw` (full text, HTML stripped) |
| `trending` | INTEGER (0/1) | `Game.trending` | computed from ordering/popularity signals |
| `featured` | INTEGER (0/1) | `Game.featured` | editorial flag or top-N by metacritic |
| `external_id` | INTEGER UNIQUE | — | RAWG `id` for dedupe |
| `fetched_at` | TEXT (ISO) | — | ingestion timestamp |
| `updated_at` | TEXT (ISO) | — | last refresh |

### `esports_teams` → serves `Team` from `src/data/esports.ts`

| Column | Type | Maps to | Source (PandaScore) |
|--------|------|---------|---------------------|
| `id` | TEXT PK | `Team.id` | generated slug from name |
| `name` | TEXT | `Team.name` | `name` |
| `tag` | TEXT | `Team.tag` | `acronym` |
| `region` | TEXT | `Team.region` | `location` |
| `game` | TEXT | `Team.game` | from videogame context |
| `logo_color` | TEXT | `Team.logoColor` | extracted from logo or assigned |
| `logo_url` | TEXT | — | `image_url` (for future use) |
| `wins` | INTEGER | `Team.wins` | computed from match results |
| `losses` | INTEGER | `Team.losses` | computed from match results |
| `points` | INTEGER | `Team.points` | from standings |
| `form_streak` | TEXT (JSON array) | `Team.formStreak` | computed from last 5 match results |
| `external_id` | INTEGER UNIQUE | — | PandaScore team `id` |
| `fetched_at` | TEXT (ISO) | — | ingestion timestamp |
| `updated_at` | TEXT (ISO) | — | last refresh |

### `esports_players` → serves `Player` from `src/data/esports.ts`

| Column | Type | Maps to | Source (PandaScore) |
|--------|------|---------|---------------------|
| `id` | TEXT PK | `Player.id` | generated |
| `handle` | TEXT | `Player.handle` | `name` (in-game name) |
| `real_name` | TEXT | `Player.realName` | `first_name` + `last_name` |
| `team_id` | TEXT FK | `Player.teamId` | from roster |
| `game` | TEXT | `Player.game` | from videogame context |
| `role` | TEXT | `Player.role` | `role` |
| `rating` | REAL | `Player.rating` | from stats or placeholder |
| `kda` | REAL | `Player.kda` | computed from stats |
| `signature` | TEXT | `Player.signature` | most-played agent/hero/weapon |
| `external_id` | INTEGER UNIQUE | — | PandaScore player `id` |
| `fetched_at` | TEXT (ISO) | — | ingestion timestamp |

**Why this table exists:** The match detail page at `/esports/$matchId` calls `playersByGame()` and renders full roster tables with handle, role, rating, KDA, and signature. The old plan had no player data at all.

### `esports_matches` → serves `Match` from `src/data/esports.ts`

| Column | Type | Maps to | Source (PandaScore) |
|--------|------|---------|---------------------|
| `id` | TEXT PK | `Match.id` | generated |
| `game` | TEXT | `Match.game` | `videogame.name` |
| `tournament` | TEXT | `Match.tournament` | `tournament.name` or `league.name` |
| `status` | TEXT | `Match.status` | mapped: running→live, not_started→upcoming, finished→finished |
| `starts_at` | TEXT (ISO) | `Match.startsAt` | `scheduled_at` or `begin_at` |
| `team_a_id` | TEXT FK | `Match.teamAId` | `opponents[0].opponent.id` |
| `team_b_id` | TEXT FK | `Match.teamBId` | `opponents[1].opponent.id` |
| `score_a` | INTEGER | `Match.scoreA` | `results[0].score` |
| `score_b` | INTEGER | `Match.scoreB` | `results[1].score` |
| `format` | TEXT | `Match.format` | `number_of_games` → BO1/BO3/BO5 |
| `current_map` | TEXT | `Match.currentMap` | last game in `games[]` if status=running |
| `viewers` | INTEGER | `Match.viewers` | `streams_list[0].viewers` or null |
| `winner_team_id` | TEXT | — | `winner.id` |
| `external_id` | INTEGER UNIQUE | — | PandaScore match `id` |
| `fetched_at` | TEXT (ISO) | — | ingestion timestamp |
| `updated_at` | TEXT (ISO) | — | last refresh |

### `esports_standings` → serves standings tables on `/esports`

| Column | Type | Maps to |
|--------|------|---------|
| `id` | INTEGER PK | — |
| `game` | TEXT | filter key |
| `league_id` | TEXT | grouping |
| `season` | TEXT | time grouping |
| `team_id` | TEXT FK | join to `esports_teams` |
| `wins` | INTEGER | display |
| `losses` | INTEGER | display |
| `points` | INTEGER | display |
| `rank` | INTEGER | sort order |
| `as_of_date` | TEXT (ISO) | staleness indicator |
| `updated_at` | TEXT (ISO) | ingestion timestamp |

### `sync_state` → ingestion tracking

| Column | Type | Purpose |
|--------|------|---------|
| `key` | TEXT PK | e.g. `news_rss`, `rawg_games`, `pandascore_matches` |
| `last_success_at` | TEXT (ISO) | last successful run |
| `last_error` | TEXT | last failure message |
| `cursor` | TEXT | pagination cursor or page number |
| `request_count` | INTEGER | running monthly total (for PandaScore budget) |
| `notes` | TEXT | debug info |

---

## The Scrapers

### News Scraper — every 30 minutes

**Sources:** IGN, Kotaku, Dot Esports, PC Gamer, Eurogamer, Polygon, GameSpot (matches the 7 sources in your `NewsSource` type)

**What it does:**
1. Fetch RSS/Atom feeds from all 7 sources
2. Parse `<title>`, `<link>`, `<description>`, `<pubDate>`, `<author>`/`<dc:creator>`, `<media:thumbnail>`
3. Generate slug from title
4. Classify category using keyword matching (Esports, Reviews, Industry, Updates, Drama, Hardware — your 6 `NewsCategory` values)
5. Attempt game-title matching against `games` table to set `related_game_slug`
6. **Fetch article body:** Follow the article URL, extract main content, split into paragraph array. Cache fetched bodies to avoid re-fetching. If fetch fails, store excerpt as single-element body.
7. Upsert into `articles` with `external_url` as dedupe key

**Why fetch bodies:** Your `/news/$slug` page renders `article.body.map(p => <p>{p}</p>)`. Without bodies, detail pages show nothing.

### Game Scraper — once daily at 2am

**Source:** RAWG API (free tier: 20,000 req/month)

**What it does:**
1. Fetch lists: trending, top-rated per genre, new releases
2. For each game, fetch detail endpoint for `description_raw`, `developers`, `publishers`
3. Fetch screenshots endpoint for each game
4. Normalize genres to your `Genre` union type (Action, RPG, Shooter, Strategy, Adventure, Sports, Racing, Indie, MMO, Fighting, Simulation, Horror)
5. Normalize platforms to your `Platform` union type (PC, PS5, Xbox, Switch)
6. Compute `trending` and `featured` flags based on popularity/rating thresholds
7. Upsert into `games` by RAWG `id`

**Budget:** ~200 games × 3 API calls each (list + detail + screenshots) = ~600 req/day = ~18,000 req/month. Fits free tier.

### Esports Scraper — two schedules (no live polling)

**Source:** PandaScore API (free tier: 1,000 req/month)

**Job A — Matches sync (every 12 hours)**
1. Fetch upcoming matches for Valorant, CS2, LoL, Dota 2 (4 requests)
2. Fetch recently finished matches for same 4 games (4 requests)
3. Upsert into `esports_matches`
4. Upsert/update teams from match `opponents` into `esports_teams`

**Job B — Standings + rosters sync (daily)**
1. Fetch standings per league for 4 games
2. Fetch team rosters for active teams
3. Upsert `esports_standings` and `esports_players`
4. Recompute `form_streak` from last 5 match results per team

**Budget math:**
- Matches: 8 requests × 2/day = 16/day × 30 = 480/month
- Standings: ~8 requests/day × 30 = 240/month
- Rosters: ~16 requests/day × 30 = ~limited, batch where possible
- **Total: ~750–900/month — fits 1,000 free tier if careful**

**No live polling.** Match statuses are `"upcoming"` or `"finished"` only. The `LiveTicker` component will show upcoming matches with countdown timers. Add a "Last updated X hours ago" badge to the UI.

---

## Frontend Integration Points

These are the **exact places** where `src/data/*` imports need to be replaced:

### Route Loaders (clean seam, swap directly)

| Route | Current code | Backend replacement |
|-------|-------------|---------------------|
| `/games/$slug` | `getGame(params.slug)` | `serverFn: getGameBySlug(slug)` → D1 query |
| `/news/$slug` | `getArticle(params.slug)` | `serverFn: getArticleBySlug(slug)` → D1 query |
| `/esports/$matchId` | `getMatch(params.matchId)` | `serverFn: getMatchById(id)` → D1 query + joined teams |

### List Pages (import arrays → add loaders)

| Route | Current code | Backend replacement |
|-------|-------------|---------------------|
| `/games` | imports `games` array, `useMemo` filter | Add loader with server-side filter/sort/search query |
| `/news` | imports `articles` array, `useMemo` filter | Add loader with server-side filter/sort/search query |
| `/esports` | imports multiple helpers | Add loader returning matches + standings + players by game |

### Home Page (5 data sources, no loader currently)

| Data | Current code | Backend replacement |
|------|-------------|---------------------|
| Lead story | `featuredArticles()` | `serverFn: getFeaturedArticles(limit)` |
| Top stories | `articles.filter(!featured).slice(0,6)` | `serverFn: getRecentArticles(limit, excludeFeatured)` |
| Trending stories | `articles.slice(0,5)` | `serverFn: getTrendingArticles(limit)` |
| Featured games | `featuredGames()` | `serverFn: getFeaturedGames(limit)` |
| Trending games | `trendingGames()` | `serverFn: getTrendingGames(limit)` |
| Live/upcoming matches | `liveMatches()`, `upcomingMatches()` | `serverFn: getUpcomingMatches(limit)` |

Add a composite loader to the home route that calls all of these.

### Cross-Cutting Components (run on every page, not through loaders)

| Component | Current code | Backend replacement |
|-----------|-------------|---------------------|
| `LiveTicker` | imports `liveMatches()`, `upcomingMatches()`, `getTeam()` | Fetch from KV-cached endpoint. Called from root layout, needs lightweight global data fetch. |
| `SearchDialog` | imports `games`, `articles`, `matches` arrays | Add `serverFn: search(query)` that searches across all 3 tables. Return top matches per domain. |

**LiveTicker strategy:** Since there's no live polling, the ticker shows upcoming matches with countdown timers. Pre-cache the ticker payload in KV with a 5-minute TTL. Fetch once on root layout mount via a client-side query (React Query) or a root loader.

**SearchDialog strategy:** Either (a) fetch all data client-side on dialog open (fast for small datasets), or (b) add a server search function that returns top-N per domain. Option (b) scales better.

---

## Caching — Cloudflare KV

| Key Pattern | TTL | Serves |
|-------------|-----|--------|
| `articles:list:{filters}` | 5 min | `/news` list page |
| `articles:slug:{slug}` | 10 min | `/news/$slug` detail |
| `articles:featured` | 5 min | Home page lead stories |
| `games:list:{filters}` | 10 min | `/games` list page |
| `games:slug:{slug}` | 30 min | `/games/$slug` detail |
| `games:featured` | 30 min | Home page spotlight |
| `games:trending` | 30 min | Home page heat check |
| `matches:upcoming` | 5 min | LiveTicker + home page |
| `matches:list:{game}:{status}` | 5 min | `/esports` sections |
| `matches:id:{id}` | 10 min | `/esports/$matchId` detail |
| `standings:{game}` | 60 min | `/esports` standings tables |
| `players:{game}` | 60 min | `/esports/$matchId` roster tables |
| `search:{query}` | 2 min | SearchDialog results |
| `ticker` | 5 min | LiveTicker global payload |

---

## Cron Schedule

| Job | Frequency | Budget Impact |
|-----|-----------|---------------|
| News scraper | Every 30 min | Free (RSS) |
| Game scraper | Once daily at 2am UTC | ~600 RAWG req/day |
| Esports matches sync | Every 12 hours | ~16 PandaScore req/day |
| Esports standings + rosters sync | Once daily | ~24 PandaScore req/day |

---

## Services

| Service | Purpose | Cost |
|---------|---------|------|
| Cloudflare D1 | Database (7 tables) | Free |
| Cloudflare KV | Response cache | Free |
| Cloudflare Cron Triggers | Scheduled scrapers | Free |
| PandaScore | Esports data | Free (1K req/month) |
| RAWG | Game database | Free (20K req/month) |
| RSS feeds (7 sources) | News data | Free, no key |

---

## Build Order

### Week 1 — Infrastructure + Schema
Set up D1 + KV bindings in `wrangler.jsonc`. Write all 7 table migrations. Seed with current mock data from `src/data/*` so queries work immediately.

### Week 2 — News Pipeline
Build RSS parsers for all 7 sources. Implement article body fetching. Test category classification. Wire up cron. Verify articles land in D1 matching `Article` interface.

### Week 3 — Games Pipeline
Build RAWG client. Implement genre/platform normalization to match your exact `Genre` and `Platform` union types. Fetch screenshots. Wire up daily cron. Verify games in D1 match `Game` interface.

### Week 4 — Esports Pipeline
Build PandaScore client with budget controls. Ingest matches, teams, players, standings. Verify all 4 esports-related tables serve the data that `/esports` and `/esports/$matchId` need.

### Week 5 — Query Layer + Frontend Integration
Build server functions for every route. Replace detail route loaders first, then list pages. Add home page composite loader. Swap LiveTicker and SearchDialog data sources. Add KV caching.

### Week 6 — Polish + Deploy
Error handling, empty states, staleness badges, rate-limit fallbacks. Test all routes end-to-end. Deploy with `wrangler deploy`. Monitor first 48 hours.

---

## Non-Goals for This Cycle

- AI summaries / recommendation engine
- User accounts / authentication
- User behavior tracking
- Real-time live esports score updates
- Comments or social features

These can be layered on once the core data pipeline is stable.