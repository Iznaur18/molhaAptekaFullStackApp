import { useCallback, useEffect, useMemo, useState } from "react";

import { resolveProductImageUrls } from "../../product/lib/resolveProductImageUrls.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../product/model/productConstants.js";
import {
  fetchAllUserProducts,
  fetchUserProducts,
  USER_PROFILE_PRODUCTS_PAGE_SIZE,
} from "../api/fetchUserProducts.js";
import {
  API_CLIENT_UI,
  USER_PROFILE_PRODUCTS_UI,
} from "../../../shared/config/appUiCopy.js";

import "./UserProfilePurchasesList.css";

const THUMB_SIZE_PX = 48;

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
  const [phase, setPhase] = useState("loading");
  const [items, setItems] = useState(
    /** @type {import('../model/userProfileProductThumbTypes.js').UserProfileProductThumbItem[]} */ ([]),
  );
  const [total, setTotal] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [error, setError] = useState("");
  const [unavailableHint, setUnavailableHint] = useState("");
  const [failedThumbIds, setFailedThumbIds] = useState(
    /** @type {Set<string>} */ () => new Set(),
  );

  const loadFirstPage = useCallback(async () => {
    const result = await fetchUserProducts(targetUserId, {
      page: 1,
      limit: USER_PROFILE_PRODUCTS_PAGE_SIZE,
    });
    setItems(result.items);
    setTotal(result.pagination?.total ?? result.items.length);
  }, [targetUserId]);

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setError("");
    setUnavailableHint("");
    setFailedThumbIds(new Set());
    setIsExpanded(false);
    setTotal(0);

    void (async () => {
      try {
        await loadFirstPage();
        if (cancelled) return;
        setPhase("success");
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK,
        );
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targetUserId, loadFirstPage]);

  const visibleItems = useMemo(
    () => (isExpanded ? items : items.slice(0, USER_PROFILE_PRODUCTS_PAGE_SIZE)),
    [isExpanded, items],
  );

  const canExpand = total > USER_PROFILE_PRODUCTS_PAGE_SIZE;
  const showMore = !isExpanded && canExpand;
  const showLess = isExpanded && canExpand;

  const handleShowMore = async () => {
    if (!canExpand || isLoadingAll) return;
    setIsLoadingAll(true);
    setError("");
    try {
      if (items.length >= total) {
        setIsExpanded(true);
        return;
      }
      const result = await fetchAllUserProducts(targetUserId);
      setItems(result.items);
      setTotal(result.pagination.total);
      setIsExpanded(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK,
      );
    } finally {
      setIsLoadingAll(false);
    }
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
    <div className="user-profile-purchases">
      <div className="user-profile-purchases__heading-row">
        {showViewAll ? (
          <button
            type="button"
            className="user-profile-purchases__heading user-profile-purchases__heading_action"
            onClick={onViewAllProducts}
          >
            {USER_PROFILE_PRODUCTS_UI.HEADING}
          </button>
        ) : (
          <h3 className="user-profile-purchases__heading">
            {USER_PROFILE_PRODUCTS_UI.HEADING}
          </h3>
        )}
        {showViewAll ? (
          <button
            type="button"
            className="user-profile-purchases__view-all"
            onClick={onViewAllProducts}
          >
            {USER_PROFILE_PRODUCTS_UI.VIEW_ALL}
          </button>
        ) : null}
      </div>
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
          {error}
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
          disabled={isLoadingAll}
        >
          {isLoadingAll
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
      {error && items.length > 0 ? (
        <p
          className="user-profile-purchases__state user-profile-purchases__state_error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {unavailableHint ? (
        <p className="user-profile-purchases__hint" role="status">
          {unavailableHint}
        </p>
      ) : null}
    </div>
  );
}
