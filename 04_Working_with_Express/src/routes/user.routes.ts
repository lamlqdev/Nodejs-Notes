import { Router } from "express";
import {
  getUsersController,
  createUserController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "../controller/user.controller";

const router = Router();

router.get("/", getUsersController);
router.post("/", createUserController);
router.get("/:id", getUserByIdController);
router.put("/:id", updateUserController);
router.delete("/:id", deleteUserController);

export default router;
