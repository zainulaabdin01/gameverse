/**
 * News Scraper — RSS Ingestion Pipeline
 *
 * Fetches articles from 7 gaming RSS feeds, transforms them
 * into the Article schema, and upserts into D1.
 */
import { parseFeed, type RawFeedItem } from "./rss-parser";
import { fetchArticleBody } from "./article-body";
import { slugify, classifyCategory, type NewsSource } from "@/server/types";

// ─────────────────────────────────────────────────
// Feed configuration
// ─────────────────────────────────────────────────

interface FeedConfig {
  source: NewsSource;
  url: string;
}

const FEEDS: FeedConfig[] = [
  { source: "IGN", url: "https://feeds.feedburner.com/ign/games-all" },
  { source: "Kotaku", url: "https://kotaku.com/rss" },
  { source: "Dot Esports", url: "https://dotesports.com/feed" },
  { source: "PC Gamer", url: "https://www.pcgamer.com/rss/" },
  { source: "Eurogamer", url: "https://www.eurogamer.net/feed" },
  { source: "Polygon", url: "https://www.polygon.com/rss/index.xml" },
  { source: "GameSpot", url: "https://www.gamespot.com/feeds/mashup/" },
];

/** Max article bodies to fetch per cron run (rate limiting). */
const MAX_BODY_FETCHES = 5;

/** Max articles per feed to process. */
const MAX_ITEMS_PER_FEED = 15;

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

/** Truncate text to N chars at a word boundary. */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

/** Fetch a single feed, returning parsed items tagged with source. */
async function fetchFeed(
  config: FeedConfig,
): Promise<{ source: NewsSource; items: RawFeedItem[] }> {
  try {
    const res = await fetch(config.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Gameverse/1.0; +https://gameverse.dev)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!res.ok) {
      console.warn(
        `[news-scraper] Feed ${config.source} returned ${res.status}`,
      );
      return { source: config.source, items: [] };
    }

    const xml = await res.text();
    const items = parseFeed(xml);
    return { source: config.source, items: items.slice(0, MAX_ITEMS_PER_FEED) };
  } catch (err) {
    console.error(`[news-scraper] Feed ${config.source} fetch failed:`, err);
    return { source: config.source, items: [] };
  }
}

// ─────────────────────────────────────────────────
// Main scraper
// ─────────────────────────────────────────────────

export interface ScrapeResult {
  inserted: number;
  skipped: number;
  errors: number;
  feedResults: Record<string, number>;
}

/**
 * Scrape all RSS feeds and upsert articles into D1.
 *
 * @param db - D1 database binding
 * @param fetchBodies - Whether to fetch full article bodies (default true)
 */
export async function scrapeNews(
  db: D1Database,
  fetchBodies = true,
): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    inserted: 0,
    skipped: 0,
    errors: 0,
    feedResults: {},
  };

  console.log("[news-scraper] Starting RSS ingestion...");

  // 1. Fetch all feeds in parallel
  const feedResults = await Promise.allSettled(FEEDS.map(fetchFeed));

  const allItems: Array<{ source: NewsSource; item: RawFeedItem }> = [];
  for (const res of feedResults) {
    if (res.status === "fulfilled") {
      result.feedResults[res.value.source] = res.value.items.length;
      for (const item of res.value.items) {
        allItems.push({ source: res.value.source, item });
      }
    }
  }

  console.log(
    `[news-scraper] Fetched ${allItems.length} items from ${Object.keys(result.feedResults).length} feeds`,
  );

  if (allItems.length === 0) {
    await updateSyncState(db, "No items fetched from any feed");
    return result;
  }

  // 2. Load game slugs/titles for matching
  const gameRows = await db
    .prepare("SELECT slug, title FROM games")
    .all<{ slug: string; title: string }>();
  const games = gameRows.results ?? [];

  // 3. Process each item
  let bodiesFetched = 0;

  for (const { source, item } of allItems) {
    try {
      const slug = slugify(item.title);
      if (!slug) continue;

      const excerpt = truncate(item.description || item.title, 250);
      const category = classifyCategory(
        item.categories,
        item.title,
        excerpt,
      );
      const author = item.author || `${source} Staff`;
      const publishedAt = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString();
      const cover = item.coverUrl || "";

      // Match related game
      const relatedGameSlug = matchGame(item.title, excerpt, games);

      // Fetch body (rate limited)
      let body: string[];
      if (fetchBodies && bodiesFetched < MAX_BODY_FETCHES && item.link) {
        body = await fetchArticleBody(item.link, excerpt);
        bodiesFetched++;
      } else {
        body = [excerpt];
      }

      // 4. Upsert — INSERT OR IGNORE dedupes on external_url
      const insertResult = await db
        .prepare(
          `INSERT OR IGNORE INTO articles
           (slug, title, excerpt, body, source, category, author,
            published_at, cover, related_game_slug, featured, reads, external_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
        )
        .bind(
          slug,
          item.title,
          excerpt,
          JSON.stringify(body),
          source,
          category,
          author,
          publishedAt,
          cover,
          relatedGameSlug,
          item.link,
        )
        .run();

      if (insertResult.meta.changes > 0) {
        result.inserted++;
      } else {
        result.skipped++;
      }
    } catch (err) {
      console.error(
        `[news-scraper] Error processing "${item.title}":`,
        err,
      );
      result.errors++;
    }
  }

  // 5. Mark top 2 recent articles as featured
  await markFeatured(db);

  // 6. Update sync state
  await updateSyncState(db, null, allItems.length);

  console.log(
    `[news-scraper] Done — inserted: ${result.inserted}, skipped: ${result.skipped}, errors: ${result.errors}`,
  );

  return result;
}

// ─────────────────────────────────────────────────
// Game matching
// ─────────────────────────────────────────────────

/** Scan title + excerpt for known game names/slugs. Returns slug or null. */
function matchGame(
  title: string,
  excerpt: string,
  games: Array<{ slug: string; title: string }>,
): string | null {
  const haystack = `${title} ${excerpt}`.toLowerCase();

  for (const game of games) {
    // Match on full game title (case-insensitive, word boundary)
    if (haystack.includes(game.title.toLowerCase())) {
      return game.slug;
    }
  }

  return null;
}

// ─────────────────────────────────────────────────
// Featured computation
// ─────────────────────────────────────────────────

/** Mark the 2 most recent non-mock articles as featured. */
async function markFeatured(db: D1Database): Promise<void> {
  // Reset all featured flags for non-mock articles
  await db
    .prepare(
      "UPDATE articles SET featured = 0 WHERE external_url NOT LIKE 'mock://%'",
    )
    .run();

  // Set top 2 most recent as featured
  await db
    .prepare(
      `UPDATE articles SET featured = 1
       WHERE id IN (
         SELECT id FROM articles
         WHERE external_url NOT LIKE 'mock://%'
         ORDER BY published_at DESC
         LIMIT 2
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
    if (error) {
      await db
        .prepare(
          `UPDATE sync_state
           SET last_error = ?, notes = datetime('now')
           WHERE key = 'news_rss'`,
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
           WHERE key = 'news_rss'`,
        )
        .bind(requestCount ?? 0)
        .run();
    }
  } catch (err) {
    console.error("[news-scraper] Failed to update sync_state:", err);
  }
}
