import { useEffect, useState } from "react";

import { resolveProductImageUrls } from "../../product/lib/resolveProductImageUrls.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../product/model/productConstants.js";
import { fetchUserPurchases } from "../api/fetchUserPurchases.js";
import {
  API_CLIENT_UI,
  USER_PROFILE_PURCHASES_UI,
} from "../../../shared/config/appUiCopy.js";

import "./UserProfilePurchasesList.css";

const PURCHASE_THUMB_SIZE_PX = 48;

/**
 * @param {import('../model/userPurchaseTypes.js').UserPurchaseListItem} item
 */
function getPurchaseThumbSrc(item) {
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
 * }} props
 */
export function UserProfilePurchasesList({ targetUserId, onProductClick }) {
  const [phase, setPhase] = useState("loading");
  const [items, setItems] = useState(
    /** @type {import('../model/userPurchaseTypes.js').UserPurchaseListItem[]} */ ([]),
  );
  const [error, setError] = useState("");
  const [unavailableHint, setUnavailableHint] = useState("");
  const [failedThumbIds, setFailedThumbIds] = useState(
    /** @type {Set<string>} */ () => new Set(),
  );

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setError("");
    setUnavailableHint("");
    setFailedThumbIds(new Set());

    void (async () => {
      try {
        const list = await fetchUserPurchases(targetUserId);
        if (cancelled) return;
        setItems(list);
        setPhase("success");
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.FETCH_USER_PURCHASES_FALLBACK,
        );
        setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  /** @param {import('../model/userPurchaseTypes.js').UserPurchaseListItem} item */
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
    setUnavailableHint(USER_PROFILE_PURCHASES_UI.UNAVAILABLE);
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

  return (
    <div className="user-profile-purchases">
      <h3 className="user-profile-purchases__heading">
        {USER_PROFILE_PURCHASES_UI.HEADING}
      </h3>
      {phase === "loading" ? (
        <p className="user-profile-purchases__state">
          {USER_PROFILE_PURCHASES_UI.LOADING}
        </p>
      ) : null}
      {phase === "error" ? (
        <p
          className="user-profile-purchases__state user-profile-purchases__state_error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {phase === "success" && items.length === 0 ? (
        <p className="user-profile-purchases__state">
          {USER_PROFILE_PURCHASES_UI.EMPTY}
        </p>
      ) : null}
      {phase === "success" && items.length > 0 ? (
        <ul className="user-profile-purchases__list" role="list">
          {items.map((item) => {
            const isUnavailable = !item.viewable || item.product == null;
            const thumbSrc = failedThumbIds.has(item.productId)
              ? PRODUCT_IMAGE_PLACEHOLDER_URL
              : getPurchaseThumbSrc(item);

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
                  aria-label={item.productName}
                  title={item.productName}
                >
                  <img
                    className="user-profile-purchases__thumb"
                    src={thumbSrc}
                    alt=""
                    width={PURCHASE_THUMB_SIZE_PX}
                    height={PURCHASE_THUMB_SIZE_PX}
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
      {unavailableHint ? (
        <p className="user-profile-purchases__hint" role="status">
          {unavailableHint}
        </p>
      ) : null}
    </div>
  );
}
