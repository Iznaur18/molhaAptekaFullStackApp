import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Тело для `POST /product` (совпадает с `makeProductValidation`).
 *
 * @typedef {object} CreateProductBody
 * @property {string} productName
 * @property {string} productDescription
 * @property {string[]} [productImageUrls]
 * @property {string} [productImageUrl]
 * @property {string} [productPreviewVideoUrl]
 * @property {number} productPrice
 * @property {number | null} [productOldPrice]
 * @property {import('../model/types.js').ProductCategory} productCategory
 * @property {boolean} productIsAvailable
 * @property {number} [productStockQuantity]
 * @property {boolean} [productAuctionEnabled]
 */

/**
 * `POST /product` — создать товар (Bearer).
 *
 * @param {CreateProductBody} body
 * @returns {Promise<import('../model/types.js').ProductFromApi>}
 */
export async function createProduct(body) {
  try {
    const payload = {
      productName: body.productName.trim(),
      productDescription: body.productDescription.trim(),
      productPrice: body.productPrice,
      productOldPrice: body.productOldPrice ?? null,
      productCategory: body.productCategory,
      productIsAvailable: body.productIsAvailable,
    };
    if (body.productIsAvailable === true) {
      payload.productStockQuantity = body.productStockQuantity;
    }
    if (body.productAuctionEnabled != null) {
      payload.productAuctionEnabled = body.productAuctionEnabled === true;
    }
    const urls = Array.isArray(body.productImageUrls)
      ? body.productImageUrls.map((s) => String(s).trim()).filter(Boolean)
      : [];
    if (urls.length > 0) {
      payload.productImageUrls = urls;
    }
    const previewVideo = body.productPreviewVideoUrl?.trim();
    if (previewVideo) {
      payload.productPreviewVideoUrl = previewVideo;
    }
    const legacy = body.productImageUrl?.trim();
    if (legacy && urls.length === 0) {
      payload.productImageUrl = legacy;
    }

    const { data } = await apiClient.post("/product", payload);

    if (!data?.success || data.data?.product == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.product;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.CREATE_PRODUCT_FALLBACK;
    throw new Error(message);
  }
}
