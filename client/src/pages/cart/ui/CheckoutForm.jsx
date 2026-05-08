import { useEffect, useState } from "react";

import {
  ORDER_PAYMENT_METHODS,
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_LABEL_RU,
} from "../../../entities/order/model/constants.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

import "./CheckoutForm.css";

/**
 * @param {{
 *   defaultDeliveryAddress: string;
 *   isSubmitting: boolean;
 *   submitError: string;
 *   submitSuccess: string;
 *   onSubmit: (payload: {
 *     deliveryAddress: string;
 *     paymentMethod: string;
 *   }) => void | Promise<void>;
 *   isDisabled?: boolean;
 * }} props
 */
export function CheckoutForm({
  defaultDeliveryAddress,
  isSubmitting,
  submitError,
  submitSuccess,
  onSubmit,
  isDisabled = false,
}) {
  const [deliveryAddress, setDeliveryAddress] = useState(
    defaultDeliveryAddress,
  );
  const [paymentMethod, setPaymentMethod] = useState(
    ORDER_PAYMENT_METHOD_CARD_PREPAID,
  );

  useEffect(() => {
    setDeliveryAddress(defaultDeliveryAddress);
  }, [defaultDeliveryAddress]);

  const handleSubmit = (event) => {
    event.preventDefault();
    void onSubmit({
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
    });
  };

  const isAddressValid = deliveryAddress.trim().length > 0;
  const isFormDisabled = isDisabled || isSubmitting || !isAddressValid;

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h2 className="checkout-form__heading">{CHECKOUT_FORM_UI.HEADING}</h2>

      <label className="checkout-form__field">
        <span className="checkout-form__label">
          {CHECKOUT_FORM_UI.LABEL_DELIVERY_ADDRESS}
        </span>
        <input
          type="text"
          className="checkout-form__input"
          value={deliveryAddress}
          onChange={(event) => setDeliveryAddress(event.target.value)}
          placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_DELIVERY_ADDRESS}
          maxLength={CHECKOUT_FORM_UI.ADDRESS_MAX_LENGTH}
          disabled={isDisabled || isSubmitting}
          required
        />
      </label>

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

      {submitError ? (
        <p className="checkout-form__error" role="alert">
          {submitError}
        </p>
      ) : null}
      {submitSuccess ? (
        <p className="checkout-form__success" role="status">
          {submitSuccess}
        </p>
      ) : null}

      <button
        type="submit"
        className="checkout-form__submit"
        disabled={isFormDisabled}
      >
        {isSubmitting
          ? CHECKOUT_FORM_UI.SUBMIT_LOADING
          : CHECKOUT_FORM_UI.SUBMIT_IDLE}
      </button>
    </form>
  );
}
