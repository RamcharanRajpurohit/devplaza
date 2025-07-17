import { Request, Response } from "express";
import { generateToken } from "../utils/generateTokens";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// That’s where @types/jsonwebtoken swoops in like a superhero 💥 — it gives TypeScript the info it needs to understand the types, functions, and structure of the jsonwebtoken package.

// --save-dev means you're installing it as a dev dependency 'cause types are only needed during development, not when the code is running.


import { User } from "../models/user";

// Utils (store secret in env in prod)
const JWT_SECRET = "your_jwt_secret_here"; // move to process.env.JWT_SECRET later

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
    });
    //add into daatbase with bcrypt
    const token = generateToken({ userId: newUser._id, email: newUser.email });

    res.status(201).json({ message: "User created", token });
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
    const token = generateToken({ userId: user._id, email: user.email });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
