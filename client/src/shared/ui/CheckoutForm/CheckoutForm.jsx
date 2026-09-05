import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT,
} from "@molha/api-contract";

import { AddressDeliveryFields } from "../../../entities/address/ui/AddressDeliveryFields.jsx";
import { CheckoutSavedAddressPicker } from "../../../features/checkout/ui/CheckoutSavedAddressPicker.jsx";
import { CheckoutPaymentMethodPicker } from "../../../features/checkout/ui/CheckoutPaymentMethodPicker.jsx";
import { CheckoutShippingProviderPicker } from "../../../features/checkout/ui/CheckoutShippingProviderPicker.jsx";
import { CheckoutShippingEstimate } from "../../../features/checkout/ui/CheckoutShippingEstimate.jsx";
import { addressValueFromUser } from "../../../entities/address/lib/addressValueFromUser.js";
import {
  CHECKOUT_SAVED_ADDRESS_CUSTOM_ID,
  deliveryAddressFromSaved,
  matchCheckoutSavedAddressId,
  resolveInitialCheckoutSavedAddressId,
} from "../../../entities/address/lib/deliveryAddressFromSaved.js";
import { validateRuDeliveryAddressForm } from "../../../entities/address/lib/validateRuDeliveryAddressForm.js";
import { ORDER_PAYMENT_METHOD_DEFAULT } from "../../../entities/order/model/constants.js";
import {
  resolveInitialPickupSelections,
  buildPickupSelectionsPayload,
} from "../../../entities/cart/lib/buildCheckoutPickupLocations.js";
import { CHECKOUT_FORM_UI, PRODUCT_PICKUP_UI } from "../../config/appUiCopy.js";

import "./CheckoutForm.css";

const EMPTY_PICKUP_LOCATIONS = [];
const EMPTY_SAVED_DELIVERY_ADDRESSES = [];

/**
 * @param {{
 *   defaultDeliveryAddress: Partial<{
 *     userAddress?: string;
 *     userAddressFlat?: string;
 *     userAddressFiasId?: string;
 *     userAddressGeo?: { lat?: number; lon?: number } | null;
 *   }>;
 *   savedDeliveryAddresses?: Array<{
 *     id: string;
 *     label?: string;
 *     line: string;
 *     flat?: string;
 *     fiasId?: string;
 *     geo?: { lat: number; lon: number } | null;
 *     isDefault?: boolean;
 *   }>;
 *   pickupLocations?: Array<{
 *     productId: string;
 *     productTitle: string;
 *     locations: Array<{
 *       id: string;
 *       label?: string;
 *       address: string;
 *       isDefault?: boolean;
 *     }>;
 *   }>;
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
 *   onSubmit: (payload: {
 *     fulfillmentMethod: string;
 *     deliveryAddress: string;
 *     deliveryAddressFlat: string;
 *     paymentMethod: string;
 *     pickupSelections?: Array<{ productId: string; pickupLocationId: string }>;
 *   }) => void | Promise<void>;
 *   isDisabled?: boolean;
 *   dockSubmit?: boolean;
 *   pinSubmitToBottom?: boolean;
 *   showHeading?: boolean;
 * }} props
 */
