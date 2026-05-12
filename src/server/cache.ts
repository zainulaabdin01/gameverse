import { getCache } from "./db";

/**
 * Generic read-through cache wrapper for any data type.
 * Provides TTL management and automatic fallback to database.
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  try {
    const cache = await getCache();
    
    // Try to get cached data
    const cached = await cache.get(key);
    if (cached !== null) {
      console.log(`Cache hit for key: ${key}`);
      return JSON.parse(cached) as T;
    }
    
    console.log(`Cache miss for key: ${key}, fetching fresh data`);
    
    // Cache miss - fetch fresh data
    const freshData = await fetcher();
    
    // Store in cache with TTL
    await cache.put(key, JSON.stringify(freshData), {
      expirationTtl: ttl,
    });
    
    return freshData;
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    
    // Fallback to direct fetch if cache fails
    try {
      return await fetcher();
    } catch (fetchError) {
      console.error(`Fallback fetch failed for key ${key}:`, fetchError);
      throw fetchError;
    }
  }
}

/**
 * Invalidate cache entry by key
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    const cache = await getCache();
    await cache.delete(key);
    console.log(`Cache invalidated for key: ${key}`);
  } catch (error) {
    console.error(`Failed to invalidate cache for key ${key}:`, error);
  }
}

/**
 * Invalidate multiple cache entries by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const cache = await getCache();
    const list = await cache.list({ prefix: pattern });
    
    const deletePromises = list.keys.map(key => cache.delete(key.name));
    await Promise.all(deletePromises);
    
    console.log(`Cache invalidated for pattern: ${pattern}, deleted ${list.keys.length} entries`);
  } catch (error) {
    console.error(`Failed to invalidate cache pattern ${pattern}:`, error);
  }
}

/**
 * Predefined TTL values for different data types
 */
export const CACHE_TTL = {
  NEWS: 5 * 60,        // 5 minutes
  GAMES: 10 * 60,      // 10 minutes
  ESPORTS_LIVE: 5 * 60, // 5 minutes for live data
  ESPORTS_STATIC: 15 * 60, // 15 minutes for static esports data
  SEARCH: 10 * 60,     // 10 minutes for search results
  HOMEPAGE: 5 * 60,    // 5 minutes for homepage data
} as const;

/**
 * Generate cache keys for different data types
 */
export const CACHE_KEYS = {
  NEWS_LIST: (filters = {}) => `news:list:${JSON.stringify(filters)}`,
  ARTICLE: (slug: string) => `article:${slug}`,
  GAMES_LIST: (filters = {}) => `games:list:${JSON.stringify(filters)}`,
  GAME: (id: string) => `game:${id}`,
  ESPORTS_LIVE: 'esports:live',
  ESPORTS_UPCOMING: 'esports:upcoming',
  ESPORTS_FINISHED: 'esports:finished',
  ESPORTS_MATCH: (id: string) => `esports:match:${id}`,
  ESPORTS_TEAMS: (game?: string) => `esports:teams:${game || 'all'}`,
  ESPORTS_PLAYERS: (game?: string) => `esports:players:${game || 'all'}`,
  SEARCH_RESULTS: (query: string) => `search:${query}`,
  HOMEPAGE_DATA: 'homepage:data',
} as const;
