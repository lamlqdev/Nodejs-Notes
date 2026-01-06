import express from "express";

import { errorHandler } from "./middlewares/error.middleware";
import { logger } from "./middlewares/logger.middleware";

import userRoutes from "./routes/user.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(logger);

// Routes
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
