import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true, 
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    default: null,
  },
  isVerified :{
    type :Boolean,
    default:false,
  },
  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
}, {
  timestamps: true,
});

export const User = mongoose.model("User", userSchema);

