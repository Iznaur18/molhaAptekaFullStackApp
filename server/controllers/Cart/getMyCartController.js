import { CartModel } from "../../models/index.js";
import { errorRes, successRes } from "../../utils/index.js";

import {
  filterCartItemsToPurchasableProducts,
  normalizeStoredCartItems,
} from "./cartItemHelpers.js";
import { resolveCartUserId } from "./resolveCartUserId.js";

/** `GET /cart` — корзина текущего пользователя; недоступные позиции выкидываются и сохраняются. */
export const getMyCartController = async (req, res) => {
  try {
    const userId = resolveCartUserId(req.userId);
    if (!userId) {
      return errorRes(res, 401, "Не авторизован");
    }
    const doc = await CartModel.findOne({ userId }).lean();
    const rawItems =
      doc?.items && typeof doc.items === "object" && !Array.isArray(doc.items)
        ? doc.items
        : {};
    const normalized = normalizeStoredCartItems(rawItems);
    const purchasable = await filterCartItemsToPurchasableProducts(normalized);

    if (!doc && Object.keys(purchasable).length === 0) {
      return successRes(res, { items: {} });
    }

    await CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: purchasable } },
      { upsert: true, returnDocument: "after" },
    );

    return successRes(res, { items: purchasable });
  } catch (error) {
    console.error("getMyCartController error:", error);
    return errorRes(res, 500, "Не удалось загрузить корзину");
  }
};
