import mongoose from "mongoose";

import { PRODUCT_SELLER_PUBLIC_SELECT } from "../constants/productSellerPublicFields.js";
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

  const product = await ProductModel.findById(productId)
    .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
    .lean();
  if (!product) {
    return null;
  }

  const [withSellerSnapshots] = await attachProductSellerSnapshots([product]);
  return enrichProductApiFields(withSellerSnapshots);
};
