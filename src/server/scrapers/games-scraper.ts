/**
 * Games Scraper — RAWG API Ingestion Pipeline
 *
 * Fetches games from the RAWG API, transforms them into the
 * Game schema, and upserts into D1.
 *
 * Endpoints used:
 *   GET /games          — list of games (trending, top-rated, new)
 *   GET /games/{id}     — full detail (description, developers, publishers)
 *   GET /games/{id}/screenshots — high-res screenshots
 */
import { slugify, normalizeGenre, normalizePlatform } from "@/server/types";
import type { Genre, Platform } from "@/server/types";

// ─────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────

const RAWG_BASE = "https://api.rawg.io/api";

/** Max games to process per scrape run. */
const MAX_GAMES = 40;

/** Max detail fetches per run (rate limiting). */
const MAX_DETAIL_FETCHES = 40;

/** Delay between detail requests (ms) to respect rate limits. */
const DETAIL_DELAY_MS = 250;

/** Max screenshots to store per game. */
const MAX_SCREENSHOTS = 4;

// ─────────────────────────────────────────────────
// RAWG API Response Types
// ─────────────────────────────────────────────────

interface RawgListResponse {
  count: number;
  next: string | null;
  results: RawgGameSummary[];
}

interface RawgGameSummary {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  rating: number; // 0-5
  ratings_count: number;
  metacritic: number | null;
  genres: Array<{ id: number; name: string }>;
  platforms: Array<{ platform: { id: number; name: string } }> | null;
}

interface RawgGameDetail {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  background_image_additional: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  description_raw: string;
  genres: Array<{ id: number; name: string }>;
  platforms: Array<{ platform: { id: number; name: string } }> | null;
  developers: Array<{ id: number; name: string }>;
  publishers: Array<{ id: number; name: string }>;
}

interface RawgScreenshotResponse {
  count: number;
  results: Array<{ id: number; image: string }>;
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

/** Sleep for a given number of milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Truncate description to a short blurb. */
function truncateDesc(text: string, maxLen: number): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/** Extract release year from a date string like "2024-03-15". */
function extractYear(released: string | null): number {
  if (!released) return 0;
  const year = parseInt(released.slice(0, 4), 10);
  return isNaN(year) ? 0 : year;
}

/** Convert RAWG rating (0-5) to our 0-100 scale. */
function ratingTo100(rating: number): number {
  return Math.round(rating * 20);
}

/** Convert RAWG rating (0-5) to our 0-10 user score. */
function ratingTo10(rating: number): number {
  return Math.round(rating * 20) / 10;
}

/** Map RAWG genres to our Genre union. */
function mapGenres(rawgGenres: Array<{ name: string }>): Genre[] {
  const mapped: Genre[] = [];
  const seen = new Set<Genre>();
  for (const g of rawgGenres) {
    const normalized = normalizeGenre(g.name);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      mapped.push(normalized);
    }
  }
  return mapped;
}

/** Map RAWG platforms to our Platform union. */
function mapPlatforms(
  rawgPlatforms: Array<{ platform: { name: string } }> | null,
): Platform[] {
  if (!rawgPlatforms) return [];
  const mapped: Platform[] = [];
  const seen = new Set<Platform>();
  for (const p of rawgPlatforms) {
    const normalized = normalizePlatform(p.platform.name);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      mapped.push(normalized);
    }
  }
  return mapped;
}

// ─────────────────────────────────────────────────
// API Fetchers
// ─────────────────────────────────────────────────

/** Fetch a list of games from RAWG with given params. */
async function fetchGameList(
  apiKey: string,
  params: Record<string, string>,
): Promise<RawgGameSummary[]> {
  const url = new URL(`${RAWG_BASE}/games`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("page_size", "20");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Gameverse/1.0 (+https://gameverse.dev)",
    },
  });

  if (!res.ok) {
    console.warn(`[games-scraper] List fetch returned ${res.status}: ${await res.text()}`);
    return [];
  }

  const data = (await res.json()) as RawgListResponse;
  return data.results ?? [];
}

/** Fetch full game detail from RAWG. */
async function fetchGameDetail(
  apiKey: string,
  gameId: number,
): Promise<RawgGameDetail | null> {
  const url = `${RAWG_BASE}/games/${gameId}?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Gameverse/1.0" },
    });

    if (!res.ok) {
      console.warn(`[games-scraper] Detail fetch for ${gameId} returned ${res.status}`);
      return null;
    }

    return (await res.json()) as RawgGameDetail;
  } catch (err) {
    console.error(`[games-scraper] Detail fetch for ${gameId} failed:`, err);
    return null;
  }
}

/** Fetch screenshots for a game from RAWG. */
async function fetchScreenshots(
  apiKey: string,
  gameId: number,
): Promise<string[]> {
  const url = `${RAWG_BASE}/games/${gameId}/screenshots?key=${apiKey}&page_size=${MAX_SCREENSHOTS}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Gameverse/1.0" },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as RawgScreenshotResponse;
    return (data.results ?? []).map((s) => s.image);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────
// Main scraper
// ─────────────────────────────────────────────────

export interface GameScrapeResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  totalProcessed: number;
}

