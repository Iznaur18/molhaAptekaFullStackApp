import { useCallback, useEffect, useState } from "react";

import { createOrder } from "../../order/api/createOrder.js";
import { fetchCurrentUserProfile } from "../../user/api/fetchCurrentUserProfile.js";
import { addressValueFromUser } from "../../address/lib/addressValueFromUser.js";
import { CheckoutForm } from "../../../pages/cart/ui/CheckoutForm.jsx";
import { cancelMyPriceOffer } from "../api/cancelMyPriceOffer.js";
import { fetchMyPriceOffer } from "../api/fetchMyPriceOffer.js";
import { patchMyPriceOffer } from "../api/patchMyPriceOffer.js";
import { submitPriceOffer } from "../api/submitPriceOffer.js";
import {
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_PENDING,
} from "../model/constants.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { PRODUCT_PRICE_OFFER_UI } from "../../../shared/config/appUiCopy.js";
import {
  clearPriceOfferPayFlowOpened,
  isPriceOfferPayFlowOpened,
  markPriceOfferPayFlowOpened,
} from "../lib/priceOfferPayFlowStorage.js";

import { ProductPriceOfferTopList } from "./ProductPriceOfferTopList.jsx";

import "./ProductPriceOffer.css";

/**
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   isUserDataConfirmed: boolean;
 *   isOwnProduct: boolean;
 *   top: import('../model/types.js').PriceOfferTopEntry[];
 *   onOpenBuyer?: (userId: string) => void;
 *   onRequestLogin?: () => void;
 *   onOffersChanged?: () => void;
 * }} props
 */
