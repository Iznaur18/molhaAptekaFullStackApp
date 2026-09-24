import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { downloadBlob } from "../../../shared/lib/downloadBlob.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { resolveShipmentStatusTone } from "../../../shared/lib/shipmentStatusTone.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { ShipmentStatusPill } from "../../../shared/ui/ShipmentStatus/ShipmentStatus.jsx";
import { Truck } from "lucide-react";
import {
  createYandexDeliveryRequest,
  fetchYandexDeliveryLabel,
  refreshYandexDeliveryRequest,
} from "../api/yandexDeliveryRequestApi.js";

// Та же карточка, что у накладной СДЭК: продавец видит службы одинаково.
import "../../cdek/ui/CdekWaybillPanel.css";

const UI = {
  TITLE: "Яндекс Доставка",
  PICKUP_POINT: "Покупатель заберёт в пункте",
  RECIPIENT: "Получатель",
  DELIVERY_PAID_BY_BUYER: "Доставку покупатель оплатит картой в пункте",
  COMMISSION: "Комиссия Яндекса за приём оплаты (спишут с вас)",
  CREATE: "Создать заявку в Яндекс",
  CREATE_PENDING: "Создаём…",
  CREATE_HINT:
    "Заявка создаётся по вашему договору с Яндексом. После неё отнесите коробку в свой пункт сдачи.",
  STATUS: "Статус",
  TRACKING: "Отслеживание",
  TRACKING_LINK: "Открыть в Яндексе",
  REFRESH: "Обновить статус",
  REFRESH_PENDING: "Обновляем…",
  LABEL: "Ярлык для коробки (PDF)",
  LABEL_PENDING: "Готовим ярлык…",
  LABEL_HINT: "Распечатайте и наклейте на коробку перед сдачей в пункт",
  AUTO_STATUS_HINT:
    "Статус заказа меняется сам: «Отгружен» — когда Яндекс примет посылку, «Доставлен» — когда выдаст покупателю. Проверяем раз в полчаса.",
  CANCELLED: "Заявка отменена в Яндексе вместе с заказом",
  /** @param {string} reason */
  CANCEL_FAILED: (reason) =>
    `Яндекс не дал отменить заявку (${reason}). Отмените её в кабинете dostavka.yandex.ru.`,
};

/** Заявка есть, но посылку ещё не сдали: ярлык ещё нужен. */
const BEFORE_HANDOVER = new Set([
  "",
  "VALIDATING_ERROR",
  "CREATED",
  "DELIVERY_PROCESSING_STARTED",
  "SORTING_CENTER_LOADED",
]);

/**
 * Яндекс Доставка в карточке продажи: куда и кому везти, деньги, заявка.
 *
 * @param {{
 *   orderId: string;
 *   shipment: { yandexDeliveryShipmentAtOrder: Record<string, any>; yandexDeliveryRequest?: Record<string, any> | null };
 *   closed?: boolean;
 *   onChanged?: () => void;
 * }} props
 */
