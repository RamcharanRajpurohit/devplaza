import express from 'express';
import {
  getTodaysPOTDs,
  refreshPOTDs,
  getHistoricalPOTDs,
  getPOTDStats,
} from '../controllers/potdController';

const router = express.Router();

// Public routes (no auth required)
router.get('/today', getTodaysPOTDs);
router.get('/history', getHistoricalPOTDs);
router.get('/stats', getPOTDStats);

// Refresh route (can be called by cron job or admin)
// TODO: Add auth middleware if you want to protect this
router.post('/refresh', refreshPOTDs);

export default router;
