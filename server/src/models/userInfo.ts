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
  location: String,
  
  // Contact Information
  email: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  portfolio: {
    type: String,
    default: null,
  },

  // Academic Information
  institute: {
    type: String,
    default: null,
  },
  graduationYear: {
    type: Number,
    default: null,
  },

  // Platform Links
  links: {
    // Social Platforms
    github: String,
    linkedin: String,
    twitter: String,
    instagram: String,
    
    // Competitive Programming Platforms
    leetcode: String,
    codeforces: String,
    codechef: String,
    gfg: String,
    hackerrank: String,
    code360: String,
  },

  // Skills Array
  skills: [String],

  // Experience Information
  experience: {
    years: {
      type: Number,
      default: 0,
    },
    currentRole: String,
    company: String,
  },

}, {
  timestamps: true,
});

// Indexes for better query performance
userInfoSchema.index({ user: 1 });
userInfoSchema.index({ fullName: 1 });

export const UserInfo = mongoose.model("UserInfo", userInfoSchema);