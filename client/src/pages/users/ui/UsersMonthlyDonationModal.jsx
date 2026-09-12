import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  USERS_MONTHLY_DONATION_MAX_RUB,
  USERS_MONTHLY_DONATION_MIN_RUB,
} from "@molha/api-contract";

import {
  useCreateUsersMonthlyDonationPaymentMutation,
  usePaymentConfigQuery,
} from "../../../entities/payment/model/paymentQueries.js";
import { rememberPendingPaymentId } from "../../../entities/payment/lib/pendingPaymentStorage.js";
import { useWholesalePriceSheetAnimation } from "../../../entities/product/ui/useWholesalePriceSheetAnimation.js";
import { useUsersLoyaltyRaffleSettingsQuery } from "../../../entities/users-loyalty-raffle/model/useUsersLoyaltyRaffleSettingsQuery.js";
import { USERS_MONTHLY_LOYALTY_LOADBAR_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  formatRubPriceInput,
  parseRubPriceInput,
} from "../../../shared/lib/numericInput.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";

import "./UsersMonthlyDonationModal.css";

const USERS_MONTHLY_DONATION_RETURN_PATH = "/user-list?donated=1";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 * }} props
 */
export function UsersMonthlyDonationModal({ isOpen, onClose }) {
  const titleId = useId();
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);
  const [amountInput, setAmountInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const paymentConfigQuery = usePaymentConfigQuery({ enabled: isOpen });
  const settingsQuery = useUsersLoyaltyRaffleSettingsQuery({ enabled: isOpen });
  const createMutation = useCreateUsersMonthlyDonationPaymentMutation();
  const isCardPaymentEnabled = paymentConfigQuery.data?.cardPaymentEnabled === true;

  const amountRub = useMemo(() => parseRubPriceInput(amountInput), [amountInput]);
  const donationImageSrc = useMemo(() => {
    const raw = String(settingsQuery.data?.donationImageUrl ?? "").trim();
    return raw ? resolveUploadedImageUrl(raw) : "";
  }, [settingsQuery.data?.donationImageUrl]);

  useEffect(() => {
    if (isOpen) {
      return;
    }
    setAmountInput("");
    setValidationError("");
    setPaymentError("");
  }, [isOpen]);

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      const topLayer = getTopModalFocusLayer();
      if (!topLayer || topLayer.container !== panelRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  if (!mounted) {
    return null;
  }

  const handleAmountChange = (event) => {
    setAmountInput(formatRubPriceInput(event.target.value));
    setValidationError("");
    setPaymentError("");
  };

  const handleSubmit = async () => {
    setPaymentError("");
    if (amountRub == null) {
      setValidationError(
        USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_AMOUNT_MIN(
          USERS_MONTHLY_DONATION_MIN_RUB,
        ),
      );
      return;
    }
    if (amountRub < USERS_MONTHLY_DONATION_MIN_RUB) {
      setValidationError(
        USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_AMOUNT_MIN(
          USERS_MONTHLY_DONATION_MIN_RUB,
        ),
      );
      return;
    }
    if (amountRub > USERS_MONTHLY_DONATION_MAX_RUB) {
      setValidationError(
        USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_AMOUNT_MAX(
          USERS_MONTHLY_DONATION_MAX_RUB,
        ),
      );
      return;
    }

    if (!isCardPaymentEnabled) {
      setPaymentError(USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_COMING_SOON);
      return;
    }

    setValidationError("");
    try {
      const payment = await createMutation.mutateAsync({
        amountRub,
        returnUrl: USERS_MONTHLY_DONATION_RETURN_PATH,
      });
      rememberPendingPaymentId(payment.paymentId);
      if (!payment.confirmationUrl) {
        setPaymentError(USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_PAY_ERROR);
        return;
      }
      window.location.assign(payment.confirmationUrl);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_PAY_ERROR,
      );
    }
  };

  const canSubmit =
    amountRub != null &&
    amountRub >= USERS_MONTHLY_DONATION_MIN_RUB &&
    amountRub <= USERS_MONTHLY_DONATION_MAX_RUB &&
    !createMutation.isPending;

  const backdropClassName = [
    "users-monthly-donation-modal__backdrop",
    isVisible ? "users-monthly-donation-modal__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className={backdropClassName}>
      <div className="users-monthly-donation-modal__scrim" aria-hidden="true" />
      <button
        type="button"
        className="users-monthly-donation-modal__dismiss"
        aria-label={USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_CANCEL}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="users-monthly-donation-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {donationImageSrc ? (
          <div className="users-monthly-donation-modal__media">
            <img
              className="users-monthly-donation-modal__image"
              src={donationImageSrc}
              alt=""
            />
          </div>
        ) : null}
        <header className="users-monthly-donation-modal__header">
          <h2 id={titleId} className="users-monthly-donation-modal__title">
            {USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_MODAL_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="users-monthly-donation-modal__close app-btn"
            onClick={onClose}
          >
            {USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_CANCEL}
          </button>
        </header>
        <div className="users-monthly-donation-modal__body">
          <label className="users-monthly-donation-modal__label">
            {USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_AMOUNT_LABEL}
            <input
              className="users-monthly-donation-modal__input"
              value={amountInput}
              onChange={handleAmountChange}
              inputMode="numeric"
              autoComplete="off"
              {...INTEGER_INPUT_FIELD_PROPS}
            />
          </label>
          {validationError ? (
            <p className="users-monthly-donation-modal__error" role="alert">
              {validationError}
            </p>
          ) : null}
          {paymentError ? (
            <p className="users-monthly-donation-modal__error" role="alert">
              {paymentError}
            </p>
          ) : null}
        </div>
        <footer className="users-monthly-donation-modal__footer">
          <button
            type="button"
            className="app-btn app-btn--primary"
            disabled={!canSubmit}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {createMutation.isPending
              ? "…"
              : USERS_MONTHLY_LOYALTY_LOADBAR_UI.DONATE_SUBMIT}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
