import { getProductPurchaseLimit } from "../../lib/getProductPurchaseLimit.js";
import { isProductOnSale } from "../../lib/isProductOnSale.js";
import { PRODUCT_SALE_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductDetailsTeaser } from "./ProductDetailsTeaser.jsx";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   sellerId: string;
 *   onOpenSeller: (sellerId: string) => void;
 * }} props
 */
export function ProductDetailsSaleTeaser({ product, sellerId, onOpenSeller }) {
  const trimmedSellerId = sellerId.trim();

  if (!isProductOnSale(product) || trimmedSellerId.length === 0) {
    return null;
  }

  const remainingCount = getProductPurchaseLimit(product);

  return (
    <ProductDetailsTeaser
      title={PRODUCT_SALE_UI.DETAILS_TEASER_TITLE}
      subtitle={PRODUCT_SALE_UI.DETAILS_TEASER_REMAINING(remainingCount)}
      goLabel={PRODUCT_SALE_UI.DETAILS_TEASER_GO}
      ariaLabel={PRODUCT_SALE_UI.DETAILS_TEASER_ARIA}
      onClick={() => onOpenSeller(trimmedSellerId)}
    />
  );
}
