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
  description: {
    type: String,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['restaurant', 'hotel', 'attraction', 'museum', 'park', 'other']
  },
  address: {
    type: String,
    maxlength: 500
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

placeSchema.index({ city: 1 });
placeSchema.index({ isDeleted: 1 });
placeSchema.index({ category: 1 });
placeSchema.index({ averageRating: -1 });

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

// Pre-find: Filter out deleted places by default
// Note: To query deleted places, use Place.find({ isDeleted: true }) explicitly
placeSchema.pre(['find', 'findOne'], function () {
  // Only apply filter if isDeleted is not explicitly set in the query
  if (this.getQuery().isDeleted === undefined) {
    this.where('isDeleted', false);
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
