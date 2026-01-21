import { Router } from "express";
import { getReviewsByPlace, createReview, deleteReview } from "../controllers/review.controller";

const router = Router();

router.get("/places/:placeId/reviews", getReviewsByPlace);
router.post("/places/:placeId/reviews", createReview);
router.delete("/reviews/:id", deleteReview);

export default router;
