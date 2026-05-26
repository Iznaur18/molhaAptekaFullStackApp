import { ProductModel, UserModel } from "../../models/index.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import {
    PRODUCT_MODERATION_APPROVED,
    PRODUCT_MODERATION_PENDING,
} from "../../constants/productModerationConstants.js";
import { attachProductSellerSnapshot } from "../../utils/attachProductSellerSnapshots.js";
import { isUserAdmin } from "../../utils/adminUserGuard.js";
import { mergeProductImageUrlsFromBody } from "../../utils/mergeProductImageUrlsFromBody.js";
import { assertSellerCanCreateProduct } from "../../utils/sellerProductsLimit.js";
import { notifyFollowersOfSellerNewCatalogProduct } from "../../utils/userFollowHelpers.js";
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
      productAuctionEnabled,
    } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      return errorRes(res, 404, "Пользователь не найден");
    }

    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      const limitCheck = await assertSellerCanCreateProduct(userId, user);
      if (!limitCheck.ok) {
        return errorRes(res, 403, limitCheck.message);
      }
    }

    const productImageUrls = mergeProductImageUrlsFromBody(req.body);
    const productModerationStatus = isAdmin
      ? PRODUCT_MODERATION_APPROVED
      : PRODUCT_MODERATION_PENDING;
    const listedInCatalog = isAdmin
      ? productIsAvailable !== false
      : false;

    const product = await ProductModel.create({
      productName,
      productDescription,
      productImageUrls,
      productPrice,
      productSeller: userId,
      productCategory,
      productIsAvailable: listedInCatalog,
      productAuctionEnabled: productAuctionEnabled === true,
      productAuctionCompletedOnce: false,
      productModerationStatus,
      productModerationComment: "",
    });

    await product.populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT);
    const productPayload = await attachProductSellerSnapshot(product.toObject());

    if (productModerationStatus === PRODUCT_MODERATION_APPROVED) {
      try {
        await notifyFollowersOfSellerNewCatalogProduct(productPayload);
      } catch (notifyError) {
        console.error(
          "notifyFollowersOfSellerNewCatalogProduct error:",
          notifyError,
        );
      }
    }

    return successRes(
        res,
        { message: "Продукт успешно создан", product: productPayload },
        201,
    );
  } catch (error) {
    console.error(error);
    return errorRes(res, 500, "Ошибка при создании продукта");
  }
};
