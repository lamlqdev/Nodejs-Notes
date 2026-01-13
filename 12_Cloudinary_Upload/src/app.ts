import express from "express";
import { errorHandler } from "./middlewares/error.middleware.js";
import fileRoutes from "./routes/file.routes.js";

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// File upload routes
app.use("/api/files", fileRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
