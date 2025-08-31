import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes"
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose'); // Use CommonJS require
const cookieParser = require('cookie-parser');

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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/profile", profileRoutes);

// const del = async()=>{
//   await User.deleteMany({});
//  await OTP.deleteMany({});
// }
// del();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;