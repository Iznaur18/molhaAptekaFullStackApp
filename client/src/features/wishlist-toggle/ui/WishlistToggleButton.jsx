import { useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";

import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { patchProductWishlistCount } from "../../../entities/wishlist/lib/patchProductWishlistCount.js";
import { useWishlist } from "../../../entities/wishlist/model/useWishlist.js";
import { WISHLIST_TOGGLE_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

import "./WishlistToggleButton.css";

/**
 * @param {{
 *   productId: string;
 *   product?: import('../../../entities/product/model/types.js').ProductFromApi | null;
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   currentUserId?: string | null;
 *   onProductStatsUpdate?: (
 *     productId: string,
 *     stats: { productWishlistCount: number },
 *   ) => void;
 *   className?: string;
 *   variant?: "card" | "inline";
 * }} props
 */
export function WishlistToggleButton({
  productId,
  product = null,
  isAuthorized,
  onRequestLogin,
  currentUserId = null,
  onProductStatsUpdate,
  className = "",
  variant = "card",
}) {
  const queryClient = useQueryClient();
  const { isInWishlist, toggleItem } = useWishlist();
  const id = String(productId);

  if (product && isCurrentUserProductSeller(product, currentUserId)) {
    return null;
  }

  const active = isInWishlist(id);
  const baseCount = Math.max(
    0,
    Math.floor(Number(product?.productWishlistCount) || 0),
  );

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (!isAuthorized) {
      onRequestLogin();
      return;
    }

    const delta = active ? -1 : 1;
    patchProductWishlistCount(queryClient, id, delta);
    toggleItem(id);

    const nextCount = Math.max(0, baseCount + delta);
    onProductStatsUpdate?.(id, { productWishlistCount: nextCount });
  };

  const rootClassName = [
    "wishlist-toggle",
    variant === "card" ? "wishlist-toggle--card" : "wishlist-toggle--inline",
    active ? "wishlist-toggle--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rootClassName}
      aria-label={active ? WISHLIST_TOGGLE_UI.REMOVE_ARIA : WISHLIST_TOGGLE_UI.ADD_ARIA}
      aria-pressed={active}
      onClick={handleClick}
    >
      <AppIcon icon={Heart} size="sm" strokeWidth={2.1} className="wishlist-toggle__icon" />
    </button>
  );
}
