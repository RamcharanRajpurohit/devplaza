import { Request, Response } from "express";
import { generateAccessToken, generateAccessAndRefreshToken, generateRefreshToken } from "../utils/generateTokens";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { UserTokens } from "../models/userTokens";
// That’s where @types/jsonwebtoken swoops in like a superhero 💥 — it gives TypeScript the info it needs to understand the types, functions, and structure of the jsonwebtoken package.

// --save-dev means you're installing it as a dev dependency 'cause types are only needed during development, not when the code is running.
import { generateAndSaveOTP } from "../utils/otpUtils";
import { promises } from "dns";// read about his more 
import { User } from "../models/user";
// Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    // Hash password
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    // Generate OTP for verification
    const otpGenerated = await generateAndSaveOTP(email);
    if (!otpGenerated) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate OTP. Try again later.",
      });
    }

    res.status(201).json({
      message: "User created. OTP sent for verification."
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check verification
    if (!user.isVerified) {
      // Resend OTP
      const otpGenerated = await generateAndSaveOTP(email);
      if (!otpGenerated) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate OTP. Try again later.",
        });
      }
      return res.status(403).json({
        success: false,
        code: "USER_NOT_VERIFIED",
        message: "User not verified. OTP resent to your email."
      });

    }

    // Generate tokens (only if verified)
    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      { _id: user._id, email: user.email },
      { _id: user._id, email: user.email }
    );

    // Save refresh token in UserTokens collection
    let tokenDoc = await UserTokens.findOne({ user: user._id });
    if (!tokenDoc) {
      tokenDoc = await UserTokens.create({ user: user._id, refreshToken: [refreshToken] });
    } else {
      tokenDoc.refreshToken.push(refreshToken); // multi-device support
      await tokenDoc.save();
    }

    // Set cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    console.log("Login successful, refresh token generated:", refreshToken);
    res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) return res.sendStatus(204); // No content

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Remove the refreshToken only for this logged-in user
    await UserTokens.updateOne(
      { user: req.user._id },
      { $pull: { refreshToken } }
    );

    // Clear cookie
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.sendStatus(204);
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



interface DecodedPayload extends JwtPayload {
  _id: string;
}interface AccessTokenPayload {
  _id: string;
}
interface RefreshTokenPayload {
  _id: string;
}

export const refreshToken = async (req: Request, res: Response) => {
  console.log("incoming cookies:", req.cookies);
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const oldRefreshToken = cookies.jwt;
    res.clearCookie("jwt", { httpOnly: true });
    console.log("🔄 Refresh token received:", oldRefreshToken);

    // Add this right after getting the oldRefreshToken
    try {
      const debugDecoded = jwt.decode(oldRefreshToken);
      console.log("🐛 Debug - Token payload:", debugDecoded);
    } catch (e) {
      console.log("🐛 Debug - Could not decode token");
    }

    // FIX: Use $in to search within the refreshToken array
    const foundTokenDoc = await UserTokens.findOne({
      refreshToken: { $in: [oldRefreshToken] }
    }).populate("user");

    console.log("Found token document:", foundTokenDoc);

    if (!foundTokenDoc) {
      // possible token reuse detection
      try {
        const decoded = jwt.verify(
          oldRefreshToken,
          process.env.REFRESH_TOKEN_SECRET as string
        ) as RefreshTokenPayload;

        // wipe all refresh tokens for this hacked user
        await UserTokens.updateOne(
          { user: decoded._id },
          { $set: { refreshToken: [] } }
        );
      } catch (err) {
        // ignore if invalid
      }
      return res.sendStatus(403);
    }

    // filter out the old refresh token
    const newRefreshTokenArray = foundTokenDoc.refreshToken.filter(
      (rt) => rt !== oldRefreshToken
    );

    // verify old refresh token
    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(
        oldRefreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as RefreshTokenPayload;
    } catch (err) {
      await UserTokens.updateOne(
        { user: foundTokenDoc.user._id },
        { $set: { refreshToken: [] } }
      );
      return res.sendStatus(403);
    }

    if (foundTokenDoc.user._id.toString() !== decoded._id) {
      await UserTokens.updateOne(
        { user: foundTokenDoc.user._id },
        { $set: { refreshToken: [] } }
      );
      return res.sendStatus(403);
    }

    // Generate new tokens
    const accessToken = jwt.sign(
      { _id: foundTokenDoc.user._id.toString() } as AccessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { _id: foundTokenDoc.user._id.toString() } as RefreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    foundTokenDoc.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await foundTokenDoc.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    const user = await User.findById(foundTokenDoc.user._id).lean();
    res.status(200).json({ accessToken, email: user?.email });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};




const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { id_token } = req.body;
    if (!id_token) {
      return res.status(400).json({ message: "Missing Google ID token" });
    }

    // verify with Google
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: "Google token invalid" });
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;
    console.log(payload);
    if (!email_verified) {
      return res.status(403).json({ message: "Email not verified with Google" });
    }

    // find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: name || email,
        email,
        password: null,          // no local password
        isVerified: true,        // Google verified
        googleId,
        profilePic: picture,
      });
    }

    // generate tokens
    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      { _id: user._id, email: user.email },
      { _id: user._id, email: user.email }
    );

    // save refresh token
    let tokenDoc = await UserTokens.findOne({ user: user._id });
    if (!tokenDoc) {
      tokenDoc = await UserTokens.create({
        user: user._id,
        refreshToken: [refreshToken],
      });
    } else {
      tokenDoc.refreshToken.push(refreshToken);
      await tokenDoc.save();
    }

    // set cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Google login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.username,
        email: user.email
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
