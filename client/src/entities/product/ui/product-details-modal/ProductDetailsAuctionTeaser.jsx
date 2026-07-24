import { useTopPriceOffersQuery } from "../../../product-price-offer/model/useTopPriceOffersQuery.js";
import { PRODUCT_PRICE_OFFER_UI } from "../../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../../shared/lib/formatPriceRub.js";
import { ProductDetailsTeaser } from "./ProductDetailsTeaser.jsx";

/**
 * @param {{
 *   productId: string;
 *   auctionActive: boolean;
 *   onPress: () => void;
 * }} props
 */
export function ProductDetailsAuctionTeaser({ productId, auctionActive, onPress }) {
  const offersQuery = useTopPriceOffersQuery({
    productId,
    enabled: auctionActive,
  });
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
    <ProductDetailsTeaser
      title={PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_TITLE}
      subtitle={subtitle}
      goLabel={PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_GO}
      ariaLabel={PRODUCT_PRICE_OFFER_UI.DETAILS_TEASER_ARIA}
      onClick={onPress}
    />
  );
}
