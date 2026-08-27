import { TicketPercent } from "@/shared/ui/productDetailsLucideIcons";

import { PRODUCT_PROMO_CODE_UI } from "@/shared/config";

import { ProductDetailsFeatureCard } from "@/entities/product/ui/ProductDetailsFeatureCard";

type ProductDetailsPromoTeaserProps = {
  product: Record<string, unknown>;
  onPress: () => void;
};

export const ProductDetailsPromoTeaser = ({
  product,
  onPress,
}: ProductDetailsPromoTeaserProps) => {
  if (product.productHasActivePromoCodes !== true) {
    return null;
  }

  return (
    <ProductDetailsFeatureCard
      icon={TicketPercent}
      title={PRODUCT_PROMO_CODE_UI.DETAILS_TEASER_TITLE}
      subtitle={PRODUCT_PROMO_CODE_UI.DETAILS_TEASER_SUBTITLE}
      ariaLabel={PRODUCT_PROMO_CODE_UI.DETAILS_TEASER_ARIA}
      onPress={onPress}
    />
  );
};
