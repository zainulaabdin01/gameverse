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
      await scrapeNews(env.DB);
      break;

    case "0 2 * * *":
      await scrapeGames(env.DB, env.RAWG_API_KEY);
      break;

    case "0 */12 * * *":
      await scrapeEsports(env.DB, env.PANDASCORE_API_KEY);
      break;

    default:
      console.warn(`[cron] Unknown cron schedule: ${cron}`);
  }
}
