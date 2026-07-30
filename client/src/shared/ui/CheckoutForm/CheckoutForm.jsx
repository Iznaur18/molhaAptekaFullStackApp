import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT,
} from "@molha/api-contract";

import { AddressDeliveryFields } from "../../../entities/address/ui/AddressDeliveryFields.jsx";
import { CheckoutPaymentMethodPicker } from "../../../features/checkout/ui/CheckoutPaymentMethodPicker.jsx";
import { CheckoutShippingProviderPicker } from "../../../features/checkout/ui/CheckoutShippingProviderPicker.jsx";
import { addressValueFromUser } from "../../../entities/address/lib/addressValueFromUser.js";
import { validateRuDeliveryAddressForm } from "../../../entities/address/lib/validateRuDeliveryAddressForm.js";
import { ORDER_PAYMENT_METHOD_DEFAULT } from "../../../entities/order/model/constants.js";
import { CHECKOUT_FORM_UI } from "../../config/appUiCopy.js";

import "./CheckoutForm.css";

/**
 * @param {{
 *   defaultDeliveryAddress: Partial<{
 *     userAddress?: string;
 *     userAddressFlat?: string;
 *     userAddressFiasId?: string;
 *     userAddressGeo?: { lat?: number; lon?: number } | null;
 *   }>;
 *   pickupAddressSummary?: string;
 *   deliveryAvailable?: boolean;
 *   pickupAvailable?: boolean;
 *   isSubmitting: boolean;
 *   submitError: string;
 *   submitSuccess: string;
 *   onSubmit: (payload: {
 *     fulfillmentMethod: string;
 *     deliveryAddress: string;
 *     deliveryAddressFlat: string;
 *     paymentMethod: string;
 *   }) => void | Promise<void>;
 *   isDisabled?: boolean;
 *   dockSubmit?: boolean;
 *   pinSubmitToBottom?: boolean;
 *   showHeading?: boolean;
 * }} props
 */
