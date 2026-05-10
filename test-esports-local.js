/**
 * Simple local test for esports scraper
 * Run with: node test-esports-local.js
 * This tests the scraper logic without requiring a full build
 */

// Import the scraper directly (Node.js will transpile on the fly)
async function testScraper() {
  console.log("🎮 Testing esports scraper locally...");
  
  try {
    // Import modules dynamically
    const { scrapeEsports } = await import('./src/server/scrapers/esports-scraper.ts');
    const { env } = await import('./src/server/cloudflare-mock.ts');
    
    console.log("🔑 Using test API key:", env.PANDASCORE_API_KEY?.slice(0, 8) + "...");
    
    // Run the scraper
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

testScraper();
