import express from "express";
import { AppError, errorHandler } from "./middlewares/error.middleware";
import cityRoutes from "./routes/city.routes";
import placeRoutes from "./routes/place.routes";
import reviewRoutes from "./routes/review.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/cities", cityRoutes);
app.use("/places", placeRoutes);
app.use("/users", userRoutes);
app.use("/", reviewRoutes);

// 404 Not Found
app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;