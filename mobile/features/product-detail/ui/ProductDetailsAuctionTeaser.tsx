import { Gavel } from "@/shared/ui/productDetailsLucideIcons";

import { useTopPriceOffersQuery } from "@/entities/product-price-offer/model/useTopPriceOffersQuery";
import { PRODUCT_PRICE_OFFER_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";

import { ProductDetailsFeatureCard } from "@/entities/product/ui/ProductDetailsFeatureCard";

type ProductDetailsAuctionTeaserProps = {
  productId: string;
  auctionActive: boolean;
  onPress: () => void;
};

export const ProductDetailsAuctionTeaser = ({
  productId,
  auctionActive,
  onPress,
}: ProductDetailsAuctionTeaserProps) => {
  const offersQuery = useTopPriceOffersQuery(productId, auctionActive);
  const topOffer = offersQuery.data?.[0];
  const topPrice =
    topOffer != null && Number.isFinite(Number(topOffer.offerPrice))
      ? Number(topOffer.offerPrice)
      : null;

  if (!auctionActive) {
    return null;
  }

  const subtitle =
    topPrice != null
      ? PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_BEST_OFFER(formatPriceRub(topPrice))
      : PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_NO_OFFERS;

  return (
    <ProductDetailsFeatureCard
      icon={Gavel}
      title={PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_TITLE}
      subtitle={subtitle}
      ariaLabel={PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_ARIA}
      onPress={onPress}
    />
  );
};
