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
    required: true
  },
  images: [String]
}, {
  timestamps: true
});

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
    if (!placeExists) {
      throw new Error('Place not found');
    }
  }
});

// Post-save: Update averageRating of Place
reviewSchema.post('save', async function (doc) {
  await updatePlaceAverageRating(doc.place as unknown as Schema.Types.ObjectId);
  console.log(`Review created/updated for place: ${doc.place}`);
});

// Post-remove: Update averageRating of Place
reviewSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  await updatePlaceAverageRating(doc.place as unknown as Schema.Types.ObjectId);
  console.log(`Review deleted for place: ${doc.place}`);
});

// Helper function to update rating
async function updatePlaceAverageRating(placeId: Schema.Types.ObjectId) {
  const Review = model('Review');
  const Place = model('Place');

  const result = await Review.aggregate([
    { $match: { place: placeId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);

  const averageRating = result.length > 0 ? result[0].avgRating : 0;

  await Place.findByIdAndUpdate(placeId, {
    averageRating: Math.round(averageRating * 10) / 10
  });
}

export const Review = model("Review", reviewSchema);