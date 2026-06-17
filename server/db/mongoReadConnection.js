import mongoose from "mongoose";

import ProductModel, { ProductSchema } from "../models/ProductModel.js";

/** @type {import("mongoose").Connection | null} */
let readConnection = null;

/** @type {typeof ProductModel | null} */
let catalogProductReadModel = null;

/** @returns {boolean} */
export function isMongoReadConnectionConfigured() {
  return Boolean(process.env.MONGO_URI_READ?.trim());
}

/** @returns {boolean} */
export function isMongoReadConnectionReady() {
  return readConnection?.readyState === 1;
}

/**
 * Подключает optional read replica для каталога (GET /product list).
 * Без MONGO_URI_READ — no-op, каталог читает с primary.
 *
 * @returns {Promise<boolean>} true если read connection активен
 */
export async function connectMongoRead() {
  const uri = process.env.MONGO_URI_READ?.trim();
  if (!uri) {
    return false;
  }

  if (readConnection?.readyState === 1) {
    return true;
  }

  readConnection = mongoose.createConnection(uri);
  readConnection.on("error", (error) => {
    console.error("[mongo-read] connection error:", error);
  });

  await readConnection.asPromise();

  catalogProductReadModel =
    readConnection.models.Product ?? readConnection.model("Product", ProductSchema);

  console.log("[mongo-read] catalog reads routed to MONGO_URI_READ");
  return true;
}

/** Модель Product для листинга каталога: read replica или primary. */
export function getCatalogProductModel() {
  return catalogProductReadModel ?? ProductModel;
}

/** @returns {Promise<void>} */
export async function closeMongoRead() {
  if (!readConnection) {
    return;
  }

  await readConnection.close();
  readConnection = null;
  catalogProductReadModel = null;
}
