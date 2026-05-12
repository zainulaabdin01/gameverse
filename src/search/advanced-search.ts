/**
 * Advanced Search System
 * Enhanced search with filters, sorting, and analytics
 */

import { createServerFn } from "@tanstack/react-start";
import { getDB } from "../server/db";
import { getCachedData, CACHE_TTL, CACHE_KEYS } from "../server/cache";
import {
  gameRowToGame,
  articleRowToArticle,
  matchRowToMatch,
  type GameRow,
  type ArticleRow,
  type MatchRow
} from "../server/types";

export interface AdvancedSearchFilters {
  query: string;
  type?: 'all' | 'game' | 'article' | 'match';
  dateRange?: {
    from: string;
    to: string;
  };
  categories?: string[];
  sortBy?: 'relevance' | 'date' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface AdvancedSearchResult {
  id: string;
  type: 'game' | 'article' | 'match';
  title: string;
  description?: string;
  relevance: number;
  data: any;
  metadata?: {
    date?: string;
    category?: string;
    rating?: number;
    popularity?: number;
  };
}

export interface SearchAnalytics {
  query: string;
  filters: AdvancedSearchFilters;
  resultsCount: number;
  responseTime: number;
  timestamp: number;
  userId?: string;
}

/**
 * Advanced search with filters and sorting
 */
export const advancedSearchFn = createServerFn({ method: "GET" })
  .inputValidator((data: AdvancedSearchFilters) => data)
  .handler(async ({ data }) => {
    const cacheKey = `advanced_search:${JSON.stringify(data)}`;
    
    return await getCachedData(
      cacheKey,
      async () => {
        const db = await getDB();
        const results: AdvancedSearchResult[] = [];
        
        // Search games
        if (data.type === 'all' || data.type === 'game') {
          const gameResults = await searchGamesAdvanced(db, data);
          results.push(...gameResults);
        }
        
        // Search articles
        if (data.type === 'all' || data.type === 'article') {
          const articleResults = await searchArticlesAdvanced(db, data);
          results.push(...articleResults);
        }
        
        // Search matches
        if (data.type === 'all' || data.type === 'match') {
          const matchResults = await searchMatchesAdvanced(db, data);
          results.push(...matchResults);
        }
        
        // Sort results
        const sortedResults = sortSearchResults(results, data.sortBy, data.sortOrder);
        
        // Apply pagination
        const paginatedResults = sortedResults.slice(
          data.offset || 0,
          (data.offset || 0) + (data.limit || 20)
        );
        
        return {
          results: paginatedResults,
          total: results.length,
          query: data.query,
          filters: data
        };
      },
      CACHE_TTL.SEARCH
    );
  });

/**
 * Advanced games search
 */
async function searchGamesAdvanced(db: any, filters: AdvancedSearchFilters): Promise<AdvancedSearchResult[]> {
  let query = `
    SELECT g.*, 
           COUNT(*) OVER () as total_games
    FROM games g
    WHERE 1=1
  `;
  const binds: any[] = [];
  
  // Add text search
  if (filters.query) {
    query += ` AND (
      g.title LIKE ? OR 
      g.description LIKE ? OR 
      g.developer LIKE ? OR 
      g.genres LIKE ?
    )`;
    const searchTerm = `%${filters.query}%`;
    for (let i = 0; i < 4; i++) {
      binds.push(searchTerm);
    }
  }
  
  // Add category filter
  if (filters.categories && filters.categories.length > 0) {
    const categoryPlaceholders = filters.categories.map(() => 'g.genres LIKE ?').join(' OR ');
    query += ` AND (${categoryPlaceholders})`;
    filters.categories.forEach(cat => binds.push(`%${cat}%`));
  }
  
  // Add date range filter
  if (filters.dateRange) {
    if (filters.dateRange.from) {
      query += ` AND g.release_year >= ?`;
      binds.push(filters.dateRange.from);
    }
    if (filters.dateRange.to) {
      query += ` AND g.release_year <= ?`;
      binds.push(filters.dateRange.to);
    }
  }
  
  query += ` ORDER BY ${getSortClause('games', filters.sortBy)} ${filters.sortOrder || 'DESC'}`;
  
  const result = await db.prepare(query).bind(...binds).all<GameRow>();
  
  return result.results?.map((game: GameRow) => ({
    id: game.id,
    type: 'game' as const,
    title: game.title,
    description: game.description,
    relevance: calculateRelevance(game.title, game.description, filters.query),
    data: gameRowToGame(game),
    metadata: {
      date: game.release_year,
      category: game.genres,
      rating: game.rating,
      popularity: (game as any).viewers || 0
    }
  })) || [];
}

/**
 * Advanced articles search
 */
async function searchArticlesAdvanced(db: any, filters: AdvancedSearchFilters): Promise<AdvancedSearchResult[]> {
  let query = `
    SELECT a.*, 
           COUNT(*) OVER () as total_articles
    FROM articles a
    WHERE 1=1
  `;
  const binds: any[] = [];
  
  // Add text search
  if (filters.query) {
    query += ` AND (
      a.title LIKE ? OR 
      a.summary LIKE ? OR 
      a.content LIKE ?
    )`;
    const searchTerm = `%${filters.query}%`;
    for (let i = 0; i < 3; i++) {
      binds.push(searchTerm);
    }
  }
  
  // Add date range filter
  if (filters.dateRange) {
    if (filters.dateRange.from) {
      query += ` AND a.published_at >= ?`;
      binds.push(filters.dateRange.from);
    }
    if (filters.dateRange.to) {
      query += ` AND a.published_at <= ?`;
      binds.push(filters.dateRange.to);
    }
  }
  
  query += ` ORDER BY ${getSortClause('articles', filters.sortBy)} ${filters.sortOrder || 'DESC'}`;
  
  const result = await db.prepare(query).bind(...binds).all<ArticleRow>();
  
  return result.results?.map((article: ArticleRow) => ({
    id: article.id,
    type: 'article' as const,
    title: article.title,
    description: (article as any).summary || '',
    relevance: calculateRelevance(article.title, (article as any).summary || '', filters.query),
    data: articleRowToArticle(article),
    metadata: {
      date: article.published_at,
      category: article.source,
      popularity: (article as any).views || 0
    }
  })) || [];
}

/**
 * Advanced matches search
 */
async function searchMatchesAdvanced(db: any, filters: AdvancedSearchFilters): Promise<AdvancedSearchResult[]> {
  let query = `
    SELECT m.*, 
           COUNT(*) OVER () as total_matches
    FROM esports_matches m
    LEFT JOIN esports_teams t_a ON m.team_a_id = t_a.id
    LEFT JOIN esports_teams t_b ON m.team_b_id = t_b.id
    WHERE 1=1
  `;
  const binds: any[] = [];
  
  // Add text search
  if (filters.query) {
    query += ` AND (
      t_a.name LIKE ? OR 
      t_b.name LIKE ? OR 
      m.tournament_name LIKE ?
    )`;
    const searchTerm = `%${filters.query}%`;
    for (let i = 0; i < 3; i++) {
      binds.push(searchTerm);
    }
  }
  
  // Add status filter
  if (filters.categories && filters.categories.includes('live')) {
    query += ` AND m.status = 'live'`;
  }
  
  query += ` ORDER BY ${getSortClause('matches', filters.sortBy)} ${filters.sortOrder || 'DESC'}`;
  
  const result = await db.prepare(query).bind(...binds).all<MatchRow>();
  
  return result.results?.map((match: MatchRow) => ({
    id: match.id,
    type: 'match' as const,
    title: `${(match as any).team_a_name} vs ${(match as any).team_b_name}`,
    description: (match as any).tournament_name || '',
    relevance: calculateRelevance((match as any).team_a_name, (match as any).tournament_name, filters.query),
    data: matchRowToMatch(match),
    metadata: {
      date: match.starts_at,
      category: (match as any).game,
      popularity: (match as any).viewers || 0
    }
  })) || [];
}

/**
 * Get sort clause for different content types
 */
function getSortClause(type: string, sortBy?: string): string {
  switch (type) {
    case 'games':
      switch (sortBy) {
        case 'relevance': return 'relevance';
        case 'date': return 'release_year';
        case 'popularity': return 'viewers';
        case 'rating': return 'rating';
        default: return 'rating';
      }
    case 'articles':
      switch (sortBy) {
        case 'relevance': return 'relevance';
        case 'date': return 'published_at';
        case 'popularity': return 'views';
        default: return 'published_at';
      }
    case 'matches':
      switch (sortBy) {
        case 'relevance': return 'relevance';
        case 'date': return 'starts_at';
        case 'popularity': return 'viewers';
        default: return 'starts_at';
      }
    default:
      return 'relevance';
  }
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevance(title: string, description: string, query: string): number {
  if (!query) return 1;
  
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  const descLower = description?.toLowerCase() || '';
  
  let score = 0;
  
  // Exact title match
  if (titleLower === queryLower) score += 100;
  
  // Title contains query
  if (titleLower.includes(queryLower)) score += 50;
  
  // Description contains query
  if (descLower.includes(queryLower)) score += 25;
  
  // Word matches
  const queryWords = queryLower.split(' ');
  const titleWords = titleLower.split(' ');
  const descWords = descLower.split(' ');
  
  queryWords.forEach((word: string) => {
    if (titleWords.includes(word)) score += 10;
    if (descWords.includes(word)) score += 5;
  });
  
  return Math.max(score, 1);
}

/**
 * Sort search results
 */
function sortSearchResults(results: AdvancedSearchResult[], sortBy?: string, sortOrder?: string): AdvancedSearchResult[] {
  if (!sortBy || sortBy === 'relevance') {
    return results.sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      return (a.relevance - b.relevance) * order;
    });
  }
  
