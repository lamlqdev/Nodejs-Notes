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

export const Place = model("Place", placeSchema);
