import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Package,
  Star,
  Users,
  Wallet,
} from "lucide-react";

import { formatSearchRowRatingCompact } from "../../user/lib/formatSearchRowRating.js";
import { formatSearchRowTotalSales } from "../../user/lib/formatSearchRowTotalSales.js";
import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
} from "../../user/lib/profileImageFocus.js";
import { pickUserProfilePhotoUrl } from "../../user/lib/pickUserProfilePhotoUrl.js";
import { UserPremiumAvatar } from "../../user/ui/UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import { DEFAULT_USER_AVATAR_URL } from "../../user/model/userConstants.js";
import {
  PRODUCT_SELLER_PREVIEW_UI,
  USER_LIST_ROW_UI,
  USER_PROFILE_COPY,
} from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import { ProductDetailsSellerStorefrontButton } from "./ProductDetailsSellerStorefrontButton.jsx";
import "./ProductDetailsSellerPreview.css";

/**
 * @param {number | undefined} value
 */
function formatFollowersCount(value) {
  if (value == null) {
    return "0";
  }

  return String(Math.max(0, Math.floor(Number(value)) || 0));
}

/**
 * @param {{
 *   seller: import("../model/types.js").ProductSellerPopulated | string | null | undefined;
 *   onOpenProfile?: (userId: string) => void;
 *   showStorefrontButton?: boolean;
 * }} props
 */
export function ProductDetailsSellerPreview({
  seller,
  onOpenProfile,
  showStorefrontButton = false,
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const sellerObj =
    seller != null && typeof seller === "object" && seller._id != null ? seller : null;
  const sellerId = sellerObj != null ? String(sellerObj._id) : "";

  useEffect(() => {
    setAvatarFailed(false);
  }, [sellerId]);

  const ratingText = useMemo(
    () => formatSearchRowRatingCompact(sellerObj?.userRatingByVotes),
    [sellerObj],
  );

  if (sellerObj == null || !sellerId) {
    return null;
  }

  const userName = sellerObj.userName?.trim() ?? "";
  const displayName = userName || USER_LIST_ROW_UI.MISSING_NAME;
  const isPremium = sellerObj.isPremiumUser === true;
  const isConfirmed = sellerObj.isUserDataConfirmed === true;
  const canOpenProfile = typeof onOpenProfile === "function";
  const listedRaw = sellerObj.sellerListedProductCount;
  const listedCount = Number(listedRaw);
  const listedProductsText = Number.isFinite(listedCount)
    ? String(Math.max(0, Math.floor(listedCount)))
    : "0";

  const pickedAvatar = pickUserProfilePhotoUrl(sellerObj);
  const avatarSrc =
    !avatarFailed && pickedAvatar ? pickedAvatar : DEFAULT_USER_AVATAR_URL;
  const avatarObjectPosition = formatProfileImageObjectPosition(
    getUserAvatarFocus(sellerObj),
  );

  const metrics = [
    {
      key: "rating",
      label: USER_LIST_ROW_UI.RATING_LABEL,
      value: ratingText,
      icon: Star,
    },
    {
      key: "totalSales",
      label: USER_PROFILE_COPY.LABELS.totalSalesAmount,
      value: formatSearchRowTotalSales(sellerObj.totalSalesAmount),
      icon: Wallet,
    },
    {
      key: "listed",
      label: PRODUCT_SELLER_PREVIEW_UI.LISTED_PRODUCTS_LABEL,
      value: listedProductsText,
      icon: Package,
    },
    {
      key: "followers",
      label: USER_LIST_ROW_UI.FOLLOWERS_LABEL,
      value: formatFollowersCount(sellerObj.followersCount),
      icon: Users,
    },
  ];

  const handleOpenProfile = () => {
    if (!canOpenProfile) return;
    onOpenProfile(sellerId);
  };

  const header = (
    <>
      <UserPremiumAvatar
        className="product-details-seller-preview__avatar"
        src={avatarSrc}
        isPremium={isPremium}
        objectPosition={avatarObjectPosition}
        decoding="async"
        onError={() => setAvatarFailed(true)}
      />
      <span className="product-details-seller-preview__header-text">
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
      </span>
      {canOpenProfile ? (
        <AppIcon
          icon={ChevronRight}
          size="md"
          strokeWidth={2.5}
          className="product-details-seller-preview__chevron"
        />
      ) : null}
    </>
  );

  const content = (
    <>
      {canOpenProfile ? (
        <button
          type="button"
          className="product-details-seller-preview__header-btn"
          aria-label={PRODUCT_SELLER_PREVIEW_UI.OPEN_PROFILE_ARIA}
          onClick={handleOpenProfile}
        >
          {header}
        </button>
      ) : (
        <span className="product-details-seller-preview__header">{header}</span>
      )}

      {showStorefrontButton ? (
        <ProductDetailsSellerStorefrontButton sellerId={sellerId} embedded />
      ) : null}

      <dl className="product-details-seller-preview__metrics">
        {metrics.map((row) => (
          <div key={row.key} className="product-details-seller-preview__metric">
            <span className="product-details-seller-preview__metric-icon" aria-hidden>
              <AppIcon icon={row.icon} size="sm" strokeWidth={2.25} />
            </span>
            <div className="product-details-seller-preview__metric-body">
              <dd className="product-details-seller-preview__metric-value">
                {row.value}
              </dd>
              <dt className="product-details-seller-preview__metric-key">{row.label}</dt>
            </div>
          </div>
        ))}
      </dl>
    </>
  );

  return (
    <section
      className={`product-details-seller-preview${
        canOpenProfile ? "" : " product-details-seller-preview--static"
      }`}
      aria-label={PRODUCT_SELLER_PREVIEW_UI.SECTION_LABEL}
    >
      {content}
    </section>
  );
}
