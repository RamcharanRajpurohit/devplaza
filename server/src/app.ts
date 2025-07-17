import express, { Request, Response } from 'express';
import authRoutes from "./routes/authRoutes";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
const cors = require('cors');
import mongoose from 'mongoose';


dotenv.config();

const mongoURI = process.env.MONGO_URI as string;
mongoose.connect(mongoURI)
  .then(() => {
    console.log('🟢 MongoDB connected to Atlas successfully!');
  })
  .catch((err) => {
    console.error('🔴 MongoDB connection error:', err);
  });

  
const app = express();
const port = process.env.PORT || 3000;



app.use(express.json());
app.use(bodyParser.json());
// anytime a request comes in with JSON body (like from Postman), automatically parse it and give me req.body as a JS object.”

app.use("/api/auth", authRoutes);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;










