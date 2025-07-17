import mongoose from "mongoose";

const userInfoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,// ref to user model
    ref: "User",
    required: true,
    unique: true,
  },
  // Add any fields you want later, e.g.:
  bio: String,
  profileImage: String,
  preferences: Object,
}, {
  timestamps: true,
});

export const UserInfo = mongoose.model("UserInfo", userInfoSchema);
