import mongoose from "mongoose";

import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import { ProductModel } from "../../models/index.js";
import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import { enrichProductApiFields } from "./productDiscount.js";

/**
 * Каталожные карточки по списку id (для корзины).
 * Отсутствующие id просто не попадают в ответ.
 * Просроченный flash sale нормализует `enrichProductApiFields` без N× write.
 *
 * @param {string[]} productIds
 */
export async function findCatalogProductsByIds(productIds) {
  const ids = [
    ...new Set(
      (Array.isArray(productIds) ? productIds : [])
        .map(String)
        .filter((id) => mongoose.isValidObjectId(id)),
    ),
  ];
  if (ids.length === 0) {
    return [];
  }

  const products = await ProductModel.find({ _id: { $in: ids } })
    .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
    .lean();

  if (products.length === 0) {
    return [];
  }

  const withSellerSnapshots = await attachProductSellerSnapshots(products);
  return withSellerSnapshots.map((row) => enrichProductApiFields(row));
}
