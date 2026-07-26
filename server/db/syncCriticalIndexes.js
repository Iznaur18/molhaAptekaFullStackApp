import ProductCategoryDisplayModel from "../models/ProductCategoryDisplayModel.js";
import {
  PendingRegistrationModel,
  ReferralLedgerEntryModel,
  UserModel,
} from "../models/index.js";
import { logServerEvent } from "../utils/logServerEvent.js";

/**
 * Пересоздаёт индексы моделей, у которых в схеме менялись ОПЦИИ индексов,
 * или которые критичны для идемпотентности денег (prod: autoIndex=false).
 * Также снимает stale unique (пример: pendingTokenHash_1 → E11000 на null).
 */
async function syncModelIndexes(model, modelName) {
  try {
    await model.syncIndexes();
    logServerEvent("info", {
      event: "indexes_synced",
      model: modelName,
    });
  } catch (err) {
    logServerEvent("error", {
      event: "indexes_sync_failed",
      model: modelName,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function syncCriticalIndexes() {
  await syncModelIndexes(ProductCategoryDisplayModel, "ProductCategoryDisplay");
  await syncModelIndexes(UserModel, "User");
  await syncModelIndexes(ReferralLedgerEntryModel, "ReferralLedgerEntry");
  await syncModelIndexes(PendingRegistrationModel, "PendingRegistration");
}
