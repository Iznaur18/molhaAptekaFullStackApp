import { MapPin, Truck } from "lucide-react";

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
  const address = String(product.productPickupAddress ?? "").trim();
  const lat =
    product.productPickupLat != null && Number.isFinite(Number(product.productPickupLat))
      ? Number(product.productPickupLat)
      : null;
  const lon =
    product.productPickupLon != null && Number.isFinite(Number(product.productPickupLon))
      ? Number(product.productPickupLon)
      : null;

  if (!pickupOn && !deliveryOn) {
    return (
      <p className="product-details-content-switcher__description">
        {PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}
      </p>
    );
  }

  if (pickupOn && !address && !deliveryOn) {
    return (
      <p className="product-details-content-switcher__description">
        {PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}
      </p>
    );
  }

  const routeLabel =
    lat != null && lon != null
      ? PRODUCT_PICKUP_UI.DETAILS_ROUTE
      : PRODUCT_PICKUP_UI.DETAILS_OPEN_MAP;

  return (
    <div className="product-pickup-details-panel">
      {pickupOn ? (
        address ? (
          <button
            type="button"
            className="product-pickup-details-panel__method product-pickup-details-panel__method--action"
            onClick={() => openYandexMapsRoute({ lat, lon, address })}
            aria-label={`${PRODUCT_PICKUP_UI.DETAILS_TITLE}: ${routeLabel}`}
          >
            <span className="product-pickup-details-panel__icon" aria-hidden>
              <AppIcon icon={MapPin} size="lg" strokeWidth={2.25} />
            </span>
            <span className="product-pickup-details-panel__text">
              <span className="product-pickup-details-panel__title">
                {PRODUCT_PICKUP_UI.DETAILS_TITLE}
              </span>
              <span className="product-pickup-details-panel__subtitle">{address}</span>
            </span>
            <span className="product-pickup-details-panel__action">{routeLabel}</span>
          </button>
        ) : (
          <div className="product-pickup-details-panel__method">
            <span className="product-pickup-details-panel__icon" aria-hidden>
              <AppIcon icon={MapPin} size="lg" strokeWidth={2.25} />
            </span>
            <span className="product-pickup-details-panel__text">
              <span className="product-pickup-details-panel__title">
                {PRODUCT_PICKUP_UI.DETAILS_TITLE}
              </span>
              <span className="product-pickup-details-panel__subtitle product-pickup-details-panel__subtitle--muted">
                {PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}
              </span>
            </span>
          </div>
        )
      ) : null}
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
