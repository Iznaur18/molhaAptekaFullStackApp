import { useEffect, useMemo, useState } from "react";
import { PRODUCT_PROMOTION_UI } from "../../../shared/config/appUiCopy.js";
import { calculateProductPromotionPointsCost } from "../lib/calculateProductPromotionPointsCost.js";
import {
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
  PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
} from "../model/productPromotionPaymentConstants.js";

import "./ProductPromotionModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   productName: string;
 *   tariffs: Array<{
 *     code: string;
 *     title: string;
 *     durationHours: number;
 *     priceRub: number;
 *     pricePoints?: number;
 *   }>;
 *   loyaltyPoints: number;
 *   rubBalance: number;
 *   isSubmitting?: boolean;
 *   errorMessage?: string;
 *   onClose: () => void;
 *   onSubmit: (tariffCode: string, paymentMethod: string) => void | Promise<void>;
 * }} props
 */
export function ProductPromotionModal({
  isOpen,
  productName,
  tariffs,
  loyaltyPoints,
  rubBalance,
  isSubmitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
}) {
  const defaultTariff = tariffs[0]?.code ?? "";
  const [selectedTariffCode, setSelectedTariffCode] = useState(defaultTariff);
  const [paymentMethod, setPaymentMethod] = useState(
    PRODUCT_PROMOTION_PAYMENT_METHOD_RUB,
  );

  useEffect(() => {
    setSelectedTariffCode(defaultTariff);
    setPaymentMethod(PRODUCT_PROMOTION_PAYMENT_METHOD_RUB);
  }, [defaultTariff, isOpen]);

  const selectedTariff = useMemo(
    () => tariffs.find((item) => item.code === selectedTariffCode) ?? null,
    [selectedTariffCode, tariffs],
  );

  const isPointsPayment =
    paymentMethod === PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS;

  const selectedPricePoints = useMemo(() => {
    if (!selectedTariff) {
      return 0;
    }
    const fromApi = Number(selectedTariff.pricePoints);
    if (Number.isFinite(fromApi) && fromApi > 0) {
      return fromApi;
    }
    return calculateProductPromotionPointsCost(selectedTariff.priceRub);
  }, [selectedTariff]);

  const selectedPriceRub = selectedTariff
    ? Math.ceil(Number(selectedTariff.priceRub))
    : 0;

  const hasEnoughFunds = isPointsPayment
    ? loyaltyPoints >= selectedPricePoints
    : rubBalance >= selectedPriceRub;

  const insufficientMessage = (() => {
    if (!selectedTariff || hasEnoughFunds) {
      return "";
    }
    if (isPointsPayment) {
      return PRODUCT_PROMOTION_UI.INSUFFICIENT_POINTS(
        selectedPricePoints,
        loyaltyPoints,
      );
    }
    return PRODUCT_PROMOTION_UI.INSUFFICIENT_RUB(selectedPriceRub, rubBalance);
  })();

  const submitLabel = isPointsPayment
    ? PRODUCT_PROMOTION_UI.SUBMIT_POINTS
    : PRODUCT_PROMOTION_UI.SUBMIT_RUB;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="product-promotion-modal__backdrop" onClick={onClose}>
      <section
        className="product-promotion-modal"
        role="dialog"
        aria-modal="true"
        aria-label={PRODUCT_PROMOTION_UI.MODAL_TITLE}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="product-promotion-modal__header">
          <h3>{PRODUCT_PROMOTION_UI.MODAL_TITLE}</h3>
          <button
            type="button"
            className="app-btn app-btn--ghost"
            onClick={onClose}
          >
            {PRODUCT_PROMOTION_UI.CLOSE}
          </button>
        </header>

        <p className="product-promotion-modal__subtitle">
          {PRODUCT_PROMOTION_UI.MODAL_SUBTITLE(productName)}
        </p>
        <p className="product-promotion-modal__balance">
          {PRODUCT_PROMOTION_UI.BALANCE_RUB(rubBalance)}
        </p>
        <p className="product-promotion-modal__balance">
          {PRODUCT_PROMOTION_UI.BALANCE_POINTS(loyaltyPoints)}
        </p>
        <p className="product-promotion-modal__hint">
          {paymentMethod === PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS
            ? PRODUCT_PROMOTION_UI.PAYMENT_HINT_POINTS
            : PRODUCT_PROMOTION_UI.PAYMENT_HINT_RUB}
        </p>

        <fieldset className="product-promotion-modal__payment-methods">
          <legend>{PRODUCT_PROMOTION_UI.PAYMENT_METHOD_LABEL}</legend>
          <label className="product-promotion-modal__payment-option">
            <input
              type="radio"
              name="promotion-payment-method"
              value={PRODUCT_PROMOTION_PAYMENT_METHOD_RUB}
              checked={paymentMethod === PRODUCT_PROMOTION_PAYMENT_METHOD_RUB}
              disabled={isSubmitting}
              onChange={() =>
                setPaymentMethod(PRODUCT_PROMOTION_PAYMENT_METHOD_RUB)
              }
            />
            {PRODUCT_PROMOTION_UI.PAYMENT_METHOD_RUB}
          </label>
          <label className="product-promotion-modal__payment-option">
            <input
              type="radio"
              name="promotion-payment-method"
              value={PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS}
              checked={
                paymentMethod === PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS
              }
              disabled={isSubmitting}
              onChange={() =>
                setPaymentMethod(PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS)
              }
            />
            {PRODUCT_PROMOTION_UI.PAYMENT_METHOD_POINTS}
          </label>
        </fieldset>

        <label className="product-promotion-modal__field">
          <span>{PRODUCT_PROMOTION_UI.TARIFF_LABEL}</span>
          <select
            value={selectedTariffCode}
            disabled={isSubmitting || tariffs.length === 0}
            onChange={(event) => setSelectedTariffCode(event.target.value)}
          >
            {tariffs.map((tariff) => {
              const pricePoints =
                Number(tariff.pricePoints) > 0
                  ? Number(tariff.pricePoints)
                  : calculateProductPromotionPointsCost(tariff.priceRub);
              const label = isPointsPayment
                ? PRODUCT_PROMOTION_UI.TARIFF_OPTION_POINTS(
                    tariff.title,
                    tariff.priceRub,
                    pricePoints,
                  )
                : PRODUCT_PROMOTION_UI.TARIFF_OPTION_RUB(
                    tariff.title,
                    tariff.priceRub,
                  );
              return (
                <option key={tariff.code} value={tariff.code}>
                  {label}
                </option>
              );
            })}
          </select>
        </label>
        {selectedTariff ? (
          <p className="product-promotion-modal__summary">
            {PRODUCT_PROMOTION_UI.TARIFF_DURATION(selectedTariff.durationHours)}
          </p>
        ) : null}
        {insufficientMessage ? (
          <p className="product-promotion-modal__error" role="alert">
            {insufficientMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="product-promotion-modal__error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <footer className="product-promotion-modal__actions">
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            {PRODUCT_PROMOTION_UI.CANCEL}
          </button>
          <button
            type="button"
            className="app-btn app-btn--primary"
            disabled={!selectedTariff || isSubmitting || !hasEnoughFunds}
            onClick={() =>
              selectedTariff &&
              void onSubmit(selectedTariff.code, paymentMethod)
            }
          >
            {isSubmitting
              ? PRODUCT_PROMOTION_UI.SUBMIT_PENDING
              : submitLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}
