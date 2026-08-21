import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { PRODUCT_SORT_NEWEST } from "../../constants/productCatalogSort.js";
import { countProducts, findProductsPage } from "../product/productCatalogQuery.js";
import { isProductViewableForProfile } from "../product/isProductViewableForProfile.js";

const { ObjectId } = mongoose.Types;

export const USER_SELLER_PRODUCTS_PAGE_SIZE_DEFAULT = 5;
export const USER_SELLER_PRODUCTS_PAGE_SIZE_MAX = 20;

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerId
 * @param {{ shelfId?: string | null }} [opts]
 */
export const buildSellerCatalogProductsQuery = (sellerId, opts = {}) => {
  const query = {
    productSeller:
      typeof sellerId === "string" && ObjectId.isValid(sellerId)
        ? new ObjectId(sellerId)
        : sellerId,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: { $ne: false },
  };

  const shelfId = opts.shelfId != null ? String(opts.shelfId).trim() : "";
  if (shelfId && ObjectId.isValid(shelfId)) {
    query.sellerShelfId = new ObjectId(shelfId);
  }

  return query;
};

/**
 * @param {Record<string, unknown>} product
 */
export const mapProductToProfileThumbItem = (product) => ({
  productId: String(product._id),
  productName:
    typeof product.productName === "string" && product.productName.trim() !== ""
      ? product.productName.trim()
      : "Товар без названия",
  viewable: isProductViewableForProfile(product),
  product,
});

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerId
 * @param {number} page
 * @param {number} limit
 * @param {{ shelfId?: string | null }} [opts]
 */
export const getSellerCatalogProductsPage = async (sellerId, page, limit, opts = {}) => {
  const productsQuery = buildSellerCatalogProductsQuery(sellerId, opts);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    findProductsPage(productsQuery, PRODUCT_SORT_NEWEST, skip, limit),
    countProducts(productsQuery),
  ]);

  const items = products.map((product) => mapProductToProfileThumbItem(product));
  const totalPages = Math.ceil(total / limit) || 0;

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};
