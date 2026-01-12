import { Router } from "express";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadSingleImage,
  uploadMultipleImages,
  getFileInfo,
} from "../controllers/file.controller.js";
import {
  uploadSingle,
  uploadMultiple,
  uploadSingleImage as multerSingleImage,
} from "../config/multer.config.js";
import {
  validateSingleFile,
  validateMultipleFiles,
  validateSingleImage,
  validateMultipleImages,
} from "../middlewares/fileValidation.middleware.js";

const router = Router();

router.post(
  "/upload/single",
  uploadSingle.single("file"),
  validateSingleFile,
  uploadSingleFile
);

router.post(
  "/upload/multiple",
  uploadMultiple.array("files", 10),
  validateMultipleFiles,
  uploadMultipleFiles
);

router.post(
  "/upload/image",
  multerSingleImage.single("image"),
  validateSingleImage,
  uploadSingleImage
);

router.post(
  "/upload/images",
  multerSingleImage.array("images", 5),
  validateMultipleImages,
  uploadMultipleImages
);

router.get("/:filename", getFileInfo);

export default router;
