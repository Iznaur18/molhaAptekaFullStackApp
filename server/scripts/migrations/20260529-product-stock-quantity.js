import { ProductModel } from "../../models/index.js";

/** Backfill `productStockQuantity` for existing products. */
export const up = async () => {
  await ProductModel.updateMany(
    { productIsAvailable: { $ne: false } },
    { $set: { productStockQuantity: 9999 } },
  );
  await ProductModel.updateMany(
    { productIsAvailable: false },
    { $set: { productStockQuantity: 0 } },
  );
  await ProductModel.updateMany(
    { productStockQuantity: { $exists: false } },
    { $set: { productStockQuantity: 0 } },
  );
};
