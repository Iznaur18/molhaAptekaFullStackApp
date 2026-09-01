import { useState } from "react";

import {
  useResolveShipmentDisputeMutation,
  useShipmentDisputesQuery,
} from "../../../entities/courier/model/courierQueries.js";
import { SHIPMENT_DISPUTE_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import "./ShipmentDisputesPage.css";

/** @param {string | Date | null | undefined} value */
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("ru-RU");
};

/**
 * Очередь споров по доставке.
 *
 * Модератор решает, где оказался товар, — правильного ответа сервер не знает,
 * поэтому оба исхода равноправны. Телефоны всех троих здесь для того, чтобы
 * решение принималось после звонков, а не вслепую.
 *
 * @param {{ onQueueChanged?: () => void }} props
 */
export function ShipmentDisputesPage({ onQueueChanged }) {
  const [rowError, setRowError] = useState(/** @type {Record<string, string>} */ ({}));
  const [pendingKey, setPendingKey] = useState(/** @type {string | null} */ (null));

  const queueQuery = useShipmentDisputesQuery();
  const resolveMutation = useResolveShipmentDisputeMutation();

  const disputes = queueQuery.data?.disputes ?? [];

  /** @param {Record<string, any>} row @param {"returned" | "confirmed"} outcome */
  const handleResolve = async (row, outcome) => {
    if (!window.confirm(SHIPMENT_DISPUTE_UI.RESOLVE_CONFIRM)) return;

    const key = `${row.orderId}:${row.sellerId}`;
    setPendingKey(key);
    setRowError((prev) => ({ ...prev, [key]: "" }));
    try {
      await resolveMutation.mutateAsync({
        orderId: row.orderId,
        sellerId: row.sellerId,
        outcome,
      });
      onQueueChanged?.();
    } catch (e) {
      setRowError((prev) => ({
        ...prev,
        [key]: e instanceof Error ? e.message : SHIPMENT_DISPUTE_UI.ERROR_GENERIC,
      }));
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <section className="shipment-disputes">
      <header className="shipment-disputes__header">
        <h2 className="shipment-disputes__title">{SHIPMENT_DISPUTE_UI.QUEUE_TITLE}</h2>
      </header>

      {queueQuery.isPending ? (
        <p className="shipment-disputes__loading">{SHIPMENT_DISPUTE_UI.QUEUE_LOADING}</p>
      ) : queueQuery.isError ? (
        <p className="shipment-disputes__error" role="alert">
          {queueQuery.error instanceof Error
            ? queueQuery.error.message
            : SHIPMENT_DISPUTE_UI.ERROR_GENERIC}
        </p>
      ) : disputes.length === 0 ? (
        <p className="shipment-disputes__empty">{SHIPMENT_DISPUTE_UI.QUEUE_EMPTY}</p>
      ) : (
        <ul className="shipment-disputes__list" role="list">
          {disputes.map((row) => {
            const key = `${row.orderId}:${row.sellerId}`;
            const isRowPending = pendingKey === key;
            return (
              <li key={key} className="shipment-disputes__card">
                <div className="shipment-disputes__row">
                  <span className="shipment-disputes__when">
                    {SHIPMENT_DISPUTE_UI.OPENED_AT}: {formatDate(row.openedAt)}
                  </span>
                  <span className="shipment-disputes__fee">
                    {formatPriceRub(row.deliveryFeeRub)}
                  </span>
                </div>

                {/* Без причины подпись «Причина:» лишняя — фраза сама себя
                    объясняет. */}
                <p className="shipment-disputes__reason">
                  {row.reason
                    ? `${SHIPMENT_DISPUTE_UI.REASON}: ${row.reason}`
                    : SHIPMENT_DISPUTE_UI.NO_REASON}
                </p>

                <dl className="shipment-disputes__people">
                  <div>
                    <dt>{SHIPMENT_DISPUTE_UI.SELLER}</dt>
                    <dd>
                      {row.sellerName || "—"}
                      {row.sellerPhone ? ` · ${row.sellerPhone}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>{SHIPMENT_DISPUTE_UI.COURIER}</dt>
                    <dd>
                      {row.courierName || "—"}
                      {row.courierPhone ? ` · ${row.courierPhone}` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt>{SHIPMENT_DISPUTE_UI.BUYER}</dt>
                    <dd>
                      {row.buyerName || "—"}
                      {row.buyerPhone ? ` · ${row.buyerPhone}` : ""}
                    </dd>
                  </div>
                </dl>

                <ul className="shipment-disputes__items" role="list">
                  {(row.items ?? []).map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>

                {rowError[key] ? (
                  <p className="shipment-disputes__row-error" role="alert">
                    {rowError[key]}
                  </p>
                ) : null}

                <div className="shipment-disputes__actions">
                  <button
                    type="button"
                    className="shipment-disputes__returned"
                    onClick={() => handleResolve(row, "returned")}
                    disabled={isRowPending}
                  >
                    {SHIPMENT_DISPUTE_UI.RESOLVE_RETURNED}
                  </button>
                  <button
                    type="button"
                    className="shipment-disputes__confirmed"
                    onClick={() => handleResolve(row, "confirmed")}
                    disabled={isRowPending}
                  >
                    {SHIPMENT_DISPUTE_UI.RESOLVE_CONFIRMED}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
