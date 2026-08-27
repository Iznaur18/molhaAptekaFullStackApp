import { MessageCircle } from "@/shared/ui/productDetailsLucideIcons";

import { ProductDetailsFeatureCard } from "@/entities/product/ui/ProductDetailsFeatureCard";
import { PRODUCT_QA_UI } from "@/shared/config";

type ProductDetailsQaTeaserProps = {
  visible: boolean;
  onPress: () => void;
};

export const ProductDetailsQaTeaser = ({
  visible,
  onPress,
}: ProductDetailsQaTeaserProps) => {
  if (!visible) {
    return null;
  }

  return (
    <ProductDetailsFeatureCard
      icon={MessageCircle}
      title={PRODUCT_QA_UI.DETAILS_TEASER_TITLE}
      subtitle={PRODUCT_QA_UI.DETAILS_TEASER_SUBTITLE}
      ariaLabel={PRODUCT_QA_UI.DETAILS_TEASER_ARIA}
      onPress={onPress}
    />
  );
};
