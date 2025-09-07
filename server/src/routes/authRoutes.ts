import express from "express";
import { signup, login,refreshToken, logout,googleAuth ,forgotPassword} from "../controllers/authController";
import { authenticateToken} from "../middleware/auth";

import { verifyOtp,resendOtp} from '../controllers/otpController';
const router = express.Router();

router.post("/signup", signup);
router.post("/google", googleAuth);
router.post("/login", login);
router.post('/verify-otp', verifyOtp);
router.post("/refresh-token",refreshToken);
router.post("/resend-otp",resendOtp )
router.post("/forgot-password",forgotPassword )
router.post("/logout",authenticateToken, logout);
export default router;
