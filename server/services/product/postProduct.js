import { ProductModel, UserModel } from "../../models/index.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
} from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import { attachProductSellerSnapshot } from "./attachProductSellerSnapshots.js";
import { isUserAdmin } from "../access/adminUserGuard.js";
import { mergeProductImageUrlsFromBody } from "./mergeProductImageUrlsFromBody.js";
import {
  assertProductPreviewVideoRequiresPhotos,
  normalizeProductPreviewVideoUrl,
} from "./productPreviewVideo.js";
import { assertSellerCanCreateProduct } from "./sellerProductsLimit.js";
import { notifyFollowersOfSellerNewCatalogProduct } from "../user/userFollowHelpers.js";
import { notifyFollowersOfSellerProductDiscount } from "./productDiscount.js";
import { resolveProductStockQuantityForWrite } from "./productStock.js";
import {
  assertProductOldPricePair,
  normalizeProductOldPriceRub,
  normalizeProductPriceRub,
} from "./productDiscount.js";
import { assertSellerCanSetProductLoyaltyPointsPerUnit } from "./assertProductLoyaltyPointsPerUnit.js";
import { normalizeProductCharacteristics } from "./normalizeProductCharacteristics.js";
import { resolveProductReturnWriteFromBody } from "./normalizeProductReturnTerms.js";
import { normalizeProductListingOrigin } from "./normalizeProductListingOrigin.js";
import { normalizeProductIsOriginal } from "./normalizeProductIsOriginal.js";
import { PRODUCT_PRICE_MARKET_STATUS_DEFAULT } from "../../constants/productPriceMarketStatusConstants.js";
import { refreshProductPriceMarketStatus } from "./refreshProductPriceMarketStatus.js";
import { buildProductSearchBlobFromFields } from "./buildProductSearchBlob.js";
import { resolveProductCategoryWriteFromBody } from "./resolveProductCategoryWrite.js";
import { resolveActiveSellerPersonalCategoryId } from "../seller-personal-category/sellerPersonalCategoryHelpers.js";
import { applyProductSaleCityFields } from "./ruCityNormalized.js";
import { resolveCreateProductPickupFields } from "./productPickup.js";
import { logServerEvent } from "../../utils/logServerEvent.js";

const throwFieldError = (error, fallback) => {
  throw new AppError(400, error instanceof Error ? error.message : fallback);
};

const resolveCreatePrices = (body) => {
  try {
    const productPrice = normalizeProductPriceRub(body.productPrice);
    const productOldPrice = normalizeProductOldPriceRub(body?.productOldPrice);
    assertProductOldPricePair(productOldPrice, productPrice);
    return { productPrice, productOldPrice };
  } catch (priceError) {
    throwFieldError(priceError, "Некорректная цена");
  }
};

const resolveCreateStock = (body, productIsAvailable) => {
  try {
    return resolveProductStockQuantityForWrite(
      productIsAvailable === true,
      body.productStockQuantity,
    );
  } catch (stockError) {
    throwFieldError(stockError, "Некорректное количество в наличии");
  }
};

const resolveCreateLoyaltyPoints = async (userId, body) => {
  try {
    return await assertSellerCanSetProductLoyaltyPointsPerUnit(
      String(userId),
      body?.loyaltyPointsPerUnit,
    );
  } catch (loyaltyError) {
    throwFieldError(loyaltyError, "Некорректное количество баллов за покупку");
  }
};

const resolveCreateCharacteristics = (body) => {
  try {
    return normalizeProductCharacteristics(body?.productCharacteristics);
  } catch (characteristicsError) {
    throwFieldError(characteristicsError, "Некорректные характеристики товара");
  }
};

const resolveCreateReturnPolicy = (body) => {
  try {
    return resolveProductReturnWriteFromBody(body);
  } catch (returnError) {
    throwFieldError(returnError, "Некорректные условия возврата");
  }
};

const resolveCreateCategory = async (body) => {
  try {
    return await resolveProductCategoryWriteFromBody(body);
  } catch (categoryError) {
    throwFieldError(categoryError, "Некорректная категория товара");
  }
};

const resolveCreateSaleCity = (body) => {
  try {
    return applyProductSaleCityFields(body?.productSaleCity);
  } catch (saleCityError) {
    throwFieldError(saleCityError, "Некорректный город продажи");
  }
};

const resolveCreateRegionCode = (body) => {
  const code = String(body?.productRegionCode ?? "").trim();
  if (!code) {
    throwFieldError(new Error("required"), "Укажите регион продажи");
  }
  return code;
};

const resolvePreviewVideo = (body, productImageUrls) => {
  const productPreviewVideoUrl = normalizeProductPreviewVideoUrl(
    body?.productPreviewVideoUrl,
  );
  try {
    assertProductPreviewVideoRequiresPhotos(productPreviewVideoUrl, productImageUrls);
  } catch (previewVideoError) {
    throwFieldError(previewVideoError, "Некорректное превью-видео");
  }
  return productPreviewVideoUrl;
};

