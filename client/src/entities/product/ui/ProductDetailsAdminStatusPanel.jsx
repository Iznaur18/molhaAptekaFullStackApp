import { PRODUCT_MODERATION_APPROVED } from "../model/productModerationConstants.js";
import { getProductModerationBadgeLabel } from "../lib/getProductModerationUi.js";
import {
  COMMON_UI,
  PRODUCT_CARD_UI,
  PRODUCT_DETAILS_ADMIN_STATUS_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductDetailsAdminStatusPanel.css";

/**
 * @param {import("../model/types.js").ProductFromApi["productSeller"]} seller
 */
function formatSellerRating(seller) {
  if (seller == null || typeof seller !== "object") return COMMON_UI.EM_DASH;
  const raw = seller.userRatingByVotes;
  if (raw == null || raw === "") return COMMON_UI.EM_DASH;
  const n = Number(raw);
  return Number.isFinite(n) ? n.toFixed(1) : String(raw);
}

/**
 * @param {{ product: import("../model/types.js").ProductFromApi; showSalesLock?: boolean }} props
 */
export function ProductDetailsAdminStatusPanel({
  product,
  showSalesLock = true,
}) {
  const isListedForOthers = product.productIsAvailable !== false;
  const hasOpenSalesLocked = product.hasOpenSales === true;
  const moderationLabel = getProductModerationBadgeLabel(product);
  const moderationComment = String(product.productModerationComment ?? "").trim();
  const seller = product.productSeller;
  const sellerObj =
    seller != null && typeof seller === "object" ? seller : null;
  const sellerEmail =
    sellerObj?.email != null && String(sellerObj.email).trim() !== ""
      ? String(sellerObj.email).trim()
      : COMMON_UI.EM_DASH;
  const sellerPhone =
    sellerObj?.userPhoneNumber != null &&
    String(sellerObj.userPhoneNumber).trim() !== ""
      ? String(sellerObj.userPhoneNumber).trim()
      : COMMON_UI.EM_DASH;

  return (
    <section
      className="product-details-admin-status"
      aria-label={PRODUCT_DETAILS_ADMIN_STATUS_UI.SECTION_ARIA}
    >
      <h3 className="product-details-admin-status__heading">
        {PRODUCT_DETAILS_ADMIN_STATUS_UI.HEADING}
      </h3>
      <dl className="product-details-admin-status__list">
        <div className="product-details-admin-status__row">
          <dt>{PRODUCT_DETAILS_ADMIN_STATUS_UI.MODERATION_STATUS_LABEL}</dt>
          <dd>
            <span
              className={`product-moderation-badge product-moderation-badge_${
                product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED
              }`}
            >
              {moderationLabel}
            </span>
          </dd>
        </div>
        {moderationComment ? (
          <div className="product-details-admin-status__row">
            <dt>{PRODUCT_DETAILS_ADMIN_STATUS_UI.MODERATION_COMMENT_LABEL}</dt>
            <dd className="product-details-admin-status__value--multiline">
              {moderationComment}
            </dd>
          </div>
        ) : null}
        <div className="product-details-admin-status__row">
          <dt>{PRODUCT_DETAILS_ADMIN_STATUS_UI.CATALOG_LABEL}</dt>
          <dd>
            {isListedForOthers
              ? PRODUCT_CARD_UI.AVAILABILITY_STATUS_VISIBLE
              : PRODUCT_CARD_UI.AVAILABILITY_STATUS_HIDDEN}
          </dd>
        </div>
        {showSalesLock ? (
          <div className="product-details-admin-status__row">
            <dt>{PRODUCT_DETAILS_ADMIN_STATUS_UI.SALES_LOCK_LABEL}</dt>
            <dd
              className={
                hasOpenSalesLocked
                  ? "product-details-admin-status__value product-details-admin-status__value--locked"
                  : "product-details-admin-status__value"
              }
            >
              {hasOpenSalesLocked
                ? PRODUCT_DETAILS_ADMIN_STATUS_UI.SALES_LOCK_BLOCKED
                : PRODUCT_DETAILS_ADMIN_STATUS_UI.SALES_LOCK_CLEAR}
            </dd>
          </div>
        ) : null}
      </dl>
      {showSalesLock && hasOpenSalesLocked ? (
        <p className="product-details-admin-status__hint">
          {PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}
        </p>
      ) : null}
      {sellerObj ? (
        <>
          <h4 className="product-details-admin-status__subheading">
            {PRODUCT_DETAILS_ADMIN_STATUS_UI.SELLER_SECTION_HEADING}
          </h4>
          <dl className="product-details-admin-status__list">
            <div className="product-details-admin-status__row">
              <dt>{PRODUCT_DETAILS_ADMIN_STATUS_UI.SELLER_EMAIL_LABEL}</dt>
              <dd>{sellerEmail}</dd>
            </div>
            <div className="product-details-admin-status__row">
              <dt>{PRODUCT_DETAILS_ADMIN_STATUS_UI.SELLER_PHONE_LABEL}</dt>
              <dd>{sellerPhone}</dd>
            </div>
            <div className="product-details-admin-status__row">
              <dt>{PRODUCT_DETAILS_ADMIN_STATUS_UI.SELLER_RATING_LABEL}</dt>
              <dd>{formatSellerRating(sellerObj)}</dd>
            </div>
          </dl>
        </>
      ) : null}
    </section>
  );
}
