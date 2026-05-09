# Gameverse — Data Contracts

Every field the backend must serve, mapped to its external API source.

> **Rule:** The frontend interfaces in `src/data/*.ts` are the source of truth.
> The backend schema must produce these exact shapes — no UI changes allowed.

---

## 1. Game (RAWG API)

**Source interface:** `Game` in `src/data/games.ts` (lines 16–33)
**External API:** RAWG — `GET /api/games/{id}?key=KEY`

| Frontend Field | Type | Required | RAWG Field | Transform |
|---|---|---|---|---|
| `slug` | `string` | ✅ | `slug` | Direct |
| `title` | `string` | ✅ | `name` | Direct |
| `developer` | `string` | ✅ | `developers[0].name` | First entry. Fallback: `"Unknown"` |
| `publisher` | `string` | ✅ | `publishers[0].name` | First entry. Fallback: `"Unknown"` |
| `releaseYear` | `number` | ✅ | `released` | `new Date(released).getFullYear()` |
| `rating` | `number` | ✅ | `metacritic` | Direct (0–100). Fallback: `Math.round(rating * 20)` |
| `userScore` | `number` | ✅ | `rating` | RAWG 0–5 scale → `×2`, round to 1 decimal → 0–10 |
| `genres` | `Genre[]` | ✅ | `genres[].name` | Map through genre normalizer |
| `platforms` | `Platform[]` | ✅ | `platforms[].platform.name` | Map through platform normalizer |
| `cover` | `string` | ✅ | `background_image` | Direct URL |
| `hero` | `string` | ✅ | `background_image` | Same image, larger crop |
| `screenshots` | `string[]` | ✅ | `/games/{id}/screenshots` → `results[].image` | Separate API call |
| `shortDescription` | `string` | ✅ | `description_raw` | First sentence (split on `. `, take `[0]` + `.`) |
| `description` | `string` | ✅ | `description_raw` | Full text, HTML stripped |
| `trending` | `boolean?` | ❌ | Computed | Top 20 by `added` count in recent fetch |
| `featured` | `boolean?` | ❌ | Computed | Top 5 by `metacritic` across all fetched |

### Genre Normalizer

Maps RAWG genre strings → `Genre` union type from `src/data/games.ts` (lines 2–14).

| RAWG `genres[].name` | App `Genre` |
|---|---|
| `"Action"` | `"Action"` |
| `"Role-playing"` or `"RPG"` | `"RPG"` |
| `"Shooter"` | `"Shooter"` |
| `"Strategy"` | `"Strategy"` |
| `"Adventure"` | `"Adventure"` |
| `"Sports"` | `"Sports"` |
| `"Racing"` | `"Racing"` |
| `"Indie"` | `"Indie"` |
| `"Massively Multiplayer"` | `"MMO"` |
| `"Fighting"` | `"Fighting"` |
| `"Simulation"` | `"Simulation"` |
| `"Horror"` (from tags, not genre) | `"Horror"` |
| Anything else (Puzzle, Platformer, etc.) | **Dropped** — not in the union |

### Platform Normalizer

Maps RAWG platform strings → `Platform` union type from `src/data/games.ts` (line 1).

| RAWG `platforms[].platform.name` (contains) | App `Platform` |
|---|---|
| `"PC"` | `"PC"` |
| `"PlayStation 5"` | `"PS5"` |
| `"Xbox Series"` or `"Xbox One"` | `"Xbox"` |
| `"Nintendo Switch"` | `"Switch"` |
| Anything else (PS4, Wii, mobile, etc.) | **Dropped** |

### API Budget

| Call | Count | Frequency |
|---|---|---|
| List endpoints (trending, top, new) | ~10 | Daily |
| Detail per game (`/games/{id}`) | ~200 | Daily |
| Screenshots per game | ~200 | Daily |
| **Total** | **~410/day** | **~12,300/month** (fits 20K free tier) |

---

## 2. Article (RSS Feeds)

**Source interface:** `Article` in `src/data/news.ts` (lines 18–31)
**External sources:** 7 RSS feeds

| Frontend Field | Type | Required | RSS Element | Transform |
|---|---|---|---|---|
| `slug` | `string` | ✅ | `<title>` | `slugify()` — lowercase, strip non-alnum, hyphenate, max 80 chars |
| `title` | `string` | ✅ | `<title>` | HTML entity decode |
| `excerpt` | `string` | ✅ | `<description>` | Strip HTML, truncate to 250 chars at word boundary |
| `body` | `string[]` | ✅ | Fetched from `<link>` URL | Readability extract → split `\n\n` → paragraph array. Fallback: `[excerpt]` |
| `source` | `NewsSource` | ✅ | Feed origin | Hardcoded per feed URL |
| `category` | `NewsCategory` | ✅ | `<category>` + keyword scan | Category classifier (see below) |
| `author` | `string` | ✅ | `<author>` or `<dc:creator>` | Direct. Fallback: `"{Source} Staff"` |
| `publishedAt` | `string` (ISO) | ✅ | `<pubDate>` | `new Date(pubDate).toISOString()` |
| `cover` | `string` | ✅ | `<media:thumbnail>` or `<enclosure>` or first `<img>` in desc | URL extraction with fallback chain |
| `relatedGameSlug` | `string?` | ❌ | Computed | Scan title + excerpt against `games` table slugs/titles |
| `featured` | `boolean?` | ❌ | Computed | Most recent 2 with highest source-priority × recency score |
| `reads` | `number?` | ❌ | None | `0` or omit — not available from RSS |

