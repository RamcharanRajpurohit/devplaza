import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import userInfoRoutes from './routes/userInfo';
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose'); // Keep CommonJS require
const cookieParser = require('cookie-parser');
import helmet from 'helmet';
import userinfo from './routes/userInfo'; // yep, keep duplicate import as you had it

const mongoURI = process.env.MONGO_URI as string;

mongoose.connect(mongoURI)
  .then(() => console.log('🟢 MongoDB connected to Atlas successfully!'))
  .catch((err: any) => console.error('🔴 MongoDB connection error:', err));

const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true
}));
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/user-info', userInfoRoutes);

// Example root route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
