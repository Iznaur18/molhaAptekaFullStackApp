import { ProductModel } from "../../models/index.js";
import { mergeProductImageUrlsFromBody } from "../../utils/mergeProductImageUrlsFromBody.js";
import {
  hasProductOpenSales,
  OPEN_SALES_BLOCK_MESSAGE,
} from "../../utils/productOrderLocks.js";
import { errorRes, successRes } from "../../utils/index.js";

const SELLER_PUBLIC_FIELDS =
  "userName email userPhoneNumber _id userRatingByVotes";

/** `PATCH /product/:productId` — частичное обновление своего товара (не в заказе). */
export const patchMyProductController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (await hasProductOpenSales(productId)) {
      return errorRes(res, 409, OPEN_SALES_BLOCK_MESSAGE);
    }

    const body = req.body;
    const $set = {};

    if (Object.prototype.hasOwnProperty.call(body, "productName")) {
      $set.productName = String(body.productName).trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, "productDescription")) {
      $set.productDescription = String(body.productDescription).trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, "productPrice")) {
      $set.productPrice = body.productPrice;
    }
    if (Object.prototype.hasOwnProperty.call(body, "productCategory")) {
      $set.productCategory = String(body.productCategory).trim();
    }
    if (
      Object.prototype.hasOwnProperty.call(body, "productImageUrls") ||
      Object.prototype.hasOwnProperty.call(body, "productImageUrl")
    ) {
      $set.productImageUrls = mergeProductImageUrlsFromBody(body);
    }
    if (Object.prototype.hasOwnProperty.call(body, "productIsAvailable")) {
      $set.productIsAvailable = Boolean(body.productIsAvailable);
    }

    if (Object.keys($set).length === 0) {
      return errorRes(res, 400, "Нет полей для обновления");
    }

    const product = await ProductModel.findOneAndUpdate(
      { _id: productId, productSeller: userId },
      { $set },
      { new: true, runValidators: true },
    )
      .populate("productSeller", SELLER_PUBLIC_FIELDS)
      .lean();

    if (!product) {
      return errorRes(
        res,
        404,
        "Товар не найден или нет прав на изменение",
      );
    }

    return successRes(res, {
      message: "Товар обновлён",
      product,
    });
  } catch (error) {
    console.error(error);
    return errorRes(res, 500, "Ошибка при обновлении товара");
  }
};
