import { Request, Response } from 'express';
import { Contest } from '../models/contest';
import { fetchAllContests } from '../services/contestAggregator';

/**
 * Get upcoming and ongoing contests (next 7 days)
 * Public endpoint - no auth required
 */
export const getUpcomingContests = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Check cache first (contests fetched in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    let contests = await Contest.find({
      fetchedAt: { $gte: oneHourAgo },
      startTime: {
        $gte: now,
        $lte: sevenDaysFromNow,
      },
    }).sort({ startTime: 1 });

    // If no cached contests, fetch fresh data
    if (contests.length === 0) {
      console.log('No cached contests, fetching fresh data...');

      const freshContests = await fetchAllContests();

      // Filter for next 7 days
      const upcomingContests = freshContests.filter(
        (c) => c.startTime >= now && c.startTime <= sevenDaysFromNow
      );

      // Save to database
      if (upcomingContests.length > 0) {
        await Contest.insertMany(upcomingContests);
        contests = await Contest.find({
          startTime: {
            $gte: now,
            $lte: sevenDaysFromNow,
          },
        }).sort({ startTime: 1 });
      }
    }

    res.status(200).json({
      success: true,
      count: contests.length,
      contests: contests.map((c) => ({
        platform: c.platform,
        name: c.name,
        url: c.url,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        status: c.status,
      })),
    });
  } catch (error) {
    console.error('Error getting contests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contests',
    });
  }
};

/**
 * Get contests for today
 * Public endpoint - no auth required
 */
export const getTodayContests = async (req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const contests = await Contest.find({
      $or: [
        // Contests starting today
        {
          startTime: {
            $gte: todayStart,
            $lte: todayEnd,
          },
        },
        // Ongoing contests (started before today, ending today or later)
        {
          startTime: { $lt: todayStart },
          endTime: { $gte: todayStart },
        },
      ],
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      date: todayStart,
      count: contests.length,
      contests: contests.map((c) => ({
        platform: c.platform,
        name: c.name,
        url: c.url,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        status: c.status,
      })),
    });
  } catch (error) {
    console.error('Error getting today contests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s contests',
    });
  }
};

/**
 * Manual refresh contests
 * Can be called by cron or admin
 */
export const refreshContests = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Manually refreshing contests...');

    // Delete old contests (older than 1 day)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Contest.deleteMany({
      endTime: { $lt: oneDayAgo },
    });

    // Fetch fresh contests
    const freshContests = await fetchAllContests();

    // Delete existing contests and insert fresh ones
    const now = new Date();
    await Contest.deleteMany({
      startTime: { $gte: now },
    });

    if (freshContests.length > 0) {
      await Contest.insertMany(freshContests);
    }

    res.status(200).json({
      success: true,
      message: 'Contests refreshed successfully',
      count: freshContests.length,
    });
  } catch (error) {
    console.error('Error refreshing contests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh contests',
    });
  }
};

/**
 * Get contest statistics
 */
export const getContestStats = async (req: Request, res: Response) => {
  try {
    const totalContests = await Contest.countDocuments();
    const now = new Date();

    const upcomingCount = await Contest.countDocuments({
      startTime: { $gt: now },
    });

    const ongoingCount = await Contest.countDocuments({
      startTime: { $lte: now },
      endTime: { $gte: now },
    });

    const platformCounts = await Contest.aggregate([
      {
        $match: {
          startTime: { $gte: now },
        },
      },
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
        total: totalContests,
        upcoming: upcomingCount,
        ongoing: ongoingCount,
        platforms: platformCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Error getting contest stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contest statistics',
    });
  }
};
