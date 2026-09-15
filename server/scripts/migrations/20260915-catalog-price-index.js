import { ProductModel } from "../../models/index.js";

/**
 * Идемпотентно создаёт индексы из схемы Product — среди них новый
 * `catalog_approved_price` для сортировок и фильтра по цене (страховка к autoIndex).
 */
export const up = async () => {
  await ProductModel.createIndexes();
};
