import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true, // allow nulls while keeping unique
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
 refreshToken :{
    type:String,
    default:null,
  },
  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
}, {
  timestamps: true,// auto ads createdAt: Date,updatedAt: Date
});

export const User = mongoose.model("User", userSchema);


//  sparse: true means:

// "Enforce unique only on docs where the field is present (non-null)"

// What is provider and why used?
// 🧠 provider means:

// Where this user came from? Google? Local signup?

// Why? Later when user logs in:

// If provider === 'google' → you skip password checking

// If provider === 'local' → you hash/check password

// Basically: Helps you decide auth logic path without chaos.





// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   local: new mongoose.Schema({
//     email: { type: String, unique: true, required: true },
//     name: { type: String, required: true },
//     password: { type: String, required: true },
//     resetPasswordToken: String,
//     resetPasswordExpires: Date,
//     verificationToken: String,
//     verificationExpires: {
//       type: Date,
//       default: () => new Date(+new Date() + 3 * 60 * 1000) //3 minutes
//     },
//     registrationConfirmed: {
//       type: Boolean,
//       default: false
//     }
//   }),
//   google: {
//     id: String,
//     name: String,
//     email: String
//   },
//   accountType: String
// });