export function CheckoutForm({
  defaultDeliveryAddress,
  pickupAddressSummary = "",
  deliveryAvailable = false,
  pickupAvailable = true,
  isSubmitting,
  submitError,
  submitSuccess,
  onSubmit,
  isDisabled = false,
  dockSubmit = false,
  pinSubmitToBottom = false,
  showHeading = true,
}) {
  const formId = useId();
  const [fulfillmentMethod, setFulfillmentMethod] = useState(ORDER_FULFILLMENT_PICKUP);
  const [deliveryAddress, setDeliveryAddress] = useState(() =>
    addressValueFromUser(defaultDeliveryAddress),
  );
  const [paymentMethod, setPaymentMethod] = useState(ORDER_PAYMENT_METHOD_DEFAULT);
  const [localError, setLocalError] = useState("");

  const deliverySelectable =
    PRODUCT_DELIVERY_FULFILLMENT_ENABLED && deliveryAvailable;
  const pickupSelectable = pickupAvailable;

  useEffect(() => {
    setDeliveryAddress(addressValueFromUser(defaultDeliveryAddress));
  }, [defaultDeliveryAddress]);

  useEffect(() => {
    if (!deliverySelectable && fulfillmentMethod === ORDER_FULFILLMENT_DELIVERY) {
      if (pickupSelectable) {
        setFulfillmentMethod(ORDER_FULFILLMENT_PICKUP);
      }
      return;
    }
    if (!pickupSelectable && fulfillmentMethod === ORDER_FULFILLMENT_PICKUP) {
      if (deliverySelectable) {
        setFulfillmentMethod(ORDER_FULFILLMENT_DELIVERY);
      }
    }
  }, [deliverySelectable, pickupSelectable, fulfillmentMethod]);

  const isPickup = fulfillmentMethod === ORDER_FULFILLMENT_PICKUP;
  const pickupReady = String(pickupAddressSummary ?? "").trim().length > 0;

  const isAddressValid = useMemo(() => {
    if (isPickup) {
      return pickupSelectable && pickupReady;
    }
    return (
      deliverySelectable &&
      validateRuDeliveryAddressForm(deliveryAddress, { required: true }) === null
    );
  }, [deliveryAddress, deliverySelectable, isPickup, pickupReady, pickupSelectable]);

  const deliveryOptionHint = !PRODUCT_DELIVERY_FULFILLMENT_ENABLED
    ? SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT
    : !deliveryAvailable
      ? CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE
      : null;

  const pickupOptionHint = !pickupAvailable
    ? CHECKOUT_FORM_UI.FULFILLMENT_PICKUP_UNAVAILABLE
    : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPickup) {
      if (!pickupSelectable || !pickupReady) {
        setLocalError(
          pickupOptionHint || CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED,
        );
        return;
      }
      setLocalError("");
      void onSubmit({
        fulfillmentMethod: ORDER_FULFILLMENT_PICKUP,
        deliveryAddress: "",
        deliveryAddressFlat: "",
        paymentMethod,
      });
      return;
    }

    if (!deliverySelectable) {
      setLocalError(
        deliveryOptionHint || CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE,
      );
      return;
    }

    const validationError = validateRuDeliveryAddressForm(deliveryAddress, {
      required: true,
    });
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError("");
    void onSubmit({
      fulfillmentMethod: ORDER_FULFILLMENT_DELIVERY,
      deliveryAddress: deliveryAddress.line.trim(),
      deliveryAddressFlat: deliveryAddress.flat.trim(),
      paymentMethod,
    });
  };

  const isFormDisabled = isDisabled || isSubmitting || !isAddressValid;
  const displayError = localError || submitError;
  const submitLabel = isSubmitting
    ? CHECKOUT_FORM_UI.SUBMIT_LOADING
    : CHECKOUT_FORM_UI.SUBMIT_IDLE;

  const formClassName = [
    "checkout-form",
    pinSubmitToBottom ? "checkout-form--pinned" : "",
    pinSubmitToBottom || !showHeading ? "checkout-form--embedded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const submitClassName = [
    "checkout-form__submit",
    pinSubmitToBottom ? "checkout-form__submit--docked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const renderSubmitButton = (linkedToForm) => (
    <button
      type="submit"
      className={submitClassName}
      form={linkedToForm ? formId : undefined}
      disabled={isFormDisabled}
    >
      {submitLabel}
    </button>
  );

  const dockedSubmit =
    dockSubmit && !pinSubmitToBottom && typeof document !== "undefined"
      ? createPortal(
          <div className="product-modal-shell__docked-footer checkout-form__docked-footer">
            {renderSubmitButton(true)}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <form id={formId} className={formClassName} onSubmit={handleSubmit}>
        <div className="checkout-form__fields">
          {showHeading ? (
            <h2 className="checkout-form__heading">{CHECKOUT_FORM_UI.HEADING}</h2>
          ) : null}

          <div className="checkout-form__fulfillment">
            <span className="checkout-form__label" id={`${formId}-fulfillment-label`}>
              {CHECKOUT_FORM_UI.LABEL_FULFILLMENT}
            </span>
            <div
              className="checkout-form__fulfillment-row"
              role="radiogroup"
              aria-labelledby={`${formId}-fulfillment-label`}
            >
              <button
                type="button"
                role="radio"
                aria-checked={isPickup}
                className={[
                  "checkout-form__fulfillment-option",
                  isPickup ? "checkout-form__fulfillment-option--active" : "",
                  !pickupSelectable
                    ? "checkout-form__fulfillment-option--disabled"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={!pickupSelectable || isDisabled || isSubmitting}
                onClick={() => {
                  if (!pickupSelectable) {
                    return;
                  }
                  setFulfillmentMethod(ORDER_FULFILLMENT_PICKUP);
                }}
              >
                <span className="checkout-form__fulfillment-option-title">
                  {CHECKOUT_FORM_UI.FULFILLMENT_PICKUP}
                </span>
                {pickupOptionHint ? (
                  <span className="checkout-form__soon">{pickupOptionHint}</span>
                ) : null}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!isPickup}
                className={[
                  "checkout-form__fulfillment-option",
                  !isPickup ? "checkout-form__fulfillment-option--active" : "",
                  !deliverySelectable
                    ? "checkout-form__fulfillment-option--disabled"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={!deliverySelectable || isDisabled || isSubmitting}
                onClick={() => {
                  if (!deliverySelectable) {
                    return;
                  }
                  setFulfillmentMethod(ORDER_FULFILLMENT_DELIVERY);
                }}
              >
                <span className="checkout-form__fulfillment-option-title">
                  {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}
                </span>
                {deliveryOptionHint ? (
                  <span className="checkout-form__soon">{deliveryOptionHint}</span>
                ) : null}
              </button>
            </div>
          </div>

          {isPickup ? (
            <div className="checkout-form__pickup">
              <span className="checkout-form__label">{CHECKOUT_FORM_UI.PICKUP_ADDRESS_LABEL}</span>
              <p className="checkout-form__pickup-address">
                {pickupReady ? pickupAddressSummary : CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED}
              </p>
            </div>
          ) : (
            <>
              <AddressDeliveryFields
                value={deliveryAddress}
                onChange={setDeliveryAddress}
                disabled={isDisabled || isSubmitting}
                lineInputClassName="checkout-form__input"
                labels={{
                  line: CHECKOUT_FORM_UI.LABEL_DELIVERY_ADDRESS,
                }}
              />

              <label className="checkout-form__field">
                <span className="checkout-form__label">{CHECKOUT_FORM_UI.LABEL_FLAT}</span>
                <input
                  type="text"
                  className="checkout-form__input"
                  value={deliveryAddress.flat}
                  onChange={(event) =>
                    setDeliveryAddress((prev) => ({
                      ...prev,
                      flat: event.target.value,
                    }))
                  }
                  disabled={isDisabled || isSubmitting}
                  placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_FLAT}
                  autoComplete="address-line2"
                />
              </label>

              <CheckoutShippingProviderPicker
                disabled={isDisabled || isSubmitting}
              />
            </>
          )}

          <CheckoutPaymentMethodPicker
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={isDisabled || isSubmitting}
            legend={CHECKOUT_FORM_UI.LABEL_PAYMENT_METHOD}
          />

          {displayError ? (
            <p className="checkout-form__error" role="alert">
              {displayError}
            </p>
          ) : null}
          {submitSuccess ? (
            <p className="checkout-form__success" role="status">
              {submitSuccess}
            </p>
          ) : null}
        </div>

        {!dockSubmit || pinSubmitToBottom ? renderSubmitButton(false) : null}
      </form>
      {dockedSubmit}
    </>
  );
}
