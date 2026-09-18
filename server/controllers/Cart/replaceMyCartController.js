import { CartModel } from "../../models/index.js";
import { emitCartItemsAddedEvents } from "../../services/analytics-events/index.js";
import { errorRes, successRes } from "../../services/http/index.js";

import {
  filterCartItemsToPurchasableProducts,
  parseReplaceCartBodyItems,
} from "./cartItemHelpers.js";
import { resolveCartUserId } from "./resolveCartUserId.js";

/** `PUT /cart` — полная замена корзины; в ответе только доступные товары. */
export const replaceMyCartController = async (req, res) => {
  const userId = resolveCartUserId(req.userId);
  if (!userId) {
    return errorRes(res, 401, "Не авторизован");
  }
  const parsed = parseReplaceCartBodyItems(req.body?.items);
  if (!parsed.ok) {
    return errorRes(res, 400, parsed.message);
  }

  const purchasable = await filterCartItemsToPurchasableProducts(parsed.items, userId);

  const previous = await CartModel.findOneAndUpdate(
    { userId },
    { $set: { items: purchasable } },
    { upsert: true, returnDocument: "before", lean: true },
  );

  const previousIds = new Set(Object.keys(previous?.items ?? {}));
  const addedIds = Object.keys(purchasable).filter((id) => !previousIds.has(id));
  if (addedIds.length > 0) {
    emitCartItemsAddedEvents({ userId: String(userId), productIds: addedIds });
  }

  return successRes(res, { items: purchasable });
};
