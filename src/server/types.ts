/**
 * Gameverse — Shared Backend Types
 *
 * This module is the bridge between D1 database rows and
 * the existing frontend interfaces. It re-exports frontend
 * types as the single source of truth, defines D1 row shapes,
 * and provides converters between them.
 *
 * NO frontend files should be changed — these types exist
 * so backend code produces the exact shapes the UI expects.
 */

// ─────────────────────────────────────────────────────────
// 1. Re-export frontend contracts (single source of truth)
// ─────────────────────────────────────────────────────────

export type { Game, Platform, Genre } from "@/data/games";
export type { Article, NewsSource, NewsCategory } from "@/data/news";
export type { Team, Player, Match, EsportsGame } from "@/data/esports";

// Pull in value-level types for runtime usage in converters
import type { Game, Platform, Genre } from "@/data/games";
import type { Article, NewsSource, NewsCategory } from "@/data/news";
import type { Team, Player, Match, EsportsGame } from "@/data/esports";

// ─────────────────────────────────────────────────────────
// 2. D1 Row Types (what comes back from SQL queries)
// ─────────────────────────────────────────────────────────

/** Raw row from the `games` table. */
export interface GameRow {
  id: number;
  slug: string;
  title: string;
  developer: string;
  publisher: string;
  release_year: number;
  rating: number;
  user_score: number;
  /** JSON-encoded `Genre[]` */
  genres: string;
  /** JSON-encoded `Platform[]` */
  platforms: string;
  cover: string;
  hero: string;
  /** JSON-encoded `string[]` */
  screenshots: string;
  short_description: string;
  description: string;
  trending: number; // 0 or 1
  featured: number; // 0 or 1
  external_id: number;
  fetched_at: string;
  updated_at: string;
}

/** Raw row from the `articles` table. */
export interface ArticleRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** JSON-encoded `string[]` */
  body: string;
  source: string;
  category: string;
  author: string;
  published_at: string;
  cover: string;
  related_game_slug: string | null;
  featured: number; // 0 or 1
  reads: number;
  external_url: string;
  fetched_at: string;
  updated_at: string;
}

/** Raw row from the `esports_teams` table. */
export interface TeamRow {
  id: string;
  name: string;
  tag: string;
  region: string;
  game: string;
  logo_color: string;
  logo_url: string | null;
  wins: number;
  losses: number;
  points: number;
  /** JSON-encoded `("W"|"L")[]` */
  form_streak: string;
  external_id: number;
  fetched_at: string;
  updated_at: string;
}

/** Raw row from the `esports_players` table. */
export interface PlayerRow {
  id: string;
  handle: string;
  real_name: string;
  team_id: string;
  game: string;
  role: string;
  rating: number;
  kda: number;
  signature: string;
  external_id: number;
  fetched_at: string;
}

/** Raw row from the `esports_matches` table. */
export interface MatchRow {
  id: string;
  game: string;
  tournament: string;
  status: string;
  starts_at: string;
  team_a_id: string;
  team_b_id: string;
  score_a: number;
  score_b: number;
  format: string;
  current_map: string | null;
  viewers: number | null;
  winner_team_id: string | null;
  external_id: number;
  fetched_at: string;
  updated_at: string;
}

/** Raw row from the `esports_standings` table. */
export interface StandingsRow {
  id: number;
  game: string;
  league_id: string;
  season: string;
  team_id: string;
  wins: number;
  losses: number;
  points: number;
  rank: number;
  as_of_date: string;
  updated_at: string;
}

/** Raw row from the `sync_state` table. */
export interface SyncStateRow {
  key: string;
  last_success_at: string | null;
  last_error: string | null;
  cursor: string | null;
  request_count: number;
  notes: string | null;
}

// ─────────────────────────────────────────────────────────
// 3. Row → Model Converters
// ─────────────────────────────────────────────────────────

/** Convert a D1 `games` row to the frontend `Game` interface. */
export function gameRowToGame(row: GameRow): Game {
  return {
    slug: row.slug,
    title: row.title,
    developer: row.developer,
    publisher: row.publisher,
    releaseYear: row.release_year,
    rating: row.rating,
    userScore: row.user_score,
    genres: JSON.parse(row.genres) as Genre[],
    platforms: JSON.parse(row.platforms) as Platform[],
    cover: row.cover,
    hero: row.hero,
    screenshots: JSON.parse(row.screenshots) as string[],
    shortDescription: row.short_description,
    description: row.description,
    ...(row.trending === 1 && { trending: true }),
    ...(row.featured === 1 && { featured: true }),
  };
}

