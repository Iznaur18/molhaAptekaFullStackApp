import { OrderModel } from "../../models/index.js";

import {
  isProductViewableForProfile,
  PURCHASE_PRODUCT_PUBLIC_SELECT,
} from "../product/isProductViewableForProfile.js";
import { resolveOrderLineItemProductName } from "../order/orderLineItemDisplay.js";
import { attachSoldQuantityToPurchaseItems } from "../../utils/productSoldQuantity.js";

export const USER_RECENT_PURCHASES_LIMIT = 5;

/**
 * @param {unknown} productRef
 */
const resolveProductPayload = (productRef) => {
  if (productRef != null && typeof productRef === "object" && productRef._id != null) {
    return productRef;
  }
  return null;
};

/**
 * @param {import('mongoose').Types.ObjectId | string} userId
 * @param {number} [limit]
 */
export const getUserRecentUniquePurchases = async (
  userId,
  limit = USER_RECENT_PURCHASES_LIMIT,
) => {
  const orders = await OrderModel.find({ userBuyerId: userId })
    .sort({ createdAt: -1 })
    .select("items")
    .populate({
      path: "items.productId",
      select: PURCHASE_PRODUCT_PUBLIC_SELECT,
      populate: { path: "productSeller", select: "userName _id" },
    })
    .lean();

  const seen = new Set();
  /** @type {{ productId: string; productName: string; viewable: boolean; product: Record<string, unknown> | null }[]} */
  const items = [];

  for (const order of orders) {
    const lineItems = Array.isArray(order.items) ? order.items : [];
    for (const line of lineItems) {
      const rawRef = line?.productId;
      const productId =
        rawRef != null && typeof rawRef === "object" && rawRef._id != null
          ? String(rawRef._id)
          : rawRef != null
            ? String(rawRef)
            : null;
      if (!productId || seen.has(productId)) {
        continue;
      }
      seen.add(productId);
      const productPayload = resolveProductPayload(rawRef);
      items.push({
        productId,
        productName: resolveOrderLineItemProductName(line),
        viewable: isProductViewableForProfile(productPayload),
        product: productPayload,
      });
      if (items.length >= limit) {
        return attachSoldQuantityToPurchaseItems(items);
      }
    }
  }

  return attachSoldQuantityToPurchaseItems(items);
};
