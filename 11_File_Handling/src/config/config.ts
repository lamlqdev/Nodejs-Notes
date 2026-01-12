import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  uploadDir: string;
  maxFileSize: number; // in bytes
  maxFiles: number;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  maxFiles: Number(process.env.MAX_FILES) || 10,
};

export default config;
