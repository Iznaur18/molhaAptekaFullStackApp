import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import { useUserProfileProductsAllPagesQuery } from "../model/useUserProfileProductsAllPagesQuery.js";
import { resolveProductImageUrls } from "../../product/lib/resolveProductImageUrls.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../product/model/productConstants.js";
import { isProfileProductThumbUnavailable } from "../lib/resolveProfileProductThumbState.js";
import {
  API_CLIENT_UI,
  USER_PROFILE_PRODUCTS_UI,
} from "../../../shared/config/appUiCopy.js";

import "./UserProfilePurchasesList.css";

const THUMB_SIZE_PX = 64;

/**
 * @param {import('../model/userProfileProductThumbTypes.js').UserProfileProductThumbItem} item
 */
function getThumbSrc(item) {
  const urls = resolveProductImageUrls(
    /** @type {import('../../product/model/types.js').ProductFromApi | null} */ (
      item.product
    ),
  );
  return urls[0] ?? PRODUCT_IMAGE_PLACEHOLDER_URL;
}

/**
 * @param {{
 *   targetUserId: string;
 *   onProductClick?: (
 *     product: import('../../product/model/types.js').ProductFromApi,
 *   ) => void;
 *   onViewAllProducts?: () => void;
 *   isSelf?: boolean;
 * }} props
 */
export function UserProfileProductsList({
  targetUserId,
  onProductClick,
  onViewAllProducts,
  isSelf = false,
}) {
  const productsQuery = useUserProfileProductsAllPagesQuery({
    userId: targetUserId,
    enabled: true,
  });
  const [error, setError] = useState("");
  const [failedThumbIds, setFailedThumbIds] = useState(
    /** @type {Set<string>} */ () => new Set(),
  );

  useEffect(() => {
    setError("");
    setFailedThumbIds(new Set());
  }, [targetUserId]);

  useEffect(() => {
    if (productsQuery.isError) {
      setError(
        productsQuery.error instanceof Error
          ? productsQuery.error.message
          : API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK,
      );
    }
  }, [productsQuery.error, productsQuery.isError]);

  const items = productsQuery.data?.items ?? [];
  const total = productsQuery.data?.pagination?.total ?? items.length;

  const phase = productsQuery.isPending
    ? "loading"
    : productsQuery.isError && items.length === 0
      ? "error"
      : "success";
  const fetchError =
    productsQuery.error instanceof Error
      ? productsQuery.error.message
      : API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK;
  const displayError = error || (phase === "error" ? fetchError : "");

  /** @param {import('../model/userProfileProductThumbTypes.js').UserProfileProductThumbItem} item */
  const handleItemClick = (item) => {
    if (isProfileProductThumbUnavailable(item, { isSelf })) {
      return;
    }

    onProductClick?.(
      /** @type {import('../../product/model/types.js').ProductFromApi} */ (
        item.product
      ),
    );
  };

  /** @param {string} productId */
  const markThumbFailed = (productId) => {
    setFailedThumbIds((prev) => {
      if (prev.has(productId)) return prev;
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  };

  const showViewAll =
    typeof onViewAllProducts === "function" && phase === "success" && total > 0;

  return (
    <div className="user-profile-purchases-section">
      {showViewAll ? (
        <button
          type="button"
          className="user-profile-purchases__heading user-profile-purchases__heading_action"
          onClick={onViewAllProducts}
        >
          <span>{USER_PROFILE_PRODUCTS_UI.HEADING}</span>
          <span className="user-profile-purchases__heading-go">
            {USER_PROFILE_PRODUCTS_UI.GO}
            <ChevronRight
              className="user-profile-purchases__heading-chevron"
              size={16}
              strokeWidth={2.5}
              aria-hidden
            />
          </span>
        </button>
      ) : (
        <h3 className="user-profile-purchases__heading">
          {USER_PROFILE_PRODUCTS_UI.HEADING}
        </h3>
      )}
      <div className="user-profile-purchases">
        {phase === "loading" ? (
          <p className="user-profile-purchases__state">
            {USER_PROFILE_PRODUCTS_UI.LOADING}
          </p>
        ) : null}
        {phase === "error" && items.length === 0 ? (
          <p
            className="user-profile-purchases__state user-profile-purchases__state_error"
            role="alert"
          >
            {displayError}
          </p>
        ) : null}
        {phase === "success" && items.length === 0 ? (
          <p className="user-profile-purchases__state">
            {USER_PROFILE_PRODUCTS_UI.EMPTY}
          </p>
        ) : null}
        {items.length > 0 ? (
          <ul className="user-profile-purchases__list" role="list">
            {items.map((item) => {
              const isUnavailable = isProfileProductThumbUnavailable(item, { isSelf });
              const thumbSrc = failedThumbIds.has(item.productId)
                ? PRODUCT_IMAGE_PLACEHOLDER_URL
                : getThumbSrc(item);

              return (
                <li key={item.productId} className="user-profile-purchases__item">
                  <button
                    type="button"
                    className={[
                      "user-profile-purchases__row",
                      isUnavailable
                        ? "user-profile-purchases__row_unavailable"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleItemClick(item)}
                    disabled={isUnavailable}
                    aria-label={item.productName}
                    title={item.productName}
                  >
                    <img
                      className="user-profile-purchases__thumb"
                      src={thumbSrc}
                      alt=""
                      width={THUMB_SIZE_PX}
                      height={THUMB_SIZE_PX}
                      loading="lazy"
                      decoding="async"
                      onError={() => markThumbFailed(item.productId)}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        {displayError && items.length > 0 ? (
          <p
            className="user-profile-purchases__state user-profile-purchases__state_error"
            role="alert"
          >
            {displayError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
