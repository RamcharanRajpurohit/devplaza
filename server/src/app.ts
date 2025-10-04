import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import userInfoRoutes from './routes/userInfo';
const bodyParser = require("body-parser");
const cors = require('cors');
const cookieParser = require('cookie-parser');
import helmet from 'helmet';
import connectDB from './utils/connectDb';
// yep, keep duplicate import as you had it

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch(err => console.error('MongoDB connection failed, not starting server:', err));

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
