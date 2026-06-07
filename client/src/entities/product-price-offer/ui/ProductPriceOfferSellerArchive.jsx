import { useSellerPriceOfferArchiveQuery } from "../model/useSellerPriceOfferArchiveQuery.js";
import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  API_CLIENT_UI,
  PRODUCT_PRICE_OFFER_UI,
  USER_LIST_ROW_UI,
} from "../../../shared/config/appUiCopy.js";

import { ProductPriceOfferSectionTitle } from "./ProductPriceOfferSectionTitle.jsx";

import "./ProductPriceOffer.css";

/**
 * @param {{
 *   productId: string;
 *   onOpenBuyer?: (userId: string) => void;
 * }} props
 */
export function ProductPriceOfferSellerArchive({ productId, onOpenBuyer }) {
  const offersQuery = useSellerPriceOfferArchiveQuery({ productId });

  const offers = offersQuery.data ?? [];
  const phase = offersQuery.isPending
    ? "loading"
    : offersQuery.isError && offers.length === 0
      ? "error"
      : "success";
  const error =
    offersQuery.error instanceof Error
      ? offersQuery.error.message
      : API_CLIENT_UI.FETCH_SELLER_PRICE_OFFERS_FALLBACK;

  if (phase === "loading") {
    return (
      <p className="product-price-offer__empty">
        {PRODUCT_PRICE_OFFER_UI.SELLER_LOADING}
      </p>
    );
  }

  if (phase === "error" && offers.length === 0) {
    return (
      <p className="product-price-offer__error" role="alert">
        {error}
      </p>
    );
  }

  if (offers.length === 0) {
    return (
      <p className="product-price-offer__empty">
        {PRODUCT_PRICE_OFFER_UI.ARCHIVE_EMPTY}
      </p>
    );
  }

  return (
    <section className="product-price-offer">
      <ProductPriceOfferSectionTitle />
      <h2 className="product-price-offer__heading">
        {PRODUCT_PRICE_OFFER_UI.ARCHIVE_SECTION_TITLE}
      </h2>
      <ul className="product-price-offer__seller-list" role="list">
        {offers.map((row) => {
          const buyer = row.buyer ?? row.buyerUserId;
          const buyerObj = buyer != null && typeof buyer === "object" ? buyer : null;
          const userId = buyerObj?._id != null ? String(buyerObj._id) : null;
          const name = buyerObj?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;

          return (
            <li key={String(row._id)} className="product-price-offer__seller-row">
              <div className="product-price-offer__seller-head">
                {userId && onOpenBuyer ? (
                  <button
                    type="button"
                    className="product-price-offer__buyer-link"
                    onClick={() => onOpenBuyer(userId)}
                  >
                    <UserPremiumDisplayName
                      name={name}
                      isPremium={buyerObj?.isPremiumUser === true}
                      isUserDataConfirmed={buyerObj?.isUserDataConfirmed === true}
                    />
                  </button>
                ) : (
                  <UserPremiumDisplayName
                    name={name}
                    isPremium={buyerObj?.isPremiumUser === true}
                    isUserDataConfirmed={buyerObj?.isUserDataConfirmed === true}
                  />
                )}
                <span className="product-price-offer__seller-price">
                  {formatPriceRub(row.offerPrice)}
                </span>
              </div>
              <p className="product-price-offer__seller-meta">
                {formatIsoDateTime(row.updatedAt ?? row.createdAt)} · {row.status}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
