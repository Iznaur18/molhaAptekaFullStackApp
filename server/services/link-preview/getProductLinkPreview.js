import { formatPriceRub } from "@izibuy/shared-lib";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { getHiddenSellerIds } from "../access/adminUserGuard.js";
import { findCatalogProductById } from "../product/findCatalogProductById.js";
import { resolveFrontendOrigin } from "../../utils/resolveFrontendOrigin.js";
import {
  appendMediaCacheBust,
  resolveAbsolutePublicMediaUrl,
  resolveSiteOgImageUrl,
} from "./resolveAbsolutePublicMediaUrl.js";

/**
 * @param {string} productId
 * @returns {Promise<{
 *   title: string;
 *   description: string;
 *   url: string;
 *   imageUrl: string;
 * } | null>}
 */
export async function getProductLinkPreview(productId) {
  const product = await findCatalogProductById(productId);
  if (!product) {
    return null;
  }

  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    return null;
  }

  const sellerId = String(product.productSeller?._id ?? product.productSeller ?? "");
  if (sellerId) {
    const hiddenSellerIds = await getHiddenSellerIds();
    if (hiddenSellerIds.some((id) => String(id) === sellerId)) {
      return null;
    }
  }

  const origin = resolveFrontendOrigin(process.env.FRONTEND_URL);
  const url = `${origin}/product/${encodeURIComponent(String(product._id))}`;
  const name = String(product.productName ?? "").trim() || "Товар";
  const priceLabel = formatPriceRub(product.productPrice);
  const title = `${name} — ${priceLabel}`;
  const description = `Купить на Gitorg · ${priceLabel}`;

  const rawImages = Array.isArray(product.productImageUrls)
    ? product.productImageUrls
    : [];
  const firstImage =
    rawImages.map((item) => String(item ?? "").trim()).find(Boolean) ||
    String(product.productImageUrl ?? "").trim();

  const absoluteImage =
    resolveAbsolutePublicMediaUrl(firstImage, { pageOrigin: origin }) ||
    resolveSiteOgImageUrl();
  const imageUrl = appendMediaCacheBust(
    absoluteImage,
    product.updatedAt ?? product.createdAt ?? null,
  );

  return { title, description, url, imageUrl };
}