/** Convert a D1 `articles` row to the frontend `Article` interface. */
export function articleRowToArticle(row: ArticleRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: JSON.parse(row.body) as string[],
    source: row.source as NewsSource,
    category: row.category as NewsCategory,
    author: row.author,
    publishedAt: row.published_at,
    cover: row.cover,
    ...(row.related_game_slug && { relatedGameSlug: row.related_game_slug }),
    ...(row.featured === 1 && { featured: true }),
    ...(row.reads > 0 && { reads: row.reads }),
  };
}

/** Convert a D1 `esports_teams` row to the frontend `Team` interface. */
export function teamRowToTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    region: row.region,
    game: row.game as EsportsGame,
    logoColor: row.logo_color,
    wins: row.wins,
    losses: row.losses,
    points: row.points,
    formStreak: JSON.parse(row.form_streak) as ("W" | "L")[],
  };
}

/** Convert a D1 `esports_players` row to the frontend `Player` interface. */
export function playerRowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    handle: row.handle,
    realName: row.real_name,
    teamId: row.team_id,
    game: row.game as EsportsGame,
    role: row.role,
    rating: row.rating,
    kda: row.kda,
    signature: row.signature,
  };
}

/** Convert a D1 `esports_matches` row to the frontend `Match` interface. */
export function matchRowToMatch(row: MatchRow): Match {
  return {
    id: row.id,
    game: row.game as EsportsGame,
    tournament: row.tournament,
    status: row.status as Match["status"],
    startsAt: row.starts_at,
    teamAId: row.team_a_id,
    teamBId: row.team_b_id,
    scoreA: row.score_a,
    scoreB: row.score_b,
    format: row.format,
    ...(row.current_map && { currentMap: row.current_map }),
    ...(row.viewers != null && { viewers: row.viewers }),
  };
}

// ─────────────────────────────────────────────────────────
// 4. Server Function Signature Types
// ─────────────────────────────────────────────────────────

/** Filters for the /games list page. */
export interface GameFilters {
  q?: string;
  genre?: Genre;
  platform?: Platform;
  minRating?: number;
  sort?: "rating" | "releaseYear" | "title" | "userScore";
}

/** Filters for the /news list page. */
export interface ArticleFilters {
  q?: string;
  source?: NewsSource;
  category?: NewsCategory;
  sort?: "newest" | "oldest";
}

/** Filters for the /esports list page. */
export interface EsportsFilters {
  game?: EsportsGame;
}

/** Composite payload for the home page loader. */
export interface HomepageData {
  featuredArticles: Article[];
  topStories: Article[];
  trendingArticles: Article[];
  featuredGames: Game[];
  trendingGames: Game[];
  upcomingMatches: Match[];
}

/** Payload for the LiveTicker component. */
export interface TickerData {
  matches: Match[];
  teams: Record<string, Team>;
}

/** Payload for the SearchDialog component. */
export interface SearchResults {
  games: Game[];
  articles: Article[];
  matches: Match[];
}

/** Composite payload for the /esports list page. */
export interface EsportsPageData {
  liveMatches: Match[];
  upcomingMatches: Match[];
  finishedMatches: Match[];
  teamsByGame: Record<EsportsGame, Team[]>;
  playersByGame: Record<EsportsGame, Player[]>;
}

/** Composite payload for the /esports/$matchId detail page. */
export interface MatchDetailData {
  match: Match;
  teamA: Team;
  teamB: Team;
  playersA: Player[];
  playersB: Player[];
  relatedMatches: Match[];
}

/** Composite payload for the /games/$slug detail page. */
export interface GameDetailData {
  game: Game;
  relatedNews: Article[];
  similarGames: Game[];
}

/** Composite payload for the /news/$slug detail page. */
export interface ArticleDetailData {
  article: Article;
  relatedGame?: Game;
  relatedArticles: Article[];
}

// ─────────────────────────────────────────────────────────
// 5. Normalizer Helpers
// ─────────────────────────────────────────────────────────