export function ProductPriceOfferBuyerBlock({
  productId,
  isAuthorized,
  isUserDataConfirmed,
  isOwnProduct,
  top,
  onOpenBuyer,
  onRequestLogin,
  onOffersChanged,
}) {
  const [myOffer, setMyOffer] = useState(
    /** @type {import('../model/types.js').PriceOfferRow | null} */ (null),
  );
  const [priceInput, setPriceInput] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState({});

  const reloadMyOffer = useCallback(async () => {
    if (!isAuthorized) {
      setMyOffer(null);
      return;
    }
    try {
      const offer = await fetchMyPriceOffer(productId);
      setMyOffer(offer);
      if (offer?.offerPrice != null) {
        setPriceInput(String(offer.offerPrice));
      }
    } catch {
      setMyOffer(null);
    }
  }, [isAuthorized, productId]);

  useEffect(() => {
    void reloadMyOffer();
  }, [reloadMyOffer]);

  const offerId = myOffer?._id != null ? String(myOffer._id) : null;
  const hasLinkedOrder =
    myOffer?.orderId != null && String(myOffer.orderId).trim() !== "";

  useEffect(() => {
    if (myOffer?.status !== PRICE_OFFER_STATUS_ACCEPTED || offerId == null) {
      return;
    }
    if (hasLinkedOrder) {
      clearPriceOfferPayFlowOpened(productId, offerId);
      setShowPay(false);
      return;
    }
    if (isPriceOfferPayFlowOpened(productId, offerId)) {
      setShowPay(true);
    }
  }, [myOffer?.status, offerId, hasLinkedOrder, productId]);

  useEffect(() => {
    if (!showPay || !isAuthorized) return undefined;
    let isCancelled = false;
    void (async () => {
      try {
        const { user } = await fetchCurrentUserProfile();
        if (!isCancelled) {
          setDefaultAddress(addressValueFromUser(user));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [showPay, isAuthorized]);

  const handleSubmitOffer = async () => {
    if (!isAuthorized) {
      onRequestLogin?.();
      return;
    }
    const price = Math.floor(Number(priceInput));
    if (!Number.isFinite(price) || price < 1) {
      setError("Укажите целую цену больше 0");
      return;
    }

    setIsBusy(true);
    setError("");
    try {
      if (myOffer?.status === PRICE_OFFER_STATUS_PENDING) {
        await patchMyPriceOffer(productId, price);
      } else {
        await submitPriceOffer(productId, price);
      }
      await reloadMyOffer();
      onOffersChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setIsBusy(false);
    }
  };

  const handleCancel = async () => {
    setIsBusy(true);
    setError("");
    try {
      await cancelMyPriceOffer(productId);
      setMyOffer(null);
      setPriceInput("");
      onOffersChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setIsBusy(false);
    }
  };

  const handlePay = async (payload) => {
    if (!myOffer?._id) return;
    setIsPaying(true);
    setPayError("");
    setPaySuccess("");
    try {
      await createOrder({
        items: [{ productId, quantity: 1 }],
        priceOfferId: String(myOffer._id),
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
      });
      setPaySuccess("Заказ оформлен");
      if (myOffer?._id != null) {
        clearPriceOfferPayFlowOpened(productId, String(myOffer._id));
      }
      await reloadMyOffer();
      onOffersChanged?.();
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setIsPaying(false);
    }
  };

  const showForm =
    !isOwnProduct &&
    isAuthorized &&
    isUserDataConfirmed &&
    myOffer?.status !== PRICE_OFFER_STATUS_ACCEPTED;

  const handleOpenPay = () => {
    setShowPay(true);
    if (offerId != null) {
      markPriceOfferPayFlowOpened(productId, offerId);
    }
  };

  const statusText =
    myOffer?.status === PRICE_OFFER_STATUS_PENDING
      ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
      : myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED
        ? hasLinkedOrder
          ? PRODUCT_PRICE_OFFER_UI.PAY_ORDER_PLACED
          : showPay
            ? null
            : PRODUCT_PRICE_OFFER_UI.STATUS_ACCEPTED
        : myOffer?.status === "rejected"
          ? PRODUCT_PRICE_OFFER_UI.STATUS_REJECTED
          : null;

  const showPayButton =
    myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED &&
    !hasLinkedOrder &&
    !showPay;

  const showPayCheckout =
    myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED &&
    !hasLinkedOrder &&
    showPay;

  return (
    <section className="product-price-offer">
      <h3 className="product-price-offer__heading">
        {PRODUCT_PRICE_OFFER_UI.SECTION_TOP_TITLE}
      </h3>
      <ProductPriceOfferTopList top={top} onOpenBuyer={onOpenBuyer} />

      {!isOwnProduct ? (
        <>
          {showForm ? (
            <div className="product-price-offer__form">
              <h3 className="product-price-offer__heading">
                {PRODUCT_PRICE_OFFER_UI.SECTION_FORM_TITLE}
              </h3>
              <label className="product-price-offer__label">
                {PRODUCT_PRICE_OFFER_UI.LABEL_PRICE}
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  disabled={isBusy}
                />
              </label>
              <div className="product-price-offer__actions">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleSubmitOffer()}
                >
                  {isBusy
                    ? PRODUCT_PRICE_OFFER_UI.SUBMIT_LOADING
                    : myOffer?.status === PRICE_OFFER_STATUS_PENDING
                      ? PRODUCT_PRICE_OFFER_UI.UPDATE
                      : PRODUCT_PRICE_OFFER_UI.SUBMIT}
                </button>
                {myOffer?.status === PRICE_OFFER_STATUS_PENDING ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleCancel()}
                  >
                    {PRODUCT_PRICE_OFFER_UI.CANCEL}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {!isAuthorized ? (
            <button
              type="button"
              className="product-price-offer__login-hint"
              onClick={() => onRequestLogin?.()}
            >
              {PRODUCT_PRICE_OFFER_UI.SUBMIT}
            </button>
          ) : null}

          {isAuthorized && !isUserDataConfirmed && !isOwnProduct ? (
            <p className="product-price-offer__hint">
              {PRODUCT_PRICE_OFFER_UI.CONFIRMED_DATA_REQUIRED}
            </p>
          ) : null}

          {statusText ? (
            <p className="product-price-offer__status">{statusText}</p>
          ) : null}

          {showPayButton ? (
            <div className="product-price-offer__pay">
              <button type="button" onClick={handleOpenPay}>
                {PRODUCT_PRICE_OFFER_UI.PAY_BUTTON} (
                {formatPriceRub(myOffer.offerPrice)})
              </button>
            </div>
          ) : null}

          {showPayCheckout ? (
            <div className="product-price-offer__pay">
              <CheckoutForm
                defaultDeliveryAddress={defaultAddress}
                isSubmitting={isPaying}
                submitError={payError}
                submitSuccess={paySuccess}
                onSubmit={handlePay}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {error ? (
        <p className="product-price-offer__error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
