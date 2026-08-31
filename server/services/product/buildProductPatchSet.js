import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
} from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import { mergeProductImageUrlsFromBody } from "./mergeProductImageUrlsFromBody.js";
import { deleteUploadFileByUrl } from "../upload/deleteUploadFileByUrl.js";
import {
  assertProductPreviewVideoRequiresPhotos,
  normalizeProductPreviewVideoUrl,
} from "./productPreviewVideo.js";
import { patchBodyTouchesModerationContent } from "./productModeration.js";
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
import { normalizeProductOutOfStock } from "./normalizeProductOutOfStock.js";
import { normalizeProductOutOfStockLabel } from "./normalizeProductOutOfStockLabel.js";
import { resolveProductCategoryWriteFromBody } from "./resolveProductCategoryWrite.js";
import { normalizeProductSaleCity } from "./productSaleCity.js";
import { resolveProductSaleCityNormalized } from "./ruCityNormalized.js";
import { assertProductStockPatchAllowed } from "./productStock.js";
import {
  assertProductFulfillmentMethods,
  resolveProductDeliveryEnabledForWrite,
  resolveProductPickupEnabledForWrite,
} from "./productPickup.js";
import {
  mergeLegacyPickupIntoExistingLocations,
  resolveProductPickupWriteFields,
} from "./productPickupLocations.js";

import {
  CATALOG_VISIBILITY_BLOCK_MESSAGE,
  EMPTY_PATCH_BODY_MESSAGE,
} from "./patchMyProductConstants.js";
import { applyWholesaleFields } from "./applyWholesaleFields.js";
import { applyBuyNFreeFields } from "./applyBuyNFreeFields.js";
import { applyFlashSaleFields } from "./applyFlashSaleFields.js";
import { applyRentalFields } from "./applyRentalFields.js";
import { PRODUCT_FLASH_SALE_ACTIVE_PRICE_LOCKED_MESSAGE } from "@molha/api-contract";
import {
  AFFILIATE_PERCENT_MAX,
  AFFILIATE_PERCENT_MIN,
  AFFILIATE_PERCENT_REQUIRED_MESSAGE,
} from "../../constants/affiliateConstants.js";
import { assertSellerCanEnableAffiliate } from "./assertSellerCanEnableAffiliate.js";

const hasBodyField = (body, field) => Object.prototype.hasOwnProperty.call(body, field);

const hasSetField = ($set, field) => Object.prototype.hasOwnProperty.call($set, field);

const throwFieldError = (error, fallback) => {
  throw new AppError(400, error instanceof Error ? error.message : fallback);
};

const applyTextFields = (body, $set) => {
  if (hasBodyField(body, "productName")) {
    $set.productName = String(body.productName).trim();
  }
  if (hasBodyField(body, "productDescription")) {
    $set.productDescription = String(body.productDescription).trim();
  }
};

const applyCharacteristicsField = (body, $set) => {
  if (!hasBodyField(body, "productCharacteristics")) {
    return;
  }
  try {
    $set.productCharacteristics = normalizeProductCharacteristics(
      body.productCharacteristics,
    );
  } catch (error) {
    throwFieldError(error, "Некорректные характеристики товара");
  }
};

const applyReturnPolicyFields = (body, $set, existing) => {
  if (
    !hasBodyField(body, "productReturnEnabled") &&
    !hasBodyField(body, "productReturnTerms")
  ) {
    return;
  }

  try {
    const next = resolveProductReturnWriteFromBody({
      productReturnEnabled: hasBodyField(body, "productReturnEnabled")
        ? body.productReturnEnabled
        : existing.productReturnEnabled === true,
      productReturnTerms: hasBodyField(body, "productReturnTerms")
        ? body.productReturnTerms
        : existing.productReturnTerms,
    });
    $set.productReturnEnabled = next.productReturnEnabled;
    $set.productReturnTerms = next.productReturnTerms;
  } catch (error) {
    throwFieldError(error, "Некорректные условия возврата");
  }
};

const applyListingOriginField = (body, $set) => {
  if (!hasBodyField(body, "productListingOrigin")) {
    return;
  }

  try {
    $set.productListingOrigin = normalizeProductListingOrigin(
      body.productListingOrigin,
      {
        required: true,
      },
    );
  } catch (error) {
    throwFieldError(error, "Некорректный статус товара");
  }
};