/**
 * Scrape games from the RAWG API and upsert into D1.
 *
 * @param db - D1 database binding
 * @param apiKey - RAWG API key
 */
export async function scrapeGames(
  db: D1Database,
  apiKey: string,
): Promise<GameScrapeResult> {
  const result: GameScrapeResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    totalProcessed: 0,
  };

  if (!apiKey) {
    console.error("[games-scraper] No RAWG_API_KEY provided. Aborting.");
    return result;
  }

  console.log("[games-scraper] Starting RAWG ingestion...");

  // ── Step 1: Fetch game lists from multiple angles ──

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  // Fetch several lists in parallel for diversity
  const [trending, topRated, newReleases, popular] = await Promise.all([
    fetchGameList(apiKey, {
      ordering: "-added",
      dates: `${lastYear}-01-01,${currentYear}-12-31`,
      metacritic: "70,100",
    }),
    fetchGameList(apiKey, {
      ordering: "-metacritic",
      metacritic: "80,100",
    }),
    fetchGameList(apiKey, {
      ordering: "-released",
      dates: `${lastYear}-06-01,${currentYear}-12-31`,
    }),
    fetchGameList(apiKey, {
      ordering: "-rating",
      metacritic: "75,100",
      dates: `${currentYear - 3}-01-01,${currentYear}-12-31`,
    }),
  ]);

  // Deduplicate by RAWG id
  const seen = new Set<number>();
  const trendingIds = new Set<number>();
  const allGames: Array<{ summary: RawgGameSummary; isTrending: boolean; isFeatured: boolean }> = [];

  const addGames = (
    list: RawgGameSummary[],
    options: { trending?: boolean; featured?: boolean } = {},
  ) => {
    for (const game of list) {
      if (seen.has(game.id)) {
        // Mark existing entries as trending/featured if applicable
        if (options.trending) trendingIds.add(game.id);
        continue;
      }
      seen.add(game.id);
      if (options.trending) trendingIds.add(game.id);
      allGames.push({
        summary: game,
        isTrending: options.trending ?? false,
        isFeatured: options.featured ?? false,
      });
    }
  };

  // Trending = recently added with high metacritic
  addGames(trending, { trending: true });
  // Top rated = featured
  addGames(topRated, { featured: true });
  // New releases
  addGames(newReleases, { trending: true });
  // Popular recent
  addGames(popular, { featured: true });

  // Cap at MAX_GAMES
  const toProcess = allGames.slice(0, MAX_GAMES);

  console.log(
    `[games-scraper] Fetched ${allGames.length} unique games, processing ${toProcess.length}`,
  );

  if (toProcess.length === 0) {
    await updateSyncState(db, "No games fetched from RAWG");
    return result;
  }

  // ── Step 2: Fetch details + screenshots for each game ──

  let detailsFetched = 0;

  for (const { summary, isTrending, isFeatured } of toProcess) {
    try {
      result.totalProcessed++;

      // Rate limiting
      if (detailsFetched > 0 && detailsFetched < MAX_DETAIL_FETCHES) {
        await sleep(DETAIL_DELAY_MS);
      }

      if (detailsFetched >= MAX_DETAIL_FETCHES) {
        // Fallback: upsert with summary data only
        await upsertFromSummary(db, summary, isTrending, isFeatured);
        result.inserted++;
        continue;
      }

      // Fetch detail and screenshots in parallel
      const [detail, screenshots] = await Promise.all([
        fetchGameDetail(apiKey, summary.id),
        fetchScreenshots(apiKey, summary.id),
      ]);
      detailsFetched++;

      if (!detail) {
        // Fallback to summary data
        await upsertFromSummary(db, summary, isTrending, isFeatured);
        result.inserted++;
        continue;
      }

      // Build the full game record
      const slug = slugify(detail.name);
      if (!slug) {
        result.skipped++;
        continue;
      }

      const genres = mapGenres(detail.genres);
      const platforms = mapPlatforms(detail.platforms);
      const developer = detail.developers?.[0]?.name ?? "";
      const publisher = detail.publishers?.[0]?.name ?? "";
      const releaseYear = extractYear(detail.released);
      const rating = detail.metacritic ?? ratingTo100(detail.rating);
      const userScore = ratingTo10(detail.rating);
      const cover = detail.background_image ?? "";
      const hero = detail.background_image_additional ?? detail.background_image ?? "";
      const shortDesc = truncateDesc(detail.description_raw, 200);
      const description = detail.description_raw ?? "";

      const upsertResult = await db
        .prepare(
          `INSERT INTO games
           (slug, title, developer, publisher, release_year, rating, user_score,
            genres, platforms, cover, hero, screenshots, short_description, description,
            trending, featured, external_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(external_id) DO UPDATE SET
             title = excluded.title,
             developer = excluded.developer,
             publisher = excluded.publisher,
             release_year = excluded.release_year,
             rating = excluded.rating,
             user_score = excluded.user_score,
             genres = excluded.genres,
             platforms = excluded.platforms,
             cover = excluded.cover,
             hero = excluded.hero,
             screenshots = excluded.screenshots,
             short_description = excluded.short_description,
             description = excluded.description,
             trending = excluded.trending,
             featured = excluded.featured,
             updated_at = datetime('now')`,
        )
        .bind(
          slug,
          detail.name,
          developer,
          publisher,
          releaseYear,
          rating,
          userScore,
          JSON.stringify(genres),
          JSON.stringify(platforms),
          cover,
          hero,
          JSON.stringify(screenshots),
          shortDesc,
          description,
          isTrending || trendingIds.has(summary.id) ? 1 : 0,
          isFeatured ? 1 : 0,
          detail.id,
        )
        .run();

      if (upsertResult.meta.changes > 0) {
        result.inserted++;
      } else {
        result.skipped++;
      }
    } catch (err) {
      console.error(
        `[games-scraper] Error processing "${summary.name}":`,
        err,
      );
      result.errors++;
    }
  }

  // ── Step 3: Mark top featured games ──
  await markFeaturedGames(db);

  // ── Step 4: Update sync state ──
  await updateSyncState(db, null, result.totalProcessed);

  console.log(
    `[games-scraper] Done — inserted: ${result.inserted}, updated: ${result.updated}, skipped: ${result.skipped}, errors: ${result.errors}`,
  );

  return result;
}

