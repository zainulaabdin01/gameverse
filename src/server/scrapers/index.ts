/**
 * Cron Handler — Dispatches scrapers based on cron schedule.
 *
 * Wired to Cloudflare Cron Triggers defined in wrangler.jsonc:
 *   Every 30 min  → News RSS scraper
 *   Daily at 2am  → Games scraper (Phase 4)
 *   Every 12 hrs  → Esports scraper (Phase 5)
 */
import { scrapeNews } from "./news-scraper";

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
      // Phase 4: await scrapeGames(env.DB);
      console.log("[cron] Games scraper not yet implemented");
      break;

    case "0 */12 * * *":
      // Phase 5: await scrapeEsports(env.DB);
      console.log("[cron] Esports scraper not yet implemented");
      break;

    default:
      console.warn(`[cron] Unknown cron schedule: ${cron}`);
  }
}
