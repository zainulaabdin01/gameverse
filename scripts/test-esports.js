#!/usr/bin/env node

/**
 * Development script to test esports scraper
 * Usage: node scripts/test-esports.js
 */

const { testEsportsScraper } = require('../dist/server/assets/test-esports-HYkvq4Ni.js');

async function main() {
  try {
    await testEsportsScraper();
    console.log('🎉 Esports test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Esports test failed:', error);
    process.exit(1);
  }
}

main();
