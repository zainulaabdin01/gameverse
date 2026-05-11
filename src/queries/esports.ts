import { createServerFn } from "@tanstack/react-start";
import { getDB } from "../server/db";
import { 
  type MatchRow, 
  type TeamRow, 
  type PlayerRow,
  matchRowToMatch,
  teamRowToTeam,
  playerRowToPlayer,
  type EsportsGame 
} from "../server/types";

/**
 * Fetch matches with optional filtering by status and game.
 */
export const listMatchesFn = createServerFn({ method: "GET" })
  .inputValidator((data: { status?: string; game?: string; limit?: number } = {}) => data)
  .handler(async ({ data }) => {
    const db = await getDB();
    
    let query = `
      SELECT m.*, 
             t_a.name as team_a_name, t_a.tag as team_a_tag,
             t_b.name as team_b_name, t_b.tag as team_b_tag
      FROM esports_matches m
      LEFT JOIN esports_teams t_a ON m.team_a_id = t_a.id
      LEFT JOIN esports_teams t_b ON m.team_b_id = t_b.id
      WHERE 1=1
    `;
    const binds: any[] = [];
    
    if (data.status) {
      query += " AND m.status = ?";
      binds.push(data.status);
    }
    
    if (data.game) {
      query += " AND m.game = ?";
      binds.push(data.game);
    }
    
    query += " ORDER BY m.starts_at DESC";
    
    if (data.limit) {
      query += " LIMIT ?";
      binds.push(data.limit);
    }

    const result = await db.prepare(query).bind(...binds).all<MatchRow>();
    
    if (!result.results) return [];
    return result.results.map(matchRowToMatch);
  });

/**
 * Fetch a single match by its ID with team details.
 */
export const getMatchByIdFn = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    const db = await getDB();
    
    const result = await db.prepare(`
      SELECT m.*, 
             t_a.name as team_a_name, t_a.tag as team_a_tag, t_a.region as team_a_region,
             t_a.wins as team_a_wins, t_a.losses as team_a_losses, t_a.points as team_a_points,
             t_a.form_streak as team_a_form_streak,
             t_b.name as team_b_name, t_b.tag as team_b_tag, t_b.region as team_b_region,
             t_b.wins as team_b_wins, t_b.losses as team_b_losses, t_b.points as team_b_points,
             t_b.form_streak as team_b_form_streak
      FROM esports_matches m
      LEFT JOIN esports_teams t_a ON m.team_a_id = t_a.id
      LEFT JOIN esports_teams t_b ON m.team_b_id = t_b.id
      WHERE m.id = ?
    `).bind(data).first<MatchRow>();

    if (!result) return null;
    return matchRowToMatch(result);
  });

/**
 * Fetch teams filtered by game.
 */
export const listTeamsFn = createServerFn({ method: "GET" })
  .inputValidator((data: { game?: string } = {}) => data)
  .handler(async ({ data }) => {
    const db = await getDB();
    
    let query = "SELECT * FROM esports_teams WHERE 1=1";
    const binds: any[] = [];
    
    if (data.game) {
      query += " AND game = ?";
      binds.push(data.game);
    }
    
    query += " ORDER BY points DESC, wins DESC";

    const result = await db.prepare(query).bind(...binds).all<TeamRow>();
    
    if (!result.results) return [];
    return result.results.map(teamRowToTeam);
  });

/**
 * Fetch players filtered by game.
 */
export const listPlayersFn = createServerFn({ method: "GET" })
  .inputValidator((data: { game?: string } = {}) => data)
  .handler(async ({ data }) => {
    const db = await getDB();
    
    let query = `
      SELECT p.*, t.name as team_name, t.tag as team_tag
      FROM esports_players p
      LEFT JOIN esports_teams t ON p.team_id = t.id
      WHERE 1=1
    `;
    const binds: any[] = [];
    
    if (data.game) {
      query += " AND p.game = ?";
      binds.push(data.game);
    }
    
    query += " ORDER BY p.rating DESC";

    const result = await db.prepare(query).bind(...binds).all<PlayerRow>();
    
    if (!result.results) return [];
    return result.results.map(playerRowToPlayer);
  });

/**
 * Fetch live ticker data (live matches for ticker component).
 */
export const getTickerDataFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = await getDB();
    
    const result = await db.prepare(`
      SELECT m.*, 
             t_a.name as team_a_name, t_a.tag as team_a_tag,
             t_b.name as team_b_name, t_b.tag as team_b_tag
      FROM esports_matches m
      LEFT JOIN esports_teams t_a ON m.team_a_id = t_a.id
      LEFT JOIN esports_teams t_b ON m.team_b_id = t_b.id
      WHERE m.status = 'live'
      ORDER BY m.viewers DESC, m.starts_at DESC
      LIMIT 10
    `).all<MatchRow>();

    if (!result.results) return [];
    return result.results.map(matchRowToMatch);
  });

/**
 * Get team by ID.
 */
export const getTeamByIdFn = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    const db = await getDB();
    
    const result = await db.prepare("SELECT * FROM esports_teams WHERE id = ?")
      .bind(data)
      .first<TeamRow>();

    if (!result) return null;
    return teamRowToTeam(result);
  });

/**
 * Get players by team ID.
 */
export const getPlayersByTeamFn = createServerFn({ method: "GET" })
  .inputValidator((data: string) => data)
  .handler(async ({ data }) => {
    const db = await getDB();
    
    const result = await db.prepare("SELECT * FROM esports_players WHERE team_id = ? ORDER BY rating DESC")
      .bind(data)
      .all<PlayerRow>();

    if (!result.results) return [];
    return result.results.map(playerRowToPlayer);
  });
