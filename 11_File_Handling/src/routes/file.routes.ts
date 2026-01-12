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

/**
 * @route   POST /api/files/upload/single
 * @desc    Upload a single file (any allowed type)
 * @access  Public
 * @field   file - The file to upload
 */
router.post(
  "/upload/single",
  uploadSingle.single("file"),
  validateSingleFile,
  uploadSingleFile
);

/**
 * @route   POST /api/files/upload/multiple
 * @desc    Upload multiple files (any allowed type)
 * @access  Public
 * @field   files - Array of files to upload (max 10)
 */
router.post(
  "/upload/multiple",
  uploadMultiple.array("files", 10),
  validateMultipleFiles,
  uploadMultipleFiles
);

/**
 * @route   POST /api/files/upload/image
 * @desc    Upload a single image file
 * @access  Public
 * @field   image - The image file to upload
 */
router.post(
  "/upload/image",
  multerSingleImage.single("image"),
  validateSingleImage,
  uploadSingleImage
);

/**
 * @route   POST /api/files/upload/images
 * @desc    Upload multiple image files
 * @access  Public
 * @field   images - Array of image files to upload (max 5)
 */
router.post(
  "/upload/images",
  multerSingleImage.array("images", 5),
  validateMultipleImages,
  uploadMultipleImages
);

/**
 * @route   GET /api/files/:filename
 * @desc    Get file information by filename
 * @access  Public
 */
router.get("/:filename", getFileInfo);

export default router;
