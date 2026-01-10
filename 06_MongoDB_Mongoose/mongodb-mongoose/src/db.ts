import mongoose from "mongoose";

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/mongodb_mongoose_demo";

export async function connectDB(
  uri: string = process.env.MONGO_URI || DEFAULT_MONGO_URI
) {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully...");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB...");
}
