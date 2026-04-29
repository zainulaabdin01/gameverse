export type EsportsGame = "Valorant" | "CS2" | "League of Legends" | "Dota 2";

export interface Team {
  id: string;
  name: string;
  tag: string;
  region: string;
  game: EsportsGame;
  logoColor: string; // tailwind-friendly hex
  wins: number;
  losses: number;
  points: number;
  formStreak: ("W" | "L")[];
}

export interface Player {
  id: string;
  handle: string;
  realName: string;
  teamId: string;
  game: EsportsGame;
  role: string;
  rating: number;
  kda: number;
  signature: string; // signature champ/agent/operator
}

export interface Match {
  id: string;
  game: EsportsGame;
  tournament: string;
  status: "live" | "upcoming" | "finished";
  startsAt: string; // ISO
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  format: string; // e.g. BO3
  currentMap?: string;
  viewers?: number;
}

const teams: Team[] = [
  // Valorant
  { id: "sentinel", name: "Sentinel", tag: "SEN", region: "NA", game: "Valorant", logoColor: "#FACC15", wins: 12, losses: 3, points: 36, formStreak: ["W","W","W","L","W"] },
  { id: "iron-maple", name: "Iron Maple", tag: "IRM", region: "EU", game: "Valorant", logoColor: "#F97316", wins: 11, losses: 4, points: 33, formStreak: ["W","W","L","W","W"] },
  { id: "black-lotus", name: "Black Lotus", tag: "BLK", region: "KR", game: "Valorant", logoColor: "#A855F7", wins: 10, losses: 5, points: 30, formStreak: ["L","W","W","W","L"] },
  { id: "pacific-tide", name: "Pacific Tide", tag: "PCT", region: "APAC", game: "Valorant", logoColor: "#06B6D4", wins: 8, losses: 7, points: 24, formStreak: ["W","L","W","L","L"] },

  // CS2
  { id: "vexar", name: "Vexar", tag: "VXR", region: "EU", game: "CS2", logoColor: "#EF4444", wins: 14, losses: 2, points: 42, formStreak: ["W","W","W","W","W"] },
  { id: "north-star", name: "North Star", tag: "NST", region: "NA", game: "CS2", logoColor: "#3B82F6", wins: 10, losses: 6, points: 30, formStreak: ["W","L","W","W","L"] },
  { id: "drei", name: "Drei", tag: "3EI", region: "EU", game: "CS2", logoColor: "#10B981", wins: 9, losses: 7, points: 27, formStreak: ["L","W","L","W","W"] },
  { id: "horizon-cl", name: "Horizon CL", tag: "HZN", region: "BR", game: "CS2", logoColor: "#F59E0B", wins: 7, losses: 9, points: 21, formStreak: ["L","L","W","L","W"] },

  // LoL
  { id: "atlas", name: "Atlas Esports", tag: "ATL", region: "EU", game: "League of Legends", logoColor: "#8B5CF6", wins: 13, losses: 5, points: 39, formStreak: ["W","W","L","W","W"] },
  { id: "kingdom-9", name: "Kingdom Nine", tag: "K9", region: "KR", game: "League of Legends", logoColor: "#EC4899", wins: 16, losses: 2, points: 48, formStreak: ["W","W","W","W","W"] },
  { id: "blue-rift", name: "Blue Rift", tag: "BLR", region: "NA", game: "League of Legends", logoColor: "#0EA5E9", wins: 9, losses: 9, points: 27, formStreak: ["L","W","L","W","L"] },
  { id: "phantom-9", name: "Phantom Nine", tag: "PH9", region: "CN", game: "League of Legends", logoColor: "#22C55E", wins: 14, losses: 4, points: 42, formStreak: ["W","W","W","L","W"] },

  // Dota 2
  { id: "old-guard", name: "Old Guard", tag: "OG2", region: "EU", game: "Dota 2", logoColor: "#F472B6", wins: 11, losses: 4, points: 33, formStreak: ["W","L","W","W","W"] },
  { id: "team-liquid-fire", name: "Liquid Fire", tag: "LQF", region: "EU", game: "Dota 2", logoColor: "#3B82F6", wins: 12, losses: 3, points: 36, formStreak: ["W","W","W","W","L"] },
  { id: "spirit-hunters", name: "Spirit Hunters", tag: "SPH", region: "CIS", game: "Dota 2", logoColor: "#EAB308", wins: 13, losses: 2, points: 39, formStreak: ["W","W","W","W","W"] },
  { id: "dynasty-league", name: "Dynasty", tag: "DYN", region: "CN", game: "Dota 2", logoColor: "#EF4444", wins: 9, losses: 6, points: 27, formStreak: ["L","W","W","L","W"] },
];

