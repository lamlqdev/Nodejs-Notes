import { model, Schema } from "mongoose";

const placeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  city: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['restaurant', 'hotel', 'attraction', 'museum', 'park', 'other']
  },
  images: [String],
  address: String,
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save: Validate city exists
placeSchema.pre('save', async function () {
  if (this.isModified('city')) {
    const City = model('City');
    const cityExists = await City.findById(this.city);
    if (!cityExists) {
      throw new Error('City not found');
    }
  }
});

// Pre-remove: Delete all reviews related to place when deleting place
placeSchema.pre('deleteOne', { document: true, query: false }, async function () {
  try {
    const Review = model('Review');
    await Review.deleteMany({ place: this._id });
    console.log(`Deleted all reviews for place: ${this.name}`);
  } catch (error) {
    console.error(`Error deleting reviews for place: ${this.name}`, error);
  }
});

export const Place = model("Place", placeSchema);
