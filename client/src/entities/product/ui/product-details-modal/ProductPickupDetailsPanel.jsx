import { MapPin, Truck } from "lucide-react";
import { productPickupLocationsFromProduct } from "@molha/api-contract";

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
  const deliveryOn = product.productDeliveryEnabled === true;
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
              {PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY}
            </span>
            <span className="product-pickup-details-panel__subtitle product-pickup-details-panel__subtitle--muted">
              {PRODUCT_PICKUP_UI.DETAILS_DELIVERY_HINT}
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
