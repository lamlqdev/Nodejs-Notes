# Cloudinary File Upload & Management

A comprehensive guide to implementing cloud-based file storage and management using Cloudinary with Express, Multer, and Zod validation. This project demonstrates the complete file lifecycle (CRUD operations) with cloud storage.

---

## 1. Core Terminology

### What is Cloudinary?

**Cloudinary** is a cloud-based image and video management platform that provides end-to-end media management solutions. It offers:

- **Cloud Storage**: Store files in the cloud instead of local filesystem
- **Image/Video Processing**: Transform, optimize, and manipulate media on-the-fly
- **CDN Delivery**: Fast global content delivery through CDN
- **Metadata Management**: Store and manage file metadata, tags, and context
- **API Management**: Complete REST API for file operations

### Why Use Cloudinary?

- **Scalability**: No storage limits on your server
- **Performance**: CDN delivery ensures fast access globally
- **Image Processing**: Built-in transformations (resize, crop, filters, etc.)
- **Cost-Effective**: Pay only for what you use
- **Reliability**: Enterprise-grade infrastructure
- **Security**: Secure uploads and access controls

---

## 2. Implementation Guide

### 2.1. Project Setup & Dependencies

This project builds upon the **[Express.js setup](../04_Working_with_Express/SETUP.md)**. Install the required dependencies:

```bash
npm install cloudinary multer zod dotenv
npm install -D typescript @types/node @types/express @types/multer tsx nodemon
```

- **cloudinary**: Cloudinary SDK for Node.js
- **multer**: Middleware for handling `multipart/form-data` file uploads
- **zod**: Schema-based validation library
- **dotenv**: Environment variable management

### 2.2. Cloudinary Account Setup

