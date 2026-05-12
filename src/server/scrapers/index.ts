/**
 * Cron Handler — Dispatches scrapers based on cron schedule.
 *
 * Wired to Cloudflare Cron Triggers defined in wrangler.jsonc:
 *   Every 30 min  → News RSS scraper
 *   Daily at 2am  → Games scraper (RAWG)
 *   Every 12 hrs  → Esports scraper (Phase 7)
 */
import { scrapeNews } from "./news-scraper";
import { scrapeGames } from "./games-scraper";
import { scrapeEsports } from "./esports-scraper";
import { invalidateCachePattern, CACHE_KEYS } from "../cache";

/**
 * Handle a scheduled cron event.
 * Called by the Cloudflare Workers runtime on each cron trigger.
 */
export async function handleScheduled(
  event: ScheduledEvent,
  env: Cloudflare.Env,
): Promise<void> {
  const cron = event.cron;
  console.log(`[cron] Triggered: ${cron} at ${new Date().toISOString()}`);

  switch (cron) {
    case "*/30 * * * *":
      console.log("[cron] Running news scraper...");
      await scrapeNews(env.DB);
      // Invalidate news-related cache after scraping
      await invalidateCachePattern("news:");
      await invalidateCachePattern("article:");
      await invalidateCachePattern(CACHE_KEYS.HOMEPAGE_DATA);
      console.log("[cron] News cache invalidated");
      break;

    case "0 2 * * *":
      console.log("[cron] Running games scraper...");
      await scrapeGames(env.DB, env.RAWG_API_KEY);
      // Invalidate games-related cache after scraping
      await invalidateCachePattern("games:");
      await invalidateCachePattern("game:");
      await invalidateCachePattern(CACHE_KEYS.HOMEPAGE_DATA);
      console.log("[cron] Games cache invalidated");
      break;

    case "0 */12 * * *":
      console.log("[cron] Running esports scraper...");
      await scrapeEsports(env.DB, env.PANDASCORE_API_KEY);
      // Invalidate esports-related cache after scraping
      await invalidateCachePattern("esports:");
      await invalidateCachePattern(CACHE_KEYS.SEARCH_RESULTS(""));
      console.log("[cron] Esports cache invalidated");
      break;

    default:
      console.warn(`[cron] Unknown cron schedule: ${cron}`);
  }
}
