import { PRODUCT_DELIVERY_FULFILLMENT_ENABLED } from "@molha/api-contract";

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
 *   deliveryEnabled: boolean;
 *   disabled?: boolean;
 *   onChange: (next: {
 *     productPickupAddress: string;
 *     productPickupLat: number | null;
 *     productPickupLon: number | null;
 *     productDeliveryEnabled: boolean;
 *   }) => void;
 * }} props
 */
export function ProductPickupLocationFields({
  address,
  lat,
  lon,
  deliveryEnabled,
  disabled = false,
  onChange,
}) {
  const emit = (patch) => {
    onChange({
      productPickupAddress: address,
      productPickupLat: lat,
      productPickupLon: lon,
      productDeliveryEnabled: deliveryEnabled,
      ...patch,
    });
  };

  const pickupSelected = !deliveryEnabled;
  const deliverySelectable = PRODUCT_DELIVERY_FULFILLMENT_ENABLED && !disabled;

  return (
    <div className="product-pickup-location-fields">
      <p className="product-pickup-location-fields__legend">
        <FormFieldLabel>{PRODUCT_PICKUP_UI.FULFILLMENT_LEGEND}</FormFieldLabel>
      </p>

      <div
        className="product-pickup-location-fields__choice-row"
        role="radiogroup"
        aria-label={PRODUCT_PICKUP_UI.FULFILLMENT_LEGEND}
      >
        <button
          type="button"
          className={[
            "product-pickup-location-fields__chip",
            pickupSelected ? "product-pickup-location-fields__chip_active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="radio"
          aria-checked={pickupSelected}
          disabled={disabled}
          onClick={() => emit({ productDeliveryEnabled: false })}
        >
          {PRODUCT_PICKUP_UI.FULFILLMENT_PICKUP}
        </button>

        <button
          type="button"
          className={[
            "product-pickup-location-fields__chip",
            "product-pickup-location-fields__chip_soon",
            deliveryEnabled ? "product-pickup-location-fields__chip_active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="radio"
          aria-checked={deliveryEnabled}
          disabled={!deliverySelectable}
          onClick={() => {
            if (!PRODUCT_DELIVERY_FULFILLMENT_ENABLED) {
              return;
            }
            emit({ productDeliveryEnabled: true });
          }}
        >
          {PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY}
          {PRODUCT_PICKUP_UI.SOON_BADGE}
        </button>
      </div>

      <p className="product-pickup-location-fields__hint">{PRODUCT_PICKUP_UI.PICKUP_HINT}</p>

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
          line: PRODUCT_PICKUP_UI.ADDRESS_LABEL,
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
