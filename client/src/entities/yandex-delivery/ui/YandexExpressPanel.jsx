import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  createYandexExpressClaim,
  refreshYandexExpressClaim,
} from "../api/yandexExpressClaimApi.js";

// Та же карточка, что у накладной СДЭК: продавец видит службы одинаково.
import "../../cdek/ui/CdekWaybillPanel.css";

const UI = {
  TITLE: "Яндекс Экспресс",
  FROM: "Курьер заберёт",
  TO: "Отвезёт",
  RECIPIENT: "Получатель",
  DELIVERY_PAID_BY_BUYER: "Товар и доставку покупатель оплатит курьеру картой",
  ETA: "В пути примерно",
  /** @param {number} minutes */
  ETA_MINUTES: (minutes) => `${minutes} мин`,
  CALL: "Вызвать курьера",
  CALL_PENDING: "Вызываем…",
  CALL_HINT:
    "Нажмите, когда заказ упакован. Курьер приедет по адресу вашей точки продажи и позвонит на телефон из настроек Яндекс Доставки.",
  CALL_AGAIN: "Вызвать курьера заново",
  STATUS: "Статус",
  PICKUP_CODE: "Код для курьера",
  PICKUP_CODE_HINT: "Назовите курьеру этот код, когда отдаёте заказ",
  TRACKING: "Где курьер",
  TRACKING_LINK: "Открыть в Яндексе",
  REFRESH: "Обновить статус",
  REFRESH_PENDING: "Обновляем…",
  AUTO_STATUS_HINT:
    "Статус заказа меняется сам: «Отгружен» — когда курьер заберёт заказ, «Доставлен» — когда вручит. Проверяем раз в полчаса, быстрее — кнопкой.",
  CANCELLED: "Курьер отменён вместе с заказом",
  /** @param {string} reason */
  CANCEL_FAILED: (reason) =>
    `Яндекс не дал отменить курьера (${reason}). Отмените заявку в кабинете dostavka.yandex.ru.`,
};

/** Понятные продавцу названия статусов заявки. */
const STATUS_LABELS = {
  new: "Заявка создана",
  estimating: "Яндекс считает цену",
  ready_for_approval: "Подтверждаем заявку",
  accepted: "Ищем курьера",
  performer_lookup: "Ищем курьера",
  performer_draft: "Ищем курьера",
  performer_found: "Курьер едет к вам",
  pickup_arrived: "Курьер на месте",
  ready_for_pickup_confirmation: "Курьер ждёт код",
  pickuped: "Курьер забрал заказ",
  delivery_arrived: "Курьер у покупателя",
  ready_for_delivery_confirmation: "Курьер у покупателя",
  pay_waiting: "Покупатель оплачивает",
  delivered: "Доставлен",
  delivered_finish: "Доставлен",
  returning: "Курьер везёт заказ обратно",
  return_arrived: "Курьер вернулся",
  ready_for_return_confirmation: "Курьер вернулся",
  returned: "Заказ возвращён",
  returned_finish: "Заказ возвращён",
  failed: "Не получилось",
  estimating_failed: "Яндекс не смог рассчитать",
  performer_not_found: "Курьер не нашёлся",
  cancelled: "Отменена",
  cancelled_with_payment: "Отменена (платно)",
  cancelled_by_taxi: "Отменена Яндексом",
  cancelled_with_items_on_hands: "Отменена, заказ у курьера",
};

/** Курьера не будет — можно вызвать ещё раз (как на сервере). */
const RETRYABLE = new Set([
  "failed",
  "estimating_failed",
  "performer_not_found",
  "cancelled_by_taxi",
]);

/** Дальше следить не за чем. */
const FINAL = new Set([
  "delivered_finish",
  "returned_finish",
  "cancelled",
  "cancelled_with_payment",
  "cancelled_with_items_on_hands",
  ...RETRYABLE,
]);

