import type { Request } from "express";

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
