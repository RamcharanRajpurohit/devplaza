import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserTokens } from "../models/userTokens";

interface AccessTokenPayload extends JwtPayload {
  _id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET_KEY as string
    ) as AccessTokenPayload;

    // Extra step: check if user still has valid refreshTokens in DB
    const userTokens = await UserTokens.findOne({ user: decoded._id });
    if (!userTokens || userTokens.refreshToken.length === 0) {
      return res.status(403).json({ message: "Session expired. Please log in again." });
    }

    req.user = { _id: decoded._id };
    next();
  } catch (err) {
    console.error("verifyAccessToken error:", err);
    res.status(403).json({ message: "Forbidden. Invalid or expired token." });
  }
};
