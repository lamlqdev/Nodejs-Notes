import { model, Schema } from "mongoose";

const reviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  place: {
    type: Schema.Types.ObjectId,
    ref: 'Place',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reviewSchema.index({ place: 1, isDeleted: 1 });
reviewSchema.index({ user: 1, isDeleted: 1 });
reviewSchema.index({ place: 1, user: 1 });

// Pre-save: Validate user and place exist
reviewSchema.pre('save', async function () {
  const User = model('User');
  const Place = model('Place');

  if (this.isNew || this.isModified('user')) {
    const userExists = await User.findById(this.user);
    if (!userExists) {
      throw new Error('User not found');
    }
  }

  if (this.isNew || this.isModified('place')) {
    const placeExists = await Place.findById(this.place);
    if (!placeExists || placeExists.isDeleted) {
      throw new Error('Place not found or has been deleted');
    }
  }
});

// Post-save: Update averageRating of Place
reviewSchema.post('save', async function (doc) {
  await updatePlaceAverageRatingAndReviewCount(doc.place as unknown as Schema.Types.ObjectId);
  console.log(`Review created/updated for place: ${doc.place}`);
});

// Post-remove: Update averageRating of Place
// This runs for both document.deleteOne() and Model.findByIdAndDelete()
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await updatePlaceAverageRatingAndReviewCount(doc.place as unknown as Schema.Types.ObjectId);
    console.log(`Review deleted for place: ${doc.place}`);
  }
});

reviewSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  await updatePlaceAverageRatingAndReviewCount(doc.place as unknown as Schema.Types.ObjectId);
  console.log(`Review deleted for place: ${doc.place}`);
});

// Helper function to update rating
async function updatePlaceAverageRatingAndReviewCount(placeId: Schema.Types.ObjectId) {
  const Review = model('Review');
  const Place = model('Place');

  const result = await Review.aggregate([
    { $match: { place: placeId, isDeleted: false } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  const averageRating = result.length > 0 ? result[0].avgRating : 0;
  const reviewCount = result.length > 0 ? result[0].count : 0;

  await Place.findByIdAndUpdate(placeId, {
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: reviewCount
  });
}

export const Review = model("Review", reviewSchema);