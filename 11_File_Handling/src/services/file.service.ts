import path from "path";
import fs from "fs/promises";
import { AppError } from "../middlewares/error.middleware.js";

// File metadata interface
export interface FileMetadata {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}

// File info interface
export interface FileInfo {
  filename: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

/**
 * Process single file upload
 * Extracts and formats file metadata from Multer file object
 */
export async function processSingleFileUpload(
  file: Express.Multer.File
): Promise<FileMetadata> {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
  };
}

/**
 * Process multiple file uploads
 * Extracts and formats file metadata from Multer files array
 */
export async function processMultipleFileUpload(
  files: Express.Multer.File[] | undefined
): Promise<FileMetadata[]> {
  if (!files || files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  return files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
  }));
}

/**
 * Process single image upload
 * Extracts and formats image metadata from Multer file object
 */
export async function processSingleImageUpload(
  file: Express.Multer.File
): Promise<FileMetadata> {
  if (!file) {
    throw new AppError("No image uploaded", 400);
  }

  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
  };
}

/**
 * Process multiple image uploads
 * Extracts and formats image metadata from Multer files array
 */
export async function processMultipleImageUpload(
  files: Express.Multer.File[] | undefined
): Promise<FileMetadata[]> {
  if (!files || files.length === 0) {
    throw new AppError("No images uploaded", 400);
  }

  return files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
  }));
}

/**
 * Get file information by filename
 * Reads file stats from filesystem
 */
export async function getFileInfo(filename: string): Promise<FileInfo> {
  if (!filename || Array.isArray(filename)) {
    throw new AppError("Filename is required", 400);
  }

  const filePath = path.join(process.cwd(), "uploads", filename);

  try {
    const stats = await fs.stat(filePath);
    return {
      filename,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new AppError("File not found", 404);
    }
    throw new AppError("Failed to get file info", 500);
  }
}
