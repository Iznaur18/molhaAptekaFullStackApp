import { useState } from "react";

import {
  useCompleteCourierDeliveryMutation,
  useConfirmCourierHandoverMutation,
  useDeclineCourierShipmentMutation,
  useMarkCourierArrivedMutation,
  useStartCourierDeliveryMutation,
} from "../../../entities/courier/model/courierQueries.js";
import { ORDER_STATUS_LABEL_RU } from "../../../entities/order/model/constants.js";
import { COURIER_OVERVIEW_UI } from "../../../shared/config/appUiCopy.js";
import { CourierOrderItem } from "./CourierOrderItem.jsx";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

/**
 * Имя стороны сделки: ссылка в профиль, если открывать есть куда.
 *
 * @param {{ name?: string; userId?: string; onUserClick?: (userId: string) => void }} props
 */
function PersonName({ name, userId, onUserClick }) {
  const label = String(name ?? "").trim();
  if (!label) return "—";
  if (!onUserClick || !userId) return label;
  return (
    <button
      type="button"
      className="courier-overview__person"
      onClick={() => onUserClick(String(userId))}
    >
      {label}
    </button>
  );
}

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
 *   onUserClick?: (userId: string) => void;
 *   onProductClick?: (productId: string) => void;
 * }} props
 */
export function CourierDeliveryCard({
  delivery,
  onError,
  onUserClick,
  onProductClick,
}) {
  const [code, setCode] = useState("");

  const handoverMutation = useConfirmCourierHandoverMutation();
  const startMutation = useStartCourierDeliveryMutation();
  const arrivedMutation = useMarkCourierArrivedMutation();
  const completeMutation = useCompleteCourierDeliveryMutation();
  const declineMutation = useDeclineCourierShipmentMutation();

  const ids = { orderId: delivery.orderId, sellerId: delivery.sellerId };
  const isBusy =
    handoverMutation.isPending ||
    startMutation.isPending ||
    arrivedMutation.isPending ||
    completeMutation.isPending ||
    declineMutation.isPending;

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
          <dt>{COURIER_OVERVIEW_UI.SELLER}</dt>
          <dd>
            <PersonName
              name={delivery.sellerName}
              userId={delivery.sellerId}
              onUserClick={onUserClick}
            />
          </dd>
        </div>
        {/* Покупателя показываем, только когда контакты уже открыты: до
            передачи товара курьеру знать, кому везти, ещё рано. */}
        {delivery.buyerName ? (
          <div>
            <dt>{COURIER_OVERVIEW_UI.BUYER}</dt>
            <dd>
              <PersonName
                name={delivery.buyerName}
                userId={delivery.buyerId}
                onUserClick={onUserClick}
              />
            </dd>
          </div>
        ) : null}
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
          <CourierOrderItem
            key={`${item.name}-${index}`}
            item={item}
            onProductClick={onProductClick}
          />
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

      {/* Отказ возможен, только пока товар у продавца: дальше это уже спор. */}
      {delivery.status === "courier_assigned" ? (
        <button
          type="button"
          className="courier-overview__decline"
          disabled={isBusy}
          onClick={() => {
            if (!window.confirm(COURIER_OVERVIEW_UI.DECLINE_CONFIRM)) return;
            void guard(() => declineMutation.mutateAsync(ids));
          }}
        >
          {COURIER_OVERVIEW_UI.DECLINE}
        </button>
      ) : null}
    </li>
  );
}
