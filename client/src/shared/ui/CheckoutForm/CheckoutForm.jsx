import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
} from "@molha/api-contract";

import { AddressDeliveryFields } from "../../../entities/address/ui/AddressDeliveryFields.jsx";
import { CheckoutPaymentMethodPicker } from "../../../features/checkout/ui/CheckoutPaymentMethodPicker.jsx";
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

  useEffect(() => {
    setDeliveryAddress(addressValueFromUser(defaultDeliveryAddress));
  }, [defaultDeliveryAddress]);

  const isPickup = fulfillmentMethod === ORDER_FULFILLMENT_PICKUP;
  const pickupReady = String(pickupAddressSummary ?? "").trim().length > 0;

  const isAddressValid = useMemo(() => {
    if (isPickup) {
      return pickupReady;
    }
    return validateRuDeliveryAddressForm(deliveryAddress, { required: true }) === null;
  }, [deliveryAddress, isPickup, pickupReady]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPickup) {
      if (!pickupReady) {
        setLocalError(CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED);
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

    if (!PRODUCT_DELIVERY_FULFILLMENT_ENABLED) {
      setLocalError(CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_SOON);
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

          <fieldset className="checkout-form__fulfillment">
            <legend className="checkout-form__label">{CHECKOUT_FORM_UI.LABEL_FULFILLMENT}</legend>
            <label className="checkout-form__fulfillment-option">
              <input
                type="radio"
                name={`${formId}-fulfillment`}
                checked={isPickup}
                onChange={() => setFulfillmentMethod(ORDER_FULFILLMENT_PICKUP)}
                disabled={isDisabled || isSubmitting}
              />
              <span>{CHECKOUT_FORM_UI.FULFILLMENT_PICKUP}</span>
            </label>
            <label className="checkout-form__fulfillment-option checkout-form__fulfillment-option--disabled">
              <input
                type="radio"
                name={`${formId}-fulfillment`}
                checked={!isPickup}
                disabled={!PRODUCT_DELIVERY_FULFILLMENT_ENABLED || isDisabled || isSubmitting}
                onChange={() => {
                  if (!PRODUCT_DELIVERY_FULFILLMENT_ENABLED) {
                    return;
                  }
                  setFulfillmentMethod(ORDER_FULFILLMENT_DELIVERY);
                }}
              />
              <span>
                {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}
                <span className="checkout-form__soon">
                  {" "}
                  ({CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_SOON})
                </span>
              </span>
            </label>
          </fieldset>

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