  return results.sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'date':
        return ((a.metadata?.date || '').localeCompare(b.metadata?.date || '')) * order;
      case 'popularity':
        return ((a.metadata?.popularity || 0) - (b.metadata?.popularity || 0)) * order;
      case 'rating':
        return ((a.metadata?.rating || 0) - (b.metadata?.rating || 0)) * order;
      default:
        return 0;
    }
  });
}

/**
 * Track search analytics
 */
export const trackSearchAnalyticsFn = createServerFn({ method: "POST" })
  .inputValidator((data: SearchAnalytics) => data)
  .handler(async ({ data }) => {
    try {
      const db = await getDB();
      
      await db.prepare(`
        INSERT INTO search_analytics (query, filters, results_count, response_time, user_id, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        data.query,
        JSON.stringify(data.filters),
        data.resultsCount,
        data.responseTime,
        data.userId || 'anonymous',
        data.timestamp
      ).run();
      
      console.log('[Search Analytics] Tracked search:', data.query);
      return { success: true };
    } catch (error) {
      console.error('[Search Analytics] Failed to track search:', error);
      return { success: false, error: 'Failed to track analytics' };
    }
  });

/**
 * Get popular searches
 */
export const getPopularSearchesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return await getCachedData(
      'popular_searches',
      async () => {
        const db = await getDB();
        const result = await db.prepare(`
          SELECT query, COUNT(*) as search_count
          FROM search_analytics
          WHERE timestamp >= datetime('now', '-7 days')
          GROUP BY query
          ORDER BY search_count DESC
          LIMIT 10
        `).all();
        
        return result.results?.map((row: any) => ({
          query: row.query,
          count: row.search_count
        })) || [];
      },
      CACHE_TTL.SEARCH * 2 // Cache for 20 minutes
    );
  });
}
