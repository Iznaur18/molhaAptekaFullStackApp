import { Tag } from "lucide-react";

import { getProductPurchaseLimit } from "../../lib/getProductPurchaseLimit.js";
import { isProductOnSale } from "../../lib/isProductOnSale.js";
import { PRODUCT_SALE_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductDetailsFeatureCard } from "./ProductDetailsFeatureCard.jsx";

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
    <ProductDetailsFeatureCard
      icon={Tag}
      title={PRODUCT_SALE_UI.DETAILS_TEASER_TITLE}
      subtitle={PRODUCT_SALE_UI.DETAILS_TEASER_REMAINING(remainingCount)}
      ariaLabel={PRODUCT_SALE_UI.DETAILS_TEASER_ARIA}
      onClick={() => onOpenSeller(trimmedSellerId)}
    />
  );
}
