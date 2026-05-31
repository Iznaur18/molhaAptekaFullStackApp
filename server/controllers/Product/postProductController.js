import { ProductModel, UserModel } from "../../models/index.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import {
    PRODUCT_MODERATION_APPROVED,
    PRODUCT_MODERATION_PENDING,
} from "../../constants/productModerationConstants.js";
import { attachProductSellerSnapshot } from "../../utils/attachProductSellerSnapshots.js";
import { isUserAdmin } from "../../utils/adminUserGuard.js";
import { mergeProductImageUrlsFromBody } from "../../utils/mergeProductImageUrlsFromBody.js";
import {
    assertProductPreviewVideoRequiresPhotos,
    normalizeProductPreviewVideoUrl,
} from "../../utils/productPreviewVideo.js";
import { assertSellerCanCreateProduct } from "../../utils/sellerProductsLimit.js";
import { notifyFollowersOfSellerNewCatalogProduct } from "../../utils/userFollowHelpers.js";
import { notifyFollowersOfSellerProductDiscount } from "../../utils/productDiscount.js";
import { resolveProductStockQuantityForWrite } from "../../utils/productStock.js";
import {
    assertProductOldPricePair,
    normalizeProductOldPriceRub,
    normalizeProductPriceRub,
} from "../../utils/productDiscount.js";
import { errorRes, successRes } from "../../utils/index.js";

export const postProductController = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      productName,
      productDescription,
      productPrice: rawProductPrice,
      productCategory,
      productIsAvailable,
      productAuctionEnabled,
    } = req.body;

    let productPrice;
    let productOldPrice;
    try {
      productPrice = normalizeProductPriceRub(rawProductPrice);
      productOldPrice = normalizeProductOldPriceRub(req.body?.productOldPrice);
      assertProductOldPricePair(productOldPrice, productPrice);
    } catch (priceError) {
      return errorRes(
        res,
        400,
        priceError instanceof Error ? priceError.message : "Некорректная цена",
      );
    }

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
    const productPreviewVideoUrl = normalizeProductPreviewVideoUrl(
        req.body?.productPreviewVideoUrl,
    );
    try {
        assertProductPreviewVideoRequiresPhotos(
            productPreviewVideoUrl,
            productImageUrls,
        );
    } catch (previewVideoError) {
        return errorRes(
            res,
            400,
            previewVideoError instanceof Error
                ? previewVideoError.message
                : "Некорректное превью-видео",
        );
    }
    const productModerationStatus = isAdmin
      ? PRODUCT_MODERATION_APPROVED
      : PRODUCT_MODERATION_PENDING;
    const wantsStockListed = productIsAvailable === true;
    let productStockQuantity;
    try {
      productStockQuantity = resolveProductStockQuantityForWrite(
        wantsStockListed,
        req.body.productStockQuantity,
      );
    } catch (stockError) {
      return errorRes(
        res,
        400,
        stockError instanceof Error
          ? stockError.message
          : "Некорректное количество в наличии",
      );
    }

    const visibleInCatalog = isAdmin && productStockQuantity > 0;

    const product = await ProductModel.create({
      productName,
      productDescription,
      productImageUrls,
      productPreviewVideoUrl,
      productPrice,
      productOldPrice,
      productSeller: userId,
      productCategory,
      productIsAvailable: visibleInCatalog,
      productStockQuantity,
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
      try {
        await notifyFollowersOfSellerProductDiscount(productPayload, null);
      } catch (notifyError) {
        console.error(
          "notifyFollowersOfSellerProductDiscount error:",
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
