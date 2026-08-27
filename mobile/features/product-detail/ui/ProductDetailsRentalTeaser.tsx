import { KeyRound } from "@/shared/ui/productDetailsLucideIcons";
import {
  isProductRentalConfigured,
  PRODUCT_RENTAL_PRICE_UNIT_HOUR,
} from "@izibuy/shared-lib";

import { PRODUCT_RENTAL_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";

import { ProductDetailsFeatureCard } from "@/entities/product/ui/ProductDetailsFeatureCard";

type ProductDetailsRentalTeaserProps = {
  product: Record<string, unknown>;
  onPress: () => void;
};

export const ProductDetailsRentalTeaser = ({
  product,
  onPress,
}: ProductDetailsRentalTeaserProps) => {
  if (
    product.productRentalEnabled !== true ||
    !isProductRentalConfigured(product)
  ) {
    return null;
  }

  const priceRub = Math.floor(Number(product.productRentalPriceRub));
  const priceLabel = formatPriceRub(priceRub);
  const subtitle =
    product.productRentalPriceUnit === PRODUCT_RENTAL_PRICE_UNIT_HOUR
      ? PRODUCT_RENTAL_UI.DETAILS_TEASER_PRICE_HOUR(priceLabel)
      : PRODUCT_RENTAL_UI.DETAILS_TEASER_PRICE_DAY(priceLabel);

  return (
    <ProductDetailsFeatureCard
      icon={KeyRound}
      title={PRODUCT_RENTAL_UI.DETAILS_TEASER_TITLE}
      subtitle={subtitle}
      ariaLabel={PRODUCT_RENTAL_UI.DETAILS_TEASER_ARIA}
      onPress={onPress}
    />
  );
};
