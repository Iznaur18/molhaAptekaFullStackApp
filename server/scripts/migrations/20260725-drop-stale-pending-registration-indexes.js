/**
 * Снимает устаревшие индексы PendingRegistration:
 * - pendingTokenHash_1 (unique) → E11000 при upsert, т.к. поле удалено из схемы
 * - userName_1 (unique) → брошенные заявки не должны резервировать ник
 *
 * На старте сервера то же делает syncCriticalIndexes → syncIndexes().
 * Скрипт — для ручного прогона / prod без ожидания рестарта.
 *
 * Usage: node server/scripts/migrations/20260725-drop-stale-pending-registration-indexes.js
 */
import mongoose from "mongoose";
import "dotenv/config";
import { PendingRegistrationModel } from "../../models/index.js";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.error("MONGODB_URI / MONGO_URI required");
  process.exit(1);
}

await mongoose.connect(uri);

const collection = PendingRegistrationModel.collection;
const before = await collection.indexes();
console.log(
  "before:",
  before.map((index) => index.name).join(", "),
);

await collection.updateMany(
  { pendingTokenHash: { $exists: true } },
  { $unset: { pendingTokenHash: "" } },
);

await PendingRegistrationModel.syncIndexes();

const after = await collection.indexes();
console.log(
  "after:",
  after.map((index) => index.name).join(", "),
);

await mongoose.disconnect();
