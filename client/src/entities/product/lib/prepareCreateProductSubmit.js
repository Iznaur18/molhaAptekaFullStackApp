import { normalizeUploadUrlForStorage } from "@izibuy/shared-lib";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { isRuRegionCode } from "@molha/api-contract";
import {
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
} from "@molha/api-contract";
import {
  computeProductDiscountPercent,
  parseProductPriceInput,
  validateProductOldPricePair,
} from "./computeProductDiscountPercent.js";
import { getProductPriceRubMaxError } from "./productPriceRubValidation.js";
import { validateProductDescription } from "./validateProductDescription.js";
import { validateProductName } from "./validateProductName.js";
import { isProductListingOrigin } from "./productListingOrigin.js";
import {
  productCharacteristicsFromRows,
  validateProductCharacteristicsRows,
} from "./validateProductCharacteristicsRows.js";
import {
  serializeProductReturnTermRows,
  validateProductReturnTermRows,
} from "./productReturnTermRows.js";
import { urlsFromImageRows } from "./productImageRowHelpers.js";
import { PRODUCT_STOCK_QUANTITY_MAX, PRODUCT_STOCK_QUANTITY_MIN } from "../model/productStockConstants.js";

/**
 * @typedef {{
 *   form: Record<string, unknown>;
 *   isEdit: boolean;
 *   showCatalogAvailabilityToggle: boolean;
 *   sellerPointsMaxPerUnit: number;
 *   sellerCatalogCommitted: number;
 * }} PrepareCreateProductSubmitInput
 */

/**
 * @param {PrepareCreateProductSubmitInput} input
 * @returns {{ ok: false; message: string } | { ok: true; patchBody?: Record<string, unknown>; createBody?: Record<string, unknown> }}
 */
