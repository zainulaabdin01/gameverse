/**
 * Test script for news scraper. Run with: npx tsx src/server/scrapers/test-local.ts
 */
import Database from "better-sqlite3";
import { scrapeNews } from "./news-scraper";
import { join } from "path";

// Locate the local D1 database file
const dbPath = join(
  process.cwd(),
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/c204843922c7d8b0460aacd7d5eef263a2ad6de9bd92c76a90ee80ed8b6b331b.sqlite"
);

const sqliteDb = new Database(dbPath);

// Create a minimal D1Database mock
const mockD1 = {
  prepare: (query: string) => {
    // Replace ? with standard sqlite bindings in basic ways if needed,
    // but better-sqlite3 handles ? natively.
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

async function run() {
  console.log("Running scraper...");
  // Pass fetchBodies=false initially for speed
  const result = await scrapeNews(mockD1, false);
  console.log("Scrape complete:", result);

  // Check the table size
  const count = sqliteDb.prepare("SELECT COUNT(*) as c FROM articles").get() as any;
  console.log("Total articles in DB now:", count.c);
}

run().catch(console.error);
