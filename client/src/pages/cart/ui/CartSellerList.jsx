import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
} from "../../../entities/user/lib/profileImageFocus.js";
import { pickUserProfilePhotoUrl } from "../../../entities/user/lib/pickUserProfilePhotoUrl.js";
import { DEFAULT_USER_AVATAR_URL } from "../../../entities/user/model/userConstants.js";
import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import { resolveProductImageUrl } from "../../../entities/product/lib/resolveProductImageUrl.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../../entities/product/model/productConstants.js";
import { CART_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./CartSellerList.css";

const THUMB_SIZE_PX = 44;

/**
 * @param {{
 *   lines: import('../../../entities/cart/lib/selectCartLines.js').CartLine[];
 * }} props
 */
function CartSellerProductThumbs({ lines }) {
  return (
    <div className="cart-seller-row__thumbs" aria-hidden>
      {lines.map((line) => (
        <CartSellerProductThumb key={line.productId} line={line} />
      ))}
    </div>
  );
}

/**
 * @param {{
 *   line: import('../../../entities/cart/lib/selectCartLines.js').CartLine;
 * }} props
 */
function CartSellerProductThumb({ line }) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveProductImageUrl(line.product);
  const src = failed || !resolved ? PRODUCT_IMAGE_PLACEHOLDER_URL : resolved;

  return (
    <img
      className="cart-seller-row__thumb"
      src={src}
      alt=""
      width={THUMB_SIZE_PX}
      height={THUMB_SIZE_PX}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * @param {{
 *   group: import('../../../entities/cart/lib/groupCartLinesBySeller.js').CartSellerGroup;
 *   summary: {
 *     selectedLines: Array<{ quantity?: number }>;
 *     selectedTotal: number;
 *   };
 *   onOpen: (sellerId: string) => void;
 * }} props
 */
function CartSellerRow({ group, summary, onOpen }) {
  const [imgFailed, setImgFailed] = useState(false);

  const sellerForPhoto = useMemo(
    () => ({
      userAvatarUrl: group.sellerAvatarUrl,
      userAvatarFocus: group.sellerAvatarFocus,
    }),
    [group.sellerAvatarFocus, group.sellerAvatarUrl],
  );

  const picked = pickUserProfilePhotoUrl(sellerForPhoto);
  const avatarSrc = !imgFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  const avatarObjectPosition = formatProfileImageObjectPosition(
    getUserAvatarFocus(sellerForPhoto),
  );
  const displayName =
    group.sellerName?.trim() || CART_PAGE_UI.SECTION_SELLER_FALLBACK;
  const itemsCount = summary.selectedLines.reduce(
    (sum, line) => sum + (Number(line?.quantity) || 0),
    0,
  );
  const lineCount = group.lines.length;
  const countForLabel = itemsCount > 0 ? itemsCount : lineCount;

  return (
    <div className="cart-seller-row">
      <div className="cart-seller-row__top">
        <button
          type="button"
          className="cart-seller-row__main"
          onClick={() => onOpen(group.sellerId)}
        >
          <UserPremiumAvatar
            className="cart-seller-row__avatar"
            src={avatarSrc}
            alt=""
            isPremium={group.isPremiumUser}
            objectPosition={avatarObjectPosition}
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
          <span className="cart-seller-row__body">
            <UserPremiumDisplayName
              name={displayName}
              isPremium={group.isPremiumUser}
              isUserDataConfirmed={group.isUserDataConfirmed}
              className="cart-seller-row__name"
            />
            <span className="cart-seller-row__meta">
              {CART_PAGE_UI.ITEMS_COUNT(countForLabel)}
            </span>
          </span>
        </button>

        <button
          type="button"
          className="cart-seller-row__checkout"
          onClick={() => onOpen(group.sellerId)}
        >
          <span className="cart-seller-row__checkout-price">
            {formatPriceRub(summary.selectedTotal)}
          </span>
          <span className="cart-seller-row__checkout-label">
            {CART_PAGE_UI.SELLER_ROW_OPEN}
            <AppIcon
              icon={ChevronRight}
              className="cart-seller-row__checkout-arrow"
              size={16}
            />
          </span>
        </button>
      </div>

      {group.lines.length > 0 ? (
        <CartSellerProductThumbs lines={group.lines} />
      ) : null}
    </div>
  );
}

/**
 * Общий экран корзины: продавцы блоками (аватар + ник).
 *
 * @param {{
 *   entries: Array<{
 *     group: import('../../../entities/cart/lib/groupCartLinesBySeller.js').CartSellerGroup;
 *     summary: {
 *       selectedLines: Array<{ quantity?: number }>;
 *       selectedTotal: number;
 *     };
 *   }>;
 *   onOpenSeller: (sellerId: string) => void;
 * }} props
 */
export function CartSellerList({ entries, onOpenSeller }) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <ul className="cart-seller-list" role="list">
      {entries.map(({ group, summary }) => (
        <li
          key={group.sellerId || "unknown-seller"}
          className="cart-seller-list__item"
          role="listitem"
        >
          <CartSellerRow
            group={group}
            summary={summary}
            onOpen={onOpenSeller}
          />
        </li>
      ))}
    </ul>
  );
}
