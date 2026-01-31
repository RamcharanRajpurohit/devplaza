import mongoose from "mongoose";

export interface IProblemOfTheDay {
  platform: string;
  title: string;
  url: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  description?: string;
  tags?: string[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const potdSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['leetcode', 'geeksforgeeks', 'naukri'],
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  description: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  date: {
    type: Date,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient querying by date and platform
potdSchema.index({ date: -1, platform: 1 });

export const ProblemOfTheDay = mongoose.model<IProblemOfTheDay>("ProblemOfTheDay", potdSchema);
