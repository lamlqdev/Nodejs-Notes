import type { Request, Response } from "express";
import type { FileUploadResponse } from "../types/file.types.js";
import { AppError } from "../middlewares/error.middleware.js";
import {
  processSingleFileUpload,
  processMultipleFileUpload,
  processSingleImageUpload,
  processMultipleImageUpload,
  getFileInfo as getFileInfoService,
} from "../services/file.service.js";

/**
 * Handle single file upload
 * POST /api/files/upload/single
 */
export const uploadSingleFile = async (
  req: Request,
  res: Response<FileUploadResponse>
) => {
  const fileMetadata = await processSingleFileUpload(req.file!);

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: {
      file: fileMetadata,
    },
  });
};

/**
 * Handle multiple file uploads
 * POST /api/files/upload/multiple
 */
export const uploadMultipleFiles = async (
  req: Request,
  res: Response<FileUploadResponse>
) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const uploadedFiles = await processMultipleFileUpload(files);

  res.status(200).json({
    success: true,
    message: `${uploadedFiles.length} file(s) uploaded successfully`,
    data: {
      files: uploadedFiles,
    },
  });
};

/**
 * Handle single image upload
 * POST /api/files/upload/image
 */
export const uploadSingleImage = async (
  req: Request,
  res: Response<FileUploadResponse>
) => {
  const fileMetadata = await processSingleImageUpload(req.file!);

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    data: {
      file: fileMetadata,
    },
  });
};

/**
 * Handle multiple image uploads
 * POST /api/files/upload/images
 */
export const uploadMultipleImages = async (
  req: Request,
  res: Response<FileUploadResponse>
) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const uploadedImages = await processMultipleImageUpload(files);

  res.status(200).json({
    success: true,
    message: `${uploadedImages.length} image(s) uploaded successfully`,
    data: {
      files: uploadedImages,
    },
  });
};

/**
 * Get file information
 * GET /api/files/:filename
 */
export const getFileInfo = async (req: Request, res: Response) => {
  const { filename } = req.params;

  if (Array.isArray(filename)) {
    throw new AppError("Invalid filename parameter", 400);
  }

  const fileInfo = await getFileInfoService(filename!);

  res.status(200).json({
    success: true,
    data: fileInfo,
  });
};
