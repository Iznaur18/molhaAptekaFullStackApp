import { Building2, Car, MapPin, MonitorSmartphone, Truck } from "lucide-react";
import {
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_LABEL_RU,
  PRODUCT_DELIVERY_CARRIER_LOBO,
  CATEGORY_DEAL_TYPE_SERVICE,
  PRODUCT_SERVICE_LOCATION_LABELS_RU,
  isCartDealType,
  normalizeProductServiceLocations,
  normalizeCategoryDealType,
  productPickupLocationsFromProduct,
  productShipsToBuyer,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";

import { PRODUCT_PICKUP_UI } from "../../../../shared/config/appUiCopy.js";
import { openYandexMapsRoute } from "../../../../shared/lib/openYandexMaps.js";
import { AppIcon } from "../../../../shared/ui/icon/index.js";

/** Иконка к каждому месту оказания услуги. */
const SERVICE_LOCATION_ICONS = {
  at_client: Car,
  at_provider: Building2,
  online: MonitorSmartphone,
};

/**
 * @param {{
 *   product: import("../../model/types.js").ProductFromApi;
 * }} props
 */
export function ProductPickupDetailsPanel({ product }) {
  // Авто, недвижимость и услуги: адрес — место встречи, доставки нет. Флаги
  // самовывоза и доставки на товаре остаются, но покупателю их не показываем.
  const dealType = normalizeCategoryDealType(product.productDealType);
  const isCartDeal = isCartDealType(dealType);
  const pickupOn = !isCartDeal || product.productPickupEnabled !== false;
  // Перевозчик — из поля товара: у ЛОБО старые флаги доставки сняты.
  const deliveryOn = isCartDeal && productShipsToBuyer(product);
  const detailsTitle = isCartDeal
    ? PRODUCT_PICKUP_UI.DETAILS_TITLE
    : PRODUCT_PICKUP_UI.DEAL_DETAILS_TITLE[dealType];
  const noAddressLabel = isCartDeal
    ? PRODUCT_PICKUP_UI.DETAILS_NO_ADDRESS
    : PRODUCT_PICKUP_UI.DEAL_DETAILS_NO_ADDRESS[dealType];
  const carrier = resolveProductDeliveryCarrier(product);
  const locations = productPickupLocationsFromProduct(product);
  // Услуга: где её оказывают — рядом с адресом, это про то же «куда идти».
  const serviceLocations =
    dealType === CATEGORY_DEAL_TYPE_SERVICE
      ? normalizeProductServiceLocations(product.productServiceLocations)
      : [];
  // Каждое место — своя строка со своей иконкой, как строка адреса над ними.
  const serviceLocationsRow = serviceLocations.map((value) => (
    <div key={value} className="product-pickup-details-panel__method">
      <span className="product-pickup-details-panel__icon" aria-hidden>
        <AppIcon icon={SERVICE_LOCATION_ICONS[value]} size="lg" strokeWidth={2.25} />
      </span>
      <span className="product-pickup-details-panel__text">
        <span className="product-pickup-details-panel__title">
          {PRODUCT_SERVICE_LOCATION_LABELS_RU[value]}
        </span>
        <span className="product-pickup-details-panel__subtitle product-pickup-details-panel__subtitle--muted">
          {PRODUCT_PICKUP_UI.DEAL_SERVICE_LOCATION_HINTS[value]}
        </span>
      </span>
    </div>
  ));
  const noAddress = (
    <>
      <p className="product-details-content-switcher__description">{noAddressLabel}</p>
      {serviceLocationsRow}
    </>
  );

  if (!pickupOn && !deliveryOn) {
    return noAddress;
  }

  if (pickupOn && locations.length === 0 && !deliveryOn) {
    return noAddress;
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
              ? `${detailsTitle}: ${location.label}`
              : detailsTitle;

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
      {serviceLocationsRow}
    </div>
  );
}
