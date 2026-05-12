import { createServerFn } from "@tanstack/react-start";
import { getDB } from "../server/db";
import { getCachedData, CACHE_TTL, CACHE_KEYS } from "../server/cache";
import type { Game } from "../data/games";
import type { Article } from "../data/news";
import type { Match, Team } from "../data/esports";
import {
  gameRowToGame,
  articleRowToArticle,
  matchRowToMatch,
  type GameRow,
  type ArticleRow,
  type MatchRow
} from "../server/types";

export interface SearchResult {
  type: "game" | "article" | "match";
  id: string;
  title: string;
  description?: string;
  relevance: number;
  data: Game | Article | Match;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

/**
 * Global search across games, news, and esports data with relevance scoring.
 */
export const globalSearchFn = createServerFn({ method: "GET" })
  .inputValidator((data: { q: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const { q, limit = 20 } = data;
    const trimmedQuery = q.trim().toLowerCase();
    
    if (!trimmedQuery) {
      return { results: [], total: 0, query: trimmedQuery };
    }

    return await getCachedData(
      CACHE_KEYS.SEARCH_RESULTS(trimmedQuery),
      async () => {
        const db = await getDB();
        const results: SearchResult[] = [];

        // Search Games
        const gameResults = await searchGames(db, trimmedQuery, 6);
        results.push(...gameResults);

        // Search Articles
        const articleResults = await searchArticles(db, trimmedQuery, 6);
        results.push(...articleResults);

        // Search Matches
        const matchResults = await searchMatches(db, trimmedQuery, 5);
        results.push(...matchResults);

        // Sort by relevance and limit results
        const sortedResults = results
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, limit);

        return {
          results: sortedResults,
          total: results.length,
          query: trimmedQuery,
        };
      },
      CACHE_TTL.SEARCH
    );
  });

/**
 * Search games by title, developer, and genres
 */
async function searchGames(db: D1Database, query: string, limit: number): Promise<SearchResult[]> {
  const gamesResult = await db.prepare(`
    SELECT * FROM games 
    WHERE 
      LOWER(title) LIKE ? OR
      LOWER(developer) LIKE ? OR
      LOWER(genres) LIKE ?
    ORDER BY 
      CASE 
        WHEN LOWER(title) LIKE ? THEN 1
        WHEN LOWER(developer) LIKE ? THEN 2
        ELSE 3
      END,
      rating DESC
    LIMIT ?
  `).bind(
    `%${query}%`, `%${query}%`, `%${query}%`,
    `${query}%`, `${query}%`,
    limit
  ).all<GameRow>();

  return gamesResult.results?.map(game => ({
    type: "game" as const,
    id: game.slug,
    title: game.title,
    description: game.description,
    relevance: calculateGameRelevance(game, query),
    data: gameRowToGame(game),
  })) || [];
}

/**
 * Search articles by title, excerpt, category, and source
 */
async function searchArticles(db: D1Database, query: string, limit: number): Promise<SearchResult[]> {
  const articlesResult = await db.prepare(`
    SELECT * FROM articles 
    WHERE 
      LOWER(title) LIKE ? OR
      LOWER(excerpt) LIKE ? OR
      LOWER(category) LIKE ? OR
      LOWER(source) LIKE ?
    ORDER BY published_at DESC
    LIMIT ?
  `).bind(
    `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`,
    limit
  ).all<ArticleRow>();

  return articlesResult.results?.map(article => ({
    type: "article" as const,
    id: article.slug,
    title: article.title,
    description: article.excerpt,
    relevance: calculateArticleRelevance(article, query),
    data: articleRowToArticle(article),
  })) || [];
}

/**
 * Search matches by tournament, game, and team names
 */
async function searchMatches(db: D1Database, query: string, limit: number): Promise<SearchResult[]> {
  const matchesResult = await db.prepare(`
    SELECT m.*, 
           t_a.name as team_a_name, t_a.tag as team_a_tag,
           t_b.name as team_b_name, t_b.tag as team_b_tag
    FROM esports_matches m
    LEFT JOIN esports_teams t_a ON m.team_a_id = t_a.id
    LEFT JOIN esports_teams t_b ON m.team_b_id = t_b.id
    WHERE 
      LOWER(m.tournament) LIKE ? OR
      LOWER(m.game) LIKE ? OR
      LOWER(t_a.name) LIKE ? OR
      LOWER(t_b.name) LIKE ?
    ORDER BY m.starts_at DESC
    LIMIT ?
  `).bind(
    `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`,
    limit
  ).all();

  return matchesResult.results?.map((match: any) => ({
    type: "match" as const,
    id: match.id,
    title: `${match.team_a_name || 'Team A'} vs ${match.team_b_name || 'Team B'}`,
    description: `${match.tournament} - ${match.game}`,
    relevance: calculateMatchRelevance(match, query),
    data: matchRowToMatch(match),
  })) || [];
}

/**
 * Calculate relevance score for games
 */
function calculateGameRelevance(game: GameRow, query: string): number {
  const title = game.title.toLowerCase();
  const developer = game.developer.toLowerCase();
  const genres = game.genres.toLowerCase();
  
  let score = 0;
  
  // Exact title match gets highest score
  if (title === query) score += 100;
  else if (title.includes(query)) score += 50;
  
  // Developer match
  if (developer.includes(query)) score += 30;
  
  // Genre match
  if (genres.includes(query)) score += 20;
  
  // Featured games get bonus
  if (game.featured) score += 10;
  
  return score;
}

/**
 * Calculate relevance score for articles
 */
function calculateArticleRelevance(article: ArticleRow, query: string): number {
  const title = article.title.toLowerCase();
  const excerpt = article.excerpt.toLowerCase();
  const category = article.category.toLowerCase();
  
  let score = 0;
  
  // Exact title match gets highest score
  if (title === query) score += 100;
  else if (title.includes(query)) score += 50;
  
  // Excerpt match
  if (excerpt.includes(query)) score += 30;
  
  // Category match
  if (category.includes(query)) score += 20;
  
  // Recent articles get bonus (based on published_at)
  const daysSincePublished = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 1) score += 15;
  else if (daysSincePublished < 7) score += 10;
  
  return score;
}

/**
 * Calculate relevance score for matches
 */
function calculateMatchRelevance(match: MatchRow, query: string): number {
  const tournament = match.tournament.toLowerCase();
  const game = match.game.toLowerCase();
  const teamA = (match as any).team_a_name?.toLowerCase() || '';
  const teamB = (match as any).team_b_name?.toLowerCase() || '';
  
  let score = 0;
  
  // Tournament match gets highest score
  if (tournament.includes(query)) score += 40;
  
  // Game match
  if (game.includes(query)) score += 30;
  
  // Team matches
  if (teamA.includes(query)) score += 35;
  if (teamB.includes(query)) score += 35;
  
  // Live matches get bonus
  if (match.status === "live") score += 20;
  
  // Recent matches get bonus
  const daysSinceMatch = (Date.now() - new Date(match.starts_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceMatch < 1) score += 15;
  else if (daysSinceMatch < 7) score += 10;
  
  return score;
}
