import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import { AddressDeliveryFields } from "../../../entities/address/ui/AddressDeliveryFields.jsx";
import { addressValueFromUser } from "../../../entities/address/lib/addressValueFromUser.js";
import { validateRuDeliveryAddressForm } from "../../../entities/address/lib/validateRuDeliveryAddressForm.js";
import {
  ORDER_PAYMENT_METHODS,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_LABEL_RU,
} from "../../../entities/order/model/constants.js";
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
}) {
  const formId = useId();
  const [deliveryAddress, setDeliveryAddress] = useState(() =>
    addressValueFromUser(defaultDeliveryAddress),
  );
  const [paymentMethod, setPaymentMethod] = useState(ORDER_PAYMENT_METHOD_CARD_PREPAID);
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
      deliveryAddressFlat: "",
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

  const renderSubmitButton = (linkedToForm) => (
    <button
      type="submit"
      className="checkout-form__submit"
      form={linkedToForm ? formId : undefined}
      disabled={isFormDisabled}
    >
      {submitLabel}
    </button>
  );

  const dockedSubmit =
    dockSubmit && typeof document !== "undefined"
      ? createPortal(
          <div className="product-modal-shell__docked-footer checkout-form__docked-footer">
            {renderSubmitButton(true)}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <form id={formId} className="checkout-form" onSubmit={handleSubmit}>
      <h2 className="checkout-form__heading">{CHECKOUT_FORM_UI.HEADING}</h2>

      <AddressDeliveryFields
        value={deliveryAddress}
        onChange={setDeliveryAddress}
        disabled={isDisabled || isSubmitting}
        lineInputClassName="checkout-form__input"
        labels={{
          line: CHECKOUT_FORM_UI.LABEL_DELIVERY_ADDRESS,
        }}
      />

      <fieldset className="checkout-form__fieldset">
        <legend className="checkout-form__legend">
          {CHECKOUT_FORM_UI.LABEL_PAYMENT_METHOD}
        </legend>
        {ORDER_PAYMENT_METHODS.map((method) => (
          <label key={method} className="checkout-form__radio">
            <input
              type="radio"
              name="paymentMethod"
              value={method}
              checked={paymentMethod === method}
              onChange={() => setPaymentMethod(method)}
              disabled={isDisabled || isSubmitting}
            />
            <span>{ORDER_PAYMENT_METHOD_LABEL_RU[method]}</span>
          </label>
        ))}
      </fieldset>

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

      {!dockSubmit ? renderSubmitButton(false) : null}
      </form>
      {dockedSubmit}
    </>
  );
}
