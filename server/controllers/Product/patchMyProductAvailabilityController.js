import { ProductModel } from "../../models/index.js";
import { errorRes, successRes } from "../../utils/index.js";

const SELLER_PUBLIC_FIELDS =
  "userName email userPhoneNumber _id userRatingByVotes";

/** `PATCH /product/:productId` — смена productIsAvailable (только владелец). */
export const patchMyProductAvailabilityController = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { productIsAvailable } = req.body;

    const product = await ProductModel.findOneAndUpdate(
      { _id: productId, productSeller: userId },
      { $set: { productIsAvailable } },
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
      message: "Доступность товара обновлена",
      product,
    });
  } catch (error) {
    console.error(error);
    return errorRes(res, 500, "Ошибка при обновлении доступности товара");
  }
};
