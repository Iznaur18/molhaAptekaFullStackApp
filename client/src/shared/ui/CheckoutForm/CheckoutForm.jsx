import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

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
 *   isSubmitting: boolean;
 *   submitError: string;
 *   submitSuccess: string;
 *   onSubmit: (payload: {
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
  const [deliveryAddress, setDeliveryAddress] = useState(() =>
    addressValueFromUser(defaultDeliveryAddress),
  );
  const [paymentMethod, setPaymentMethod] = useState(ORDER_PAYMENT_METHOD_DEFAULT);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setDeliveryAddress(addressValueFromUser(defaultDeliveryAddress));
  }, [defaultDeliveryAddress]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationError = validateRuDeliveryAddressForm(deliveryAddress, {
      required: true,
    });
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError("");
    void onSubmit({
      deliveryAddress: deliveryAddress.line.trim(),
      deliveryAddressFlat: deliveryAddress.flat.trim(),
      paymentMethod,
    });
  };

  const isAddressValid =
    validateRuDeliveryAddressForm(deliveryAddress, { required: true }) === null;
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
