import { useState } from "react";
import { Info } from "lucide-react";
import { isProductBuyNFreeActive } from "@izibuy/shared-lib";

import { PRODUCT_BUY_N_FREE_UI } from "../../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../../shared/ui/icon/index.js";
import { ProductBadgeExplainSheet } from "../../../product-badge-explain/ui/ProductBadgeExplainSheet.jsx";
import { useMyProductBuyNFreeProgressQuery } from "../../model/useMyProductBuyNFreeProgressQuery.js";

import "./ProductDetailsBuyNFreeOffer.css";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function ProductDetailsBuyNFreeOffer({
  product,
  isAuthorized,
  onRequestLogin,
}) {
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const isActive = isProductBuyNFreeActive(product);
  const productId = isActive ? String(product._id ?? "") : "";
  const threshold = Math.max(
    2,
    Math.floor(Number(product.productBuyNFreeThreshold) || 0),
  );
  const progressQuery = useMyProductBuyNFreeProgressQuery({
    productId,
    enabled: isActive && isAuthorized && productId.length > 0,
  });

  if (!isActive) {
    return null;
  }

  const bought = isAuthorized
    ? Math.max(0, Math.floor(Number(progressQuery.data?.completedPaidOrderCount) || 0))
    : 0;
  const isReady = isAuthorized && progressQuery.data?.freeEligible === true;
  const isPending = isAuthorized && progressQuery.data?.freeClaimPending === true;
  const filled = isReady || isPending ? threshold : Math.min(bought, threshold);
  const remaining = Math.max(0, threshold - filled);

  let statusText = PRODUCT_BUY_N_FREE_UI.DETAILS_GUEST(threshold);
  let variant = "guest";
  if (isAuthorized) {
    if (isPending) {
      statusText = PRODUCT_BUY_N_FREE_UI.DETAILS_PENDING_CLAIM;
      variant = "pending";
    } else if (isReady) {
      statusText = PRODUCT_BUY_N_FREE_UI.DETAILS_READY;
      variant = "ready";
    } else {
      statusText =
        remaining > 0
          ? PRODUCT_BUY_N_FREE_UI.DETAILS_REMAINING(remaining)
          : PRODUCT_BUY_N_FREE_UI.DETAILS_PROGRESS(filled, threshold);
      variant = "progress";
    }
  }

  const progressLabel = PRODUCT_BUY_N_FREE_UI.DETAILS_PROGRESS(
    Math.min(filled, threshold),
    threshold,
  );

  return (
    <>
      <aside
        className={[
          "product-details-buy-n-free",
          `product-details-buy-n-free--${variant}`,
        ].join(" ")}
        role="status"
        aria-label={[PRODUCT_BUY_N_FREE_UI.DETAILS_ARIA, statusText].join(". ")}
      >
        <button
          type="button"
          className="product-details-buy-n-free__info"
          aria-label={PRODUCT_BUY_N_FREE_UI.DETAILS_INFO_ARIA}
          onClick={() => setIsExplainOpen(true)}
        >
          <AppIcon icon={Info} size="sm" strokeWidth={2.25} />
        </button>

        <div className="product-details-buy-n-free__head">
          <div className="product-details-buy-n-free__copy">
            <span className="product-details-buy-n-free__title">
              {PRODUCT_BUY_N_FREE_UI.DETAILS_TITLE(threshold)}
            </span>
            <span className="product-details-buy-n-free__status">{statusText}</span>
          </div>
          {variant === "ready" ? (
            <span className="product-details-buy-n-free__badge">
              {PRODUCT_BUY_N_FREE_UI.DETAILS_READY_BADGE}
            </span>
          ) : null}
          {!isAuthorized ? (
            <button
              type="button"
              className="product-details-buy-n-free__login"
              onClick={onRequestLogin}
            >
              {PRODUCT_BUY_N_FREE_UI.DETAILS_LOGIN}
            </button>
          ) : null}
        </div>

        <div
          className="product-details-buy-n-free__track"
          aria-hidden="true"
        >
          {Array.from({ length: threshold }, (_, index) => {
            const step = index + 1;
            const done = step <= filled;
            const isCurrent = !isReady && !isPending && step === filled + 1;
            return (
              <span
                key={step}
                className={[
                  "product-details-buy-n-free__stamp",
                  done ? "product-details-buy-n-free__stamp--done" : "",
                  isCurrent ? "product-details-buy-n-free__stamp--current" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="product-details-buy-n-free__stamp-mark">
                  {done ? "✓" : step}
                </span>
              </span>
            );
          })}
          <span
            className={[
              "product-details-buy-n-free__gift",
              isReady || isPending
                ? "product-details-buy-n-free__gift--unlocked"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="product-details-buy-n-free__gift-label">
              {PRODUCT_BUY_N_FREE_UI.DETAILS_STAMP_GIFT}
            </span>
            <span className="product-details-buy-n-free__gift-value">
              {PRODUCT_BUY_N_FREE_UI.DETAILS_READY_BADGE}
            </span>
          </span>
        </div>

        {isAuthorized && variant === "progress" ? (
          <div className="product-details-buy-n-free__meter" aria-hidden="true">
            <div
              className="product-details-buy-n-free__meter-fill"
              style={{ width: `${Math.round((filled / threshold) * 100)}%` }}
            />
            <span className="product-details-buy-n-free__meter-label">
              {progressLabel}
            </span>
          </div>
        ) : null}
      </aside>

      <ProductBadgeExplainSheet
        isOpen={isExplainOpen}
        title={PRODUCT_BUY_N_FREE_UI.DETAILS_EXPLAIN_TITLE}
        description={PRODUCT_BUY_N_FREE_UI.DETAILS_EXPLAIN(threshold)}
        onClose={() => setIsExplainOpen(false)}
      />
    </>
  );
}
