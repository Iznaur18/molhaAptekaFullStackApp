import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

/** @type {MongoMemoryReplSet | null} */
let memoryReplSet = null;

export const connectMongoTestReplSet = async () => {
  memoryReplSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await memoryReplSet.waitUntilRunning();
  const uri = memoryReplSet.getUri();
  await mongoose.connect(
    uri.includes("?") ? `${uri}&retryWrites=false` : `${uri}?retryWrites=false`,
  );
};

export const disconnectMongoTestReplSet = async () => {
  await mongoose.disconnect();
  if (memoryReplSet) {
    await memoryReplSet.stop();
    memoryReplSet = null;
  }
};

export const clearMongoCollections = async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
};
