import { Router } from "express";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadSingleImage,
  uploadMultipleImages,
  listAllFiles,
  getFileInfoById,
  updateFileMetadata,
  deleteFileById,
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
  "/",
  uploadSingle.single("file"),
  validateSingleFile,
  uploadSingleFile
);

router.post(
  "/multiple",
  uploadMultiple.array("files", 10),
  validateMultipleFiles,
  uploadMultipleFiles
);

router.post(
  "/images",
  multerSingleImage.single("image"),
  validateSingleImage,
  uploadSingleImage
);

router.post(
  "/images/multiple",
  multerSingleImage.array("images", 5),
  validateMultipleImages,
  uploadMultipleImages
);

router.get("/", listAllFiles);
router.get("/:publicId", getFileInfoById);

router.put("/:publicId", updateFileMetadata);

router.delete("/:publicId", deleteFileById);

export default router;