// ─────────────────────────────────────────────────
// Summary-only upsert (fallback when detail unavailable)
// ─────────────────────────────────────────────────

async function upsertFromSummary(
  db: D1Database,
  summary: RawgGameSummary,
  isTrending: boolean,
  isFeatured: boolean,
): Promise<void> {
  const slug = slugify(summary.name);
  if (!slug) return;

  const genres = mapGenres(summary.genres);
  const platforms = mapPlatforms(summary.platforms);
  const releaseYear = extractYear(summary.released);
  const rating = summary.metacritic ?? ratingTo100(summary.rating);
  const userScore = ratingTo10(summary.rating);
  const cover = summary.background_image ?? "";

  await db
    .prepare(
      `INSERT INTO games
       (slug, title, developer, publisher, release_year, rating, user_score,
        genres, platforms, cover, hero, screenshots, short_description, description,
        trending, featured, external_id)
       VALUES (?, ?, '', '', ?, ?, ?, ?, ?, ?, ?, '[]', '', '', ?, ?, ?)
       ON CONFLICT(external_id) DO UPDATE SET
         title = excluded.title,
         release_year = excluded.release_year,
         rating = excluded.rating,
         user_score = excluded.user_score,
         genres = excluded.genres,
         platforms = excluded.platforms,
         cover = excluded.cover,
         hero = excluded.hero,
         trending = excluded.trending,
         featured = excluded.featured,
         updated_at = datetime('now')`,
    )
    .bind(
      slug,
      summary.name,
      releaseYear,
      rating,
      userScore,
      JSON.stringify(genres),
      JSON.stringify(platforms),
      cover,
      cover, // hero fallback = cover
      isTrending ? 1 : 0,
      isFeatured ? 1 : 0,
      summary.id,
    )
    .run();
}

// ─────────────────────────────────────────────────
// Featured computation
// ─────────────────────────────────────────────────

/** Mark the top 4 highest-rated recent games as featured. */
async function markFeaturedGames(db: D1Database): Promise<void> {
  // Reset featured flags
  await db.prepare("UPDATE games SET featured = 0").run();

  // Set top 4 by rating as featured
  await db
    .prepare(
      `UPDATE games SET featured = 1
       WHERE id IN (
         SELECT id FROM games
         ORDER BY rating DESC, release_year DESC
         LIMIT 4
       )`,
    )
    .run();

  // Mark top 5 most recently released as trending
  await db.prepare("UPDATE games SET trending = 0").run();

  await db
    .prepare(
      `UPDATE games SET trending = 1
       WHERE id IN (
         SELECT id FROM games
         ORDER BY release_year DESC, rating DESC
         LIMIT 5
       )`,
    )
    .run();
}

// ─────────────────────────────────────────────────
// Sync state tracking
// ─────────────────────────────────────────────────

async function updateSyncState(
  db: D1Database,
  error: string | null,
  requestCount?: number,
): Promise<void> {
  try {
    // Ensure the sync_state row exists
    await db
      .prepare(
        `INSERT OR IGNORE INTO sync_state (key, request_count)
         VALUES ('rawg_games', 0)`,
      )
      .run();

    if (error) {
      await db
        .prepare(
          `UPDATE sync_state
           SET last_error = ?, notes = datetime('now')
           WHERE key = 'rawg_games'`,
        )
        .bind(error)
        .run();
    } else {
      await db
        .prepare(
          `UPDATE sync_state
           SET last_success_at = datetime('now'),
               last_error = NULL,
               request_count = request_count + ?
           WHERE key = 'rawg_games'`,
        )
        .bind(requestCount ?? 0)
        .run();
    }
  } catch (err) {
    console.error("[games-scraper] Failed to update sync_state:", err);
  }
}
