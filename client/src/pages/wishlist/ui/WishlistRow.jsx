import { resolveProductImageUrls } from "../../../entities/product/lib/resolveProductImageUrls.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../../entities/product/model/productConstants.js";
import { useQueryClient } from "@tanstack/react-query";

import { patchProductWishlistCount } from "../../../entities/wishlist/lib/patchProductWishlistCount.js";
import { useWishlist } from "../../../entities/wishlist/model/useWishlist.js";
import { COMMON_UI, WISHLIST_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./WishlistRow.css";

const pickImageUrl = (product) => {
  const first = resolveProductImageUrls(product)[0];
  return typeof first === "string" && /^https?:\/\//i.test(first.trim())
    ? first.trim()
    : PRODUCT_IMAGE_PLACEHOLDER_URL;
};

/**
 * @param {{
 *   product: import('../../../entities/product/model/types.js').ProductFromApi;
 *   onProductClick?: (product: import('../../../entities/product/model/types.js').ProductFromApi) => void;
 *   onProductStatsUpdate?: (
 *     productId: string,
 *     stats: { productWishlistCount: number },
 *   ) => void;
 * }} props
 */
export function WishlistRow({ product, onProductClick, onProductStatsUpdate }) {
  const queryClient = useQueryClient();
  const { removeItem } = useWishlist();
  const heading = product.productName?.trim() || COMMON_UI.EM_DASH;
  const priceText = formatPriceRub(product.productPrice);

  const handleRemove = () => {
    const productId = String(product._id);
    const baseCount = Math.max(0, Math.floor(Number(product.productWishlistCount) || 0));
    patchProductWishlistCount(queryClient, productId, -1);
    removeItem(productId);
    onProductStatsUpdate?.(productId, {
      productWishlistCount: Math.max(0, baseCount - 1),
    });
  };

  return (
    <article className="wishlist-row">
      <img
        className="wishlist-row__image"
        src={pickImageUrl(product)}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div className="wishlist-row__info">
        <button
          type="button"
          className="wishlist-row__heading-button"
          onClick={() => onProductClick?.(product)}
        >
          {heading}
        </button>
        <p className="wishlist-row__price">{priceText}</p>
      </div>
      <button
        type="button"
        className="wishlist-row__remove"
        aria-label={WISHLIST_PAGE_UI.REMOVE_ARIA(heading)}
        onClick={handleRemove}
      >
        <ModalCloseIcon />
      </button>
    </article>
  );
}
