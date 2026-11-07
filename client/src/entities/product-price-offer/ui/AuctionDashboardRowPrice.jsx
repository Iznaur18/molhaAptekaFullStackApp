import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * Крупная цена ставки справа в шапке карточки.
 *
 * @param {{ price: number; caption: string }} props
 */
export function AuctionDashboardRowPrice({ price, caption }) {
  return (
    <div className="auction-dashboard-row__price-box">
      <span className="auction-dashboard-row__price">{formatPriceRub(price)}</span>
      <span className="auction-dashboard-row__price-caption">{caption}</span>
    </div>
  );
}
