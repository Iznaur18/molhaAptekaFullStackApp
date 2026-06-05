import { CartModel } from "../../models/index.js";
import { errorRes, successRes } from "../../utils/index.js";

import {
  filterCartItemsToPurchasableProducts,
  parseReplaceCartBodyItems,
} from "./cartItemHelpers.js";
import { resolveCartUserId } from "./resolveCartUserId.js";

/** `PUT /cart` — полная замена корзины; в ответе только доступные товары. */
export const replaceMyCartController = async (req, res) => {
  try {
    const userId = resolveCartUserId(req.userId);
    if (!userId) {
      return errorRes(res, 401, "Не авторизован");
    }
    const parsed = parseReplaceCartBodyItems(req.body?.items);
    if (!parsed.ok) {
      return errorRes(res, 400, parsed.message);
    }

    const purchasable = await filterCartItemsToPurchasableProducts(parsed.items);

    await CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: purchasable } },
      { upsert: true, returnDocument: "after" },
    );

    return successRes(res, { items: purchasable });
  } catch (error) {
    console.error("replaceMyCartController error:", error);
    return errorRes(res, 500, "Не удалось сохранить корзину");
  }
};
