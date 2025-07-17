import express from "express";
import { signup, login } from "../controllers/authController";
import { verifyToken } from "../middleware/auth";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", verifyToken, (req: AuthRequest, res: Response) => {
  res.json({
    message: "You made it to a protected route!",
    user: req.user,
  });
});

export default router;
