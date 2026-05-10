# Gameverse Implementation Phases

Execution plan for building the backend and integrating it into the existing TanStack Start + Cloudflare codebase. Every phase is mapped to actual files, components, and TypeScript interfaces in the current codebase.

## Goals

- Keep the current frontend route/component structure intact
- Replace mock `src/data/*` usage with real backend data in controlled phases
- Use Cloudflare-native infrastructure (Workers + D1 + KV + Cron)
- Support news (RSS), games (RAWG), and esports (PandaScore, non-live)
- Every table column maps to an existing TypeScript interface field

## Architecture Baseline

- **Runtime:** TanStack Start server entry on Cloudflare Workers
- **Database:** Cloudflare D1 (7 tables)
- **Cache:** Cloudflare KV
- **Scheduler:** Cron Triggers
- **External sources:** RSS feeds (news), RAWG API (games), PandaScore API (esports)

---

## Phase 0 — Data Contract Audit ✅

### Why

The backend must serve exactly the data shapes that components already consume. Any mismatch means broken UI.

### Steps

1. Lock down the 5 TypeScript interfaces the backend must serve.
2. Map each field to its external API source.
3. Identify fields that require computation.
4. Document which fields can be null/optional vs required.
5. Define the server function signatures for each page's data needs.

---

## Phase 1 — Cloudflare Infrastructure Setup ✅

### Steps

1. Add D1 database binding to `wrangler.jsonc`.
2. Add KV namespace binding.
3. Add secrets configuration for API keys.
4. Set up local D1 for development (`wrangler d1 execute --local`).
5. Create migration directory: `migrations/`.
6. Verify the app still builds and runs with new bindings.

---

## Phase 2 — Database Schema ✅

### Tables (7 total)

1. `articles`, 2. `games`, 3. `esports_teams`, 4. `esports_players`, 5. `esports_matches`, 6. `esports_standings`, 7. `sync_state`.

### Steps

1. Write migration file: `migrations/0001_initial_schema.sql`
2. Write seed migration from current mock data: `migrations/0002_seed_mock_data.sql`
3. Run migrations locally and verify.

---

## Phase 3 — News Ingestion Pipeline (RSS) ✅

### Sources

IGN, Kotaku, Dot Esports, PC Gamer, Eurogamer, Polygon, GameSpot.

### Steps

1. Build RSS parser module: parse `<title>`, `<link>`, `<description>`, `<pubDate>`, `<author>`, `<media:thumbnail>`
2. Build category classifier: map RSS tags/keywords to `NewsCategory` values.
3. Build slug generator.
4. Build article body fetcher using readability heuristics.
5. Build game-title matcher to set `related_game_slug`.
6. Upsert into `articles` with `external_url` dedupe.
7. Log sync result in `sync_state`.
8. Wire cron: every 30 minutes.

---

## Phase 4 — News Server Functions & Frontend Integration ✅

*Goal: Wire up the News routes so they display live data immediately.*

### Steps

1. **Build Queries:** Create `src/server/queries/news.ts` with `getArticleBySlug` and `listArticles` (with filter/sort support).
2. **Detail Route:** Update `src/routes/news.$slug.tsx` loader to call `getArticleBySlug`.
3. **List Route:** Update `src/routes/news.tsx` loader to call `listArticles`.
4. **Home Page (Partial):** Update `src/routes/index.tsx` to load `topStories` and `featuredArticles` from the DB.
5. **Clean Up:** Remove mock usage for news.

### Exit Criteria

- `/news` and `/news/$slug` routes render using data fetched from D1.
- Filters and sorts on the `/news` page work using server-side logic.

---

## Phase 5 — Games Ingestion Pipeline (RAWG) ✅

### Steps

1. Build RAWG API client with retry/backoff and key management.
2. Fetch game lists (trending, top rated, new releases).
3. For each game, fetch detail (`/games/{id}`) and screenshots.
4. Normalize data to match `Game` interface.
5. Compute flags (`featured`, `trending`).
6. Upsert into `games` by RAWG `id`.
7. Wire cron: once daily.

---

## Phase 6 — Games Server Functions & Frontend Integration ✅

*Goal: Wire up the Games routes.*

### Steps

1. **Build Queries:** Create `src/queries/games.ts` with `getGameBySlug`, `listGames`, `getGamesHomepageFn` and `getSimilarGamesFn`.
2. **Detail Route:** Update `src/routes/games_.$slug.tsx` loader to call `getGameBySlugFn`.
3. **List Route:** Update `src/routes/games.index.tsx` loader to call `listGamesFn` with URL search param filtering.
4. **Home Page (Partial):** Update `src/routes/index.tsx` to load games from DB concurrently with news.

---

## Phase 7 — Esports Ingestion Pipeline (PandaScore) (NEXT)

### Steps

1. Fetch upcoming/past matches for Valorant, CS2, LoL, Dota 2.
2. Extract teams into `esports_teams`.
3. Map match status and format.
4. Upsert into `esports_matches`.
5. Fetch standings and rosters (daily).
6. Compute `form_streak` for teams.

---

## Phase 8 — Esports Server Functions & Frontend Integration

*Goal: Wire up the Esports routes and components.*

### Steps

1. **Build Queries:** Create `src/server/queries/esports.ts`.
2. **Detail Route:** Update `src/routes/esports.$matchId.tsx`.
3. **List Route:** Update `src/routes/esports.tsx`.
4. **LiveTicker:** Update `src/components/LiveTicker.tsx` to fetch `getTickerData()`.
5. **Clean Up:** Remove all mock data files completely.

---

## Phase 9 — KV Caching Layer & Global Search

### Steps

1. Build `src/server/cache.ts` — generic read-through cache wrapper.
2. Implement global search (`src/components/SearchDialog.tsx` -> `search()` API).
3. Set TTLs (News: 5m, Games: 10m, Ticker: 5m).
4. Add cache invalidation after cron jobs.

---

## Phase 10 — Reliability + QA

### Steps

1. Add structured logging for ingestion jobs.
2. Add error boundaries and empty states for every page (e.g., "No articles found").
3. Add rate-limit handling for RAWG and PandaScore.
4. Add route loader smoke tests.

---

## Phase 11 — Production Deploy

### Steps

1. Create production D1 database: `wrangler d1 create gameverse-db`
2. Run migrations on production: `wrangler d1 migrations apply gameverse-db`
3. Set production secrets.
4. Configure production cron triggers.
5. Deploy: `wrangler deploy`
6. Trigger initial ingestion runs manually.

---

## Recommended Build Sequence

| Week | Phases | Focus |
|------|--------|-------|
| Week 1 | 0 + 1 + 2 + 3 | Contracts, infra, schema, mock seed, RSS pipeline |
| Week 2 | 4 | **News frontend integration** |
| Week 3 | 5 + 6 | Games pipeline & frontend integration |
| Week 4 | 7 + 8 | Esports pipeline & frontend integration |
| Week 5 | 9 | Caching and Global Search |
| Week 6 | 10 + 11 | QA, error handling, deploy |