const applyIsOriginalField = (body, $set) => {
  if (!hasBodyField(body, "productIsOriginal")) {
    return;
  }

  try {
    $set.productIsOriginal = normalizeProductIsOriginal(body.productIsOriginal, {
      required: true,
    });
  } catch (error) {
    throwFieldError(error, "Некорректный признак оригинала");
  }
};

const applyOutOfStockField = (body, $set) => {
  if (!hasBodyField(body, "productOutOfStock")) {
    return;
  }

  try {
    const normalized = normalizeProductOutOfStock(body.productOutOfStock);
    if (normalized !== undefined) {
      $set.productOutOfStock = normalized;
    }
  } catch (error) {
    throwFieldError(error, "Некорректный признак «Нет в наличии»");
  }
};

const applyOutOfStockLabelField = (body, $set) => {
  if (!hasBodyField(body, "productOutOfStockLabel")) {
    return;
  }

  try {
    const normalized = normalizeProductOutOfStockLabel(body.productOutOfStockLabel);
    if (normalized !== undefined) {
      $set.productOutOfStockLabel = normalized;
    }
  } catch (error) {
    throwFieldError(error, "Некорректная надпись для карточки «нет в наличии»");
  }
};

const applyPriceFields = (body, $set, existing) => {
  const touchesFlashSale =
    hasBodyField(body, "productFlashSaleEnabled") ||
    hasBodyField(body, "productFlashSalePrice") ||
    hasBodyField(body, "productFlashSaleDurationValue") ||
    hasBodyField(body, "productFlashSaleDurationUnit");

  if (
    existing.productFlashSaleEnabled === true &&
    !touchesFlashSale &&
    (hasBodyField(body, "productPrice") || hasBodyField(body, "productOldPrice"))
  ) {
    throw new AppError(400, PRODUCT_FLASH_SALE_ACTIVE_PRICE_LOCKED_MESSAGE);
  }

  if (hasBodyField(body, "productPrice")) {
    try {
      $set.productPrice = normalizeProductPriceRub(body.productPrice);
    } catch (error) {
      throwFieldError(error, "Некорректная цена");
    }
  }
  if (hasBodyField(body, "productOldPrice")) {
    try {
      $set.productOldPrice = normalizeProductOldPriceRub(body.productOldPrice);
    } catch (error) {
      throwFieldError(error, "Некорректная старая цена");
    }
  }

  if (!hasSetField($set, "productPrice") && !hasSetField($set, "productOldPrice")) {
    return;
  }

  try {
    const nextPrice = hasSetField($set, "productPrice")
      ? $set.productPrice
      : Math.floor(Number(existing.productPrice));
    const nextOldPrice = hasSetField($set, "productOldPrice")
      ? $set.productOldPrice
      : existing.productOldPrice == null
        ? null
        : Math.floor(Number(existing.productOldPrice));
    assertProductOldPricePair(nextOldPrice, nextPrice);
  } catch (error) {
    throwFieldError(error, "Некорректная цена");
  }
};

const applySaleCityField = (body, $set) => {
  if (!hasBodyField(body, "productSaleCity")) {
    return;
  }
  try {
    $set.productSaleCity = normalizeProductSaleCity(body.productSaleCity);
    $set.productSaleCityNormalized = resolveProductSaleCityNormalized(
      $set.productSaleCity,
    );
  } catch (error) {
    throwFieldError(error, "Некорректный город продажи");
  }
};

