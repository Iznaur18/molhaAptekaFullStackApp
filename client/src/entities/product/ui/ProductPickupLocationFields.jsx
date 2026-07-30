import {
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDERS,
} from "@molha/api-contract";

import { AddressDeliveryFields } from "../../address/ui/AddressDeliveryFields.jsx";
import { YandexMapPointPicker } from "../../maps/ui/YandexMapPointPicker.jsx";
import { PRODUCT_PICKUP_UI } from "../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";

import "./ProductPickupLocationFields.css";
import "./create-product-sections/CreateProductSections.css";

/**
 * @param {{
 *   address: string;
 *   lat: number | null;
 *   lon: number | null;
 *   pickupEnabled?: boolean;
 *   deliveryEnabled: boolean;
 *   disabled?: boolean;
 *   onChange: (next: {
 *     productPickupAddress: string;
 *     productPickupLat: number | null;
 *     productPickupLon: number | null;
 *     productPickupEnabled: boolean;
 *     productDeliveryEnabled: boolean;
 *   }) => void;
 * }} props
 */
export function ProductPickupLocationFields({
  address,
  lat,
  lon,
  pickupEnabled = true,
  deliveryEnabled,
  disabled = false,
  onChange,
}) {
  const emit = (patch) => {
    onChange({
      productPickupAddress: address,
      productPickupLat: lat,
      productPickupLon: lon,
      productPickupEnabled: pickupEnabled,
      productDeliveryEnabled: deliveryEnabled,
      ...patch,
    });
  };

  const deliverySelectable = PRODUCT_DELIVERY_FULFILLMENT_ENABLED && !disabled;

  const togglePickup = () => {
    if (disabled) {
      return;
    }
    if (pickupEnabled && !deliveryEnabled) {
      return;
    }
    emit({ productPickupEnabled: !pickupEnabled });
  };

  const toggleDelivery = () => {
    if (!deliverySelectable) {
      return;
    }
    if (deliveryEnabled && !pickupEnabled) {
      return;
    }
    emit({ productDeliveryEnabled: !deliveryEnabled });
  };

  const methodsHint =
    pickupEnabled && deliveryEnabled
      ? PRODUCT_PICKUP_UI.METHODS_BOTH_HINT
      : deliveryEnabled
        ? PRODUCT_PICKUP_UI.DELIVERY_CARRIERS_HINT
        : PRODUCT_PICKUP_UI.PICKUP_HINT;

  return (
    <div className="product-pickup-location-fields">
      <p className="product-pickup-location-fields__legend">
        <FormFieldLabel>{PRODUCT_PICKUP_UI.FULFILLMENT_LEGEND}</FormFieldLabel>
      </p>

      <div
        className="product-pickup-location-fields__methods"
        role="group"
        aria-label={PRODUCT_PICKUP_UI.FULFILLMENT_LEGEND}
      >
        <label
          className={[
            "product-pickup-location-fields__check",
            pickupEnabled ? "product-pickup-location-fields__check_on" : "",
            disabled ? "product-pickup-location-fields__check_disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            type="checkbox"
            className="product-pickup-location-fields__checkbox"
            checked={pickupEnabled}
            disabled={disabled || (pickupEnabled && !deliveryEnabled)}
            onChange={togglePickup}
          />
          <span className="product-pickup-location-fields__check-label">
            {PRODUCT_PICKUP_UI.FULFILLMENT_PICKUP}
          </span>
        </label>

        <label
          className={[
            "product-pickup-location-fields__check",
            deliveryEnabled ? "product-pickup-location-fields__check_on" : "",
            !PRODUCT_DELIVERY_FULFILLMENT_ENABLED
              ? "product-pickup-location-fields__check_soon"
              : "",
            !deliverySelectable ? "product-pickup-location-fields__check_disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            type="checkbox"
            className="product-pickup-location-fields__checkbox"
            checked={deliveryEnabled}
            disabled={!deliverySelectable || (deliveryEnabled && !pickupEnabled)}
            onChange={toggleDelivery}
          />
          <span className="product-pickup-location-fields__check-label">
            {PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY}
            {!PRODUCT_DELIVERY_FULFILLMENT_ENABLED ? PRODUCT_PICKUP_UI.SOON_BADGE : null}
          </span>
        </label>
      </div>

      <p className="product-pickup-location-fields__sublegend">
        {PRODUCT_PICKUP_UI.CARRIERS_LEGEND}
      </p>
      <div
        className="product-pickup-location-fields__methods product-pickup-location-fields__methods_carriers"
        role="group"
        aria-label={PRODUCT_PICKUP_UI.CARRIERS_LEGEND}
      >
        {SHIPPING_PROVIDERS.map((providerId) => (
          <label
            key={providerId}
            className="product-pickup-location-fields__check product-pickup-location-fields__check_soon product-pickup-location-fields__check_disabled"
          >
            <input
              type="checkbox"
              className="product-pickup-location-fields__checkbox"
              checked={false}
              disabled
              readOnly
            />
            <span className="product-pickup-location-fields__check-label">
              {SHIPPING_PROVIDER_LABEL_RU[providerId] ?? providerId}
              {PRODUCT_PICKUP_UI.SOON_BADGE}
            </span>
          </label>
        ))}
      </div>

      <p className="product-pickup-location-fields__hint">
        {PRODUCT_PICKUP_UI.METHODS_REQUIRED_HINT}
      </p>
      <p className="product-pickup-location-fields__hint">{methodsHint}</p>

      <AddressDeliveryFields
        value={{
          line: address,
          flat: "",
          fiasId: "",
          geo: lat != null && lon != null ? { lat, lon } : null,
        }}
        onChange={(next) => {
          emit({
            productPickupAddress: next.line,
            productPickupLat: next.geo?.lat ?? null,
            productPickupLon: next.geo?.lon ?? null,
          });
        }}
        disabled={disabled}
        lineInputClassName="create-product-section__input"
        labels={{
          line: pickupEnabled
            ? PRODUCT_PICKUP_UI.ADDRESS_LABEL
            : PRODUCT_PICKUP_UI.ADDRESS_LABEL_WAREHOUSE,
        }}
      />

      <YandexMapPointPicker
        lat={lat}
        lon={lon}
        disabled={disabled}
        onPointChange={({ lat: nextLat, lon: nextLon, address: mappedAddress }) => {
          emit({
            productPickupLat: nextLat,
            productPickupLon: nextLon,
            ...(mappedAddress ? { productPickupAddress: mappedAddress } : {}),
          });
        }}
      />
    </div>
  );
}
