import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes"
import userInfoRoutes from './routes/userInfo';
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose'); // Use CommonJS require
const cookieParser = require('cookie-parser');
import helmet from 'helmet';
import userinfo from './routes/userInfo';

const mongoURI = process.env.MONGO_URI as string;
mongoose.connect(mongoURI)
  .then(() => {
    console.log('🟢 MongoDB connected to Atlas successfully!');
  })
  .catch((err: any) => {
    console.error('🔴 MongoDB connection error:', err);
  });
  
const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());// use some .env stuff ti make it secure
app.use(express.json());
app.use(bodyParser.json());
// anytime a request comes in with JSON body (like from Postman), automatically parse it and give me req.body as a JS object."

app.use(cors({
  origin: ["https://localhost:5173"], // replace with your frontend URL
  credentials: true
}));
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use('/api/userinfo', userInfoRoutes);


// const del = async()=>{
//   await User.deleteMany({});
//  await OTP.deleteMany({});
// }
// del();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;