const applyPickupFields = async (body, $set, $unset, existing) => {
  const touchesLocations = hasBodyField(body, "productPickupLocations");
  const touchesAddress = hasBodyField(body, "productPickupAddress");
  const touchesLat = hasBodyField(body, "productPickupLat");
  const touchesLon = hasBodyField(body, "productPickupLon");
  const touchesDelivery = hasBodyField(body, "productDeliveryEnabled");
  const touchesCourier = hasBodyField(body, "productCourierDeliveryEnabled");
  const touchesPickupEnabled = hasBodyField(body, "productPickupEnabled");

  if (
    !touchesLocations &&
    !touchesAddress &&
    !touchesLat &&
    !touchesLon &&
    !touchesDelivery &&
    !touchesCourier &&
    !touchesPickupEnabled
  ) {
    return;
  }

  try {
    if (touchesDelivery) {
      $set.productDeliveryEnabled = resolveProductDeliveryEnabledForWrite(
        body.productDeliveryEnabled,
      );
    }

    if (touchesCourier) {
      $set.productCourierDeliveryEnabled =
        body.productCourierDeliveryEnabled === true;
    }

    if (touchesPickupEnabled) {
      $set.productPickupEnabled = resolveProductPickupEnabledForWrite(
        body.productPickupEnabled,
      );
    }

    const nextPickupEnabled = Object.prototype.hasOwnProperty.call(
      $set,
      "productPickupEnabled",
    )
      ? $set.productPickupEnabled
      : existing.productPickupEnabled !== false;
    const nextDeliveryEnabled = Object.prototype.hasOwnProperty.call(
      $set,
      "productDeliveryEnabled",
    )
      ? $set.productDeliveryEnabled === true
      : existing.productDeliveryEnabled === true;

    if (touchesDelivery || touchesPickupEnabled) {
      assertProductFulfillmentMethods(nextPickupEnabled, nextDeliveryEnabled);
    }

    if (!touchesLocations && !touchesAddress && !touchesLat && !touchesLon) {
      return;
    }

    const writeBody = touchesLocations
      ? body
      : {
          productPickupAddress: touchesAddress
            ? body.productPickupAddress
            : existing.productPickupAddress,
          productPickupLat: touchesLat
            ? body.productPickupLat
            : existing.productPickupLat,
          productPickupLon: touchesLon
            ? body.productPickupLon
            : existing.productPickupLon,
          productRegionCode: hasBodyField(body, "productRegionCode")
            ? body.productRegionCode
            : existing.productRegionCode,
        };

    if (!touchesLocations) {
      const prevAddress = String(existing.productPickupAddress ?? "").trim();
      const prevLat = existing.productPickupLat;
      const prevLon = existing.productPickupLon;
      const sameLocation =
        String(writeBody.productPickupAddress ?? "").trim() === prevAddress &&
        Number(writeBody.productPickupLat) === Number(prevLat) &&
        Number(writeBody.productPickupLon) === Number(prevLon) &&
        prevLat != null &&
        prevLon != null;

      if (sameLocation) {
        return;
      }

      // Legacy-клиент (мобилка) правит адрес, не зная про мультиточки:
      // без слияния resolveProductPickupWriteFields пересобрал бы массив из
      // одного адреса и молча стёр остальные точки продавца.
      const mergedLocations = mergeLegacyPickupIntoExistingLocations(existing, {
        address: writeBody.productPickupAddress,
        lat: writeBody.productPickupLat,
        lon: writeBody.productPickupLon,
      });
      if (mergedLocations) {
        writeBody.productPickupLocations = mergedLocations;
      }
    }

    const salePickup = await resolveProductPickupWriteFields(writeBody, {
      fallbackRegionCode: hasBodyField(body, "productRegionCode")
        ? body.productRegionCode
        : existing.productRegionCode,
    });

    $set.productPickupLocations = salePickup.productPickupLocations;
    $set.productPickupAddress = salePickup.productPickupAddress;
    $set.productPickupLat = salePickup.productPickupLat;
    $set.productPickupLon = salePickup.productPickupLon;
    $set.productRegionCode = salePickup.productRegionCode;
    if (salePickup.productPickupLocation) {
      $set.productPickupLocation = salePickup.productPickupLocation;
      delete $unset.productPickupLocation;
    } else {
      delete $set.productPickupLocation;
      $unset.productPickupLocation = 1;
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throwFieldError(error, "Некорректный адрес продажи");
  }
};

const applyCategoryFields = async (body, $set, existing) => {
  if (
    !hasBodyField(body, "productCategoryId") &&
    !hasBodyField(body, "productCategory")
  ) {
    return;
  }
  try {
    const categoryWrite = await resolveProductCategoryWriteFromBody({
      productCategoryId: body.productCategoryId,
      productCategory: body.productCategory ?? existing.productCategory,
    });
    $set.productCategoryId = categoryWrite.productCategoryId;
    $set.categoryPathIds = categoryWrite.categoryPathIds;
    $set.categoryBreadcrumbRu = categoryWrite.categoryBreadcrumbRu;
    $set.productCategory = categoryWrite.productCategory;
  } catch (error) {
    throwFieldError(error, "Некорректная категория товара");
  }
};

const applyLoyaltyField = async (body, $set, existing, productId) => {
  if (!hasBodyField(body, "loyaltyPointsPerUnit")) {
    return;
  }
  try {
    $set.loyaltyPointsPerUnit = await assertSellerCanSetProductLoyaltyPointsPerUnit(
      String(existing.productSeller),
      body.loyaltyPointsPerUnit,
      { excludeProductId: String(productId) },
    );
  } catch (error) {
    throwFieldError(error, "Некорректное количество баллов за покупку");
  }
};

const applyAffiliateFields = async (body, $set, existing) => {
  const hasEnabled = hasBodyField(body, "affiliateEnabled");
  const hasPercent = hasBodyField(body, "affiliatePercent");
  if (!hasEnabled && !hasPercent) {
    return;
  }

  const wasEnabled = existing.affiliateEnabled === true;
  const nextEnabled = hasEnabled ? body.affiliateEnabled === true : wasEnabled;
  let nextPercent = hasPercent
    ? Math.floor(Number(body.affiliatePercent) || 0)
    : Math.floor(Number(existing.affiliatePercent) || 0);

  if (!Number.isFinite(nextPercent) || nextPercent < 0) {
    nextPercent = 0;
  }
  if (nextPercent > AFFILIATE_PERCENT_MAX) {
    nextPercent = AFFILIATE_PERCENT_MAX;
  }

  if (nextEnabled && nextPercent < AFFILIATE_PERCENT_MIN) {
    throw new AppError(400, AFFILIATE_PERCENT_REQUIRED_MESSAGE);
  }

  if (!nextEnabled) {
    nextPercent = hasPercent ? nextPercent : 0;
  }

  // Только при включении (false→true). Уже включённые с дырой в балансе не трогаем.
  if (nextEnabled && !wasEnabled) {
    const productPrice = hasSetField($set, "productPrice")
      ? $set.productPrice
      : existing.productPrice;
    await assertSellerCanEnableAffiliate({
      sellerId: String(existing.productSeller),
      productPrice,
      affiliatePercent: nextPercent,
    });
  }

  if (hasEnabled) {
    $set.affiliateEnabled = nextEnabled;
  }
  if (hasPercent || (hasEnabled && !nextEnabled)) {
    $set.affiliatePercent = nextEnabled ? nextPercent : hasPercent ? nextPercent : 0;
  }
  if (hasEnabled && nextEnabled && !hasPercent) {
    $set.affiliatePercent = nextPercent;
  }
};

const applyImageFields = (body, $set) => {
  if (hasBodyField(body, "productImageUrls") || hasBodyField(body, "productImageUrl")) {
    $set.productImageUrls = mergeProductImageUrlsFromBody(body);
  }
};

const applyPreviewVideoFields = async (body, $set, existing) => {
  if (hasBodyField(body, "productPreviewVideoUrl")) {
    const nextPreviewVideoUrl = normalizeProductPreviewVideoUrl(
      body.productPreviewVideoUrl,
    );
    const nextImageUrls = hasSetField($set, "productImageUrls")
      ? $set.productImageUrls
      : Array.isArray(existing.productImageUrls)
        ? existing.productImageUrls
        : [];
    try {
      assertProductPreviewVideoRequiresPhotos(nextPreviewVideoUrl, nextImageUrls);
    } catch (error) {
      throwFieldError(error, "Некорректное превью-видео");
    }

    const prevPreviewVideoUrl = normalizeProductPreviewVideoUrl(
      existing.productPreviewVideoUrl,
    );
    if (prevPreviewVideoUrl && prevPreviewVideoUrl !== nextPreviewVideoUrl) {
      await deleteUploadFileByUrl(prevPreviewVideoUrl);
    }
    $set.productPreviewVideoUrl = nextPreviewVideoUrl;
    return;
  }

  if (!hasSetField($set, "productImageUrls")) {
    return;
  }

  const existingPreviewVideoUrl = normalizeProductPreviewVideoUrl(
    existing.productPreviewVideoUrl,
  );
  try {
    assertProductPreviewVideoRequiresPhotos(
      existingPreviewVideoUrl,
      $set.productImageUrls,
    );
  } catch (error) {
    throwFieldError(error, "Некорректное превью-видео");
  }
};

const applyModerationAndAvailability = (body, $set, existing, isAdmin) => {
  const touchesContent = patchBodyTouchesModerationContent(body);

  if (!isAdmin) {
    // Pending: owner may edit content; status stays pending (no queue re-bump).
    // Approved/rejected content → re-submit to pending + hide from catalog.
    const resubmitForModeration =
      touchesContent && existing.productModerationStatus !== PRODUCT_MODERATION_PENDING;

    if (resubmitForModeration) {
      $set.productModerationStatus = PRODUCT_MODERATION_PENDING;
      $set.productModerationComment = "";
      $set.productIsAvailable = false;
    } else if (hasBodyField(body, "productIsAvailable")) {
      if (existing.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
        throw new AppError(409, CATALOG_VISIBILITY_BLOCK_MESSAGE);
      }
      $set.productIsAvailable = Boolean(body.productIsAvailable);
    }
    return;
  }

  if (hasBodyField(body, "productIsAvailable")) {
    $set.productIsAvailable = Boolean(body.productIsAvailable);
  }
};

const applyStockField = async (body, $set, existing, productId) => {
  if (!hasBodyField(body, "productStockQuantity")) {
    return;
  }
  try {
    const nextStock = await assertProductStockPatchAllowed(
      productId,
      body.productStockQuantity,
    );
    $set.productStockQuantity = nextStock;
    if (nextStock === 0) {
      $set.productIsAvailable = false;
    } else if (existing.productModerationStatus === PRODUCT_MODERATION_APPROVED) {
      $set.productIsAvailable = true;
    }
  } catch (error) {
    throwFieldError(error, "Некорректное количество в наличии");
  }
};

const applyAuctionField = (body, $set, existing) => {
  if (!hasBodyField(body, "productAuctionEnabled")) {
    return {
      auctionEnabledChanged: false,
      nextAuctionEnabled: existing.productAuctionEnabled === true,
    };
  }

  const nextAuctionEnabled = Boolean(body.productAuctionEnabled);
  const auctionEnabledChanged =
    nextAuctionEnabled !== (existing.productAuctionEnabled === true);

  $set.productAuctionEnabled = nextAuctionEnabled;
  if (nextAuctionEnabled) {
    $set.productAuctionCompletedOnce = false;
  }

  return { auctionEnabledChanged, nextAuctionEnabled };
};

const applyQaField = (body, $set) => {
  if (!hasBodyField(body, "productQaEnabled")) {
    return;
  }
  $set.productQaEnabled = Boolean(body.productQaEnabled);
};

/**
 * @param {{
 *   existing: import("mongoose").Document;
 *   body: Record<string, unknown>;
 *   isAdmin: boolean;
 *   productId: string;
 * }} input
 */
export async function buildProductPatchSet({ existing, body, isAdmin, productId }) {
  const $set = {};
  const $unset = {};

  applyTextFields(body, $set);
  applyCharacteristicsField(body, $set);
  applyReturnPolicyFields(body, $set, existing);
  applyListingOriginField(body, $set);
  applyIsOriginalField(body, $set);
  applyOutOfStockField(body, $set);
  applyOutOfStockLabelField(body, $set);
  applyPriceFields(body, $set, existing);
  applySaleCityField(body, $set);
  await applyPickupFields(body, $set, $unset, existing);
  await applyCategoryFields(body, $set, existing);
  await applyLoyaltyField(body, $set, existing, productId);
  await applyAffiliateFields(body, $set, existing);
  applyImageFields(body, $set);
  await applyPreviewVideoFields(body, $set, existing);
  applyModerationAndAvailability(body, $set, existing, isAdmin);
  await applyStockField(body, $set, existing, productId);

  const auctionState = applyAuctionField(body, $set, existing);
  applyQaField(body, $set);
  applyWholesaleFields(body, $set, existing);
  const buyNFreeState = applyBuyNFreeFields(body, $set, existing);
  applyRentalFields(body, $set, existing);
  const flashSaleState = applyFlashSaleFields(body, $set, $unset, existing);

  const availabilityBecameHidden =
    hasSetField($set, "productIsAvailable") &&
    $set.productIsAvailable === false &&
    existing.productIsAvailable !== false;

  if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
    throw new AppError(400, EMPTY_PATCH_BODY_MESSAGE);
  }

  return {
    $set,
    $unset,
    ...auctionState,
    ...flashSaleState,
    shouldResetBuyNFreeProgress:
      buyNFreeState.shouldResetProgress === true || availabilityBecameHidden,
  };
}
