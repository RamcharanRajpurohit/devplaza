import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserInfo,
  getUserInfoById,
  createUserInfo,
  updateUserInfo,
  patchUserInfo,
  deleteUserInfo
} from '../controllers/userInfoController';

const router = express.Router();
router.get('/', authenticateToken, getUserInfo);
router.get('/:userId', authenticateToken, getUserInfoById);
router.post('/', authenticateToken, createUserInfo);
router.put('/', authenticateToken, updateUserInfo);
router.patch('/', authenticateToken, patchUserInfo);
router.delete('/', authenticateToken, deleteUserInfo);

export default router;