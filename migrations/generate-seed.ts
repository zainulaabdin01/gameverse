/**
 * Generates 0002_seed_mock_data.sql from the existing mock arrays.
 * Run: npx tsx migrations/generate-seed.ts
 */
import { games } from "../src/data/games.js";
import { articles } from "../src/data/news.js";
import { teams, players, matches } from "../src/data/esports.js";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const esc = (s: string) => s.replace(/'/g, "''");

const lines: string[] = ["-- Auto-generated seed data from src/data/*.ts", "-- Do not edit manually. Re-run: npx tsx migrations/generate-seed.ts", ""];

// Games
for (const g of games) {
  lines.push(`INSERT OR IGNORE INTO games (slug, title, developer, publisher, release_year, rating, user_score, genres, platforms, cover, hero, screenshots, short_description, description, trending, featured) VALUES ('${esc(g.slug)}', '${esc(g.title)}', '${esc(g.developer)}', '${esc(g.publisher)}', ${g.releaseYear}, ${g.rating}, ${g.userScore}, '${JSON.stringify(g.genres)}', '${JSON.stringify(g.platforms)}', '${esc(g.cover)}', '${esc(g.hero)}', '${esc(JSON.stringify(g.screenshots))}', '${esc(g.shortDescription)}', '${esc(g.description)}', ${g.trending ? 1 : 0}, ${g.featured ? 1 : 0});`);
}
lines.push("");

// Articles
for (const a of articles) {
  lines.push(`INSERT OR IGNORE INTO articles (slug, title, excerpt, body, source, category, author, published_at, cover, related_game_slug, featured, reads, external_url) VALUES ('${esc(a.slug)}', '${esc(a.title)}', '${esc(a.excerpt)}', '${esc(JSON.stringify(a.body))}', '${esc(a.source)}', '${esc(a.category)}', '${esc(a.author)}', '${a.publishedAt}', '${esc(a.cover)}', ${a.relatedGameSlug ? `'${esc(a.relatedGameSlug)}'` : "NULL"}, ${a.featured ? 1 : 0}, ${a.reads ?? 0}, 'mock://${esc(a.slug)}');`);
}
lines.push("");

// Teams
for (const t of teams) {
  lines.push(`INSERT OR IGNORE INTO esports_teams (id, name, tag, region, game, logo_color, wins, losses, points, form_streak) VALUES ('${esc(t.id)}', '${esc(t.name)}', '${esc(t.tag)}', '${esc(t.region)}', '${esc(t.game)}', '${esc(t.logoColor)}', ${t.wins}, ${t.losses}, ${t.points}, '${JSON.stringify(t.formStreak)}');`);
}
lines.push("");

// Players
for (const p of players) {
  lines.push(`INSERT OR IGNORE INTO esports_players (id, handle, real_name, team_id, game, role, rating, kda, signature) VALUES ('${esc(p.id)}', '${esc(p.handle)}', '${esc(p.realName)}', '${esc(p.teamId)}', '${esc(p.game)}', '${esc(p.role)}', ${p.rating}, ${p.kda}, '${esc(p.signature)}');`);
}
lines.push("");

// Matches
for (const m of matches) {
  lines.push(`INSERT OR IGNORE INTO esports_matches (id, game, tournament, status, starts_at, team_a_id, team_b_id, score_a, score_b, format, current_map, viewers) VALUES ('${esc(m.id)}', '${esc(m.game)}', '${esc(m.tournament)}', '${esc(m.status)}', '${m.startsAt}', '${esc(m.teamAId)}', '${esc(m.teamBId)}', ${m.scoreA}, ${m.scoreB}, '${esc(m.format)}', ${m.currentMap ? `'${esc(m.currentMap)}'` : "NULL"}, ${m.viewers ?? "NULL"});`);
}

const sql = lines.join("\n") + "\n";
const outPath = join(__dirname, "0002_seed_mock_data.sql");
writeFileSync(outPath, sql, "utf-8");
console.log(`✅ Wrote ${lines.length} lines to ${outPath}`);
console.log(`   Games: ${games.length}, Articles: ${articles.length}, Teams: ${teams.length}, Players: ${players.length}, Matches: ${matches.length}`);
