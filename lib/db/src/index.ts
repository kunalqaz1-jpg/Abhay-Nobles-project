import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;
let connectPromise: Promise<void> | null = null;
let indexMaintenancePromise: Promise<void> | null = null;

const legacyIndexMigrations = [
  { collectionName: "notices", legacyIndexName: "id_1", expectedIndexKey: { noticeId: 1 } },
  { collectionName: "messages", legacyIndexName: "id_1", expectedIndexKey: { messageId: 1 } },
  { collectionName: "events", legacyIndexName: "id_1", expectedIndexKey: { eventId: 1 } },
  { collectionName: "homeworks", legacyIndexName: "id_1", expectedIndexKey: { hwId: 1 } },
  { collectionName: "results", legacyIndexName: "id_1", expectedIndexKey: { resultId: 1 } },
  { collectionName: "studymaterials", legacyIndexName: "id_1", expectedIndexKey: { materialId: 1 } },
] as const;

async function ensureSchoolErpIndexes() {
  const database = mongoose.connection.db;
  if (!database) return;

  for (const migration of legacyIndexMigrations) {
    const collection = database.collection(migration.collectionName);

    let indexes: Array<{ name?: string }> = [];
    try {
      indexes = await collection.indexes();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("ns does not exist") || message.includes("NamespaceNotFound")) {
        continue;
      }
      console.warn(`Unable to inspect indexes for ${migration.collectionName}: ${message}`);
      continue;
    }

    if (indexes.some((index) => index.name === migration.legacyIndexName)) {
      try {
        await collection.dropIndex(migration.legacyIndexName);
        console.log(`Dropped stale index ${migration.legacyIndexName} from ${migration.collectionName}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("index not found")) {
          console.warn(`Unable to drop ${migration.legacyIndexName} on ${migration.collectionName}: ${message}`);
        }
      }
    }

    try {
      await collection.createIndex(migration.expectedIndexKey, { unique: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Unable to create expected index on ${migration.collectionName}: ${message}`);
    }
  }
}

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
    if (!indexMaintenancePromise) {
      indexMaintenancePromise = ensureSchoolErpIndexes().catch((error) => {
        indexMaintenancePromise = null;
        throw error;
      });
    }
    await indexMaintenancePromise;
  } catch (error) {
    connectPromise = null;
    throw error;
  }
}

export { mongoose };
export * from "./models";
