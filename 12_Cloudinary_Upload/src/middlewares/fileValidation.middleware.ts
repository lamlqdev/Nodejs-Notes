import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "./error.middleware.js";
import {
  singleFileUploadSchema,
  multipleFileUploadSchema,
  imageFileUploadSchema,
  multipleImageUploadSchema,
} from "../validations/file.validation.js";

// Middleware to validate single file upload with Zod
export const validateSingleFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    // Validate file using Zod schema
    singleFileUploadSchema.parse(req.file);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => err.message).join(", ");
      next(new AppError(`File validation failed: ${errorMessages}`, 400));
    } else {
      next(error);
    }
  }
};

// Middleware to validate multiple file uploads with Zod
export const validateMultipleFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }

    // Validate files array using Zod schema
    multipleFileUploadSchema.parse(files);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => err.message).join(", ");
      next(new AppError(`Files validation failed: ${errorMessages}`, 400));
    } else {
      next(error);
    }
  }
};

// Middleware to validate single image upload with Zod
export const validateSingleImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError("No image uploaded", 400);
    }

    // Validate image using Zod schema
    imageFileUploadSchema.parse(req.file);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => err.message).join(", ");
      next(new AppError(`Image validation failed: ${errorMessages}`, 400));
    } else {
      next(error);
    }
  }
};

// Middleware to validate multiple image uploads with Zod
export const validateMultipleImages = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new AppError("No images uploaded", 400);
    }

    // Validate images array using Zod schema
    multipleImageUploadSchema.parse(files);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => err.message).join(", ");
      next(new AppError(`Images validation failed: ${errorMessages}`, 400));
    } else {
      next(error);
    }
  }
};
