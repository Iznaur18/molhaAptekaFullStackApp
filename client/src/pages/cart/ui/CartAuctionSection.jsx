import { CART_AUCTION_UI } from "../../../shared/config/appUiCopy.js";

import { CartAuctionLine } from "./CartAuctionLine.jsx";

import "./CartAuctionSection.css";

/**
 * Выигранные аукционные лоты в корзине: принятые продавцом ставки, ожидающие оплаты.
 *
 * @param {{
 *   bids: import('../../../entities/product-price-offer/model/types.js').PriceOfferBuyerBidRow[];
 *   defaultDeliveryAddress: Record<string, unknown>;
 *   onCheckoutSuccess: () => void;
 * }} props
 */
export function CartAuctionSection({ bids, defaultDeliveryAddress, onCheckoutSuccess }) {
  if (bids.length === 0) {
    return null;
  }

  return (
    <section className="cart-auction">
      <header className="cart-auction__header">
        <h2 className="cart-auction__title">{CART_AUCTION_UI.SECTION_TITLE}</h2>
        <p className="cart-auction__hint">{CART_AUCTION_UI.SECTION_HINT}</p>
      </header>
      <ul className="cart-auction__list" role="list">
        {bids.map((bid) => (
          <li key={bid._id} className="cart-auction__item" role="listitem">
            <CartAuctionLine
              bid={bid}
              defaultDeliveryAddress={defaultDeliveryAddress}
              onCheckoutSuccess={onCheckoutSuccess}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
