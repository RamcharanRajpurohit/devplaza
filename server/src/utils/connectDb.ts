// lib/connectDB.ts
import mongoose from 'mongoose';

// Cache connection for serverless (Vercel)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if available
  if (cached.conn) {
    console.log("♻️  Using cached MongoDB connection");
    return cached.conn;
  }

  // Return existing connection promise if in progress
  if (!cached.promise) {
    const mongoURI = process.env.MONGO_URI as string;
    if (!mongoURI) throw new Error("🚨 Missing MONGO_URI in .env");

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    console.log("🔌 Connecting to MongoDB...");
    cached.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
      console.log("🟢 MongoDB connected to Atlas successfully!");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error("🔴 MongoDB connection error:", err);
    throw err;
  }

  return cached.conn;
};

export default connectDB;
