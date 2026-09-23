import { PRODUCT_DELIVERY_CARRIER_LOBO } from "@molha/api-contract";

import { ORDER_LOBO_UI as UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/** Где курьер видно только пока заказ везут — так отдаёт ссылку Wayset. */
const TRACKABLE = new Set(["accepted", "arrived", "in_progress"]);

/**
 * Доставка ЛОБО в карточке заказа: что сейчас с курьером, ссылка «Где
 * курьер» и сколько покупатель отдаст курьеру за доставку.
 *
 * Статус приходит опросом службы раз в несколько минут; имя и машина курьера
 * показываются общим блоком «Курьер» в карточке.
 *
 * @param {{
 *   shipment: Record<string, any> | null | undefined;
 *   role: "buyer" | "seller" | null | undefined;
 *   pickupAddress?: string;
 * }} props
 */
export function OrderCardLoboShipment({ shipment, role, pickupAddress = "" }) {
  if (shipment?.deliveryCarrier !== PRODUCT_DELIVERY_CARRIER_LOBO) return null;

  const handedOver = Boolean(shipment.shippingExternalId);
  const status = String(shipment.shippingCarrierStatus ?? "");
  const statusLabel = handedOver ? (UI.STATUS[status] ?? UI.STATUS_UNKNOWN) : "";
  const trackingUrl = String(shipment.shippingTrackingUrl ?? "");
  const deliveryFeeRub = Number(shipment.deliveryFeeRub) || 0;

  if (!handedOver && role !== "seller") return null;

  return (
    <div className="order-card__carrier" aria-label={UI.TITLE}>
      <p className="order-card__carrier-line">
        <span className="order-card__courier-label">{UI.TITLE}:</span>{" "}
        <strong>{handedOver ? statusLabel : UI.NOT_HANDED_OVER}</strong>
      </p>
      {role === "seller" && pickupAddress ? (
        <p className="order-card__carrier-line">
          <span className="order-card__courier-label">{UI.PICKUP_FROM}:</span>{" "}
          {pickupAddress}
        </p>
      ) : null}
      {role === "seller" && !handedOver && pickupAddress ? (
        <p className="order-card__carrier-hint">{UI.PICKUP_FROM_HINT}</p>
      ) : null}
      {!handedOver ? (
        <p className="order-card__carrier-hint">{UI.SELLER_HINT}</p>
      ) : null}
      {handedOver && trackingUrl && TRACKABLE.has(status) ? (
        <a
          className="order-card__carrier-link"
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {UI.TRACKING_LINK}
        </a>
      ) : null}
      {role === "buyer" && deliveryFeeRub > 0 && status !== "cancelled" ? (
        <p className="order-card__carrier-hint">
          {UI.BUYER_PAYS(formatPriceRub(deliveryFeeRub))}
        </p>
      ) : null}
    </div>
  );
}