const notifyApprovedProductFollowers = async (productPayload) => {
  try {
    await notifyFollowersOfSellerNewCatalogProduct(productPayload);
  } catch (notifyError) {
    logServerEvent("error", {
      event: "notifyfollowersofsellernewcatalogproduct",
      error: notifyError instanceof Error ? notifyError.message : String(notifyError),
    });
  }

  try {
    await notifyFollowersOfSellerProductDiscount(productPayload, null);
  } catch (notifyError) {
    logServerEvent("error", {
      event: "notifyfollowersofsellerproductdiscount",
      error: notifyError instanceof Error ? notifyError.message : String(notifyError),
    });
  }
};

/**
 * @param {{
 *   userId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function postProduct({ userId, body }) {
  const { productName, productDescription, productIsAvailable, productAuctionEnabled } =
    body;

  const { productPrice, productOldPrice } = resolveCreatePrices(body);

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    const limitCheck = await assertSellerCanCreateProduct(userId, user);
    if (!limitCheck.ok) {
      throw new AppError(403, limitCheck.message);
    }
  }

  const productImageUrls = mergeProductImageUrlsFromBody(body);
  const productPreviewVideoUrl = resolvePreviewVideo(body, productImageUrls);

  const productModerationStatus = isAdmin
    ? PRODUCT_MODERATION_APPROVED
    : PRODUCT_MODERATION_PENDING;

  const productStockQuantity = resolveCreateStock(body, productIsAvailable);
  const visibleInCatalog = isAdmin && productStockQuantity > 0;

  const loyaltyPointsPerUnit = await resolveCreateLoyaltyPoints(userId, body);
  const productCharacteristics = resolveCreateCharacteristics(body);
  const { productReturnEnabled, productReturnTerms } = resolveCreateReturnPolicy(body);
  const productListingOrigin = normalizeProductListingOrigin(
    body.productListingOrigin,
    {
      required: true,
    },
  );
  const productIsOriginal = normalizeProductIsOriginal(body.productIsOriginal, {
    required: true,
  });
  const categoryWrite = await resolveCreateCategory(body);

  const productSearchBlob = buildProductSearchBlobFromFields({
    productName,
    productDescription,
    productCharacteristics,
    productCategory: categoryWrite.productCategory,
    categoryBreadcrumbRu: categoryWrite.categoryBreadcrumbRu,
    categoryPathLabelRu: categoryWrite.categoryPathLabelRu,
    categorySearchKeywords: categoryWrite.categorySearchKeywords,
  });

  const sellerPersonalCategoryId =
    productModerationStatus === PRODUCT_MODERATION_APPROVED
      ? await resolveActiveSellerPersonalCategoryId(userId)
      : null;

  const { productSaleCity, productSaleCityNormalized } = resolveCreateSaleCity({});
  const productRegionCode = resolveCreateRegionCode(body);
  const pickupFields = resolveCreateProductPickupFields(body);

  const product = await ProductModel.create({
    productName,
    productDescription,
    productSearchBlob,
    productImageUrls,
    productPreviewVideoUrl,
    productPrice,
    productOldPrice,
    productSeller: userId,
    productSaleCity,
    productSaleCityNormalized,
    productRegionCode,
    ...pickupFields,
    productCategory: categoryWrite.productCategory,
    productCategoryId: categoryWrite.productCategoryId,
    categoryPathIds: categoryWrite.categoryPathIds,
    categoryBreadcrumbRu: categoryWrite.categoryBreadcrumbRu,
    sellerPersonalCategoryId,
    productIsAvailable: visibleInCatalog,
    productStockQuantity,
    productAuctionEnabled: productAuctionEnabled === true,
    productAuctionCompletedOnce: false,
    productModerationStatus,
    productModerationComment: "",
    loyaltyPointsPerUnit,
    productCharacteristics,
    productListingOrigin,
    productIsOriginal,
    productPriceMarketStatus: PRODUCT_PRICE_MARKET_STATUS_DEFAULT,
    productReturnEnabled,
    productReturnTerms,
  });

  await product.populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT);
  let productPayload = await attachProductSellerSnapshot(product.toObject());

  if (productModerationStatus === PRODUCT_MODERATION_APPROVED) {
    await notifyApprovedProductFollowers(productPayload);
    try {
      const marketStatus = await refreshProductPriceMarketStatus(String(product._id), {
        refreshPeers: true,
      });
      productPayload = { ...productPayload, productPriceMarketStatus: marketStatus };
    } catch (error) {
      logServerEvent("error", {
        event: "refreshproductpricemarketstatus_after_create",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    message: "Продукт успешно создан",
    product: productPayload,
  };
}
