import { useState } from "react";

import {
  useCompleteCourierDeliveryMutation,
  useConfirmCourierHandoverMutation,
  useMarkCourierArrivedMutation,
  useStartCourierDeliveryMutation,
} from "../../../entities/courier/model/courierQueries.js";
import { ORDER_STATUS_LABEL_RU } from "../../../entities/order/model/constants.js";
import { COURIER_OVERVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * Одна активная доставка со следующим шагом.
 *
 * Два шага требуют кода: забрать у продавца и вручить покупателю. Код
 * называет вживую тот, кто отдаёт, — это и есть доказательство, что оба
 * стоят рядом.
 *
 * @param {{
 *   delivery: Record<string, any>;
 *   onError: (message: string) => void;
 * }} props
 */
export function CourierDeliveryCard({ delivery, onError }) {
  const [code, setCode] = useState("");

  const handoverMutation = useConfirmCourierHandoverMutation();
  const startMutation = useStartCourierDeliveryMutation();
  const arrivedMutation = useMarkCourierArrivedMutation();
  const completeMutation = useCompleteCourierDeliveryMutation();

  const ids = { orderId: delivery.orderId, sellerId: delivery.sellerId };
  const isBusy =
    handoverMutation.isPending ||
    startMutation.isPending ||
    arrivedMutation.isPending ||
    completeMutation.isPending;

  /** @param {() => Promise<unknown>} run */
  const guard = async (run) => {
    onError("");
    try {
      await run();
      setCode("");
    } catch (e) {
      onError(e instanceof Error ? e.message : COURIER_OVERVIEW_UI.ERROR_GENERIC);
    }
  };

  const needsCode =
    delivery.status === "courier_assigned" || delivery.status === "delivered";
  const codeReady = /^\d{4}$/.test(code.trim());

  const renderAction = () => {
    switch (delivery.status) {
      case "courier_assigned":
        return (
          <button
            type="button"
            className="courier-overview__accept"
            disabled={isBusy || !codeReady}
            onClick={() => guard(() => handoverMutation.mutateAsync({ ...ids, code }))}
          >
            {COURIER_OVERVIEW_UI.STEP_TAKE}
          </button>
        );
      case "courier_holding":
        return (
          <button
            type="button"
            className="courier-overview__accept"
            disabled={isBusy}
            onClick={() => guard(() => startMutation.mutateAsync(ids))}
          >
            {COURIER_OVERVIEW_UI.STEP_GO}
          </button>
        );
      case "in_delivery":
        return (
          <button
            type="button"
            className="courier-overview__accept"
            disabled={isBusy}
            onClick={() => guard(() => arrivedMutation.mutateAsync(ids))}
          >
            {COURIER_OVERVIEW_UI.STEP_ARRIVED}
          </button>
        );
      case "delivered":
        return (
          <button
            type="button"
            className="courier-overview__accept"
            disabled={isBusy || !codeReady}
            onClick={() => guard(() => completeMutation.mutateAsync({ ...ids, code }))}
          >
            {COURIER_OVERVIEW_UI.STEP_HANDED}
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <li className="courier-overview__card">
      <div className="courier-overview__row">
        <span className="courier-overview__status">
          {ORDER_STATUS_LABEL_RU[delivery.status] ?? delivery.status}
        </span>
        <span className="courier-overview__fee">
          {formatPriceRub(delivery.deliveryFeeRub)}
        </span>
      </div>

      <dl className="courier-overview__meta">
        <div>
          <dt>{COURIER_OVERVIEW_UI.PICKUP}</dt>
          <dd>
            {delivery.pickupAddress || "—"}
            {delivery.sellerPhone ? ` · ${delivery.sellerPhone}` : ""}
          </dd>
        </div>
        <div>
          <dt>{COURIER_OVERVIEW_UI.DROPOFF}</dt>
          <dd>
            {delivery.deliveryAddress || "—"}
            {delivery.buyerPhone ? ` · ${delivery.buyerPhone}` : ""}
          </dd>
        </div>
      </dl>

      {!delivery.contactsUnlocked ? (
        <p className="courier-overview__hint">{COURIER_OVERVIEW_UI.CONTACTS_LOCKED}</p>
      ) : null}

      <ul className="courier-overview__items" role="list">
        {delivery.items.map((item, index) => (
          <li key={`${item.name}-${index}`}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      {needsCode ? (
        <label className="courier-overview__code">
          <span>
            {delivery.status === "courier_assigned"
              ? COURIER_OVERVIEW_UI.CODE_FROM_SELLER
              : COURIER_OVERVIEW_UI.CODE_FROM_BUYER}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="0000"
            disabled={isBusy}
          />
        </label>
      ) : null}

      {renderAction()}
    </li>
  );
}
