import Database from "better-sqlite3";
import { join } from "path";

// Locate the local D1 database file
const dbPath = join(
  process.cwd(),
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/c204843922c7d8b0460aacd7d5eef263a2ad6de9bd92c76a90ee80ed8b6b331b.sqlite"
);

const sqliteDb = new Database(dbPath);

const mockD1 = {
  prepare: (query: string) => {
    return {
      bind: (...args: any[]) => {
        return {
          all: async () => {
            const results = sqliteDb.prepare(query).all(...args);
            return { results, success: true, meta: { duration: 0 } };
          },
          first: async () => {
            return sqliteDb.prepare(query).get(...args) || null;
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
      first: async () => {
        return sqliteDb.prepare(query).get() || null;
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
} as any;

export const env = {
  DB: mockD1,
  CACHE: {} as any,
  RAWG_API_KEY: process.env.RAWG_API_KEY || "test-rawg-key",
  PANDASCORE_API_KEY: process.env.PANDASCORE_API_KEY || "test-pandascore-key",
};
