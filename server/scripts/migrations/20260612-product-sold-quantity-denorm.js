import { ProductModel } from "../../models/index.js";
import { rebuildAllProductSoldQuantities } from "../../utils/productSoldQuantityDenorm.js";

/** Денорм soldQuantity на Product + индекс catalog_approved_sold_quantity. */
export const up = async () => {
  await ProductModel.updateMany(
    { soldQuantity: { $exists: false } },
    { $set: { soldQuantity: 0 } },
  );

  const stats = await rebuildAllProductSoldQuantities();
  await ProductModel.createIndexes();

  return stats;
};
