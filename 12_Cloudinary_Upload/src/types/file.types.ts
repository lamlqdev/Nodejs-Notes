import type { Request } from "express";

// Cloudinary upload result interface
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resource_type: string;
  created_at: string;
  etag: string;
}

// File metadata interface (after Cloudinary upload)
export interface FileMetadata {
  publicId: string; // Cloudinary public_id
  originalName: string;
  mimetype: string;
  size: number; // bytes
  secureUrl: string; // HTTPS URL
  url: string; // HTTP URL
  format: string; // File format (jpg, png, pdf, etc.)
  width?: number; // For images
  height?: number; // For images
  resourceType: string; // image, raw, video, etc.
  createdAt: Date;
}

// File info interface (for listing/getting files)
export interface FileInfo {
  publicId: string;
  originalName?: string;
  size: number;
  format: string;
  resourceType: string;
  secureUrl: string;
  createdAt: Date;
}

// File update options
export interface FileUpdateOptions {
  tags?: string[];
  context?: Record<string, string>;
  folder?: string;
}

// File upload response type
export interface FileUploadResponse {
  success: boolean;
  message: string;
  data?: {
    file?: FileMetadata;
    files?: FileMetadata[];
  };
}

// Extended Request type with file/files
export interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

export interface RequestWithFiles extends Request {
  files?: Express.Multer.File[];
}

// File validation options
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  required?: boolean;
}

// Multiple file validation options
export interface MultipleFileValidationOptions {
  maxFiles?: number;
  maxSize?: number; // in bytes per file
  allowedMimeTypes?: string[];
  required?: boolean;
}
