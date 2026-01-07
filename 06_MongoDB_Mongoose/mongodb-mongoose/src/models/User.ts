import mongoose, { Document, Schema } from "mongoose";

// TypeScript interface describing User data
export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
}

// Define Mongoose Schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create Model from Schema
export const User = mongoose.model<IUser>("User", UserSchema);
