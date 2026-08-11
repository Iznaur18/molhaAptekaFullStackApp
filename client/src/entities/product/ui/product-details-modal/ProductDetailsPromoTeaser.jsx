import { TicketPercent } from "lucide-react";

import { PRODUCT_PROMO_CODE_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductDetailsFeatureCard } from "./ProductDetailsFeatureCard.jsx";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 *   onPress: () => void;
 * }} props
 */
export function ProductDetailsPromoTeaser({ product, onPress }) {
  if (product?.productHasActivePromoCodes !== true) {
    return null;
  }

  return (
    <ProductDetailsFeatureCard
      icon={TicketPercent}
      title={PRODUCT_PROMO_CODE_UI.DETAILS_TEASER_TITLE}
      subtitle={PRODUCT_PROMO_CODE_UI.DETAILS_TEASER_SUBTITLE}
      ariaLabel={PRODUCT_PROMO_CODE_UI.DETAILS_TEASER_ARIA}
      onClick={onPress}
    />
  );
}