export function YandexShipmentPanel({ orderId, shipment, closed = false, onChanged }) {
  const snapshot = shipment.yandexDeliveryShipmentAtOrder ?? {};
  const recipient = snapshot.recipient ?? {};
  const [request, setRequest] = useState(shipment.yandexDeliveryRequest ?? null);

  const onRequest = (next) => {
    setRequest(next);
    onChanged?.();
  };
  const createMutation = useMutation({
    mutationFn: createYandexDeliveryRequest,
    onSuccess: onRequest,
  });
  const refreshMutation = useMutation({
    mutationFn: refreshYandexDeliveryRequest,
    onSuccess: onRequest,
  });
  const labelMutation = useMutation({
    mutationFn: fetchYandexDeliveryLabel,
    onSuccess: (blob) => downloadBlob(blob, `yandex-${String(orderId).slice(-8)}.pdf`),
  });

  const active = Boolean(request?.requestId) && !request?.cancelledAt && !closed;
  const beforeHandover = active && BEFORE_HANDOVER.has(String(request?.status ?? ""));
  const error = createMutation.error ?? refreshMutation.error ?? labelMutation.error;

  return (
    <section className="cdek-waybill-panel" data-carrier="yandex" aria-label={UI.TITLE}>
      <h4 className="cdek-waybill-panel__title">
        <span className="cdek-waybill-panel__title-icon" aria-hidden="true">
          <AppIcon icon={Truck} size="sm" strokeWidth={2.25} />
        </span>
        {UI.TITLE}
      </h4>
      <dl className="cdek-waybill-panel__facts">
        {snapshot.pickupPoint?.address ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.PICKUP_POINT}</dt>
            <dd>{snapshot.pickupPoint.address}</dd>
          </div>
        ) : null}
        {recipient.name ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.RECIPIENT}</dt>
            <dd>
              {recipient.name}
              {recipient.phone ? `, ${recipient.phone}` : ""}
            </dd>
          </div>
        ) : null}
        {snapshot.deliverySumRub ? (
          <div className="cdek-waybill-panel__fact cdek-waybill-panel__fact--money">
            <dt>{UI.DELIVERY_PAID_BY_BUYER}</dt>
            <dd>{formatPriceRub(snapshot.deliverySumRub)}</dd>
          </div>
        ) : null}
        {snapshot.paymentCommissionRub ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.COMMISSION}</dt>
            <dd>{formatPriceRub(snapshot.paymentCommissionRub)}</dd>
          </div>
        ) : null}
        {request?.requestId && (request.statusDescription || request.status) ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.STATUS}</dt>
            <dd>
              <ShipmentStatusPill
                tone={resolveShipmentStatusTone(request.status, {
                  cancelled: Boolean(request.cancelledAt),
                })}
              >
                {request.statusDescription || request.status}
              </ShipmentStatusPill>
            </dd>
          </div>
        ) : null}
        {request?.sharingUrl ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.TRACKING}</dt>
            <dd>
              <a href={request.sharingUrl} target="_blank" rel="noopener noreferrer">
                {UI.TRACKING_LINK}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      {!request?.requestId && !closed ? (
        <div className="cdek-waybill-panel__form">
          <p className="cdek-waybill-panel__hint">{UI.CREATE_HINT}</p>
          <button
            type="button"
            className="cdek-waybill-panel__button"
            onClick={() => createMutation.mutate(orderId)}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? UI.CREATE_PENDING : UI.CREATE}
          </button>
        </div>
      ) : null}

      {beforeHandover ? (
        <div className="cdek-waybill-panel__form">
          <button
            type="button"
            className="cdek-waybill-panel__button cdek-waybill-panel__button--secondary"
            onClick={() => labelMutation.mutate(orderId)}
            disabled={labelMutation.isPending}
          >
            {labelMutation.isPending ? UI.LABEL_PENDING : UI.LABEL}
          </button>
          <p className="cdek-waybill-panel__hint">{UI.LABEL_HINT}</p>
        </div>
      ) : null}

      {request?.cancelledAt ? (
        <p className="cdek-waybill-panel__hint">{UI.CANCELLED}</p>
      ) : null}
      {request?.cancelError && !request?.cancelledAt ? (
        <p className="cdek-waybill-panel__error" role="alert">
          {UI.CANCEL_FAILED(request.cancelError)}
        </p>
      ) : null}

      {active ? (
        <button
          type="button"
          className="cdek-waybill-panel__button cdek-waybill-panel__button--secondary"
          onClick={() => refreshMutation.mutate(orderId)}
          disabled={refreshMutation.isPending}
        >
          {refreshMutation.isPending ? UI.REFRESH_PENDING : UI.REFRESH}
        </button>
      ) : null}
      {active ? (
        <p className="cdek-waybill-panel__hint">{UI.AUTO_STATUS_HINT}</p>
      ) : null}

      {error ? (
        <p className="cdek-waybill-panel__error" role="alert">
          {error.message}
        </p>
      ) : null}
    </section>
  );
}
