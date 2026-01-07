import mongoose, { ConnectOptions } from "mongoose";

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/mongodb_mongoose_demo";

/**
 * Connect to MongoDB using Mongoose
 * @param uri - MongoDB connection string
 */
export async function connectDB(
  uri: string = process.env.MONGO_URI || DEFAULT_MONGO_URI
) {
  try {
    await mongoose.connect(uri, {
      // Additional options can be added here if needed
    } as ConnectOptions);

    console.log("✅ Connected to MongoDB successfully");

    // Listen for connection errors for easier debugging
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}