const GENRE_MAP: Record<string, Genre> = {
  "Action": "Action",
  "Role-playing": "RPG",
  "RPG": "RPG",
  "Shooter": "Shooter",
  "Strategy": "Strategy",
  "Adventure": "Adventure",
  "Sports": "Sports",
  "Racing": "Racing",
  "Indie": "Indie",
  "Massively Multiplayer": "MMO",
  "Fighting": "Fighting",
  "Simulation": "Simulation",
  "Horror": "Horror",
};

/** Map a RAWG genre name to the app's Genre union. Returns undefined if not in the union. */
export function normalizeGenre(rawgGenre: string): Genre | undefined {
  return GENRE_MAP[rawgGenre];
}

const PLATFORM_MAP: Record<string, Platform> = {
  "PC": "PC",
  "PlayStation 5": "PS5",
  "Xbox Series S/X": "Xbox",
  "Xbox Series X": "Xbox",
  "Xbox One": "Xbox",
  "Nintendo Switch": "Switch",
};

/** Map a RAWG platform name to the app's Platform union. Returns undefined if not in the union. */
export function normalizePlatform(rawgPlatform: string): Platform | undefined {
  // Exact match first
  if (PLATFORM_MAP[rawgPlatform]) return PLATFORM_MAP[rawgPlatform];
  // Partial match
  if (rawgPlatform.includes("PC")) return "PC";
  if (rawgPlatform.includes("PlayStation 5")) return "PS5";
  if (rawgPlatform.includes("Xbox")) return "Xbox";
  if (rawgPlatform.includes("Switch")) return "Switch";
  return undefined;
}

const ESPORTS_GAME_MAP: Record<string, EsportsGame> = {
  "Valorant": "Valorant",
  "Counter-Strike 2": "CS2",
  "CS:GO": "CS2",
  "CS2": "CS2",
  "League of Legends": "League of Legends",
  "LoL": "League of Legends",
  "Dota 2": "Dota 2",
};

/** Map a PandaScore videogame name to the app's EsportsGame union. */
export function normalizeEsportsGame(
  pandaName: string,
): EsportsGame | undefined {
  return ESPORTS_GAME_MAP[pandaName];
}

const REGION_MAP: Record<string, string> = {
  US: "NA", CA: "NA",
  GB: "EU", DE: "EU", FR: "EU", SE: "EU", DK: "EU", ES: "EU", IT: "EU", PL: "EU", FI: "EU",
  KR: "KR",
  CN: "CN",
  RU: "CIS", UA: "CIS", KZ: "CIS",
  BR: "BR", AR: "BR",
  JP: "APAC", AU: "APAC", SG: "APAC", PH: "APAC", TH: "APAC", VN: "APAC", ID: "APAC",
};

/** Map a PandaScore country code to a region label. */
export function normalizeRegion(countryCode: string | null): string {
  if (!countryCode) return "INT";
  return REGION_MAP[countryCode.toUpperCase()] ?? "INT";
}

/** Generate a deterministic logo color from a team name. */
export function teamLogoColor(name: string): string {
  const palette = [
    "#FACC15", "#F97316", "#A855F7", "#06B6D4",
    "#EF4444", "#3B82F6", "#10B981", "#F59E0B",
    "#8B5CF6", "#EC4899", "#0EA5E9", "#22C55E",
    "#F472B6", "#EAB308",
  ];
  let hash = 0;
  for (const ch of name) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

type CategoryKeywords = readonly string[];

const CATEGORY_RULES: Array<{ category: NewsCategory; keywords: CategoryKeywords }> = [
  { category: "Esports", keywords: ["esport", "competitive", "tournament", "league", "championship"] },
  { category: "Reviews", keywords: ["review", "score", "verdict", "rated"] },
  { category: "Updates", keywords: ["update", "patch", "season", "dlc", "expansion", "hotfix"] },
  { category: "Industry", keywords: ["acquisition", "layoff", "studio", "hire", "business", "revenue"] },
  { category: "Drama", keywords: ["controversy", "drama", "leak", "scandal", "backlash"] },
  { category: "Hardware", keywords: ["gpu", "cpu", "hardware", "console", "chip", "nvidia", "amd"] },
];

/** Classify an article into a NewsCategory based on tags and text content. */
export function classifyCategory(
  tags: string[],
  title: string,
  excerpt: string,
): NewsCategory {
  const haystack = [...tags, title, excerpt].join(" ").toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => haystack.includes(kw))) {
      return rule.category;
    }
  }
  return "Updates";
}

/** Generate a URL-safe slug from a title string. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
