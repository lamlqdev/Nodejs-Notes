import { model, Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: String
}, {
  timestamps: true
});

export const User = model("User", userSchema);
