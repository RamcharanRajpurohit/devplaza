// lib/connectDB.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    // already connected
    return;
  }

  const mongoURI = process.env.MONGO_URI as string;
  if (!mongoURI) throw new Error("🚨 Missing MONGO_URI in .env");

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 sec max wait
    });
    console.log("🟢 MongoDB connected to Atlas successfully!");
  } catch (err) {
    console.error("🔴 MongoDB connection error:", err);
    throw err;
  }
};

export default connectDB;
