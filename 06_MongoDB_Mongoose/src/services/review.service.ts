import { Review } from "../models/review.model";
import { Place } from "../models/place.model";
import { CreateReviewData } from "../types/review.types";
import mongoose from "mongoose";

export async function findReviewsByPlace(placeId: string) {
  // Check if place exists and is not deleted
  const place = await Place.findById(placeId);
  if (!place || place.isDeleted) {
    throw new Error('Place not found or has been deleted');
  }

  return await Review.find({ 
    place: new mongoose.Types.ObjectId(placeId),
    isDeleted: false 
  })
    .populate('user', 'username email')
    .sort({ createdAt: -1 })
    .lean();
}

export async function createReview(placeId: string, data: CreateReviewData) {
  // Check if place exists and is not deleted
  const place = await Place.findById(placeId);
  if (!place || place.isDeleted) {
    throw new Error('Cannot review: Place not found or has been deleted');
  }

  return await Review.create({
    ...data,
    user: new mongoose.Types.ObjectId(data.user),
    place: new mongoose.Types.ObjectId(placeId),
  });
}

export async function deleteReview(id: string) {
  // Use findByIdAndDelete to trigger post-deleteOne middleware
  // which will update the place's rating and count
  return await Review.findByIdAndDelete(id);
}
