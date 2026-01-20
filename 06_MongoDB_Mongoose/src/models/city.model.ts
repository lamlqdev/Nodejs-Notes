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

export const City = model("City", citySchema);
