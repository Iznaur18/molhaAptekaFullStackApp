import { AppIcon } from "../icon/index.js";

import "./ShipmentStatus.css";

/**
 * Статус доставки цветной меткой: зелёный — доставлено, красный — отмена,
 * жёлтый — ждёт действия, синий — в пути, серый — только создано.
 *
 * @param {{
 *   tone: import("../../lib/shipmentStatusTone.js").ShipmentStatusTone;
 *   children: import("react").ReactNode;
 * }} props
 */
export function ShipmentStatusPill({ tone, children }) {
  return (
    <span className="shipment-status-pill" data-tone={tone}>
      <span className="shipment-status-pill__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

/**
 * Плашка «требует внимания»: сколько отдать курьеру, что сделать продавцу.
 *
 * @param {{
 *   tone: "warning" | "action" | "info";
 *   icon: import("lucide-react").LucideIcon;
 *   children: import("react").ReactNode;
 * }} props
 */
export function ShipmentCallout({ tone, icon, children }) {
  return (
    <div className="shipment-callout" data-tone={tone}>
      <span className="shipment-callout__icon" aria-hidden="true">
        <AppIcon icon={icon} size="sm" strokeWidth={2.25} />
      </span>
      <p className="shipment-callout__text">{children}</p>
    </div>
  );
}
