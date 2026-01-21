import { Request, Response, NextFunction } from "express";
import { findReviewsByPlace, createReview as createReviewService, deleteReview as deleteReviewService } from "../services/review.service";
import { CreateReviewData } from "../types/review.types";

export async function getReviewsByPlace(req: Request, res: Response, next: NextFunction) {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({ error: "Place ID is required" });
    }

    const reviews = await findReviewsByPlace(placeId as string);
    res.status(200).json({ data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { placeId } = req.params;
    const { user, rating, content } = req.body;

    if (!placeId) {
      return res.status(400).json({ error: "Place ID is required" });
    }

    // Basic validation
    if (!user || !rating || !content) {
      return res.status(400).json({ error: "User, rating, and content are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const reviewData: CreateReviewData = {
      user,
      rating,
      content,
    };

    const review = await createReviewService(placeId as string, reviewData);
    res.status(201).json({ data: review });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Review ID is required" });
    }

    const review = await deleteReviewService(id as string);
    
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json({ 
      message: "Review deleted successfully",
      data: review 
    });
  } catch (error) {
    next(error);
  }
}
