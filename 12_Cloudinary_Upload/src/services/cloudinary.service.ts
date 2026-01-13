import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.config.js";
import { AppError } from "../middlewares/error.middleware.js";
import type {
  FileMetadata,
  FileInfo,
  FileUpdateOptions,
} from "../types/file.types.js";

/**
 * Upload file to Cloudinary
 * @param file - Multer file object (from memory storage)
 * @param folder - Optional folder path in Cloudinary
 * @param options - Additional upload options
 */
export async function uploadFileToCloudinary(
  file: Express.Multer.File,
  folder?: string,
  options?: {
    resource_type?: "image" | "raw" | "video" | "auto";
    transformation?: any[];
    tags?: string[];
  }
): Promise<FileMetadata> {
  if (!file || !file.buffer) {
    throw new AppError("No file provided", 400);
  }

  try {
    // Convert buffer to data URI for Cloudinary
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const uploadOptions: any = {
      folder: folder || "uploads",
      resource_type: options?.resource_type || "auto",
      overwrite: false,
      unique_filename: true,
      use_filename: true,
    };

    if (options?.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    if (options?.tags) {
      uploadOptions.tags = options.tags;
    }

    const result: UploadApiResponse = await cloudinary.uploader.upload(
      dataUri,
      uploadOptions
    );

    return {
      publicId: result.public_id,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: result.bytes,
      secureUrl: result.secure_url,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      resourceType: result.resource_type,
      createdAt: new Date(result.created_at),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(`Cloudinary upload failed: ${error.message}`, 500);
    }
    throw new AppError("Failed to upload file to Cloudinary", 500);
  }
}

/**
 * Upload multiple files to Cloudinary
 */
export async function uploadMultipleFilesToCloudinary(
  files: Express.Multer.File[],
  folder?: string,
  options?: {
    resource_type?: "image" | "raw" | "video" | "auto";
    tags?: string[];
  }
): Promise<FileMetadata[]> {
  if (!files || files.length === 0) {
    throw new AppError("No files provided", 400);
  }

  const uploadPromises = files.map((file) =>
    uploadFileToCloudinary(file, folder, options)
  );

  return Promise.all(uploadPromises);
}

/**
 * Get file information from Cloudinary by public_id
 */
export async function getFileInfoFromCloudinary(
  publicId: string
): Promise<FileInfo> {
  if (!publicId) {
    throw new AppError("Public ID is required", 400);
  }

  try {
    const result = await cloudinary.api.resource(publicId, {
      image_metadata: true,
    });

    return {
      publicId: result.public_id,
      originalName: result.original_filename,
      size: result.bytes,
      format: result.format,
      resourceType: result.resource_type,
      secureUrl: result.secure_url,
      createdAt: new Date(result.created_at),
    };
  } catch (error: any) {
    if (error.http_code === 404) {
      throw new AppError("File not found", 404);
    }
    throw new AppError(`Failed to get file info: ${error.message}`, 500);
  }
}

/**
 * List files from Cloudinary with pagination
 */
export async function listFilesFromCloudinary(options?: {
  folder?: string;
  maxResults?: number;
  nextCursor?: string;
  resourceType?: "image" | "raw" | "video" | "auto";
}): Promise<{
  files: FileInfo[];
  nextCursor?: string;
  totalCount: number;
}> {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: options?.folder,
      max_results: options?.maxResults || 10,
      next_cursor: options?.nextCursor,
      resource_type: options?.resourceType || "image",
    });

    const files: FileInfo[] = result.resources.map((resource: any) => ({
      publicId: resource.public_id,
      originalName: resource.original_filename,
      size: resource.bytes,
      format: resource.format,
      resourceType: resource.resource_type,
      secureUrl: resource.secure_url,
      createdAt: new Date(resource.created_at),
    }));

    return {
      files,
      nextCursor: result.next_cursor,
      totalCount: result.total_count,
    };
  } catch (error: any) {
    throw new AppError(`Failed to list files: ${error.message}`, 500);
  }
}

/**
 * Update file metadata in Cloudinary
 */
export async function updateFileInCloudinary(
  publicId: string,
  options: FileUpdateOptions
): Promise<FileInfo> {
  if (!publicId) {
    throw new AppError("Public ID is required", 400);
  }

  try {
    // Add context if provided
    if (options.context) {
      // Convert context object to Cloudinary format: "key1=value1|key2=value2"
      const contextString = Object.entries(options.context)
        .map(([key, value]) => `${key}=${value}`)
        .join("|");
      await cloudinary.uploader.add_context(contextString, [publicId]);
    }

    // Add tags if provided
    if (options.tags && options.tags.length > 0) {
      // Add tags one by one or join them
      // Cloudinary add_tag accepts a single tag string, so we need to call it for each tag
      for (const tag of options.tags) {
        await cloudinary.uploader.add_tag(tag, [publicId]);
      }
    }

    // Return updated file info
    return getFileInfoFromCloudinary(publicId);
  } catch (error: any) {
    if (error.http_code === 404) {
      throw new AppError("File not found", 404);
    }
    throw new AppError(`Failed to update file: ${error.message}`, 500);
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFileFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" | "video" | "auto" = "image"
): Promise<void> {
  if (!publicId) {
    throw new AppError("Public ID is required", 400);
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== "ok") {
      throw new AppError("Failed to delete file", 500);
    }
  } catch (error: any) {
    if (error.http_code === 404) {
      throw new AppError("File not found", 404);
    }
    throw new AppError(`Failed to delete file: ${error.message}`, 500);
  }
}

/**
 * Get file URL (for direct access)
 */
export function getFileUrl(
  publicId: string,
  options?: {
    transformation?: any[];
    format?: string;
    secure?: boolean;
  }
): string {
  if (!publicId) {
    throw new AppError("Public ID is required", 400);
  }

  const url =
    options?.secure !== false
      ? cloudinary.url(publicId, {
          transformation: options?.transformation,
          format: options?.format,
          secure: true,
        })
      : cloudinary.url(publicId, {
          transformation: options?.transformation,
          format: options?.format,
          secure: false,
        });

  return url;
}