export function CheckoutForm({
  defaultDeliveryAddress,
  savedDeliveryAddresses = EMPTY_SAVED_DELIVERY_ADDRESSES,
  pickupLocations = EMPTY_PICKUP_LOCATIONS,
  deliveryAvailable = false,
  pickupAvailable = true,
  fulfillmentMode = null,
  courierDelivery = null,
  deliveryProductIds = [],
  initialFulfillmentMethod = null,
  onFulfillmentMethodChange = null,
  isSubmitting,
  submitError,
  submitSuccess,
  onSubmit,
  isDisabled = false,
  cardPrepaidAvailable = false,
  dockSubmit = false,
  pinSubmitToBottom = false,
  showHeading = true,
}) {
  const formId = useId();
  const [fulfillmentMethod, setFulfillmentMethod] = useState(() =>
    initialFulfillmentMethod === ORDER_FULFILLMENT_DELIVERY
      ? ORDER_FULFILLMENT_DELIVERY
      : ORDER_FULFILLMENT_PICKUP,
  );
  const savedAddresses = useMemo(
    () => (Array.isArray(savedDeliveryAddresses) ? savedDeliveryAddresses : []),
    [savedDeliveryAddresses],
  );

  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(() =>
    resolveInitialCheckoutSavedAddressId(savedAddresses),
  );
  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    const initialId = resolveInitialCheckoutSavedAddressId(savedAddresses);
    if (initialId !== CHECKOUT_SAVED_ADDRESS_CUSTOM_ID) {
      const item = savedAddresses.find((address) => address.id === initialId);
      if (item) {
        return deliveryAddressFromSaved(item);
      }
    }
    return addressValueFromUser(defaultDeliveryAddress);
  });
  const [paymentMethod, setPaymentMethod] = useState(ORDER_PAYMENT_METHOD_DEFAULT);
  const [localError, setLocalError] = useState("");

  const deliverySelectable =
    PRODUCT_DELIVERY_FULFILLMENT_ENABLED && deliveryAvailable;
  const pickupSelectable = pickupAvailable;

  useEffect(() => {
    const initialId = resolveInitialCheckoutSavedAddressId(savedAddresses);
    setSelectedSavedAddressId(initialId);
    if (initialId !== CHECKOUT_SAVED_ADDRESS_CUSTOM_ID) {
      const item = savedAddresses.find((address) => address.id === initialId);
      if (item) {
        setDeliveryAddress(deliveryAddressFromSaved(item));
        return;
      }
    }
    setDeliveryAddress(addressValueFromUser(defaultDeliveryAddress));
  }, [defaultDeliveryAddress, savedAddresses]);

  const handleSavedAddressSelect = (nextId) => {
    setSelectedSavedAddressId(nextId);
    if (nextId === CHECKOUT_SAVED_ADDRESS_CUSTOM_ID) {
      setDeliveryAddress({
        line: "",
        flat: "",
        fiasId: "",
        geo: null,
        regionCode: null,
        selectedFromSuggest: false,
      });
      return;
    }

    const item = savedAddresses.find((address) => address.id === nextId);
    if (item) {
      setDeliveryAddress(deliveryAddressFromSaved(item));
    }
  };

  const handleDeliveryAddressChange = (nextAddress) => {
    setDeliveryAddress(nextAddress);
    setSelectedSavedAddressId(
      matchCheckoutSavedAddressId(nextAddress, savedAddresses),
    );
  };

  useEffect(() => {
    if (initialFulfillmentMethod === ORDER_FULFILLMENT_DELIVERY) {
      setFulfillmentMethod(ORDER_FULFILLMENT_DELIVERY);
      return;
    }
    if (initialFulfillmentMethod === ORDER_FULFILLMENT_PICKUP) {
      setFulfillmentMethod(ORDER_FULFILLMENT_PICKUP);
    }
  }, [initialFulfillmentMethod]);

  const applyFulfillmentMethod = (method) => {
    setFulfillmentMethod(method);
    onFulfillmentMethodChange?.(method);
  };

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

  // Смешанный заказ: часть отправлений забирают, часть везут. Способ уже
  // выбран в корзине на каждого продавца, поэтому переключатель здесь не
  // нужен — форме остаётся собрать и точки самовывоза, и адрес.
  const needsPickup = fulfillmentMode
    ? fulfillmentMode !== "delivery"
    : fulfillmentMethod === ORDER_FULFILLMENT_PICKUP;
  const needsDelivery = fulfillmentMode
    ? fulfillmentMode !== "pickup"
    : fulfillmentMethod === ORDER_FULFILLMENT_DELIVERY;
  const isPickup = needsPickup && !needsDelivery;
  const isMixedFulfillment = needsPickup && needsDelivery;
  const pickupGroups = useMemo(
    () => (Array.isArray(pickupLocations) ? pickupLocations : []),
    [pickupLocations],
  );
  const [selectedPickupByProductId, setSelectedPickupByProductId] = useState(() =>
    resolveInitialPickupSelections(pickupGroups),
  );

  const pickupGroupsKey = useMemo(
    () =>
      pickupGroups
        .map(
          (group) =>
            `${group.productId}:${group.locations.map((item) => item.id).join(",")}`,
        )
        .join("|"),
    [pickupGroups],
  );

  useEffect(() => {
    setSelectedPickupByProductId(resolveInitialPickupSelections(pickupGroups));
  }, [pickupGroups, pickupGroupsKey]);

  const pickupReady = pickupGroups.length > 0;
  const showPickupTitles = pickupGroups.length > 1;

  const isAddressValid = useMemo(() => {
    if (needsPickup && !(pickupSelectable && pickupReady)) {
      return false;
    }
    if (
      needsDelivery &&
      !(
        deliverySelectable &&
        validateRuDeliveryAddressForm(deliveryAddress, { required: true }) === null
      )
    ) {
      return false;
    }
    return needsPickup || needsDelivery;
  }, [
    deliveryAddress,
    deliverySelectable,
    needsDelivery,
    needsPickup,
    pickupReady,
    pickupSelectable,
  ]);

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

    if (needsPickup && (!pickupSelectable || !pickupReady)) {
      setLocalError(pickupOptionHint || CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED);
      return;
    }

    if (needsDelivery && !deliverySelectable) {
      setLocalError(
        deliveryOptionHint || CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE,
      );
      return;
    }

    if (needsDelivery) {
      const validationError = validateRuDeliveryAddressForm(deliveryAddress, {
        required: true,
      });
      if (validationError) {
        setLocalError(validationError);
        return;
      }
    }

    setLocalError("");
    // В смешанном заказе уезжает и адрес, и точки: сервер разложит их по
    // отправлениям сам, опираясь на выбор способа по продавцам.
    void onSubmit({
      fulfillmentMethod: needsDelivery
        ? ORDER_FULFILLMENT_DELIVERY
        : ORDER_FULFILLMENT_PICKUP,
      deliveryAddress: needsDelivery ? deliveryAddress.line.trim() : "",
      deliveryAddressFlat: needsDelivery ? deliveryAddress.flat.trim() : "",
      // Координаты нужны службам доставки: без них ЛОБО заказ не примет.
      // Их даёт подсказка адреса или точка на карте.
      deliveryAddressGeo:
        needsDelivery &&
        Number.isFinite(Number(deliveryAddress.geo?.lat)) &&
        Number.isFinite(Number(deliveryAddress.geo?.lon))
          ? {
              lat: Number(deliveryAddress.geo.lat),
              lon: Number(deliveryAddress.geo.lon),
            }
          : null,
      paymentMethod,
      pickupSelections: needsPickup
        ? buildPickupSelectionsPayload(selectedPickupByProductId)
        : [],
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

          {/* Способ уже выбран в корзине на каждого продавца — здесь
              переключателю делать нечего. Не hidden: у блока свой display,
              он перебил бы атрибут. */}
          {fulfillmentMode == null ? (
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
                aria-disabled={!pickupSelectable || isDisabled || isSubmitting}
                className={[
                  "checkout-form__fulfillment-option",
                  isPickup ? "checkout-form__fulfillment-option--active" : "",
                  !pickupSelectable
                    ? "checkout-form__fulfillment-option--disabled"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={isDisabled || isSubmitting}
                onClick={() => {
                  if (!pickupSelectable) {
                    setLocalError(
                      pickupOptionHint ||
                        CHECKOUT_FORM_UI.FULFILLMENT_PICKUP_UNAVAILABLE,
                    );
                    return;
                  }
                  setLocalError("");
                  applyFulfillmentMethod(ORDER_FULFILLMENT_PICKUP);
                }}
              >
                <span className="checkout-form__fulfillment-option-title">
                  {CHECKOUT_FORM_UI.FULFILLMENT_PICKUP}
                </span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!isPickup}
                aria-disabled={!deliverySelectable || isDisabled || isSubmitting}
                className={[
                  "checkout-form__fulfillment-option",
                  !isPickup ? "checkout-form__fulfillment-option--active" : "",
                  !deliverySelectable
                    ? "checkout-form__fulfillment-option--disabled"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={isDisabled || isSubmitting}
                onClick={() => {
                  if (!deliverySelectable) {
                    setLocalError(
                      deliveryOptionHint ||
                        CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE,
                    );
                    return;
                  }
                  setLocalError("");
                  applyFulfillmentMethod(ORDER_FULFILLMENT_DELIVERY);
                }}
              >
                <span className="checkout-form__fulfillment-option-title">
                  {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}
                </span>
              </button>
            </div>
          </div>
          ) : null}

          {!needsPickup ? (
            <section
              className="checkout-form__fulfillment-section checkout-form__fulfillment-section--pickup checkout-form__fulfillment-section--off checkout-form__block_off"
              aria-disabled="true"
            >
              <header className="checkout-form__fulfillment-section-head">
                <span className="checkout-form__fulfillment-section-badge">
                  {CHECKOUT_FORM_UI.FULFILLMENT_PICKUP}
                </span>
                <span className="checkout-form__fulfillment-section-title">
                  {CHECKOUT_FORM_UI.PICKUP_ADDRESS_LABEL}
                </span>
              </header>
              <p className="checkout-form__hint">{CHECKOUT_FORM_UI.PICKUP_NOT_NEEDED}</p>
            </section>
          ) : null}

          {needsPickup ? (
            <section className="checkout-form__fulfillment-section checkout-form__fulfillment-section--pickup">
              <header className="checkout-form__fulfillment-section-head">
                <span className="checkout-form__fulfillment-section-badge">
                  {CHECKOUT_FORM_UI.FULFILLMENT_PICKUP}
                </span>
                <span className="checkout-form__fulfillment-section-title">
                  {CHECKOUT_FORM_UI.PICKUP_ADDRESS_LABEL}
                </span>
              </header>
              <div className="checkout-form__fulfillment-section-body checkout-form__pickup">
                {pickupReady ? (
                  <div className="checkout-form__pickup-groups">
                    {pickupGroups.map((group) => {
                      const needsSelect = group.locations.length >= 2;
                      const selectedId =
                        selectedPickupByProductId[group.productId] ??
                        group.locations.find((item) => item.isDefault)?.id ??
                        group.locations[0]?.id;

                      return (
                        <div
                          key={group.productId}
                          className="checkout-form__pickup-group"
                        >
                          {showPickupTitles && group.productTitle ? (
                            <p className="checkout-form__pickup-products">
                              {group.productTitle}
                            </p>
                          ) : null}
                          {needsSelect ? (
                            <>
                              <span className="checkout-form__pickup-select-label">
                                {PRODUCT_PICKUP_UI.CHECKOUT_PICK_LOCATION}
                              </span>
                              <div
                                className="checkout-form__pickup-options"
                                role="radiogroup"
                                aria-label={PRODUCT_PICKUP_UI.CHECKOUT_PICK_LOCATION}
                              >
                                {group.locations.map((location) => {
                                  const active = selectedId === location.id;
                                  return (
                                    <button
                                      key={location.id}
                                      type="button"
                                      role="radio"
                                      aria-checked={active}
                                      disabled={isDisabled || isSubmitting}
                                      className={[
                                        "checkout-form__pickup-option",
                                        active
                                          ? "checkout-form__pickup-option--active"
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                      onClick={() =>
                                        setSelectedPickupByProductId((prev) => ({
                                          ...prev,
                                          [group.productId]: location.id,
                                        }))
                                      }
                                    >
                                      {location.label ? (
                                        <span className="checkout-form__pickup-option-label">
                                          {location.label}
                                        </span>
                                      ) : null}
                                      <span className="checkout-form__pickup-address">
                                        {location.address}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <p className="checkout-form__pickup-address">
                              {group.locations[0]?.address}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="checkout-form__pickup-address checkout-form__pickup-address_error">
                    {CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED}
                  </p>
                )}
              </div>
            </section>
          ) : null}

          {isMixedFulfillment ? (
            <div
              className="checkout-form__fulfillment-split"
              role="separator"
              aria-label={`${CHECKOUT_FORM_UI.FULFILLMENT_PICKUP} / ${CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}`}
            />
          ) : null}

          {!needsDelivery ? (
            <section
              className="checkout-form__fulfillment-section checkout-form__fulfillment-section--delivery checkout-form__fulfillment-section--off checkout-form__block_off"
              aria-disabled="true"
            >
              <header className="checkout-form__fulfillment-section-head">
                <span className="checkout-form__fulfillment-section-badge">
                  {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}
                </span>
              </header>
              <p className="checkout-form__hint">
                {CHECKOUT_FORM_UI.DELIVERY_NOT_NEEDED}
              </p>
            </section>
          ) : null}

          {needsDelivery ? (
            <section className="checkout-form__fulfillment-section checkout-form__fulfillment-section--delivery">
              <header className="checkout-form__fulfillment-section-head">
                <span className="checkout-form__fulfillment-section-badge">
                  {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}
                </span>
              </header>
              <div className="checkout-form__fulfillment-section-body checkout-form__delivery">
                <CheckoutSavedAddressPicker
                  addresses={savedAddresses}
                  selectedId={selectedSavedAddressId}
                  onSelect={handleSavedAddressSelect}
                  disabled={isDisabled || isSubmitting}
                />

                <AddressDeliveryFields
                  value={deliveryAddress}
                  onChange={handleDeliveryAddressChange}
                  disabled={isDisabled || isSubmitting}
                  displayOnly
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
                      handleDeliveryAddressChange({
                        ...deliveryAddress,
                        flat: event.target.value,
                      })
                    }
                    disabled={isDisabled || isSubmitting}
                    placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_FLAT}
                    autoComplete="address-line2"
                  />
                </label>

                <CheckoutShippingProviderPicker
                  disabled={isDisabled || isSubmitting}
                  courierDelivery={courierDelivery}
                />

                <CheckoutShippingEstimate
                  productIds={deliveryProductIds}
                  deliveryGeo={deliveryAddress.geo ?? null}
                />
              </div>
            </section>
          ) : null}

          <CheckoutPaymentMethodPicker
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={isDisabled || isSubmitting}
            legend={CHECKOUT_FORM_UI.LABEL_PAYMENT_METHOD}
            cardPrepaidAvailable={cardPrepaidAvailable}
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
