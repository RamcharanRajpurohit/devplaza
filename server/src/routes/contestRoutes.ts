import express from 'express';
import {
  getUpcomingContests,
  getTodayContests,
  refreshContests,
  getContestStats,
} from '../controllers/contestController';

const router = express.Router();

// Public routes (no auth required)
router.get('/upcoming', getUpcomingContests);
router.get('/today', getTodayContests);
router.get('/stats', getContestStats);

// Refresh route (can be called by cron job or admin)
router.post('/refresh', refreshContests);

export default router;
