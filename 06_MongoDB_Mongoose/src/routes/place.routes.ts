import { Router } from "express";
import { getPlaces, getPlaceById, createPlace, updatePlace, deletePlace } from "../controllers/place.controller";

const router = Router();

router.get("/", getPlaces);
router.get("/:id", getPlaceById);
router.post("/", createPlace);
router.patch("/:id", updatePlace);
router.delete("/:id", deletePlace);

export default router;
