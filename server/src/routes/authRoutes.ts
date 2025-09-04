import express from "express";
import { signup, login,refreshToken, logout } from "../controllers/authController";
import { authenticateToken} from "../middleware/auth";
import { Response } from "express";

import { verifyOtp } from '../controllers/otpController';
import { resendOtp } from "../controllers/otpController";
import { googleAuth } from "../controllers/authController";
const router = express.Router();

router.post("/signup", signup);
router.post("/google", googleAuth);
router.post("/login", login);
router.post('/verify-otp', verifyOtp);
router.post("/refresh-token",refreshToken);
router.post("/resend-otp",resendOtp )
router.post("/logout",authenticateToken, logout);
export default router;
