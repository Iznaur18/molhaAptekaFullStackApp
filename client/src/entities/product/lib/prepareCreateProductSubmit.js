import { normalizeUploadUrlForStorage } from "@izibuy/shared-lib";

import { validateInstagramPostUrlInput, parseInstagramPostUrl } from "@molha/api-contract";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import {
  isRuRegionCode,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";
import {
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  PRODUCT_COURIER_DELIVERY_CONFLICT_MESSAGE,
} from "@molha/api-contract";
import {
  legacyPickupFieldsFromLocations,
  serializeProductPickupLocationsForApi,
  validateProductPickupLocationsForm,
} from "./productPickupLocationsForm.js";
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
  const instagramPostUrlRaw = String(form.productInstagramPostUrl ?? "").trim();
  const instagramPostUrlError = validateInstagramPostUrlInput(instagramPostUrlRaw);
  if (instagramPostUrlError) {
    return { ok: false, message: instagramPostUrlError };
  }
  const productInstagramPostUrl = instagramPostUrlRaw
    ? parseInstagramPostUrl(instagramPostUrlRaw)?.postUrl ?? ""
    : "";
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

  const productCategoryId =
    form.productCategoryId != null && String(form.productCategoryId).trim() !== ""
      ? String(form.productCategoryId).trim()
      : "";

  const productPickupLocationsRaw = Array.isArray(form.productPickupLocations)
    ? form.productPickupLocations
    : [];
  const locationsError = validateProductPickupLocationsForm(productPickupLocationsRaw);
  if (locationsError) {
    return { ok: false, message: locationsError };
  }
  const productPickupLocations = serializeProductPickupLocationsForApi(
    productPickupLocationsRaw,
  );
  const legacyPickup = legacyPickupFieldsFromLocations(productPickupLocationsRaw);
  const productPickupAddress = legacyPickup.productPickupAddress;
  const productPickupLat = legacyPickup.productPickupLat;
  const productPickupLon = legacyPickup.productPickupLon;
  const productRegionCodeRaw = String(form.productRegionCode ?? "").trim();
  const productRegionCode = isRuRegionCode(productRegionCodeRaw)
    ? productRegionCodeRaw
    : undefined;

  const productPickupEnabled = form.productPickupEnabled !== false;
  const productDeliveryEnabled = form.productDeliveryEnabled === true;
  const productCourierDeliveryEnabled = form.productCourierDeliveryEnabled === true;
  const productDeliveryCarrier =
    resolveProductDeliveryCarrier({
      productDeliveryCarrier: form.productDeliveryCarrier,
      productDeliveryEnabled,
      productCourierDeliveryEnabled,
    }) ?? "";
  if (!productPickupEnabled && !productDeliveryCarrier) {
    return { ok: false, message: PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE };
  }
  // Либо продавец везёт сам, либо отдаёт курьеру.
  if (productDeliveryEnabled && productCourierDeliveryEnabled) {
    return { ok: false, message: PRODUCT_COURIER_DELIVERY_CONFLICT_MESSAGE };
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

  const pickupLocationFields =
    productPickupLocations.length > 0
      ? { productPickupLocations }
      : {
          productPickupAddress,
          productPickupLat,
          productPickupLon,
        };

  if (isEdit) {
    const patchBody = {
      productName: String(form.productName).trim(),
      productListingOrigin: form.productListingOrigin,
      productDescription: String(form.productDescription).trim(),
      productImageUrls: urls,
      productPreviewVideoUrl: previewVideoUrl,
      productInstagramPostUrl,
      productPrice,
      productOldPrice,
      productCharacteristics,
      ...(productRegionCode ? { productRegionCode } : {}),
      ...pickupLocationFields,
      productPickupEnabled,
      productDeliveryEnabled,
      productCourierDeliveryEnabled,
      ...(productDeliveryCarrier ? { productDeliveryCarrier } : {}),
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
      productIsOriginal: false,
      productDescription: form.productDescription,
      productImageUrls: urls,
      productPreviewVideoUrl: previewVideoUrl || undefined,
      productInstagramPostUrl: productInstagramPostUrl || undefined,
      productPrice,
      productOldPrice,
      ...(productCategoryId ? { productCategoryId } : {}),
      productIsAvailable: form.productIsAvailable,
      productStockQuantity,
      loyaltyPointsPerUnit: 0,
      productCharacteristics,
      ...(productRegionCode ? { productRegionCode } : {}),
      ...pickupLocationFields,
      productPickupEnabled,
      productDeliveryEnabled,
      productCourierDeliveryEnabled,
      ...(productDeliveryCarrier ? { productDeliveryCarrier } : {}),
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
