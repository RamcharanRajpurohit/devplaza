import { Request, Response } from "express";
import { generateAccessToken,generateAccessAndRefreshToken,generateRefreshToken } from "../utils/generateTokens";
import bcrypt from "bcryptjs";
// That’s where @types/jsonwebtoken swoops in like a superhero 💥 — it gives TypeScript the info it needs to understand the types, functions, and structure of the jsonwebtoken package.

// --save-dev means you're installing it as a dev dependency 'cause types are only needed during development, not when the code is running.


import { User } from "../models/user";
import { generateAndSaveOTP } from "../utils/otpUtils";
import { promises } from "dns";// read about his more 
import jwt from "jsonwebtoken";


// Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    // Hash password if exists
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified:false,
    });
    //add into daatbase with bcrypt
    const otpGenerated = await generateAndSaveOTP(email);

    if (!otpGenerated) {
       return res.status(500).json({
       success: false,
       message: "Failed to generate OTP. Try again later.",
       });
    }
    res.status(201).json({ message: "User created"});
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

    // Create JWT
    const {accessToken ,refreshToken} = generateAccessAndRefreshToken({ userId: user._id, email: user.email },{ userId: user._id, email: user.email });
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'none', 
        secure: true,
        // 🔥 this is important to use req.signedCookies
        maxAge: 24 * 60 * 60 * 1000,
     });


    res.json({ message: "Login successful", accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


export const refToken = async (req: Request, res: Response): Promise<Response> => {
  
  const { REFRESH_TOKEN_SECRET } = process.env;

 const { cookies } = req;
 const { refreshToken } = cookies;


  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required"
    });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET as string);
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token"
    });
  }

  const { userId } = decodedToken as { userId: string };
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  if (user.refreshToken !== refreshToken) {
    return res.status(403).json({
      message: "Refresh token mismatch"
    });
  }

  const accessToken = generateAccessToken({ userId: user._id, email: user.email });

  return res.status(200).json({
    message:"ho gaya bhai ho gaya",
    token: accessToken
  });
};
