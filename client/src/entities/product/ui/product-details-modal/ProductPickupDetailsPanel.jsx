import { MapPin, Truck } from "lucide-react";
import {
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_LABEL_RU,
  PRODUCT_DELIVERY_CARRIER_LOBO,
  productPickupLocationsFromProduct,
  productShipsToBuyer,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";

import { PRODUCT_PICKUP_UI } from "../../../../shared/config/appUiCopy.js";
import { openYandexMapsRoute } from "../../../../shared/lib/openYandexMaps.js";
import { AppIcon } from "../../../../shared/ui/icon/index.js";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 * }} props
 */
export function ProductPickupDetailsPanel({ product }) {
  const pickupOn = product.productPickupEnabled !== false;
  // Перевозчик — из поля товара: у ЛОБО старые флаги доставки сняты.
  const deliveryOn = productShipsToBuyer(product);
  const carrier = resolveProductDeliveryCarrier(product);
  const locations = productPickupLocationsFromProduct(product);

  if (!pickupOn && !deliveryOn) {
    return (
      <p className="product-details-content-switcher__description">
        {PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}
      </p>
    );
  }

  if (pickupOn && locations.length === 0 && !deliveryOn) {
    return (
      <p className="product-details-content-switcher__description">
        {PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}
      </p>
    );
  }

  return (
    <div className="product-pickup-details-panel">
      {pickupOn
        ? locations.map((location) => {
            const address = String(location.address ?? "").trim();
            const lat =
              location.lat != null && Number.isFinite(Number(location.lat))
                ? Number(location.lat)
                : null;
            const lon =
              location.lon != null && Number.isFinite(Number(location.lon))
                ? Number(location.lon)
                : null;
            const routeLabel =
              lat != null && lon != null
                ? PRODUCT_PICKUP_UI.DETAILS_ROUTE
                : PRODUCT_PICKUP_UI.DETAILS_OPEN_MAP;
            const title = location.label
              ? `${PRODUCT_PICKUP_UI.DETAILS_TITLE}: ${location.label}`
              : PRODUCT_PICKUP_UI.DETAILS_TITLE;

            return (
              <button
                key={location.id}
                type="button"
                className="product-pickup-details-panel__method product-pickup-details-panel__method--action"
                onClick={() => openYandexMapsRoute({ lat, lon, address })}
                aria-label={`${title}: ${routeLabel}`}
              >
                <span className="product-pickup-details-panel__icon" aria-hidden>
                  <AppIcon icon={MapPin} size="lg" strokeWidth={2.25} />
                </span>
                <span className="product-pickup-details-panel__text">
                  <span className="product-pickup-details-panel__title">{title}</span>
                  <span className="product-pickup-details-panel__subtitle">
                    {address}
                    {location.isDefault
                      ? ` · ${PRODUCT_PICKUP_UI.LOCATION_DEFAULT}`
                      : ""}
                  </span>
                </span>
                <span className="product-pickup-details-panel__action">
                  {routeLabel}
                </span>
              </button>
            );
          })
        : null}
      {deliveryOn ? (
        <div className="product-pickup-details-panel__method">
          <span className="product-pickup-details-panel__icon" aria-hidden>
            <AppIcon icon={Truck} size="lg" strokeWidth={2.25} />
          </span>
          <span className="product-pickup-details-panel__text">
            <span className="product-pickup-details-panel__title">
              {carrier === PRODUCT_DELIVERY_CARRIER_LOBO
                ? `${PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY_ANY} ${PRODUCT_DELIVERY_CARRIER_LABEL_RU[carrier]}`
                : carrier === PRODUCT_DELIVERY_CARRIER_GITORG
                  ? PRODUCT_PICKUP_UI.FULFILLMENT_COURIER
                  : PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY}
            </span>
            <span className="product-pickup-details-panel__subtitle product-pickup-details-panel__subtitle--muted">
              {carrier === PRODUCT_DELIVERY_CARRIER_LOBO
                ? PRODUCT_PICKUP_UI.DETAILS_LOBO_HINT
                : PRODUCT_PICKUP_UI.DETAILS_DELIVERY_HINT}
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
