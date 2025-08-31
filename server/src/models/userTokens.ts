import mongoose, { Document, Schema } from "mongoose";

interface IUserTokens extends Document {
  user: mongoose.Types.ObjectId;
  refreshToken: string[];
}

const userTokensSchema = new Schema<IUserTokens>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    refreshToken: {
      type: [String], 
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const UserTokens = mongoose.model<IUserTokens>(
  "UserTokens",
  userTokensSchema
);
