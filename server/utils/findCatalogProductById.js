import mongoose from "mongoose";

import { ProductModel } from "../models/index.js";
import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import { enrichProductApiFields } from "./productDiscount.js";

/**
 * @param {string} productId
 */
export const findCatalogProductById = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    return null;
  }

  const product = await ProductModel.findById(productId).lean();
  if (!product) {
    return null;
  }

  const [withSellerSnapshots] = await attachProductSellerSnapshots([product]);
  return enrichProductApiFields(withSellerSnapshots);
};
