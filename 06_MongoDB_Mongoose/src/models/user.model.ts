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
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });

// Pre-remove: Delete all reviews of user when deleting user
userSchema.pre('deleteOne', { document: true, query: false }, async function () {
  try {
    const Review = model('Review');
    await Review.deleteMany({ user: this._id });
    console.log(`Deleted all reviews for user: ${this.username}`);
  } catch (error) {
    console.error(`Error deleting reviews for user: ${this.username}`, error);
  }
});

export const User = model("User", userSchema);
