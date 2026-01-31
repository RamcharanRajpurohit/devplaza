/**
 * Cron Jobs for DevPlaza
 *
 * This file contains scheduled tasks like updating Problem of the Day
 *
 * To set up daily POTD refresh:
 *
 * Option 1: Using node-cron (recommended)
 * 1. Install: npm install node-cron @types/node-cron
 * 2. Uncomment the import below
 * 3. Import and call setupPOTDCronJob() in index.ts
 * 4. The cron will run automatically
 *
 * Option 2: Using system cron
 * Add to your crontab (crontab -e):
 * 0 0 * * * curl -X POST http://localhost:5000/api/potd/refresh
 *
 * Option 3: Using external services (Render, Vercel, etc.)
 * Set up a scheduled job to hit the /api/potd/refresh endpoint daily
 */

// Uncomment this after installing node-cron:
// import cron from 'node-cron';
import { scrapeAllPOTDs } from '../services/potdScraper';
import { ProblemOfTheDay } from '../models/potd';

/**
 * Schedule: Every day at midnight (00:00)
 * Cron format: minute hour day month weekday
 *
 * NOTE: Requires node-cron to be installed
 * Install with: npm install node-cron @types/node-cron
 */
export function setupPOTDCronJob() {
  console.log('⚠️  POTD cron job not enabled. Install node-cron to enable auto-refresh.');
  console.log('💡 Run: npm install node-cron @types/node-cron');
  console.log('📖 See server/CRON_SETUP.md for instructions');

  // Uncomment this code after installing node-cron:
  /*
  cron.schedule('0 0 * * *', async () => {
    console.log('🕐 Running daily POTD refresh...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Delete old POTDs (keep last 30 days)
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await ProblemOfTheDay.deleteMany({
        date: { $lt: thirtyDaysAgo }
      });

      // Scrape fresh POTDs
      const scrapedProblems = await scrapeAllPOTDs();

      // Save to database
      const problemDocs = scrapedProblems.map((p) => ({
        ...p,
        date: today,
      }));

      await ProblemOfTheDay.insertMany(problemDocs);

      console.log(`✅ Successfully refreshed ${scrapedProblems.length} POTDs`);
    } catch (error) {
      console.error('❌ Error refreshing POTDs:', error);
    }
  });

  console.log('✅ POTD cron job scheduled (runs daily at midnight)');
  */
}

/**
 * Optional: Run POTD refresh on server startup
 * Useful for ensuring fresh data when server restarts
 */
export async function refreshPOTDsOnStartup() {
  console.log('🔄 Checking for today\'s POTDs...');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if we already have POTDs for today
    const existingPOTDs = await ProblemOfTheDay.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingPOTDs === 0) {
      console.log('📥 No POTDs found for today, fetching...');

      const scrapedProblems = await scrapeAllPOTDs();

      const problemDocs = scrapedProblems.map((p) => ({
        ...p,
        date: today,
      }));

      await ProblemOfTheDay.insertMany(problemDocs);

      console.log(`✅ Fetched ${scrapedProblems.length} POTDs for today`);
    } else {
      console.log(`✅ Found ${existingPOTDs} POTDs for today (already cached)`);
    }
  } catch (error) {
    console.error('❌ Error fetching POTDs on startup:', error);
  }
}
