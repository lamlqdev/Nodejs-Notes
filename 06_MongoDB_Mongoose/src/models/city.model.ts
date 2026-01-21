import { model, Schema } from "mongoose";

const citySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  description: String,
  image: String
}, {
  timestamps: true
});

// Pre-save: Trim name and country
citySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  if (this.isModified('country')) {
    this.country = this.country.trim();
  }
});

// Post-save: Log when creating/updating city
citySchema.post('save', function (doc) {
  console.log(`City created/updated: ${doc.name}, ${doc.country}`);
});

// Pre-remove: Delete all places related to city when deleting city
citySchema.pre('deleteOne', { document: true, query: false }, async function () {
  try {
    const Place = model('Place');
    await Place.deleteMany({ city: this._id });
    console.log(`Deleted all places for city: ${this.name}`);
  } catch (error) {
    console.error(`Error deleting places for city: ${this.name}`, error);
  }
});

export const City = model("City", citySchema);
