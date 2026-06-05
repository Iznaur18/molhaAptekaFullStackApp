import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  PRODUCT_PRICE_OFFER_UI,
  USER_LIST_ROW_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductPriceOffer.css";

/**
 * @param {{
 *   top: import('../model/types.js').PriceOfferTopEntry[];
 *   onOpenBuyer?: (userId: string) => void;
 * }} props
 */
export function ProductPriceOfferTopList({ top, onOpenBuyer }) {
  if (top.length === 0) {
    return (
      <p className="product-price-offer__empty">{PRODUCT_PRICE_OFFER_UI.EMPTY_TOP}</p>
    );
  }

  return (
    <ol className="product-price-offer__top-list">
      {top.map((row, index) => {
        const buyer = row.buyer ?? row.buyerUserId;
        const userId = buyer?._id != null ? String(buyer._id) : null;
        const name = buyer?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
        const canOpen = userId && typeof onOpenBuyer === "function";

        return (
          <li key={String(row._id)} className="product-price-offer__top-item">
            <span className="product-price-offer__top-rank">{index + 1}</span>
            {canOpen ? (
              <button
                type="button"
                className="product-price-offer__buyer-link"
                onClick={() => onOpenBuyer(userId)}
              >
                <UserPremiumDisplayName
                  name={name}
                  isPremium={buyer?.isPremiumUser === true}
                  isUserDataConfirmed={buyer?.isUserDataConfirmed === true}
                />
              </button>
            ) : (
              <UserPremiumDisplayName
                name={name}
                isPremium={buyer?.isPremiumUser === true}
                isUserDataConfirmed={buyer?.isUserDataConfirmed === true}
              />
            )}
            <span className="product-price-offer__top-price">
              {formatPriceRub(row.offerPrice)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
