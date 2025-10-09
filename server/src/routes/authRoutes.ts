import express from "express";
import { signup, login,refreshToken, logout,googleAuth ,deleteAccount,resetPassword ,forgotPassword,updateUserName,updateUserEmail,getMe,changePassword} from "../controllers/authController";
import { authenticateToken} from "../middleware/auth";
import { verifyOtp,resendOtp} from '../controllers/authController';
const router = express.Router();

router.post("/signup", signup);
router.post("/google", googleAuth);
router.post("/login", login);
router.post('/verify-otp', verifyOtp);
router.post("/refresh-token",refreshToken);
router.post("/resend-otp",resendOtp )
router.post("/forgot-password",forgotPassword )
router.post("/logout",logout);
router.patch('/update-username', authenticateToken, updateUserName);
router.patch('/update-email', authenticateToken, updateUserEmail);
router.patch('/change-password', authenticateToken, changePassword);
router.post('/reset-password', resetPassword);
router.delete('/delete-account', authenticateToken, deleteAccount);
router.get('/me', authenticateToken, getMe);

export default router;

