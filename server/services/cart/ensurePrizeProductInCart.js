import {
  CART_LINE_ITEM_QUANTITY_MIN,
  CART_MAX_DISTINCT_PRODUCTS,
} from "../../constants/cartConstants.js";
import { CartModel } from "../../models/index.js";
import { emitCartItemsAddedEvents } from "../analytics-events/index.js";
import {
  filterCartItemsToPurchasableProducts,
  normalizeStoredCartItems,
} from "./cartItemHelpers.js";
import { resolveCartUserId } from "./resolveCartUserId.js";

const CART_PRIZE_FAIL_UNAVAILABLE = "Приз получен, но товар недоступен для корзины";
const CART_PRIZE_FAIL_FULL = `Приз получен, но в корзине уже ${CART_MAX_DISTINCT_PRODUCTS} товаров`;
const CART_PRIZE_FAIL_GENERIC = "Приз получен, но не удалось добавить в корзину";

/**
 * Кладёт товар-приз в корзину (qty 1), если его ещё нет.
 * Выигрыш не трогает — при ошибке только сообщает.
 *
 * @param {{ userId: unknown; productId: unknown }} args
 * @returns {Promise<
 *   | { ok: true; alreadyInCart: boolean }
 *   | { ok: false; message: string }
 * >}
 */
export async function ensurePrizeProductInCart({ userId: rawUserId, productId }) {
  const userId = resolveCartUserId(rawUserId);
  const id = productId != null ? String(productId).trim() : "";
  if (!userId || !id) {
    return { ok: false, message: CART_PRIZE_FAIL_GENERIC };
  }

  try {
    const doc = await CartModel.findOne({ userId }).lean();
    const items = normalizeStoredCartItems(
      doc?.items && typeof doc.items === "object" && !Array.isArray(doc.items)
        ? doc.items
        : {},
    );

    if (items[id] != null) {
      return { ok: true, alreadyInCart: true };
    }

    if (Object.keys(items).length >= CART_MAX_DISTINCT_PRODUCTS) {
      return { ok: false, message: CART_PRIZE_FAIL_FULL };
    }

    const nextItems = {
      ...items,
      [id]: CART_LINE_ITEM_QUANTITY_MIN,
    };
    const purchasable = await filterCartItemsToPurchasableProducts(nextItems, userId);
    if (purchasable[id] == null) {
      return { ok: false, message: CART_PRIZE_FAIL_UNAVAILABLE };
    }

    await CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: purchasable } },
      { upsert: true },
    );
    emitCartItemsAddedEvents({ userId: String(userId), productIds: [id] });
    return { ok: true, alreadyInCart: false };
  } catch {
    return { ok: false, message: CART_PRIZE_FAIL_GENERIC };
  }
}
