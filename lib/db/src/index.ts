import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI must be set. Did you forget to add your MongoDB Atlas connection string?");
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI!);
  isConnected = true;
  console.log("Connected to MongoDB Atlas");
}

export { mongoose };
export * from "./models";