const players: Player[] = [
  { id: "p1", handle: "Phantom", realName: "Eli Park", teamId: "sentinel", game: "Valorant", role: "Duelist", rating: 1.34, kda: 1.62, signature: "Jett" },
  { id: "p2", handle: "Aria", realName: "Mia Voss", teamId: "iron-maple", game: "Valorant", role: "Controller", rating: 1.21, kda: 1.41, signature: "Omen" },
  { id: "p3", handle: "Jin", realName: "Jin-Woo Han", teamId: "black-lotus", game: "Valorant", role: "Duelist", rating: 1.30, kda: 1.55, signature: "Raze" },
  { id: "p4", handle: "Echo", realName: "Tomás Rivera", teamId: "pacific-tide", game: "Valorant", role: "Initiator", rating: 1.18, kda: 1.38, signature: "Sova" },

  { id: "p5", handle: "vex0", realName: "Anders Holm", teamId: "vexar", game: "CS2", role: "AWPer", rating: 1.42, kda: 1.71, signature: "AWP" },
  { id: "p6", handle: "kyro", realName: "Kyle Rourke", teamId: "north-star", game: "CS2", role: "Rifler", rating: 1.27, kda: 1.49, signature: "AK-47" },
  { id: "p7", handle: "drei1", realName: "Lukas Berg", teamId: "drei", game: "CS2", role: "IGL", rating: 1.12, kda: 1.18, signature: "M4A1-S" },

  { id: "p8", handle: "Skarn", realName: "Jonas Vey", teamId: "atlas", game: "League of Legends", role: "Mid", rating: 1.31, kda: 5.4, signature: "Azir" },
  { id: "p9", handle: "Royal", realName: "Min-Jae Lee", teamId: "kingdom-9", game: "League of Legends", role: "Top", rating: 1.45, kda: 6.2, signature: "K'Sante" },
  { id: "p10", handle: "Quill", realName: "Henry Marsh", teamId: "blue-rift", game: "League of Legends", role: "ADC", rating: 1.18, kda: 4.1, signature: "Aphelios" },

  { id: "p11", handle: "Vela", realName: "Pavel Sorokin", teamId: "spirit-hunters", game: "Dota 2", role: "Carry", rating: 1.38, kda: 5.9, signature: "Spectre" },
  { id: "p12", handle: "Olber", realName: "Ola Berg", teamId: "old-guard", game: "Dota 2", role: "Mid", rating: 1.28, kda: 5.2, signature: "Invoker" },
  { id: "p13", handle: "Liqui", realName: "Yuki Saito", teamId: "team-liquid-fire", game: "Dota 2", role: "Offlaner", rating: 1.22, kda: 4.6, signature: "Tidehunter" },
];

const minutes = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

