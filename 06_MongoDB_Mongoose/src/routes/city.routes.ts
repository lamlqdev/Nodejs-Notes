import { Router } from "express";
import { getCities, getCityById, createCity, updateCity, deleteCity } from "../controllers/city.controller";

const router = Router();

router.get("/", getCities);
router.get("/:id", getCityById);
router.post("/", createCity);
router.patch("/:id", updateCity);
router.delete("/:id", deleteCity);

export default router;