export function prepareCreateProductSubmit({
  form,
  isEdit,
  showCatalogAvailabilityToggle,
  sellerPointsMaxPerUnit,
  sellerCatalogCommitted,
}) {
  const productPrice = parseProductPriceInput(form.productPrice);
  if (productPrice == null) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE };
  }

  const productPriceMaxError = getProductPriceRubMaxError(productPrice);
  if (productPriceMaxError) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE_MAX };
  }

  const productOldPrice = parseProductPriceInput(form.productOldPrice);
  if (productOldPrice != null) {
    const oldPriceMaxError = getProductPriceRubMaxError(productOldPrice);
    if (oldPriceMaxError) {
      return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_PRICE_MAX };
    }
  }

  const oldPriceError = validateProductOldPricePair(productOldPrice, productPrice);
  if (oldPriceError) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_OLD_PRICE };
  }

  const nameError = validateProductName(form.productName);
  if (nameError) {
    return { ok: false, message: nameError };
  }

  if (!isProductListingOrigin(form.productListingOrigin)) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_LISTING_ORIGIN };
  }

  const descriptionError = validateProductDescription(form.productDescription);
  if (descriptionError) {
    return { ok: false, message: descriptionError };
  }

  const characteristicsError = validateProductCharacteristicsRows(
    form.productCharacteristicRows,
  );
  if (characteristicsError) {
    return { ok: false, message: characteristicsError };
  }

  const productCharacteristics = productCharacteristicsFromRows(
    form.productCharacteristicRows,
  );

  const urls = urlsFromImageRows(form.productImageRows).map((url) =>
    normalizeUploadUrlForStorage(url),
  );
  const previewVideoUrl = normalizeUploadUrlForStorage(
    String(form.productPreviewVideoUrl ?? "").trim(),
  );
  if (previewVideoUrl && urls.length === 0) {
    return {
      ok: false,
      message: CREATE_PRODUCT_MODAL_UI.ERROR_PREVIEW_VIDEO_REQUIRES_PHOTO,
    };
  }

  if (!isEdit && urls.length === 0) {
    return {
      ok: false,
      message: CREATE_PRODUCT_MODAL_UI.ERROR_IMAGE_REQUIRED,
    };
  }

  const stockParsed = Math.floor(Number(form.productStockQuantity));
  const listedInCatalog = form.productIsAvailable === true;
  const stockRequired = listedInCatalog || (isEdit && !showCatalogAvailabilityToggle);
  let productStockQuantity = 0;

  if (stockRequired) {
    if (
      !Number.isFinite(stockParsed) ||
      stockParsed < PRODUCT_STOCK_QUANTITY_MIN ||
      stockParsed > PRODUCT_STOCK_QUANTITY_MAX
    ) {
      return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_STOCK };
    }
    productStockQuantity = stockParsed;
  } else if (
    isEdit &&
    Number.isFinite(stockParsed) &&
    stockParsed >= 0 &&
    stockParsed <= PRODUCT_STOCK_QUANTITY_MAX
  ) {
    productStockQuantity = stockParsed;
  }

  const loyaltyParsed = Math.floor(Number(form.loyaltyPointsPerUnit));
  const loyaltyPointsPerUnit =
    Number.isFinite(loyaltyParsed) && loyaltyParsed >= 0 ? loyaltyParsed : 0;
  if (loyaltyPointsPerUnit > sellerPointsMaxPerUnit) {
    return {
      ok: false,
      message: CREATE_PRODUCT_MODAL_UI.ERROR_LOYALTY_POINTS_MAX(
        sellerPointsMaxPerUnit,
        sellerCatalogCommitted,
      ),
    };
  }

  if (!form.productCategoryId) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_CATEGORY_LEAF };
  }

  const productCategoryId =
    form.productCategoryId != null && String(form.productCategoryId).trim() !== ""
      ? String(form.productCategoryId).trim()
      : "";

  if (!productCategoryId) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_CATEGORY_LEAF };
  }

  const productPickupAddress = String(form.productPickupAddress ?? "").trim();
  if (productPickupAddress.length < PRODUCT_PICKUP_ADDRESS_MIN_LENGTH) {
    return { ok: false, message: PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE };
  }

  const pickupLatRaw = form.productPickupLat;
  const pickupLonRaw = form.productPickupLon;
  const hasLat = pickupLatRaw != null && Number.isFinite(Number(pickupLatRaw));
  const hasLon = pickupLonRaw != null && Number.isFinite(Number(pickupLonRaw));
  if (!hasLat || !hasLon) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_PICKUP_COORDS };
  }
  const productPickupLat = Number(pickupLatRaw);
  const productPickupLon = Number(pickupLonRaw);
  const productRegionCodeRaw = String(form.productRegionCode ?? "").trim();
  const productRegionCode = isRuRegionCode(productRegionCodeRaw)
    ? productRegionCodeRaw
    : undefined;

  const productPickupEnabled = form.productPickupEnabled !== false;
  const productDeliveryEnabled = form.productDeliveryEnabled === true;
  if (!productPickupEnabled && !productDeliveryEnabled) {
    return { ok: false, message: PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE };
  }

  if (form.productReturnEnabled == null) {
    return { ok: false, message: CREATE_PRODUCT_MODAL_UI.ERROR_RETURN_CHOICE };
  }

  const productReturnEnabled = form.productReturnEnabled === true;
  let productReturnTerms = [];
  if (productReturnEnabled) {
    const returnTermsError = validateProductReturnTermRows(
      Array.isArray(form.returnTermRows) ? form.returnTermRows : [],
    );
    if (returnTermsError) {
      return { ok: false, message: returnTermsError };
    }
    productReturnTerms = serializeProductReturnTermRows(
      Array.isArray(form.returnTermRows) ? form.returnTermRows : [],
    );
  }

  if (isEdit) {
    const patchBody = {
      productName: String(form.productName).trim(),
      productListingOrigin: form.productListingOrigin,
      productIsOriginal: form.productIsOriginal === true,
      productDescription: String(form.productDescription).trim(),
      productImageUrls: urls,
      productPreviewVideoUrl: previewVideoUrl,
      productPrice,
      productOldPrice,
      loyaltyPointsPerUnit,
      productCharacteristics,
      ...(productRegionCode ? { productRegionCode } : {}),
      productPickupAddress,
      productPickupLat,
      productPickupLon,
      productPickupEnabled,
      productDeliveryEnabled,
      productReturnEnabled,
      productReturnTerms,
    };

    if (productCategoryId) {
      patchBody.productCategoryId = productCategoryId;
    }

    if (showCatalogAvailabilityToggle) {
      patchBody.productIsAvailable = form.productIsAvailable;
    }
    if (isEdit || showCatalogAvailabilityToggle) {
      patchBody.productStockQuantity = productStockQuantity;
    }

    return { ok: true, patchBody };
  }

  return {
    ok: true,
    createBody: {
      productName: form.productName,
      productListingOrigin: form.productListingOrigin,
      productIsOriginal: form.productIsOriginal === true,
      productDescription: form.productDescription,
      productImageUrls: urls,
      productPreviewVideoUrl: previewVideoUrl || undefined,
      productPrice,
      productOldPrice,
      productCategoryId,
      productIsAvailable: form.productIsAvailable,
      productStockQuantity,
      loyaltyPointsPerUnit,
      productCharacteristics,
      ...(productRegionCode ? { productRegionCode } : {}),
      productPickupAddress,
      productPickupLat,
      productPickupLon,
      productPickupEnabled,
      productDeliveryEnabled,
      productReturnEnabled,
      productReturnTerms,
    },
  };
}

/** @param {string} productPrice @param {string} productOldPrice */
export function resolveCreateProductDiscountPreview(productPrice, productOldPrice) {
  return computeProductDiscountPercent(
    parseProductPriceInput(productOldPrice),
    parseProductPriceInput(productPrice),
  );
}
