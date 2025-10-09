import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
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

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("🚫 No token provided in Authorization header");
      res.status(401).json({ message: "Unauthorized. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    console.log("🔑 Verifying token:", token);
    if(!process.env.ACCESS_TOKEN_SECRET){
      throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as AccessTokenPayload;
     req.user = { 
      _id: decoded._id
    };
    next();
  } catch (err) {
    console.error("verifyAccessToken error:", err);
    res.status(403).json({ message: "Forbidden. Invalid or expired token." });
  }
};


