import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import { USER_PROFILE_PRODUCTS_PAGE_SIZE } from "../api/fetchUserProducts.js";
import { useUserProfileProductsAllPagesQuery } from "../model/useUserProfileProductsAllPagesQuery.js";
import { useUserProfileProductsQuery } from "../model/useUserProfileProductsQuery.js";
import { resolveProductImageUrls } from "../../product/lib/resolveProductImageUrls.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../product/model/productConstants.js";
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
 * }} props
 */
export function UserProfileProductsList({
  targetUserId,
  onProductClick,
  onViewAllProducts,
}) {
  const previewQuery = useUserProfileProductsQuery({ userId: targetUserId });
  const [loadAllPages, setLoadAllPages] = useState(false);
  const allPagesQuery = useUserProfileProductsAllPagesQuery({
    userId: targetUserId,
    enabled: loadAllPages,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState("");
  const [unavailableHint, setUnavailableHint] = useState("");
  const [failedThumbIds, setFailedThumbIds] = useState(
    /** @type {Set<string>} */ () => new Set(),
  );

  useEffect(() => {
    setIsExpanded(false);
    setLoadAllPages(false);
    setError("");
    setUnavailableHint("");
    setFailedThumbIds(new Set());
  }, [targetUserId]);

  useEffect(() => {
    if (allPagesQuery.isSuccess && loadAllPages) {
      setIsExpanded(true);
    }
  }, [allPagesQuery.isSuccess, loadAllPages]);

  useEffect(() => {
    if (allPagesQuery.isError) {
      setError(
        allPagesQuery.error instanceof Error
          ? allPagesQuery.error.message
          : API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK,
      );
    }
  }, [allPagesQuery.error, allPagesQuery.isError]);

  const previewItems = previewQuery.data?.items ?? [];
  const previewTotal = previewQuery.data?.pagination?.total ?? previewItems.length;
  const expandedItems = allPagesQuery.data?.items ?? previewItems;
  const expandedTotal = allPagesQuery.data?.pagination?.total ?? previewTotal;
  const items = isExpanded ? expandedItems : previewItems;
  const total = isExpanded ? expandedTotal : previewTotal;

  const phase = previewQuery.isPending
    ? "loading"
    : previewQuery.isError && previewItems.length === 0
      ? "error"
      : "success";
  const fetchError =
    previewQuery.error instanceof Error
      ? previewQuery.error.message
      : API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK;
  const displayError = error || (phase === "error" ? fetchError : "");

  const visibleItems = useMemo(
    () => (isExpanded ? items : items.slice(0, USER_PROFILE_PRODUCTS_PAGE_SIZE)),
    [isExpanded, items],
  );

  const canExpand = total > USER_PROFILE_PRODUCTS_PAGE_SIZE;
  const showMore = !isExpanded && canExpand;
  const showLess = isExpanded && canExpand;

  const handleShowMore = () => {
    if (!canExpand || allPagesQuery.isFetching) {
      return;
    }
    setError("");
    if (previewItems.length >= previewTotal) {
      setIsExpanded(true);
      return;
    }
    setLoadAllPages(true);
  };

  const handleShowLess = () => {
    setIsExpanded(false);
    setUnavailableHint("");
  };

  /** @param {import('../model/userProfileProductThumbTypes.js').UserProfileProductThumbItem} item */
  const handleItemClick = (item) => {
    if (item.viewable && item.product != null) {
      setUnavailableHint("");
      onProductClick?.(
        /** @type {import('../../product/model/types.js').ProductFromApi} */ (
          item.product
        ),
      );
      return;
    }
    setUnavailableHint(USER_PROFILE_PRODUCTS_UI.UNAVAILABLE);
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
          <ChevronRight
            className="user-profile-purchases__heading-chevron"
            size={16}
            strokeWidth={2.5}
            aria-hidden
          />
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
      {visibleItems.length > 0 ? (
        <ul className="user-profile-purchases__list" role="list">
          {visibleItems.map((item) => {
            const isUnavailable = !item.viewable || item.product == null;
            const thumbSrc = failedThumbIds.has(item.productId)
              ? PRODUCT_IMAGE_PLACEHOLDER_URL
              : getThumbSrc(item);

            return (
              <li key={item.productId} className="user-profile-purchases__item">
                <button
                  type="button"
                  className={[
                    "user-profile-purchases__row",
                    isUnavailable ? "user-profile-purchases__row_unavailable" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleItemClick(item)}
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
      {showMore ? (
        <button
          type="button"
          className="user-profile-purchases__more"
          onClick={() => void handleShowMore()}
          disabled={allPagesQuery.isFetching}
        >
          {allPagesQuery.isFetching
            ? USER_PROFILE_PRODUCTS_UI.LOADING_MORE
            : USER_PROFILE_PRODUCTS_UI.SHOW_MORE}
        </button>
      ) : null}
      {showLess ? (
        <button
          type="button"
          className="user-profile-purchases__more"
          onClick={handleShowLess}
        >
          {USER_PROFILE_PRODUCTS_UI.SHOW_LESS}
        </button>
      ) : null}
      {displayError && items.length > 0 ? (
        <p
          className="user-profile-purchases__state user-profile-purchases__state_error"
          role="alert"
        >
          {displayError}
        </p>
      ) : null}
      {unavailableHint ? (
        <p className="user-profile-purchases__hint" role="status">
          {unavailableHint}
        </p>
      ) : null}
      </div>
    </div>
  );
}
