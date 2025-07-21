import express from "express";
import { signup, login,refToken } from "../controllers/authController";
import { verifyToken } from "../middleware/auth";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { verifyOtp } from '../controllers/otpController';


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post('/verify-otp', verifyOtp);
router.post("/refresh-token",refToken);

router.get("/me", verifyToken, (req: AuthRequest, res: Response) => {
  res.json({
    message: "You made it to a protected route!",
    user: req.user,
  });
});

export default router;
