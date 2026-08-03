import { GitCompareArrows } from "lucide-react";

import { PRODUCT_COMPARE_UI } from "../../../../shared/config/appUiCopy.js";
import { useComparableProductsQuery } from "../../model/useComparableProductsQuery.js";
import { ProductDetailsFeatureCard } from "./ProductDetailsFeatureCard.jsx";

/**
 * @param {{
 *   productId: string;
 *   enabled?: boolean;
 *   onPress: () => void;
 * }} props
 */
export function ProductDetailsCompareTeaser({
  productId,
  enabled = true,
  onPress,
}) {
  const compareQuery = useComparableProductsQuery({
    productId,
    enabled: enabled && String(productId ?? "").trim().length > 0,
  });
  const products = compareQuery.data ?? [];

  if (!enabled || products.length === 0) {
    return null;
  }

  return (
    <ProductDetailsFeatureCard
      icon={GitCompareArrows}
      title={PRODUCT_COMPARE_UI.DETAILS_TEASER_TITLE}
      subtitle={PRODUCT_COMPARE_UI.DETAILS_TEASER_SUBTITLE}
      ariaLabel={PRODUCT_COMPARE_UI.DETAILS_TEASER_ARIA}
      onClick={onPress}
    />
  );
}
