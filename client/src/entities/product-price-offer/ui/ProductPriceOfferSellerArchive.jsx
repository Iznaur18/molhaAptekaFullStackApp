import { useCallback, useEffect, useState } from "react";

import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import { fetchSellerPriceOfferArchive } from "../api/fetchSellerPriceOfferArchive.js";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  API_CLIENT_UI,
  PRODUCT_PRICE_OFFER_UI,
  USER_LIST_ROW_UI,
} from "../../../shared/config/appUiCopy.js";

import "./ProductPriceOffer.css";

/**
 * @param {{
 *   productId: string;
 *   onOpenBuyer?: (userId: string) => void;
 * }} props
 */
export function ProductPriceOfferSellerArchive({ productId, onOpenBuyer }) {
  const [offers, setOffers] = useState(
    /** @type {import('../model/types.js').PriceOfferRow[]} */ ([]),
  );
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const list = await fetchSellerPriceOfferArchive(productId);
      setOffers(list);
      setPhase("success");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : API_CLIENT_UI.FETCH_SELLER_PRICE_OFFERS_FALLBACK,
      );
      setPhase("error");
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

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
      <h3 className="product-price-offer__heading">
        {PRODUCT_PRICE_OFFER_UI.ARCHIVE_SECTION_TITLE}
      </h3>
      <ul className="product-price-offer__seller-list" role="list">
        {offers.map((row) => {
          const buyer = row.buyer ?? row.buyerUserId;
          const buyerObj =
            buyer != null && typeof buyer === "object" ? buyer : null;
          const userId = buyerObj?._id != null ? String(buyerObj._id) : null;
          const name =
            buyerObj?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;

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
                      isUserDataConfirmed={
                        buyerObj?.isUserDataConfirmed === true
                      }
                    />
                  </button>
                ) : (
                  <UserPremiumDisplayName
                    name={name}
                    isPremium={buyerObj?.isPremiumUser === true}
                    isUserDataConfirmed={
                      buyerObj?.isUserDataConfirmed === true
                    }
                  />
                )}
                <span className="product-price-offer__seller-price">
                  {formatPriceRub(row.offerPrice)}
                </span>
              </div>
              <p className="product-price-offer__seller-meta">
                {formatIsoDateTime(row.updatedAt ?? row.createdAt)} ·{" "}
                {row.status}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
