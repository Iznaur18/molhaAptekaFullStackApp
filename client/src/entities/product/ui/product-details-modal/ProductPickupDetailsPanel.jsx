import { PRODUCT_PICKUP_UI } from "../../../../shared/config/appUiCopy.js";
import { openYandexMapsRoute } from "../../../../shared/lib/openYandexMaps.js";

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 * }} props
 */
export function ProductPickupDetailsPanel({ product }) {
  const address = String(product.productPickupAddress ?? "").trim();
  const lat =
    product.productPickupLat != null && Number.isFinite(Number(product.productPickupLat))
      ? Number(product.productPickupLat)
      : null;
  const lon =
    product.productPickupLon != null && Number.isFinite(Number(product.productPickupLon))
      ? Number(product.productPickupLon)
      : null;

  if (!address) {
    return (
      <p className="product-details-content-switcher__description">
        {PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS}
      </p>
    );
  }

  return (
    <div className="product-pickup-details-panel">
      <p className="product-pickup-details-panel__title">{PRODUCT_PICKUP_UI.DETAILS_TITLE}</p>
      <p className="product-pickup-details-panel__address">{address}</p>
      <button
        type="button"
        className="product-pickup-details-panel__route"
        onClick={() => openYandexMapsRoute({ lat, lon, address })}
      >
        {lat != null && lon != null
          ? PRODUCT_PICKUP_UI.DETAILS_ROUTE
          : PRODUCT_PICKUP_UI.DETAILS_OPEN_MAP}
      </button>
    </div>
  );
}
