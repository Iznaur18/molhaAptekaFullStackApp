import {
  isUserSellerClosedNow,
  resolveSellerScheduleOpensAtTime,
} from "@molha/api-contract";

import { UserModel } from "../../models/index.js";

/**
 * @param {Record<string, unknown>} product
 * @param {Map<string, boolean>} closedBySellerId
 * @param {string | null | undefined} viewerUserId
 */
const resolveProductSellerClosedNow = (product, closedBySellerId, viewerUserId) => {
  const sellerRef = product.productSeller;
  const sellerId =
    sellerRef != null && typeof sellerRef === "object" && sellerRef._id != null
      ? String(sellerRef._id)
      : sellerRef != null
        ? String(sellerRef)
        : "";
  if (!sellerId) {
    return false;
  }
  if (viewerUserId != null && sellerId === String(viewerUserId)) {
    return false;
  }
  return closedBySellerId.get(sellerId) === true;
};

/**
 * @param {Record<string, unknown>[]} products
 * @param {string | null | undefined} [viewerUserId]
 */
export const attachProductSellerClosedState = async (products, viewerUserId = null) => {
  if (!Array.isArray(products) || products.length === 0) {
    return products;
  }

  const sellerIds = [
    ...new Set(
      products
        .map((product) => {
          const sellerRef = product.productSeller;
          if (sellerRef != null && typeof sellerRef === "object" && sellerRef._id != null) {
            return String(sellerRef._id);
          }
          return sellerRef != null ? String(sellerRef) : "";
        })
        .filter((id) => id.length > 0),
    ),
  ];

  if (sellerIds.length === 0) {
    return products.map((product) => ({
      ...product,
      isSellerClosedNow: false,
      sellerClosedOpensAt: null,
    }));
  }

  const sellerRows = await UserModel.find({ _id: { $in: sellerIds } })
    .select("userBusinessHoursEnabled userBusinessHours userRegionCode")
    .lean();

  const closedBySellerId = new Map(
    sellerRows.map((row) => [String(row._id), isUserSellerClosedNow(row)]),
  );

  return products.map((product) => {
    const isSellerClosedNow = resolveProductSellerClosedNow(
      product,
      closedBySellerId,
      viewerUserId,
    );
    const sellerId =
      product.productSeller != null &&
      typeof product.productSeller === "object" &&
      product.productSeller._id != null
        ? String(product.productSeller._id)
        : product.productSeller != null
          ? String(product.productSeller)
          : "";
    const sellerRow = sellerRows.find((row) => String(row._id) === sellerId);
    const sellerClosedOpensAt =
      isSellerClosedNow && sellerRow
        ? resolveSellerScheduleOpensAtTime(
            {
              enabled: sellerRow.userBusinessHoursEnabled === true,
              weekdays: sellerRow.userBusinessHours?.weekdays,
              openTime: sellerRow.userBusinessHours?.openTime,
              closeTime: sellerRow.userBusinessHours?.closeTime,
            },
            sellerRow.userRegionCode,
          )
        : null;

    return {
      ...product,
      isSellerClosedNow,
      sellerClosedOpensAt,
    };
  });
};

/**
 * @param {Record<string, unknown>[]} products
 */
export const stripProductSellerClosedState = (products) =>
  products.map((product) => {
    if (product == null || typeof product !== "object") {
      return product;
    }
    const { isSellerClosedNow: _closed, sellerClosedOpensAt: _opensAt, ...rest } = product;
    return rest;
  });
