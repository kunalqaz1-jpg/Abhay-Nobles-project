import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;
let connectPromise: Promise<void> | null = null;

export function isDatabaseConfigured() {
  return Boolean(MONGODB_URI);
}

export async function connectDB() {
  if (isConnected) return;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI must be set. Did you forget to add your MongoDB Atlas connection string?");
  }
  if (!connectPromise) {
    connectPromise = mongoose.connect(MONGODB_URI).then(() => {
      isConnected = true;
      console.log("Connected to MongoDB Atlas");
    });
  }
  try {
    await connectPromise;
  } catch (error) {
    connectPromise = null;
    throw error;
  }
}

export { mongoose };
export * from "./models";
