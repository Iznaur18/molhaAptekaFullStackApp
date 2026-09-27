import {
  SHIPPING_PROVIDER_CDEK,
  buildShippingTrackingUrl,
  formatCdekKeepFreeUntil,
  formatCdekStageLabel,
  isCdekAwaitingPickup,
} from "@molha/api-contract";
import { CalendarClock, Navigation, Package } from "lucide-react";

import { ORDER_CDEK_UI as UI } from "../../../shared/config/appUiCopy.js";
import { resolveCdekStatusTone } from "../../../shared/lib/shipmentStatusTone.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import {
  ShipmentCallout,
  ShipmentStatusPill,
} from "../../../shared/ui/ShipmentStatus/ShipmentStatus.jsx";

/**
 * Посылка СДЭК в карточке заказа покупателя: этап так, как его пишет сам СДЭК
 * («Готов к выдаче»), а когда посылка лежит в пункте — до какого дня её
 * забрать и где.
 *
 * Продавцу то же самое показывает панель накладной в «Моих продажах».
 *
 * @param {{
 *   shipment: Record<string, any> | null | undefined;
 *   role: "buyer" | "seller" | null | undefined;
 * }} props
 */
export function OrderCardCdekShipment({ shipment, role }) {
  if (role !== "buyer") return null;
  if (shipment?.deliveryCarrier !== SHIPPING_PROVIDER_CDEK) return null;
  const waybill = shipment.cdekWaybill;
  if (!waybill?.uuid || waybill.cancelledAt) return null;
  if (!waybill.statusCode && !waybill.status) return null;

  const stageLabel = formatCdekStageLabel(waybill.statusCode, waybill.status ?? "");
  const awaitingPickup = isCdekAwaitingPickup(waybill.statusCode);
  const keepFreeUntil = awaitingPickup
    ? formatCdekKeepFreeUntil(waybill.keepFreeUntil)
    : "";
  const pointAddress = String(
    shipment.cdekShipmentAtOrder?.pickupPoint?.address ?? "",
  ).trim();
  const trackingUrl = waybill.cdekNumber
    ? buildShippingTrackingUrl(SHIPPING_PROVIDER_CDEK, String(waybill.cdekNumber))
    : "";

  return (
    <section className="order-card__carrier" aria-label={UI.TITLE}>
      <header className="order-card__carrier-head">
        <span className="order-card__carrier-icon" aria-hidden="true">
          <AppIcon icon={Package} size="sm" strokeWidth={2.25} />
        </span>
        <span className="order-card__carrier-title">{UI.TITLE}</span>
        <ShipmentStatusPill tone={resolveCdekStatusTone(waybill)}>
          {stageLabel}
        </ShipmentStatusPill>
      </header>

      {keepFreeUntil ? (
        <ShipmentCallout tone="warning" icon={CalendarClock}>
          <strong>{UI.PICK_UP_BY(keepFreeUntil)}</strong>
          {pointAddress ? (
            <>
              <br />
              {UI.PICKUP_POINT}: {pointAddress}
            </>
          ) : null}
        </ShipmentCallout>
      ) : null}

      {trackingUrl ? (
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
