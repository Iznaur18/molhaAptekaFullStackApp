import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthSession } from "../../../user/model/useAuthSession.js";
import { isProfileProductThumbUnavailable } from "../../../user/lib/resolveProfileProductThumbState.js";
import { useUserProfileProductsAllPagesQuery } from "../../../user/model/useUserProfileProductsAllPagesQuery.js";
import { resolveProductImageUrl } from "../../lib/resolveProductImageUrl.js";
import { navigateToProductDetails } from "../../lib/navigateToProductDetails.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../model/productConstants.js";
import {
  API_CLIENT_UI,
  SELLER_PRODUCTS_PAGE_UI,
  USER_PROFILE_PRODUCTS_UI,
} from "../../../../shared/config/appUiCopy.js";

import "./ProductDetailsSellerProductsCarousel.css";

const THUMB_SIZE_PX = 64;

/**
 * @param {{
 *   sellerId: string;
 *   excludeProductId?: string;
 * }} props
 */
export function ProductDetailsSellerProductsCarousel({ sellerId, excludeProductId = "" }) {
  const navigate = useNavigate();
  const { currentUserId } = useAuthSession();
  const isSelf =
    currentUserId != null && String(currentUserId) === String(sellerId).trim();
  const productsQuery = useUserProfileProductsAllPagesQuery({
    userId: sellerId,
    enabled: sellerId.trim().length > 0,
  });
  const [failedThumbIds, setFailedThumbIds] = useState(
    /** @type {Set<string>} */ () => new Set(),
  );

  const currentProductId = String(excludeProductId).trim();
  const items = productsQuery.data?.items ?? [];

  if (productsQuery.isPending) {
    return null;
  }

  if (productsQuery.isError && items.length === 0) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="product-details-seller-products-carousel"
      aria-label={SELLER_PRODUCTS_PAGE_UI.TITLE}
    >
      <h4 className="product-details-seller-products-carousel__heading">
        {SELLER_PRODUCTS_PAGE_UI.TITLE}
      </h4>
      <div className="product-details-seller-products-carousel__scroll">
        <ul className="product-details-seller-products-carousel__track" role="list">
          {items.map((item) => {
            const resolved = resolveProductImageUrl(item.product);
            const thumbSrc = failedThumbIds.has(item.productId)
              ? PRODUCT_IMAGE_PLACEHOLDER_URL
              : resolved || PRODUCT_IMAGE_PLACEHOLDER_URL;
            const isCurrent =
              currentProductId.length > 0 &&
              String(item.productId) === currentProductId;
            const isUnavailable = isProfileProductThumbUnavailable(item, { isSelf });

            return (
              <li key={item.productId} className="product-details-seller-products-carousel__item">
                <button
                  type="button"
                  className={[
                    "product-details-seller-products-carousel__thumb-btn",
                    isCurrent
                      ? "product-details-seller-products-carousel__thumb-btn--current"
                      : "",
                    isUnavailable
                      ? "product-details-seller-products-carousel__thumb-btn--unavailable"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={item.productName || USER_PROFILE_PRODUCTS_UI.UNAVAILABLE}
                  aria-current={isCurrent ? "page" : undefined}
                  disabled={isUnavailable || isCurrent}
                  onClick={() => {
                    if (isUnavailable || isCurrent || item.product == null) {
                      return;
                    }
                    navigateToProductDetails(navigate, item.product);
                  }}
                >
                  <img
                    className="product-details-seller-products-carousel__thumb"
                    src={thumbSrc}
                    alt=""
                    width={THUMB_SIZE_PX}
                    height={THUMB_SIZE_PX}
                    loading="lazy"
                    decoding="async"
                    onError={() => {
                      setFailedThumbIds((prev) => {
                        if (prev.has(item.productId)) return prev;
                        const next = new Set(prev);
                        next.add(item.productId);
                        return next;
                      });
                    }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {productsQuery.isError ? (
        <p className="product-details-seller-products-carousel__error" role="alert">
          {productsQuery.error instanceof Error
            ? productsQuery.error.message
            : API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK}
        </p>
      ) : null}
    </section>
  );
}
