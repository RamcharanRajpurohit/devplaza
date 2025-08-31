import express from "express";
import { signup, login,refreshToken, logout } from "../controllers/authController";
import { verifyAccessToken} from "../middleware/auth";
import { Response } from "express";

import { verifyOtp } from '../controllers/otpController';
import { resendOtp } from "../controllers/otpController";
import { googleAuth } from "../controllers/authController";
const router = express.Router();

router.post("/signup", signup);
router.post("/google", googleAuth);
router.post("/login", login);
router.post('/verify-otp', verifyOtp);
router.post("/refresh-token",verifyAccessToken,refreshToken);
router.post("/resend-otp",verifyAccessToken,resendOtp )
router.post("/logout",verifyAccessToken, logout);
export default router;