### RSS Feed URLs

| `NewsSource` | Feed URL |
|---|---|
| `"IGN"` | `https://feeds.feedburner.com/ign/games-all` |
| `"Kotaku"` | `https://kotaku.com/rss` |
| `"Dot Esports"` | `https://dotesports.com/feed` |
| `"PC Gamer"` | `https://www.pcgamer.com/rss/` |
| `"Eurogamer"` | `https://www.eurogamer.net/feed` |
| `"Polygon"` | `https://www.polygon.com/rss/index.xml` |
| `"GameSpot"` | `https://www.gamespot.com/feeds/mashup/` |

### Category Classifier

Maps RSS `<category>` tags + title/excerpt keywords → `NewsCategory` union type.
First match wins. Default: `"Updates"`.

| Signal (case-insensitive scan of tags + title) | `NewsCategory` |
|---|---|
| `esport`, `competitive`, `tournament`, `league`, `championship` | `"Esports"` |
| `review`, `score`, `verdict`, `rated` | `"Reviews"` |
| `update`, `patch`, `season`, `dlc`, `expansion`, `hotfix` | `"Updates"` |
| `acquisition`, `layoff`, `studio`, `hire`, `business`, `revenue` | `"Industry"` |
| `controversy`, `drama`, `leak`, `scandal`, `backlash` | `"Drama"` |
| `gpu`, `cpu`, `hardware`, `console`, `chip`, `nvidia`, `amd` | `"Hardware"` |
| No match | `"Updates"` |

---

## 3. Team (PandaScore API)

**Source interface:** `Team` in `src/data/esports.ts` (lines 3–14)
**External API:** PandaScore — extracted from match `opponents[]` + standings endpoints

| Frontend Field | Type | Required | PandaScore Field | Transform |
|---|---|---|---|---|
| `id` | `string` | ✅ | `opponents[].opponent.slug` | Direct. Fallback: slugify name |
| `name` | `string` | ✅ | `opponents[].opponent.name` | Direct |
| `tag` | `string` | ✅ | `opponents[].opponent.acronym` | Uppercase. Fallback: first 3 chars of name |
| `region` | `string` | ✅ | `opponents[].opponent.location` | Country code → region label (see below) |
| `game` | `EsportsGame` | ✅ | `videogame.name` | Game name normalizer (see below) |
| `logoColor` | `string` | ✅ | **Not available** | Deterministic hex from `hashCode(name) % palette` |
| `wins` | `number` | ✅ | Computed | `COUNT(matches WHERE winner = team AND status = finished)` |
| `losses` | `number` | ✅ | Computed | `COUNT(matches WHERE loser = team AND status = finished)` |
| `points` | `number` | ✅ | `standings.score` or `wins * 3` | From standings endpoint |
| `formStreak` | `("W"\|"L")[]` | ✅ | Computed | Last 5 finished matches → map winner → W/L |

### Region Normalizer

| PandaScore `location` | App region |
|---|---|
| `US`, `CA` | `"NA"` |
| `GB`, `DE`, `FR`, `SE`, `DK`, `ES`, `IT`, `PL`, `FI` | `"EU"` |
| `KR` | `"KR"` |
| `CN` | `"CN"` |
| `RU`, `UA`, `KZ` | `"CIS"` |
| `BR`, `AR` | `"BR"` |
| `JP`, `AU`, `SG`, `PH`, `TH`, `VN`, `ID` | `"APAC"` |
| Anything else | `"INT"` |

### Game Name Normalizer

| PandaScore `videogame.name` | App `EsportsGame` |
|---|---|
| `"CS:GO"`, `"Counter-Strike 2"`, `"CS2"` | `"CS2"` |
| `"LoL"`, `"League of Legends"` | `"League of Legends"` |
| `"Dota 2"` | `"Dota 2"` |
| `"Valorant"` | `"Valorant"` |

### Logo Color Generator

```typescript
function teamLogoColor(name: string): string {
  const palette = [
    "#FACC15", "#F97316", "#A855F7", "#06B6D4",
    "#EF4444", "#3B82F6", "#10B981", "#F59E0B",
    "#8B5CF6", "#EC4899", "#0EA5E9", "#22C55E",
    "#F472B6", "#EAB308",
  ];
  let hash = 0;
  for (const ch of name) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return palette[Math.abs(hash) % palette.length];
}
```

