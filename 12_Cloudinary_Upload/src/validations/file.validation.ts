import { z } from "zod";

// Schema for single file upload validation
export const singleFileUploadSchema = z.object({
  fieldname: z.string().min(1, "Field name is required"),
  originalname: z.string().min(1, "Original name is required"),
  encoding: z.string(),
  mimetype: z
    .string()
    .refine(
      (mime) =>
        [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(mime),
      {
        message: "Invalid file type. Allowed types: images, PDF, text, Word documents",
      }
    ),
  size: z
    .number()
    .positive("File size must be positive")
    .max(5 * 1024 * 1024, "File size must not exceed 5MB"),
  destination: z.string(),
  filename: z.string().min(1, "Filename is required"),
  path: z.string().min(1, "File path is required"),
});

// Schema for multiple file upload validation
export const multipleFileUploadSchema = z
  .array(singleFileUploadSchema)
  .min(1, "At least one file is required")
  .max(10, "Maximum 10 files allowed");

// Schema for image file upload validation (stricter)
export const imageFileUploadSchema = z.object({
  fieldname: z.string().min(1, "Field name is required"),
  originalname: z.string().min(1, "Original name is required"),
  encoding: z.string(),
  mimetype: z
    .string()
    .refine(
      (mime) =>
        ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(
          mime
        ),
      {
        message: "Only image files are allowed (JPEG, PNG, GIF, WebP)",
      }
    ),
  size: z
    .number()
    .positive("File size must be positive")
    .max(2 * 1024 * 1024, "Image size must not exceed 2MB"),
  destination: z.string(),
  filename: z.string().min(1, "Filename is required"),
  path: z.string().min(1, "File path is required"),
});

// Schema for multiple image upload validation
export const multipleImageUploadSchema = z
  .array(imageFileUploadSchema)
  .min(1, "At least one image is required")
  .max(5, "Maximum 5 images allowed");

// Type inference from schemas
export type SingleFileUploadInput = z.infer<typeof singleFileUploadSchema>;
export type MultipleFileUploadInput = z.infer<typeof multipleFileUploadSchema>;
export type ImageFileUploadInput = z.infer<typeof imageFileUploadSchema>;
export type MultipleImageUploadInput = z.infer<typeof multipleImageUploadSchema>;