/**
 * «Экспресс» в карточке продажи: откуда, куда, кому и кнопка вызова курьера.
 *
 * @param {{
 *   orderId: string;
 *   shipment: { yandexExpressShipmentAtOrder: Record<string, any>; yandexExpressClaim?: Record<string, any> | null };
 *   closed?: boolean;
 *   onChanged?: () => void;
 * }} props
 */
export function YandexExpressPanel({ orderId, shipment, closed = false, onChanged }) {
  const snapshot = shipment.yandexExpressShipmentAtOrder ?? {};
  const recipient = snapshot.recipient ?? {};
  const [claim, setClaim] = useState(shipment.yandexExpressClaim ?? null);

  const onClaim = (next) => {
    setClaim(next);
    onChanged?.();
  };
  const callMutation = useMutation({
    mutationFn: createYandexExpressClaim,
    onSuccess: onClaim,
  });
  const refreshMutation = useMutation({
    mutationFn: refreshYandexExpressClaim,
    onSuccess: onClaim,
  });

  const status = String(claim?.status ?? "");
  const hasClaim = Boolean(claim?.claimId);
  const canCall =
    !closed && (!hasClaim || RETRYABLE.has(status)) && !claim?.cancelledAt;
  const active = hasClaim && !claim?.cancelledAt && !closed && !FINAL.has(status);
  const error = callMutation.error ?? refreshMutation.error;
  const dropoff = [snapshot.dropoff?.address, snapshot.dropoff?.flat]
    .filter(Boolean)
    .join(", кв. ");

  return (
    <section className="cdek-waybill-panel" aria-label={UI.TITLE}>
      <h4 className="cdek-waybill-panel__title">{UI.TITLE}</h4>
      <dl className="cdek-waybill-panel__facts">
        {snapshot.pickup?.address ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.FROM}</dt>
            <dd>{snapshot.pickup.address}</dd>
          </div>
        ) : null}
        {dropoff ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.TO}</dt>
            <dd>{dropoff}</dd>
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
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.DELIVERY_PAID_BY_BUYER}</dt>
            <dd>{formatPriceRub(snapshot.deliverySumRub)}</dd>
          </div>
        ) : null}
        {snapshot.etaMinutes && !hasClaim ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.ETA}</dt>
            <dd>{UI.ETA_MINUTES(snapshot.etaMinutes)}</dd>
          </div>
        ) : null}
        {hasClaim ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.STATUS}</dt>
            <dd>{STATUS_LABELS[status] ?? status}</dd>
          </div>
        ) : null}
        {active && claim?.pickupCode ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.PICKUP_CODE}</dt>
            <dd>
              <strong>{claim.pickupCode}</strong>
            </dd>
          </div>
        ) : null}
        {active && claim?.sharingUrl ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{UI.TRACKING}</dt>
            <dd>
              <a href={claim.sharingUrl} target="_blank" rel="noopener noreferrer">
                {UI.TRACKING_LINK}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      {active && claim?.pickupCode ? (
        <p className="cdek-waybill-panel__hint">{UI.PICKUP_CODE_HINT}</p>
      ) : null}
      {hasClaim && claim?.error ? (
        <p className="cdek-waybill-panel__error" role="alert">
          {claim.error}
        </p>
      ) : null}

      {canCall ? (
        <div className="cdek-waybill-panel__form">
          <p className="cdek-waybill-panel__hint">{UI.CALL_HINT}</p>
          <button
            type="button"
            className="cdek-waybill-panel__button"
            onClick={() => callMutation.mutate(orderId)}
            disabled={callMutation.isPending}
          >
            {callMutation.isPending
              ? UI.CALL_PENDING
              : hasClaim
                ? UI.CALL_AGAIN
                : UI.CALL}
          </button>
        </div>
      ) : null}

      {claim?.cancelledAt ? (
        <p className="cdek-waybill-panel__hint">{UI.CANCELLED}</p>
      ) : null}
      {claim?.cancelError && !claim?.cancelledAt ? (
        <p className="cdek-waybill-panel__error" role="alert">
          {UI.CANCEL_FAILED(claim.cancelError)}
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
