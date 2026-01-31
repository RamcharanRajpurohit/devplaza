import { Request, Response, NextFunction } from 'express';
import connectDB from '../utils/connectDb';

/**
 * Middleware to ensure MongoDB connection before each request
 * Essential for serverless environments like Vercel
 */
export const ensureDbConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(503).json({
      success: false,
      error: 'Database connection failed. Please try again.',
    });
  }
};
