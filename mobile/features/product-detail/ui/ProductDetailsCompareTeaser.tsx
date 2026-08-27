import { GitCompareArrows } from "@/shared/ui/productDetailsLucideIcons";

import { useComparableProductsQuery } from "@/entities/product/model/useComparableProductsQuery";
import { PRODUCT_COMPARE_UI } from "@/shared/config";

import { ProductDetailsFeatureCard } from "@/entities/product/ui/ProductDetailsFeatureCard";

type ProductDetailsCompareTeaserProps = {
  productId: string;
  enabled?: boolean;
  onPress: () => void;
};

export const ProductDetailsCompareTeaser = ({
  productId,
  enabled = true,
  onPress,
}: ProductDetailsCompareTeaserProps) => {
  const compareQuery = useComparableProductsQuery({
    productId,
    enabled: enabled && String(productId ?? "").trim().length > 0,
  });

  if (!enabled || (compareQuery.data ?? []).length === 0) {
    return null;
  }

  return (
    <ProductDetailsFeatureCard
      icon={GitCompareArrows}
      title={PRODUCT_COMPARE_UI.DETAILS_TEASER_TITLE}
      subtitle={PRODUCT_COMPARE_UI.DETAILS_TEASER_SUBTITLE}
      ariaLabel={PRODUCT_COMPARE_UI.DETAILS_TEASER_ARIA}
      onPress={onPress}
    />
  );
};
