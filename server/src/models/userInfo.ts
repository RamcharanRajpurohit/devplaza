import mongoose from "mongoose";

const userInfoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    maxLength: 500,
  },
  profileImage: String,
  location: String,
  links: {
    github: String,
    linkedin: String,
    twitter: String,
    website: String,
    leetcode: String,
    hackerrank: String,
    codechef: String,
    code360: String,
    codeforces: String,
    gfg: String,
  },
  skills: [String],
  experience: {
    years: Number,
    currentRole: String,
    company: String,
  }
}, {
  timestamps: true,
});

export const UserInfo = mongoose.model("UserInfo", userInfoSchema);
