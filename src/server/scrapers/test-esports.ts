/**
 * Test script for esports data ingestion
 * Run locally to validate PandaScore integration
 */

import { scrapeEsports } from "./esports-scraper";
import { env } from "../cloudflare-mock";

async function testEsportsScraper() {
  console.log("🎮 Testing esports scraper...");
  console.log("API Key (first 8 chars):", env.PANDASCORE_API_KEY?.slice(0, 8) + "...");

  try {
    await scrapeEsports(env.DB, env.PANDASCORE_API_KEY);
    console.log("✅ Esports scraper test completed successfully!");
    
    // Verify data was inserted
    const teamCount = await env.DB.prepare("SELECT COUNT(*) as count FROM esports_teams").first();
    const matchCount = await env.DB.prepare("SELECT COUNT(*) as count FROM esports_matches").first();
    const playerCount = await env.DB.prepare("SELECT COUNT(*) as count FROM esports_players").first();
    const standingsCount = await env.DB.prepare("SELECT COUNT(*) as count FROM esports_standings").first();

    console.log("📊 Database summary:");
    console.log(`  Teams: ${teamCount?.count || 0}`);
    console.log(`  Matches: ${matchCount?.count || 0}`);
    console.log(`  Players: ${playerCount?.count || 0}`);
    console.log(`  Standings: ${standingsCount?.count || 0}`);

    // Check sync state
    const syncState = await env.DB.prepare("SELECT * FROM sync_state WHERE key = 'pandascore_matches'").first();
    console.log("🔄 Sync state:", syncState);

  } catch (error) {
    console.error("❌ Esports scraper test failed:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testEsportsScraper();
}

export { testEsportsScraper };
