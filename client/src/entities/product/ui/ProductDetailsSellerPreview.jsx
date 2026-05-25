import { useMemo } from "react";

import { formatSearchRowRating } from "../../user/lib/formatSearchRowRating.js";
import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import {
  COMMON_UI,
  FORMAT_BOOLEAN_RU,
  PRODUCT_SELLER_PREVIEW_UI,
  USER_LIST_ROW_UI,
  USER_PROFILE_COPY,
} from "../../../shared/config/appUiCopy.js";

import "./ProductDetailsSellerPreview.css";

const DATE_FORMAT = new Intl.DateTimeFormat(COMMON_UI.LOCALE_RU, {
  dateStyle: "short",
  timeStyle: "short",
});

/**
 * @param {string | undefined} iso
 */
function formatProfileCreatedAt(iso) {
  if (iso == null || iso === "") return COMMON_UI.EM_DASH;
  try {
    return DATE_FORMAT.format(new Date(iso));
  } catch {
    return String(iso);
  }
}

/**
 * @param {string | undefined} value
 */
function formatOptionalText(value) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : COMMON_UI.EM_DASH;
}

/**
 * @param {{
 *   seller: import("../model/types.js").ProductSellerPopulated | string | null | undefined;
 *   onOpenProfile?: (userId: string) => void;
 * }} props
 */
export function ProductDetailsSellerPreview({ seller, onOpenProfile }) {
  if (seller == null || typeof seller !== "object" || seller._id == null) {
    return null;
  }

  const userName = seller.userName?.trim() ?? "";
  const displayName = userName || USER_LIST_ROW_UI.MISSING_NAME;
  const isPremium = seller.isPremiumUser === true;
  const isConfirmed = seller.isUserDataConfirmed === true;
  const canOpenProfile = typeof onOpenProfile === "function";

  const ratingText = useMemo(
    () => formatSearchRowRating(seller.userRatingByVotes),
    [seller.userRatingByVotes],
  );
  const listedCount = Number(seller.sellerListedProductCount);
  const listedProductsText = Number.isFinite(listedCount)
    ? String(Math.max(0, Math.floor(listedCount)))
    : "0";

  const metrics = [
    {
      key: "rating",
      label: USER_LIST_ROW_UI.RATING_LABEL,
      value: ratingText,
    },
    {
      key: "confirmed",
      label: USER_LIST_ROW_UI.USER_DATA_CONFIRMED_LABEL,
      value: isConfirmed ? FORMAT_BOOLEAN_RU.YES : FORMAT_BOOLEAN_RU.NO,
    },
    {
      key: "premium",
      label: PRODUCT_SELLER_PREVIEW_UI.PREMIUM_LABEL,
      value: isPremium ? FORMAT_BOOLEAN_RU.YES : FORMAT_BOOLEAN_RU.NO,
    },
    {
      key: "email",
      label: USER_PROFILE_COPY.LABELS.email,
      value: formatOptionalText(seller.email),
    },
    {
      key: "phone",
      label: USER_PROFILE_COPY.LABELS.userPhoneNumber,
      value: formatOptionalText(seller.userPhoneNumber),
    },
    {
      key: "address",
      label: USER_PROFILE_COPY.LABELS.userAddress,
      value: formatOptionalText(seller.userAddress),
    },
    {
      key: "createdAt",
      label: USER_PROFILE_COPY.LABELS.createdAt,
      value: formatProfileCreatedAt(seller.createdAt),
    },
    {
      key: "listed",
      label: PRODUCT_SELLER_PREVIEW_UI.LISTED_PRODUCTS_LABEL,
      value: listedProductsText,
    },
  ];

  const handleClick = () => {
    if (!canOpenProfile) return;
    onOpenProfile(String(seller._id));
  };

  const content = (
    <>
      <span className="product-details-seller-preview__label">
        {PRODUCT_SELLER_PREVIEW_UI.SECTION_LABEL}
      </span>
      <UserPremiumDisplayName
        name={displayName}
        isPremium={isPremium}
        isUserDataConfirmed={isConfirmed}
        className="product-details-seller-preview__name"
        textClassName="product-details-seller-preview__name-text"
      />
      <dl className="product-details-seller-preview__metrics">
        {metrics.map((row) => (
          <div key={row.key} className="product-details-seller-preview__metric">
            <dt className="product-details-seller-preview__metric-key">
              {row.label}
            </dt>
            <dd className="product-details-seller-preview__metric-value">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );

  if (!canOpenProfile) {
    return (
      <section
        className="product-details-seller-preview product-details-seller-preview--static"
        aria-label={PRODUCT_SELLER_PREVIEW_UI.SECTION_LABEL}
      >
        {content}
      </section>
    );
  }

  return (
    <button
      type="button"
      className="product-details-seller-preview"
      aria-label={PRODUCT_SELLER_PREVIEW_UI.OPEN_PROFILE_ARIA}
      onClick={handleClick}
    >
      {content}
    </button>
  );
}
