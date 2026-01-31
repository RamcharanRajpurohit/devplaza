import { Request, Response } from 'express';
import { ProblemOfTheDay } from '../models/potd';
import { scrapeAllPOTDs } from '../services/potdScraper';

/**
 * Get today's problems from all platforms
 * This endpoint is public (no auth required)
 */
export const getTodaysPOTDs = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // End of day

    // Try to get from database first (cached)
    let problems = await ProblemOfTheDay.find({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ platform: 1 });

    // If no problems in DB for today, scrape and save
    if (problems.length === 0) {
      console.log('No cached POTDs found, scraping...');
      const scrapedProblems = await scrapeAllPOTDs();

      // Save to database
      const problemDocs = scrapedProblems.map((p) => ({
        ...p,
        date: today,
      }));

      problems = await ProblemOfTheDay.insertMany(problemDocs);
      console.log(`Saved ${problems.length} POTDs to database`);
    }

    res.status(200).json({
      success: true,
      date: today,
      count: problems.length,
      problems: problems.map((p) => ({
        platform: p.platform,
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        tags: p.tags,
      })),
    });
  } catch (error) {
    console.error('Error getting POTDs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problems of the day',
    });
  }
};

/**
 * Manually refresh today's POTDs (admin/cron endpoint)
 */
export const refreshPOTDs = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete existing POTDs for today
    await ProblemOfTheDay.deleteMany({
      date: {
        $gte: today,
      },
    });

    // Scrape fresh data
    const scrapedProblems = await scrapeAllPOTDs();

    // Save to database
    const problemDocs = scrapedProblems.map((p) => ({
      ...p,
      date: today,
    }));

    const problems = await ProblemOfTheDay.insertMany(problemDocs);

    res.status(200).json({
      success: true,
      message: 'POTDs refreshed successfully',
      count: problems.length,
      problems: problems.map((p) => ({
        platform: p.platform,
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
      })),
    });
  } catch (error) {
    console.error('Error refreshing POTDs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh problems of the day',
    });
  }
};

/**
 * Get historical POTDs (optional - for archive/calendar view)
 */
export const getHistoricalPOTDs = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required (format: YYYY-MM-DD)',
      });
    }

    const targetDate = new Date(date as string);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const problems = await ProblemOfTheDay.find({
      date: {
        $gte: targetDate,
        $lt: nextDay,
      },
    }).sort({ platform: 1 });

    res.status(200).json({
      success: true,
      date: targetDate,
      count: problems.length,
      problems: problems.map((p) => ({
        platform: p.platform,
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        tags: p.tags,
      })),
    });
  } catch (error) {
    console.error('Error getting historical POTDs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical problems',
    });
  }
};

/**
 * Get stats about POTD usage (optional)
 */
export const getPOTDStats = async (req: Request, res: Response) => {
  try {
    const totalProblems = await ProblemOfTheDay.countDocuments();
    const totalDays = await ProblemOfTheDay.distinct('date');

    const platformCounts = await ProblemOfTheDay.aggregate([
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProblems,
        totalDays: totalDays.length,
        platforms: platformCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Error getting POTD stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch POTD statistics',
    });
  }
};
