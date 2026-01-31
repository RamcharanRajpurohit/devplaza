import mongoose from "mongoose";

export interface IContest {
  platform: string;
  name: string;
  url: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  status: 'upcoming' | 'ongoing' | 'ended';
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contestSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['codeforces', 'codechef', 'leetcode', 'atcoder', 'naukri'],
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
    index: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'ended'],
    required: true,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index for efficient querying
contestSchema.index({ platform: 1, startTime: -1 });
contestSchema.index({ status: 1, startTime: 1 });

export const Contest = mongoose.model<IContest>("Contest", contestSchema);
