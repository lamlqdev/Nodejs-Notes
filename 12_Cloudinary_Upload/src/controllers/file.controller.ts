import type { Request, Response } from "express";
import type { FileUploadResponse } from "../types/file.types.js";
import { AppError } from "../middlewares/error.middleware.js";
import {
  processSingleFileUpload,
  processMultipleFileUpload,
  processSingleImageUpload,
  processMultipleImageUpload,
  getFileInfo,
  listFiles,
  updateFile,
  deleteFile,
} from "../services/file.service.js";

/**
 * Upload single file
 * POST /api/files
 */
export const uploadSingleFile = async (
  req: Request,
  res: Response<FileUploadResponse>
) => {
  const folder = (req.body.folder as string) || undefined;
  const fileMetadata = await processSingleFileUpload(req.file!, folder);

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: {
      file: fileMetadata,
    },
  });
};

/**
 * Upload multiple files
 * POST /api/files/multiple
 */
export const uploadMultipleFiles = async (
  req: Request,
  res: Response<FileUploadResponse>
) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const folder = (req.body.folder as string) || undefined;
  const uploadedFiles = await processMultipleFileUpload(files, folder);

  res.status(201).json({
    success: true,
    message: `${uploadedFiles.length} file(s) uploaded successfully`,
    data: {
      files: uploadedFiles,
    },
  });
};

/**
 * Upload single image
 * POST /api/files/images
 */
export const uploadSingleImage = async (
  req: Request,
  res: Response<FileUploadResponse>
) => {
  const folder = (req.body.folder as string) || undefined;
  const fileMetadata = await processSingleImageUpload(req.file!, folder);

  res.status(201).json({
    success: true,
    message: "Image uploaded successfully",
    data: {
      file: fileMetadata,
    },
  });
};

/**
 * Upload multiple images
 * POST /api/files/images/multiple
 */
export const uploadMultipleImages = async (
  req: Request,
  res: Response<FileUploadResponse>
) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const folder = (req.body.folder as string) || undefined;
  const uploadedImages = await processMultipleImageUpload(files, folder);

  res.status(201).json({
    success: true,
    message: `${uploadedImages.length} image(s) uploaded successfully`,
    data: {
      files: uploadedImages,
    },
  });
};

/**
 * List all files
 * GET /api/files
 */
export const listAllFiles = async (req: Request, res: Response) => {
  const folder = req.query.folder as string | undefined;
  const maxResults = req.query.limit
    ? parseInt(req.query.limit as string, 10)
    : undefined;
  const nextCursor = req.query.cursor as string | undefined;
  const resourceType =
    (req.query.resourceType as "image" | "raw" | "video" | "auto") || undefined;

  const listOptions: {
    folder?: string;
    maxResults?: number;
    nextCursor?: string;
    resourceType?: "image" | "raw" | "video" | "auto";
  } = {};

  if (folder) listOptions.folder = folder;
  if (maxResults) listOptions.maxResults = maxResults;
  if (nextCursor) listOptions.nextCursor = nextCursor;
  if (resourceType) listOptions.resourceType = resourceType;

  const result = await listFiles(listOptions);

  res.status(200).json({
    success: true,
    message: "Files retrieved successfully",
    data: {
      files: result.files,
      pagination: {
        totalCount: result.totalCount,
        nextCursor: result.nextCursor,
        hasMore: !!result.nextCursor,
      },
    },
  });
};

/**
 * Get file information by public_id
 * GET /api/files/:publicId
 */
export const getFileInfoById = async (req: Request, res: Response) => {
  const { publicId } = req.params;

  if (!publicId || Array.isArray(publicId)) {
    throw new AppError("Public ID is required", 400);
  }

  // Decode publicId if it contains slashes
  const decodedPublicId = publicId.replace(/:/g, "/");

  const fileInfo = await getFileInfo(decodedPublicId);

  res.status(200).json({
    success: true,
    message: "File information retrieved successfully",
    data: fileInfo,
  });
};

/**
 * Update file metadata
 * PUT /api/files/:publicId
 */
export const updateFileMetadata = async (req: Request, res: Response) => {
  const { publicId } = req.params;
  const { tags, context, folder } = req.body;

  if (!publicId || Array.isArray(publicId)) {
    throw new AppError("Public ID is required", 400);
  }

  // Decode publicId if it contains slashes
  const decodedPublicId = publicId.replace(/:/g, "/");

  const updateOptions: {
    tags?: string[];
    context?: Record<string, string>;
    folder?: string;
  } = {};

  if (tags) {
    updateOptions.tags = Array.isArray(tags) ? tags : [tags];
  }

  if (context) {
    updateOptions.context = context;
  }

  if (folder) {
    updateOptions.folder = folder;
  }

  const updatedFile = await updateFile(decodedPublicId, updateOptions);

  res.status(200).json({
    success: true,
    message: "File updated successfully",
    data: updatedFile,
  });
};

/**
 * Delete file
 * DELETE /api/files/:publicId
 */
export const deleteFileById = async (req: Request, res: Response) => {
  const { publicId } = req.params;
  const resourceType =
    (req.query.resourceType as "image" | "raw" | "video" | "auto") || "image";

  if (!publicId || Array.isArray(publicId)) {
    throw new AppError("Public ID is required", 400);
  }

  // Decode publicId if it contains slashes
  const decodedPublicId = publicId.replace(/:/g, "/");

  await deleteFile(decodedPublicId, resourceType);

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
};