1. **Create Account**: Sign up at [cloudinary.com](https://cloudinary.com)
2. **Get Credentials**: From the dashboard, copy: Cloud Name, API Key, API Secret
3. **Environment Variables**: Create `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
MAX_FILES=10
```

### 2.3. Cloudinary Configuration

Create `src/config/cloudinary.config.ts`:

```typescript
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true, // Use HTTPS
});

export default cloudinary;
```

### 2.4. Multer Memory Storage Configuration

Unlike disk storage, we use **memory storage** for Cloudinary uploads. Files are stored in memory as Buffer objects, then uploaded to Cloudinary. Create `src/config/multer.config.ts`:

```typescript
import multer from "multer";

// Use memory storage for Cloudinary uploads
// Files are stored in memory as Buffer objects and then uploaded to Cloudinary
const storage = multer.memoryStorage();

// File filter function to validate file types
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Multer configuration for single file upload
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Multer configuration for multiple file uploads
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Maximum 10 files
  },
});

// Multer configuration for single image upload (stricter)
export const uploadSingleImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for images
  },
});

export default { uploadSingle, uploadMultiple, uploadSingleImage };
```

**Key Difference from Disk Storage**:

- **Disk Storage**: Files saved to filesystem, then accessed later
- **Memory Storage**: Files kept in RAM as Buffer, uploaded immediately to Cloudinary, then discarded from memory

### 2.5. TypeScript Types for Cloudinary

Create `src/types/file.types.ts`:

```typescript
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
```

**Key Cloudinary Concepts**:

- **public_id**: Unique identifier for the file in Cloudinary (can include folder path)
- **secure_url**: HTTPS URL for accessing the file
- **resource_type**: Type of resource (image, raw, video, auto)

### 2.6. Cloudinary Service Layer

Create `src/services/cloudinary.service.ts` with all Cloudinary operations:

```typescript
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
    if (options.context) {
      await cloudinary.uploader.add_context(options.context, [publicId]);
    }

    if (options.tags) {
      await cloudinary.uploader.add_tag(options.tags, [publicId]);
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
```

### 2.7. File Service Layer

Create `src/services/file.service.ts` as a wrapper around Cloudinary service:

```typescript
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

export async function processSingleFileUpload(
  file: Express.Multer.File,
  folder?: string
): Promise<FileMetadata> {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }
  return uploadFileToCloudinary(file, folder);
}

export async function processMultipleFileUpload(
  files: Express.Multer.File[] | undefined,
  folder?: string
): Promise<FileMetadata[]> {
  if (!files || files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }
  return uploadMultipleFilesToCloudinary(files, folder);
}

export async function getFileInfo(publicId: string): Promise<FileInfo> {
  return getFileInfoFromCloudinary(publicId);
}

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

export async function updateFile(
  publicId: string,
  options: FileUpdateOptions
): Promise<FileInfo> {
  return updateFileInCloudinary(publicId, options);
}

export async function deleteFile(
  publicId: string,
  resourceType: "image" | "raw" | "video" | "auto" = "image"
): Promise<void> {
  return deleteFileFromCloudinary(publicId, resourceType);
}
```

### 2.8. Controllers Implementation

Controllers handle HTTP requests and delegate to services. Create `src/controllers/file.controller.ts`:

```typescript
import type { Request, Response } from "express";
import type { FileUploadResponse } from "../types/file.types.js";
import { AppError } from "../middlewares/error.middleware.js";
import {
  processSingleFileUpload,
  processMultipleFileUpload,
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

  // Decode publicId if it contains slashes (encoded as colons in URL)
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

  const decodedPublicId = publicId.replace(/:/g, "/");

  await deleteFile(decodedPublicId, resourceType);

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
};
```

### 2.9. Routes Setup

Create `src/routes/file.routes.ts`:

```typescript
import { Router } from "express";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  listAllFiles,
  getFileInfoById,
  updateFileMetadata,
  deleteFileById,
} from "../controllers/file.controller.js";
import { uploadSingle, uploadMultiple } from "../config/multer.config.js";
import {
  validateSingleFile,
  validateMultipleFiles,
} from "../middlewares/fileValidation.middleware.js";

const router = Router();

// File Lifecycle API Routes

// CREATE - Upload files
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

// READ - List and get files
router.get("/", listAllFiles);
router.get("/:publicId", getFileInfoById);

// UPDATE - Update file metadata
router.put("/:publicId", updateFileMetadata);

// DELETE - Delete file
router.delete("/:publicId", deleteFileById);

export default router;
```

---

## 3. API Endpoints - File Lifecycle

### 3.1. CREATE - Upload Single File

**POST** `/api/files`

Upload a single file to Cloudinary.

**Request:**

- Content-Type: `multipart/form-data`
- Field name: `file`
- Optional: `folder` (string) - Cloudinary folder path

**Example Request (cURL):**

```bash
curl -X POST http://localhost:3000/api/files \
  -F "file=@/path/to/file.pdf" \
  -F "folder=documents"
```

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "file": {
      "publicId": "uploads/document-1234567890",
      "originalName": "document.pdf",
      "mimetype": "application/pdf",
      "size": 102400,
      "secureUrl": "https://res.cloudinary.com/cloud_name/image/upload/v1234567890/uploads/document-1234567890.pdf",
      "url": "http://res.cloudinary.com/cloud_name/image/upload/v1234567890/uploads/document-1234567890.pdf",
      "format": "pdf",
      "resourceType": "raw",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3.2. CREATE - Upload Multiple Files

**POST** `/api/files/multiple`

Upload multiple files to Cloudinary.

**Request:**

- Content-Type: `multipart/form-data`
- Field name: `files` (array)
- Optional: `folder` (string)

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/files/multiple \
  -F "files=@file1.pdf" \
  -F "files=@file2.jpg" \
  -F "folder=documents"
```

### 3.3. READ - List All Files

**GET** `/api/files`

List all files from Cloudinary with pagination.

**Query Parameters:**

- `folder` (optional): Filter by folder
- `limit` (optional): Number of results per page (default: 10)
- `cursor` (optional): Pagination cursor for next page
- `resourceType` (optional): Filter by resource type (image, raw, video, auto)

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/files?folder=uploads&limit=10"
```

**Response:**

```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": {
    "files": [
      {
        "publicId": "uploads/file1",
        "originalName": "file1.pdf",
        "size": 102400,
        "format": "pdf",
        "resourceType": "raw",
        "secureUrl": "https://res.cloudinary.com/...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "totalCount": 50,
      "nextCursor": "abc123",
      "hasMore": true
    }
  }
}
```

### 3.4. READ - Get File Information

**GET** `/api/files/:publicId`

Get detailed information about a specific file.

**Note**: If `publicId` contains slashes (folder path), encode them as colons (`:`) in the URL.

**Example Request:**

```bash
# For publicId: "uploads/folder/file"
curl -X GET "http://localhost:3000/api/files/uploads:folder:file"
```

**Response:**

```json
{
  "success": true,
  "message": "File information retrieved successfully",
  "data": {
    "publicId": "uploads/folder/file",
    "originalName": "file.pdf",
    "size": 102400,
    "format": "pdf",
    "resourceType": "raw",
    "secureUrl": "https://res.cloudinary.com/...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.5. UPDATE - Update File Metadata

**PUT** `/api/files/:publicId`

Update file metadata (tags, context, folder).

**Request Body:**

```json
{
  "tags": ["important", "document"],
  "context": {
    "alt": "Document description",
    "caption": "File caption"
  },
  "folder": "new-folder"
}
```

**Example Request:**

```bash
curl -X PUT "http://localhost:3000/api/files/uploads:file" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["important"],
    "context": {"alt": "Document"}
  }'
```

### 3.6. DELETE - Delete File

**DELETE** `/api/files/:publicId`

Delete a file from Cloudinary.

**Query Parameters:**

- `resourceType` (optional): Resource type (image, raw, video, auto) - default: image

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/files/uploads:file?resourceType=raw"
```

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## 4. Key Differences from Local Storage

| Aspect               | Local Storage (Project 11)    | Cloud Storage (This Project) |
| -------------------- | ----------------------------- | ---------------------------- |
| **Storage Location** | Server filesystem             | Cloudinary cloud             |
| **Multer Storage**   | `diskStorage`                 | `memoryStorage`              |
| **File Path**        | Local filesystem path         | Cloudinary `public_id`       |
| **File Access**      | Direct file system access     | HTTPS URL from Cloudinary    |
| **Scalability**      | Limited by disk space         | Unlimited (based on plan)    |
| **CDN**              | No                            | Yes, global CDN              |
| **Backup**           | Manual                        | Automatic                    |
| **Image Processing** | Requires additional libraries | Built-in transformations     |

---

## 5. Best Practices

### Security

- Never expose Cloudinary API secret in client-side code
- Use secure URLs (HTTPS) for file access
- Implement proper authentication/authorization for file operations
- Validate file types and sizes before upload

### Performance

- Use appropriate resource types (image, raw, video)
- Implement pagination for file listing
- Use Cloudinary transformations for image optimization
- Cache frequently accessed file URLs

### Organization

- Use folders to organize files logically
- Add tags for better file management
- Use context for storing additional metadata
- Implement proper error handling

---

## 6. Summary of Implementation Steps

1. **[Project Setup & Dependencies](#21-project-setup--dependencies)**: Install `cloudinary`, `multer`, and other necessary packages.
2. **[Cloudinary Configuration](#22-cloudinary-account-setup)**: Configure environment variables and create the config module.
3. **[Cloudinary Configuration](#23-cloudinary-configuration)**: Configure Cloudinary environment variables and create the config module.
4. **[Multer Memory Storage Configuration](#24-multer-memory-storage-configuration)**: Set up Multer memory storage for Cloudinary uploads.
5. **[TypeScript Types](#25-typescript-types-for-cloudinary)**: Define TypeScript types for file uploads and responses.
6. **[Cloudinary Service Layer](#26-cloudinary-service-layer)**: Create service functions to handle Cloudinary operations.
7. **[File Service Layer](#27-file-service-layer)**: Create service functions to handle file operations.
8. **[File Upload Controllers](#28-controllers-implementation)**: Create controllers to handle HTTP requests and delegate to services.
9. **[Routes Setup](#29-routes-setup)**: Define API endpoints with Multer and validation middleware.

## 7. Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation) - Complete Cloudinary API documentation
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration) - Node.js SDK guide
- [Multer Documentation](https://github.com/expressjs/multer) - Multer middleware documentation
- [Cloudinary Image Transformations](https://cloudinary.com/documentation/image_transformations) - Image manipulation guide
