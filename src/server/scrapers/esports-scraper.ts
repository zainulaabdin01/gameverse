/**
 * PandaScore Esports Scraper
 * 
 * Fetches esports data for Valorant, CS2, LoL, and Dota 2
 * Handles matches, teams, players, and standings
 * Respects rate limits (1,000 requests/month on free tier)
 */

import { 
  normalizeEsportsGame, 
  normalizeRegion, 
  teamLogoColor,
  type TeamRow,
  type PlayerRow,
  type MatchRow,
  type StandingsRow,
  type SyncStateRow
} from "../types";

// PandaScore API base URL
const PANDASCORE_BASE = "https://api.pandascore.co";

// Supported games and their PandaScore IDs
const SUPPORTED_GAMES = [
  { name: "Valorant", slug: "valorant" },
  { name: "Counter-Strike 2", slug: "csgo" },
  { name: "League of Legends", slug: "lol" },
  { name: "Dota 2", slug: "dota2" }
] as const;

// Rate limiting: track requests per month
let monthlyRequestCount = 0;
const MONTHLY_LIMIT = 1000;

/**
 * Make a rate-limited request to PandaScore API
 */
async function pandoraScoreRequest(endpoint: string, apiKey: string): Promise<any[]> {
  if (monthlyRequestCount >= MONTHLY_LIMIT) {
    throw new Error(`PandaScore monthly limit reached (${MONTHLY_LIMIT} requests)`);
  }

  const url = `${PANDASCORE_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`PandaScore API error: ${response.status} ${response.statusText}`);
  }

  monthlyRequestCount++;
  const data = await response.json();
  return Array.isArray(data) ? data : [data];
}

/**
 * Fetch upcoming and recent matches for all supported games
 */
async function fetchMatches(apiKey: string): Promise<MatchRow[]> {
  const matches: MatchRow[] = [];
  const now = new Date().toISOString();

  for (const game of SUPPORTED_GAMES) {
    try {
      console.log(`[esports] Fetching matches for ${game.name}`);

      // Fetch upcoming matches (next 7 days)
      const upcomingMatches = await pandoraScoreRequest(
        `/${game.slug}/matches?filter[future]=1&per_page=20`,
        apiKey
      );

      // Fetch recent matches (last 3 days)
      const recentMatches = await pandoraScoreRequest(
        `/${game.slug}/matches?filter[past]=1&per_page=20`,
        apiKey
      );

      const allMatches = [...upcomingMatches, ...recentMatches];

      for (const match of allMatches) {
        // Skip matches without teams
        if (!match.opponents || match.opponents.length < 2) continue;

        const teamA = match.opponents[0]?.opponent;
        const teamB = match.opponents[1]?.opponent;

        if (!teamA || !teamB) continue;

        const normalizedGame = normalizeEsportsGame(game.name);
        if (!normalizedGame) continue;

        const matchRow: MatchRow = {
          id: match.id.toString(),
          game: normalizedGame,
          tournament: match.tournament?.name || "",
          status: match.status === "running" ? "live" : 
                  match.status === "finished" ? "finished" : "upcoming",
          starts_at: match.begin_at || now,
          team_a_id: teamA.id.toString(),
          team_b_id: teamB.id.toString(),
          score_a: match.results?.[0]?.score || 0,
          score_b: match.results?.[1]?.score || 0,
          format: match.number_of_games ? `BO${match.number_of_games}` : "BO3",
          current_map: match.games?.find((g: any) => g.status === "running")?.name || null,
          viewers: match.live?.opens_at ? null : match.viewers || null,
          winner_team_id: match.winner_id?.toString() || null,
          external_id: match.id,
          fetched_at: now,
          updated_at: now,
        };

        matches.push(matchRow);
      }

      console.log(`[esports] Fetched ${allMatches.length} matches for ${game.name}`);
    } catch (error) {
      console.error(`[esports] Error fetching matches for ${game.name}:`, error);
    }
  }

  return matches;
}

/**
 * Extract and normalize teams from match data
 */
async function extractTeamsFromMatches(matches: MatchRow[]): Promise<TeamRow[]> {
  const teamsMap = new Map<string, TeamRow>();
  const now = new Date().toISOString();

  // Get unique team IDs from matches
  const teamIds = new Set<string>();
  matches.forEach(match => {
    teamIds.add(match.team_a_id);
    teamIds.add(match.team_b_id);
  });

  console.log(`[esports] Extracting ${teamIds.size} unique teams`);

  // Note: In a real implementation, we'd fetch team details from PandaScore
  // For now, we'll create basic team entries that can be enriched later
  for (const teamId of teamIds) {
    if (!teamsMap.has(teamId)) {
      const teamRow: TeamRow = {
        id: teamId,
        name: `Team ${teamId}`, // Placeholder - would be fetched from API
        tag: `T${teamId.slice(-3)}`, // Placeholder tag
        region: "INT", // Default region
        game: "", // Will be set per match context
        logo_color: teamLogoColor(teamId),
        logo_url: null,
        wins: 0,
        losses: 0,
        points: 0,
        form_streak: "[]", // Empty form streak initially
        external_id: parseInt(teamId),
        fetched_at: now,
        updated_at: now,
      };
      teamsMap.set(teamId, teamRow);
    }
  }

  return Array.from(teamsMap.values());
}

/**
 * Fetch standings for all supported games
 */
async function fetchStandings(apiKey: string): Promise<StandingsRow[]> {
  const standings: StandingsRow[] = [];
  const now = new Date().toISOString();

  for (const game of SUPPORTED_GAMES) {
    try {
      console.log(`[esports] Fetching standings for ${game.name}`);

      // Fetch current tournaments/leagues
      const tournaments = await pandoraScoreRequest(
        `/${game.slug}/tournaments?filter[upcoming]=0&per_page=10`,
        apiKey
      );

      for (const tournament of tournaments) {
        if (!tournament.id) continue;

        try {
          // Fetch standings for this tournament
          const tournamentStandings = await pandoraScoreRequest(
            `/${game.slug}/tournaments/${tournament.id}/standings`,
            apiKey
          );

          for (const standing of tournamentStandings) {
            const normalizedGame = normalizeEsportsGame(game.name);
            if (!normalizedGame) continue;

            const standingRow: StandingsRow = {
              id: 0, // Will be auto-incremented
              game: normalizedGame,
              league_id: tournament.id.toString(),
              season: tournament.name || tournament.slug || "Current Season",
              team_id: standing.team?.id?.toString() || "",
              wins: standing.wins || 0,
              losses: standing.losses || 0,
              points: standing.points || 0,
              rank: standing.place || 0,
              as_of_date: now,
              updated_at: now,
            };

            standings.push(standingRow);
          }
        } catch (error) {
          console.error(`[esports] Error fetching standings for tournament ${tournament.id}:`, error);
        }
      }

      console.log(`[esports] Fetched standings for ${game.name}`);
    } catch (error) {
      console.error(`[esports] Error fetching tournaments for ${game.name}:`, error);
    }
  }

  return standings;
}

/**
 * Fetch player rosters for active teams
 */
async function fetchPlayers(apiKey: string, teams: TeamRow[]): Promise<PlayerRow[]> {
  const players: PlayerRow[] = [];
  const now = new Date().toISOString();

  // Group teams by game for efficient fetching
  const teamsByGame = teams.reduce((acc, team) => {
    if (!acc[team.game]) acc[team.game] = [];
    acc[team.game].push(team);
    return acc;
  }, {} as Record<string, TeamRow[]>);

  for (const [game, gameTeams] of Object.entries(teamsByGame)) {
    const gameSlug = SUPPORTED_GAMES.find(g => normalizeEsportsGame(g.name) === game)?.slug;
    if (!gameSlug) continue;

    try {
      console.log(`[esports] Fetching players for ${game}`);

      for (const team of gameTeams) {
        try {
          // Fetch team roster
          const roster = await pandoraScoreRequest(
            `/${gameSlug}/teams/${team.external_id}/players`,
            apiKey
          );

          for (const player of roster) {
            const playerRow: PlayerRow = {
              id: player.id.toString(),
              handle: player.name || player.nickname || "Unknown",
              real_name: player.real_name || "",
              team_id: team.id,
              game: game,
              role: player.role || "Player",
              rating: 1.00, // PandaScore doesn't provide this directly
              kda: 0.00, // Would need match history to calculate
              signature: player.hero?.name || "", // For Dota 2 heroes
              external_id: player.id,
              fetched_at: now,
            };

            players.push(playerRow);
          }
        } catch (error) {
          console.error(`[esports] Error fetching roster for team ${team.id}:`, error);
        }
      }

      console.log(`[esports] Fetched players for ${game}`);
    } catch (error) {
      console.error(`[esports] Error fetching players for ${game}:`, error);
    }
  }

  return players;
}

/**
 * Compute form streaks for teams based on recent matches
 */
function computeFormStreaks(matches: MatchRow[]): Record<string, string> {
  const formStreaks: Record<string, string> = {};

  // Group matches by team
  const teamMatches = new Map<string, MatchRow[]>();

  matches.forEach(match => {
    // Team A matches
    if (!teamMatches.has(match.team_a_id)) {
      teamMatches.set(match.team_a_id, []);
    }
    teamMatches.get(match.team_a_id)!.push(match);

    // Team B matches
    if (!teamMatches.has(match.team_b_id)) {
      teamMatches.set(match.team_b_id, []);
    }
    teamMatches.get(match.team_b_id)!.push(match);
  });

  // Compute form streak for each team (last 5 matches)
  for (const [teamId, teamMatchList] of teamMatches) {
    // Sort by start time (most recent first)
    teamMatchList.sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

    // Take last 5 finished matches
    const recentMatches = teamMatchList
      .filter(m => m.status === "finished")
      .slice(0, 5);

    const streak: ("W" | "L")[] = [];
    for (const match of recentMatches) {
      if (match.team_a_id === teamId) {
        streak.push(match.score_a > match.score_b ? "W" : "L");
      } else {
        streak.push(match.score_b > match.score_a ? "W" : "L");
      }
    }

    formStreaks[teamId] = JSON.stringify(streak);
  }

  return formStreaks;
}

/**
 * Main esports scraping function
 */
export async function scrapeEsports(db: D1Database, apiKey: string): Promise<void> {
  console.log("[esports] Starting esports data sync");
  const startTime = Date.now();

  try {
    // Update sync state
    await db.prepare(`
      INSERT OR REPLACE INTO sync_state (key, last_success_at, last_error, request_count, notes)
      VALUES ('pandascore_matches', NULL, NULL, ?, ?)
    `).bind(monthlyRequestCount, `Started sync at ${new Date().toISOString()}`).run();

    // 1. Fetch matches
    const matches = await fetchMatches(apiKey);
    console.log(`[esports] Fetched ${matches.length} total matches`);

    // 2. Extract teams from matches
    const teams = await extractTeamsFromMatches(matches);
    console.log(`[esports] Extracted ${teams.length} teams`);

    // 3. Compute form streaks
    const formStreaks = computeFormStreaks(matches);
    
    // Update teams with form streaks and game context
    teams.forEach(team => {
      team.form_streak = formStreaks[team.id] || "[]";
    });

    // 4. Fetch standings (daily sync)
    const standings = await fetchStandings(apiKey);
    console.log(`[esports] Fetched ${standings.length} standings entries`);

    // 5. Fetch players (daily sync)
    const players = await fetchPlayers(apiKey, teams);
    console.log(`[esports] Fetched ${players.length} players`);

    // 6. Upsert data to database
    await upsertTeams(db, teams);
    await upsertMatches(db, matches);
    await upsertStandings(db, standings);
    await upsertPlayers(db, players);

    const duration = Date.now() - startTime;
    console.log(`[esports] Sync completed in ${duration}ms`);

    // Update sync state on success
    await db.prepare(`
      INSERT OR REPLACE INTO sync_state (key, last_success_at, last_error, request_count, notes)
      VALUES ('pandascore_matches', ?, NULL, ?, ?)
    `).bind(new Date().toISOString(), monthlyRequestCount, `Success: ${matches.length} matches, ${teams.length} teams`).run();

  } catch (error) {
    console.error("[esports] Sync failed:", error);
    
    // Update sync state on error
    await db.prepare(`
      INSERT OR REPLACE INTO sync_state (key, last_success_at, last_error, request_count, notes)
      VALUES ('pandascore_matches', NULL, ?, ?, ?)
    `).bind(error instanceof Error ? error.message : String(error), monthlyRequestCount, `Failed at ${new Date().toISOString()}`).run();

    throw error;
  }
}

/**
 * Upsert teams to database
 */
async function upsertTeams(db: D1Database, teams: TeamRow[]): Promise<void> {
  for (const team of teams) {
    await db.prepare(`
      INSERT OR REPLACE INTO esports_teams (
        id, name, tag, region, game, logo_color, logo_url,
        wins, losses, points, form_streak, external_id, fetched_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      team.id, team.name, team.tag, team.region, team.game,
      team.logo_color, team.logo_url, team.wins, team.losses,
      team.points, team.form_streak, team.external_id,
      team.fetched_at, team.updated_at
    ).run();
  }
}