---

## 4. Player (PandaScore API)

**Source interface:** `Player` in `src/data/esports.ts` (lines 16–26)
**External API:** PandaScore — `GET /teams/{id}` → `players[]`

| Frontend Field | Type | Required | PandaScore Field | Transform |
|---|---|---|---|---|
| `id` | `string` | ✅ | `slug` or `"p" + id` | Generated |
| `handle` | `string` | ✅ | `name` (in-game alias) | Direct |
| `realName` | `string` | ✅ | `first_name + " " + last_name` | Concatenated. Fallback: handle |
| `teamId` | `string` | ✅ | Parent team's `slug` | From roster context |
| `game` | `EsportsGame` | ✅ | `current_videogame.name` | Game name normalizer |
| `role` | `string` | ✅ | `role` | Normalize casing. Fallback: `"Player"` |
| `rating` | `number` | ✅ | **Not on free tier** | Default: `1.00` |
| `kda` | `number` | ✅ | **Not on free tier** | Default: `0.00` |
| `signature` | `string` | ✅ | **Not available** | Default: role name (e.g. `"Duelist"`, `"AWP"`) |

> **Note:** `rating`, `kda`, and `signature` require game-specific stat endpoints
> not included in PandaScore's free tier. These will use placeholder defaults.
> The UI still renders — just with `1.00` / `0.00` / role name.

---

## 5. Match (PandaScore API)

**Source interface:** `Match` in `src/data/esports.ts` (lines 28–41)
**External API:** PandaScore — `GET /matches/upcoming`, `GET /matches/past`

| Frontend Field | Type | Required | PandaScore Field | Transform |
|---|---|---|---|---|
| `id` | `string` | ✅ | `slug` or `"m" + id` | Generated |
| `game` | `EsportsGame` | ✅ | `videogame.name` | Game name normalizer |
| `tournament` | `string` | ✅ | `tournament.name` | Direct. Fallback: `league.name` |
| `status` | `"live"\|"upcoming"\|"finished"` | ✅ | `status` | `"running"` → `"live"`, `"not_started"` → `"upcoming"`, `"finished"` → `"finished"` |
| `startsAt` | `string` (ISO) | ✅ | `scheduled_at` or `begin_at` | Direct ISO string |
| `teamAId` | `string` | ✅ | `opponents[0].opponent.slug` | Must match `esports_teams.id` |
| `teamBId` | `string` | ✅ | `opponents[1].opponent.slug` | Must match `esports_teams.id` |
| `scoreA` | `number` | ✅ | `results[0].score` | Direct. Default `0` if upcoming |
| `scoreB` | `number` | ✅ | `results[1].score` | Direct. Default `0` if upcoming |
| `format` | `string` | ✅ | `number_of_games` | `1` → `"BO1"`, `3` → `"BO3"`, `5` → `"BO5"` |
| `currentMap` | `string?` | ❌ | `games[]` last entry if running | Map/game name. `undefined` for upcoming |
| `viewers` | `number?` | ❌ | `streams_list` | Often unavailable on free tier. Default: `undefined` |

### PandaScore API Budget

| Endpoint | Calls/day | Calls/month |
|---|---|---|
| `/matches/upcoming?filter[videogame]={game}` × 4 games | 8 | 240 |
| `/matches/past?filter[videogame]={game}` × 4 games | 8 | 240 |
| `/tournaments/{id}/standings` | ~4 | 120 |
| `/teams/{id}` (roster fetch) | ~16 | 480 |
| **Total** | **~36** | **~1,080** |

> Budget is tight on 1,000 free req/month. Mitigation:
> - Reduce standings fetch to every 2 days
> - Batch team roster lookups (only fetch new/changed teams)
> - Target ≤900 req/month with headroom

---

## Computed Fields Summary

Fields not directly from any API — must be computed by the ingestion logic or query layer:

| Model | Field | How to compute |
|---|---|---|
| `Game` | `trending` | Top 20 by RAWG `added` count in the recent games fetch |
| `Game` | `featured` | Top 5 by `metacritic` score across all fetched games |
| `Article` | `relatedGameSlug` | Scan title + excerpt against `games.slug` and `games.title` |
| `Article` | `featured` | Most recent 2 articles with highest recency × source-priority score |
| `Team` | `wins`, `losses` | `COUNT` from finished matches where team is winner/loser |
| `Team` | `points` | From standings API, or `wins * 3` fallback |
| `Team` | `formStreak` | Last 5 finished matches → `["W","L","W",...]` |
| `Team` | `logoColor` | Deterministic hash of team name → hex palette |
| `Player` | `rating`, `kda`, `signature` | Defaults (`1.00`, `0.00`, role name) — free tier limitation |
