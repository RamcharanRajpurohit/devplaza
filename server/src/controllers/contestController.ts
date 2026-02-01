import { Request, Response } from 'express';
import { fetchAllContests } from '../services/contestAggregator';

/**
 * Get upcoming and ongoing contests (next 7 days)
 * Public endpoint - no auth required
 */
export const getUpcomingContests = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching upcoming contests from APIs...');

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Fetch directly from APIs
    const allContests = await fetchAllContests();

    // Filter for next 7 days
    const upcomingContests = allContests
      .filter((c) => c.startTime >= now && c.startTime <= sevenDaysFromNow)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    res.status(200).json({
      success: true,
      count: upcomingContests.length,
      contests: upcomingContests,
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
    console.log('🔍 Fetching today\'s contests from APIs...');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch directly from APIs
    const allContests = await fetchAllContests();

    // Filter for today's contests
    const todayContests = allContests
      .filter((c) => {
        // Contests starting today
        const startsToday = c.startTime >= todayStart && c.startTime <= todayEnd;
        // Ongoing contests (started before today, ending today or later)
        const ongoingToday = c.startTime < todayStart && c.endTime >= todayStart;
        return startsToday || ongoingToday;
      })
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    res.status(200).json({
      success: true,
      date: todayStart,
      count: todayContests.length,
      contests: todayContests,
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
 * Manual refresh contests (now just fetches fresh data)
 * No database operations needed
 */
export const refreshContests = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Fetching fresh contests from APIs...');

    // Fetch fresh contests
    const freshContests = await fetchAllContests();

    res.status(200).json({
      success: true,
      message: 'Contests fetched successfully',
      count: freshContests.length,
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contests',
    });
  }
};

/**
 * Get contest statistics
 */
export const getContestStats = async (req: Request, res: Response) => {
  try {
    console.log('📊 Fetching contest statistics from APIs...');

    const allContests = await fetchAllContests();
    const now = new Date();

    const upcomingContests = allContests.filter((c) => c.startTime > now);
    const ongoingContests = allContests.filter((c) => c.startTime <= now && c.endTime >= now);

    // Count by platform
    const platformCounts: Record<string, number> = {};
    upcomingContests.forEach((c) => {
      platformCounts[c.platform] = (platformCounts[c.platform] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats: {
        total: allContests.length,
        upcoming: upcomingContests.length,
        ongoing: ongoingContests.length,
        platforms: platformCounts,
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