/**
 * Upsert matches to database
 */
async function upsertMatches(db: D1Database, matches: MatchRow[]): Promise<void> {
  for (const match of matches) {
    await db.prepare(`
      INSERT OR REPLACE INTO esports_matches (
        id, game, tournament, status, starts_at, team_a_id, team_b_id,
        score_a, score_b, format, current_map, viewers, winner_team_id,
        external_id, fetched_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      match.id, match.game, match.tournament, match.status,
      match.starts_at, match.team_a_id, match.team_b_id,
      match.score_a, match.score_b, match.format, match.current_map,
      match.viewers, match.winner_team_id, match.external_id,
      match.fetched_at, match.updated_at
    ).run();
  }
}

/**
 * Upsert standings to database
 */
async function upsertStandings(db: D1Database, standings: StandingsRow[]): Promise<void> {
  for (const standing of standings) {
    await db.prepare(`
      INSERT OR REPLACE INTO esports_standings (
        game, league_id, season, team_id, wins, losses, points, rank, as_of_date, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      standing.game, standing.league_id, standing.season,
      standing.team_id, standing.wins, standing.losses,
      standing.points, standing.rank, standing.as_of_date,
      standing.updated_at
    ).run();
  }
}

/**
 * Upsert players to database
 */
async function upsertPlayers(db: D1Database, players: PlayerRow[]): Promise<void> {
  for (const player of players) {
    await db.prepare(`
      INSERT OR REPLACE INTO esports_players (
        id, handle, real_name, team_id, game, role, rating, kda, signature, external_id, fetched_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      player.id, player.handle, player.real_name, player.team_id,
      player.game, player.role, player.rating, player.kda,
      player.signature, player.external_id, player.fetched_at
    ).run();
  }
}
