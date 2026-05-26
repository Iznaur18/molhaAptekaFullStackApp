import { PRODUCT_PRICE_OFFER_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductPriceOffer.css";

export function ProductPriceOfferSectionTitle() {
  return (
    <h1 className="product-price-offer__page-title">
      {PRODUCT_PRICE_OFFER_UI.TAB_AUCTION}
    </h1>
  );
}
