import { createServerFn } from "@tanstack/react-start";
import { getDB } from "../server/db";
import { type GameRow, gameRowToGame } from "../server/types";
import { getCachedData, CACHE_KEYS, CACHE_TTL } from "../server/cache";

export type SortOrder = "popularity" | "rating" | "release" | "az";

interface ListGamesParams {
  q?: string;
  genre?: string;
  platform?: string;
  minRating?: number;
  sort?: SortOrder;
}

/**
 * Fetch a list of games with optional filtering and sorting.
 */
export const listGamesFn = createServerFn({ method: "GET" })
  .inputValidator((data: ListGamesParams) => data)
  .handler(async ({ data }) => {
    return await getCachedData(
      CACHE_KEYS.GAMES_LIST(data),
      async () => {
        const db = await getDB();
        
        let query = "SELECT * FROM games WHERE 1=1";
        const binds: any[] = [];

        if (data.q) {
          query += " AND title LIKE ?";
          binds.push(`%${data.q}%`);
        }

        if (data.genre && data.genre !== "all") {
          // JSON array string match: '["Action","RPG"]'
          query += " AND genres LIKE ?";
          binds.push(`%"${data.genre}"%`);
        }

        if (data.platform && data.platform !== "all") {
          query += " AND platforms LIKE ?";
          binds.push(`%"${data.platform}"%`);
        }

        if (data.minRating) {
          query += " AND rating >= ?";
          binds.push(data.minRating);
        }

        switch (data.sort) {
          case "rating":
            query += " ORDER BY rating DESC";
            break;
          case "release":
            query += " ORDER BY release_year DESC";
            break;
          case "az":
            query += " ORDER BY title ASC";
            break;
          case "popularity":
          default:
            // Prioritize trending, then user score, then rating
            query += " ORDER BY trending DESC, user_score DESC, rating DESC";
            break;
        }

        query += " LIMIT 100";

        const result = await db.prepare(query).bind(...binds).all<GameRow>();

        if (!result.results) return [];
        return result.results.map(gameRowToGame);
      },
      CACHE_TTL.GAMES
    );
  });

/**
 * Fetch a single game by its slug.
 */
export const getGameBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    return await getCachedData(
      CACHE_KEYS.GAME(data),
      async () => {
        const db = await getDB();
        const result = await db
          .prepare("SELECT * FROM games WHERE slug = ?")
          .bind(data)
          .first<GameRow>();

        if (!result) return null;
        return gameRowToGame(result);
      },
      CACHE_TTL.GAMES
    );
  });

/**
 * Fetch top featured and trending games for the homepage.
 */
export const getGamesHomepageFn = createServerFn({ method: "GET" }).handler(async () => {
  return await getCachedData(
    'games:homepage',
    async () => {
      const db = await getDB();

      const trendingRes = await db
        .prepare("SELECT * FROM games WHERE trending = 1 ORDER BY release_year DESC, rating DESC LIMIT 5")
        .all<GameRow>();

      const featuredRes = await db
        .prepare("SELECT * FROM games WHERE featured = 1 ORDER BY rating DESC LIMIT 4")
        .all<GameRow>();

      return {
        trending: trendingRes.results?.map(gameRowToGame) || [],
        featured: featuredRes.results?.map(gameRowToGame) || [],
      };
    },
    CACHE_TTL.GAMES
  );
});

/**
 * Fetch up to 5 games that share at least one genre with the given game.
 */
export const getSimilarGamesFn = createServerFn({ method: "GET" })
  .inputValidator((data: { genres: string[]; excludeSlug: string }) => data)
  .handler(async ({ data }) => {
    return await getCachedData(
      `games:similar:${data.excludeSlug}:${data.genres.join(',')}`,
      async () => {
        const db = await getDB();
        
        if (!data.genres || data.genres.length === 0) return [];

        // Build OR clauses for each genre
        const genreClauses = data.genres.map(() => "genres LIKE ?").join(" OR ");
        const binds = data.genres.map((g) => `%"${g}"%`);

        const result = await db
          .prepare(
            `SELECT * FROM games WHERE slug != ? AND (${genreClauses}) ORDER BY rating DESC LIMIT 5`
          )
          .bind(data.excludeSlug, ...binds)
          .all<GameRow>();

        if (!result.results) return [];
        return result.results.map(gameRowToGame);
      },
      CACHE_TTL.GAMES
    );
  });
