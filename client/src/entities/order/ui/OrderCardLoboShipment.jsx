import { PRODUCT_DELIVERY_CARRIER_LOBO } from "@molha/api-contract";
import { Banknote, MapPin, Navigation, PackageCheck, Truck } from "lucide-react";

import { ORDER_LOBO_UI as UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { resolveShipmentStatusTone } from "../../../shared/lib/shipmentStatusTone.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import {
  ShipmentCallout,
  ShipmentStatusPill,
} from "../../../shared/ui/ShipmentStatus/ShipmentStatus.jsx";

/** Где курьер видно только пока заказ везут — так отдаёт ссылку Wayset. */
const TRACKABLE = new Set(["accepted", "arrived", "in_progress"]);

/**
 * Доставка ЛОБО в карточке заказа: статус цветной меткой, откуда заберут,
 * «Где курьер» и — плашками — то, что требует внимания: сколько отдать
 * курьеру (покупателю) и когда вызовется курьер (продавцу).
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
  const statusLabel = handedOver
    ? (UI.STATUS[status] ?? UI.STATUS_UNKNOWN)
    : UI.NOT_HANDED_OVER;
  const statusTone = resolveShipmentStatusTone(status, { notStarted: !handedOver });
  const trackingUrl = String(shipment.shippingTrackingUrl ?? "");
  const deliveryFeeRub = Number(shipment.deliveryFeeRub) || 0;

  if (!handedOver && role !== "seller") return null;

  return (
    <section className="order-card__carrier" aria-label={UI.TITLE}>
      <header className="order-card__carrier-head">
        <span className="order-card__carrier-icon" aria-hidden="true">
          <AppIcon icon={Truck} size="sm" strokeWidth={2.25} />
        </span>
        <span className="order-card__carrier-title">{UI.TITLE}</span>
        <ShipmentStatusPill tone={statusTone}>{statusLabel}</ShipmentStatusPill>
      </header>

      {role === "seller" && pickupAddress ? (
        <div className="order-card__carrier-fact">
          <AppIcon
            icon={MapPin}
            size="sm"
            strokeWidth={2.25}
            className="order-card__carrier-fact-icon"
          />
          <span className="order-card__carrier-fact-body">
            <span className="order-card__carrier-fact-label">{UI.PICKUP_FROM}:</span>
            <span className="order-card__carrier-fact-value">{pickupAddress}</span>
            {!handedOver ? (
              <span className="order-card__carrier-hint">{UI.PICKUP_FROM_HINT}</span>
            ) : null}
          </span>
        </div>
      ) : null}

      {!handedOver ? (
        <ShipmentCallout tone="action" icon={PackageCheck}>
          {UI.SELLER_HINT}
        </ShipmentCallout>
      ) : null}

      {role === "buyer" && deliveryFeeRub > 0 && status !== "cancelled" ? (
        <ShipmentCallout tone="warning" icon={Banknote}>
          {UI.BUYER_PAYS_CASH}: <strong>{formatPriceRub(deliveryFeeRub)}</strong>
        </ShipmentCallout>
      ) : null}

      {handedOver && trackingUrl && TRACKABLE.has(status) ? (
        <a
          className="order-card__carrier-link"
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <AppIcon icon={Navigation} size="sm" strokeWidth={2.25} />
          {UI.TRACKING_LINK}
        </a>
      ) : null}
    </section>
  );
}
