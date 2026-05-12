import { ProductModel, UserModel } from "../../models/index.js";
import { mergeProductImageUrlsFromBody } from "../../utils/mergeProductImageUrlsFromBody.js";
import { errorRes, successRes } from "../../utils/index.js";

export const postProductController = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      productName,
      productDescription,
      productPrice,
      productCategory,
      productIsAvailable,
    } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      return errorRes(res, 404, "Пользователь не найден");
    }

    const productImageUrls = mergeProductImageUrlsFromBody(req.body);

    const product = await ProductModel.create({
      productName,
      productDescription,
      productImageUrls,
      productPrice,
      productSeller: userId,
      productCategory,
      productIsAvailable,
    });

    await product.populate("productSeller", "userName _id");

    return successRes(res, { message: "Продукт успешно создан", product }, 201);
  } catch (error) {
    console.error(error);
    return errorRes(res, 500, "Ошибка при создании продукта");
  }
};
