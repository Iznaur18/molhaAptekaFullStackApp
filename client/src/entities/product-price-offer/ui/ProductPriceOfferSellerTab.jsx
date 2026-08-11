import { useState } from "react";

import { usePriceOfferSellerMutations } from "../model/usePriceOfferSellerMutations.js";
import { useSellerPriceOffersQuery } from "../model/useSellerPriceOffersQuery.js";
import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import {
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_PENDING,
} from "../model/constants.js";
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
 *   onChanged?: () => void;
 * }} props
 */
export function ProductPriceOfferSellerTab({ productId, onOpenBuyer, onChanged }) {
  const { acceptMutation, rejectMutation } = usePriceOfferSellerMutations(productId);
  const offersQuery = useSellerPriceOffersQuery({ productId });
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(/** @type {string | null} */ (null));

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
  const displayError = actionError || (phase === "error" ? error : "");

  const handleAccept = async (offerId) => {
    setBusyId(offerId);
    setActionError("");
    try {
      await acceptMutation.mutateAsync(offerId);
      onChanged?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (offerId) => {
    setBusyId(offerId);
    setActionError("");
    try {
      await rejectMutation.mutateAsync(offerId);
      onChanged?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusyId(null);
    }
  };

  if (phase === "loading") {
    return (
      <section className="product-price-offer">
        <ProductPriceOfferSectionTitle />
        <p className="product-price-offer__empty">
          {PRODUCT_PRICE_OFFER_UI.SELLER_LOADING}
        </p>
      </section>
    );
  }

  if (phase === "error" && offers.length === 0) {
    return (
      <section className="product-price-offer">
        <ProductPriceOfferSectionTitle />
        <p className="product-price-offer__error" role="alert">
          {displayError}
        </p>
      </section>
    );
  }

  if (offers.length === 0) {
    return (
      <section className="product-price-offer">
        <ProductPriceOfferSectionTitle />
        <p className="product-price-offer__empty">
          {PRODUCT_PRICE_OFFER_UI.SELLER_EMPTY}
        </p>
      </section>
    );
  }

  return (
    <section className="product-price-offer">
      <ProductPriceOfferSectionTitle />
      <h2 className="product-price-offer__section-label">
        {PRODUCT_PRICE_OFFER_UI.SECTION_TOP_TITLE}
      </h2>
      <ul className="product-price-offer__seller-list" role="list">
        {displayError ? (
          <li className="product-price-offer__error" role="alert">
            {displayError}
          </li>
        ) : null}
        {offers.map((row) => {
          const buyer = row.buyer ?? row.buyerUserId;
          const buyerObj = buyer != null && typeof buyer === "object" ? buyer : null;
          const userId = buyerObj?._id != null ? String(buyerObj._id) : null;
          const name = buyerObj?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
          const isPending = row.status === PRICE_OFFER_STATUS_PENDING;
          const isAccepted = row.status === PRICE_OFFER_STATUS_ACCEPTED;
          const isRowBusy = busyId === String(row._id);

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
                {formatIsoDateTime(row.createdAt)}
                {isAccepted ? ` · ${PRODUCT_PRICE_OFFER_UI.ACCEPTED_BADGE}` : ""}
              </p>
              {isPending ? (
                <div className="product-price-offer__seller-actions">
                  <button
                    type="button"
                    className="product-price-offer__btn product-price-offer__btn--reject"
                    disabled={isRowBusy}
                    onClick={() => void handleReject(String(row._id))}
                  >
                    {PRODUCT_PRICE_OFFER_UI.ACTION_REJECT}
                  </button>
                  <button
                    type="button"
                    className="product-price-offer__btn product-price-offer__btn--primary"
                    disabled={isRowBusy}
                    onClick={() => void handleAccept(String(row._id))}
                  >
                    {isRowBusy
                      ? PRODUCT_PRICE_OFFER_UI.ACTION_PENDING
                      : PRODUCT_PRICE_OFFER_UI.ACTION_ACCEPT}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
