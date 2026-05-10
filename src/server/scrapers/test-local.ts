/**
 * Local test script for scrapers.
 *
 * Usage:
 *   npx tsx src/server/scrapers/test-local.ts          # Run news scraper (default)
 *   npx tsx src/server/scrapers/test-local.ts --news   # Run news scraper
 *   npx tsx src/server/scrapers/test-local.ts --games  # Run games scraper (RAWG)
 *   npx tsx src/server/scrapers/test-local.ts --all    # Run all scrapers
 */
import Database from "better-sqlite3";
import { scrapeNews } from "./news-scraper";
import { scrapeGames } from "./games-scraper";
import { join } from "path";
import { readFileSync } from "fs";

// ─────────────────────────────────────────────────
// Database Setup
// ─────────────────────────────────────────────────

const dbPath = join(
  process.cwd(),
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/c204843922c7d8b0460aacd7d5eef263a2ad6de9bd92c76a90ee80ed8b6b331b.sqlite"
);

const sqliteDb = new Database(dbPath);

// Create a minimal D1Database mock
const mockD1 = {
  prepare: (query: string) => {
    return {
      bind: (...args: any[]) => {
        return {
          all: async () => {
            const results = sqliteDb.prepare(query).all(...args);
            return { results, success: true, meta: { duration: 0 } };
          },
          run: async () => {
            const info = sqliteDb.prepare(query).run(...args);
            return {
              results: [],
              success: true,
              meta: { changes: info.changes, duration: 0 },
            };
          },
        };
      },
      all: async () => {
        const results = sqliteDb.prepare(query).all();
        return { results, success: true, meta: { duration: 0 } };
      },
      run: async () => {
        const info = sqliteDb.prepare(query).run();
        return {
          results: [],
          success: true,
          meta: { changes: info.changes, duration: 0 },
        };
      },
    };
  },
} as any as D1Database;

// ─────────────────────────────────────────────────
// Load API keys from .dev.vars
// ─────────────────────────────────────────────────

function loadDevVars(): Record<string, string> {
  try {
    const content = readFileSync(join(process.cwd(), ".dev.vars"), "utf-8");
    const vars: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        vars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
      }
    }
    return vars;
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────
// Scraper runners
// ─────────────────────────────────────────────────

async function runNews() {
  console.log("\n═══════════════════════════════════════");
  console.log("  📰 Running News Scraper (RSS)");
  console.log("═══════════════════════════════════════\n");

  const result = await scrapeNews(mockD1, true);
  console.log("\nScrape complete:", result);

  const count = sqliteDb.prepare("SELECT COUNT(*) as c FROM articles").get() as any;
  console.log("Total articles in DB:", count.c);
}

async function runGames() {
  const vars = loadDevVars();
  const apiKey = vars.RAWG_API_KEY;

  if (!apiKey) {
    console.error("❌ RAWG_API_KEY not found in .dev.vars — cannot run games scraper.");
    console.error("   Add this line to .dev.vars:  RAWG_API_KEY=your_key_here");
    process.exit(1);
  }

  console.log("\n═══════════════════════════════════════");
  console.log("  🎮 Running Games Scraper (RAWG)");
  console.log("═══════════════════════════════════════\n");

  // Clear existing games for a clean test
  console.log("Cleaning up existing games...");
  await mockD1.prepare("DELETE FROM games").run();

  const result = await scrapeGames(mockD1, apiKey);
  console.log("\nScrape complete:", result);

  const count = sqliteDb.prepare("SELECT COUNT(*) as c FROM games").get() as any;
  console.log("Total games in DB:", count.c);

  // Show a sample of what we got
  const sample = sqliteDb
    .prepare("SELECT title, developer, rating, release_year FROM games ORDER BY rating DESC LIMIT 5")
    .all() as any[];

  if (sample.length > 0) {
    console.log("\n📊 Top 5 games by rating:");
    for (const g of sample) {
      console.log(`   ${g.rating}  ${g.title} (${g.release_year}) — ${g.developer}`);
    }
  }
}

// ─────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "--news";

  switch (mode) {
    case "--news":
      await runNews();
      break;
    case "--games":
      await runGames();
      break;
    case "--all":
      await runNews();
      await runGames();
      break;
    default:
      console.log("Usage:");
      console.log("  npx tsx src/server/scrapers/test-local.ts --news   # News scraper");
      console.log("  npx tsx src/server/scrapers/test-local.ts --games  # Games scraper");
      console.log("  npx tsx src/server/scrapers/test-local.ts --all    # All scrapers");
      process.exit(1);
  }
}

main().catch(console.error);