const matches: Match[] = [
  // LIVE
  { id: "m1", game: "Valorant", tournament: "Valor Arena Champions", status: "live", startsAt: minutes(-32), teamAId: "sentinel", teamBId: "iron-maple", scoreA: 1, scoreB: 1, format: "BO3", currentMap: "Ascent — 9-7", viewers: 412_000 },
  { id: "m2", game: "CS2", tournament: "CS2 Paris Major", status: "live", startsAt: minutes(-18), teamAId: "vexar", teamBId: "north-star", scoreA: 1, scoreB: 0, format: "BO3", currentMap: "Mirage — 12-9", viewers: 318_000 },
  { id: "m3", game: "League of Legends", tournament: "LEC Spring Playoffs", status: "live", startsAt: minutes(-12), teamAId: "atlas", teamBId: "blue-rift", scoreA: 2, scoreB: 1, format: "BO5", currentMap: "Game 4 — 24:18", viewers: 268_000 },
  { id: "m4", game: "Dota 2", tournament: "DPC EU Division I", status: "live", startsAt: minutes(-44), teamAId: "old-guard", teamBId: "team-liquid-fire", scoreA: 0, scoreB: 1, format: "BO3", currentMap: "Game 2 — 28 min", viewers: 142_000 },

  // UPCOMING
  { id: "m5", game: "Valorant", tournament: "Valor Arena Champions", status: "upcoming", startsAt: minutes(45), teamAId: "black-lotus", teamBId: "pacific-tide", scoreA: 0, scoreB: 0, format: "BO3" },
  { id: "m6", game: "CS2", tournament: "CS2 Paris Major", status: "upcoming", startsAt: minutes(120), teamAId: "drei", teamBId: "horizon-cl", scoreA: 0, scoreB: 0, format: "BO3" },
  { id: "m7", game: "League of Legends", tournament: "LCK Summer Split", status: "upcoming", startsAt: minutes(220), teamAId: "kingdom-9", teamBId: "phantom-9", scoreA: 0, scoreB: 0, format: "BO5" },
  { id: "m8", game: "Dota 2", tournament: "ESL One", status: "upcoming", startsAt: minutes(360), teamAId: "spirit-hunters", teamBId: "dynasty-league", scoreA: 0, scoreB: 0, format: "BO3" },
  { id: "m9", game: "Valorant", tournament: "VCT Pacific", status: "upcoming", startsAt: minutes(720), teamAId: "pacific-tide", teamBId: "sentinel", scoreA: 0, scoreB: 0, format: "BO3" },

  // FINISHED
  { id: "m10", game: "Valorant", tournament: "Valor Arena Champions", status: "finished", startsAt: minutes(-360), teamAId: "iron-maple", teamBId: "black-lotus", scoreA: 2, scoreB: 1, format: "BO3" },
  { id: "m11", game: "CS2", tournament: "CS2 Paris Major", status: "finished", startsAt: minutes(-220), teamAId: "vexar", teamBId: "drei", scoreA: 2, scoreB: 0, format: "BO3" },
  { id: "m12", game: "League of Legends", tournament: "LEC Spring Playoffs", status: "finished", startsAt: minutes(-1440), teamAId: "atlas", teamBId: "kingdom-9", scoreA: 1, scoreB: 3, format: "BO5" },
  { id: "m13", game: "Dota 2", tournament: "DPC EU Division I", status: "finished", startsAt: minutes(-2880), teamAId: "spirit-hunters", teamBId: "dynasty-league", scoreA: 2, scoreB: 0, format: "BO3" },
];

export { teams, players, matches };
export const getTeam = (id: string) => teams.find((t) => t.id === id)!;
export const getMatch = (id: string) => matches.find((m) => m.id === id);
export const teamsByGame = (g: EsportsGame) =>
  teams.filter((t) => t.game === g).sort((a, b) => b.points - a.points);
export const playersByGame = (g: EsportsGame) =>
  players.filter((p) => p.game === g).sort((a, b) => b.rating - a.rating);
export const matchesByGame = (g: EsportsGame) => matches.filter((m) => m.game === g);
export const liveMatches = () => matches.filter((m) => m.status === "live");
export const upcomingMatches = () => matches.filter((m) => m.status === "upcoming");
export const finishedMatches = () => matches.filter((m) => m.status === "finished");

export const esportsGames: EsportsGame[] = ["Valorant", "CS2", "League of Legends", "Dota 2"];
