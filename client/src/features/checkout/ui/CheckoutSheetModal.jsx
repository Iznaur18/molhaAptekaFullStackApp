import { createPortal } from "react-dom";
import { useEffect, useId, useRef } from "react";

import { CART_PAGE_UI, CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { CheckoutForm } from "../../../shared/ui/CheckoutForm/CheckoutForm.jsx";
import { useCheckoutSheetModalAnimation } from "../model/useCheckoutSheetModalAnimation.js";

import "./CheckoutSheetModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   defaultDeliveryAddress: Record<string, unknown>;
 *   savedDeliveryAddresses?: Array<Record<string, unknown>>;
 *   pickupLocations?: Array<{ address: string; productTitles?: string[] }>;
 *   deliveryAvailable?: boolean;
 *   pickupAvailable?: boolean;
 *   fulfillmentMode?: "pickup" | "delivery" | "mixed" | null;
 *   courierDelivery?: "courier" | "seller" | "mixed" | null;
 *   deliveryProductIds?: string[];
 *   initialFulfillmentMethod?: "pickup" | "delivery" | null;
 *   onFulfillmentMethodChange?: (method: "pickup" | "delivery") => void;
 *   isSubmitting: boolean;
 *   submitError: string;
 *   submitSuccess: string;
 *   isDisabled?: boolean;
 *   onSubmit: (payload: {
 *     fulfillmentMethod: string;
 *     deliveryAddress: string;
 *     deliveryAddressFlat: string;
 *     paymentMethod: string;
 *   }) => void | Promise<void>;
 * }} props
 */
export function CheckoutSheetModal({
  isOpen,
  onClose,
  defaultDeliveryAddress,
  savedDeliveryAddresses = [],
  pickupLocations = [],
  deliveryAvailable = false,
  pickupAvailable = true,
  fulfillmentMode = null,
  courierDelivery = null,
  deliveryProductIds = [],
  initialFulfillmentMethod = null,
  onFulfillmentMethodChange = null,
  cardPrepaidAvailable = false,
  isSubmitting,
  submitError,
  submitSuccess,
  isDisabled = false,
  onSubmit,
}) {
  const titleId = useId();
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useCheckoutSheetModalAnimation(isOpen);

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
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) {
    return null;
  }

  const backdropClassName = [
    "checkout-sheet-modal__backdrop",
    isVisible ? "checkout-sheet-modal__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className={backdropClassName} role="presentation">
      <div className="checkout-sheet-modal__scrim" aria-hidden="true" />
      <button
        type="button"
        className="checkout-sheet-modal__dismiss"
        aria-label={CART_PAGE_UI.CHECKOUT_SHEET_CLOSE}
        onClick={onClose}
      />
      <div className="checkout-sheet-modal__keyboard-bleed" aria-hidden="true" />
      <div
        ref={panelRef}
        className="checkout-sheet-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="checkout-sheet-modal__header">
          <h2 id={titleId} className="checkout-sheet-modal__title">
            {CHECKOUT_FORM_UI.HEADING}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="checkout-sheet-modal__close"
            onClick={onClose}
          >
            {CART_PAGE_UI.CHECKOUT_SHEET_CLOSE}
          </button>
        </header>
        <div className="checkout-sheet-modal__body">
          <CheckoutForm
            defaultDeliveryAddress={defaultDeliveryAddress}
            savedDeliveryAddresses={savedDeliveryAddresses}
            pickupLocations={pickupLocations}
            deliveryAvailable={deliveryAvailable}
            pickupAvailable={pickupAvailable}
            fulfillmentMode={fulfillmentMode}
            courierDelivery={courierDelivery}
            deliveryProductIds={deliveryProductIds}
            initialFulfillmentMethod={initialFulfillmentMethod}
            onFulfillmentMethodChange={onFulfillmentMethodChange}
            cardPrepaidAvailable={cardPrepaidAvailable}
            isSubmitting={isSubmitting}
            submitError={submitError}
            submitSuccess={submitSuccess}
            isDisabled={isDisabled}
            showHeading={false}
            pinSubmitToBottom
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
