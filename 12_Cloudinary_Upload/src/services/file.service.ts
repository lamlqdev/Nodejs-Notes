import { AppError } from "../middlewares/error.middleware.js";
import type {
  FileMetadata,
  FileInfo,
  FileUpdateOptions,
} from "../types/file.types.js";
import {
  uploadFileToCloudinary,
  uploadMultipleFilesToCloudinary,
  getFileInfoFromCloudinary,
  listFilesFromCloudinary,
  updateFileInCloudinary,
  deleteFileFromCloudinary,
} from "./cloudinary.service.js";

/**
 * Process single file upload to Cloudinary
 */
export async function processSingleFileUpload(
  file: Express.Multer.File,
  folder?: string
): Promise<FileMetadata> {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  return uploadFileToCloudinary(file, folder);
}

/**
 * Process multiple file uploads to Cloudinary
 */
export async function processMultipleFileUpload(
  files: Express.Multer.File[] | undefined,
  folder?: string
): Promise<FileMetadata[]> {
  if (!files || files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  return uploadMultipleFilesToCloudinary(files, folder);
}

/**
 * Process single image upload to Cloudinary
 */
export async function processSingleImageUpload(
  file: Express.Multer.File,
  folder?: string
): Promise<FileMetadata> {
  if (!file) {
    throw new AppError("No image uploaded", 400);
  }

  return uploadFileToCloudinary(file, folder, {
    resource_type: "image",
  });
}

/**
 * Process multiple image uploads to Cloudinary
 */
export async function processMultipleImageUpload(
  files: Express.Multer.File[] | undefined,
  folder?: string
): Promise<FileMetadata[]> {
  if (!files || files.length === 0) {
    throw new AppError("No images uploaded", 400);
  }

  return uploadMultipleFilesToCloudinary(files, folder, {
    resource_type: "image",
  });
}

/**
 * Get file information from Cloudinary
 */
export async function getFileInfo(publicId: string): Promise<FileInfo> {
  return getFileInfoFromCloudinary(publicId);
}

/**
 * List files from Cloudinary
 */
export async function listFiles(options?: {
  folder?: string;
  maxResults?: number;
  nextCursor?: string;
  resourceType?: "image" | "raw" | "video" | "auto";
}): Promise<{
  files: FileInfo[];
  nextCursor?: string;
  totalCount: number;
}> {
  return listFilesFromCloudinary(options);
}

/**
 * Update file metadata in Cloudinary
 */
export async function updateFile(
  publicId: string,
  options: FileUpdateOptions
): Promise<FileInfo> {
  return updateFileInCloudinary(publicId, options);
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFile(
  publicId: string,
  resourceType: "image" | "raw" | "video" | "auto" = "image"
): Promise<void> {
  return deleteFileFromCloudinary(publicId, resourceType);
}
