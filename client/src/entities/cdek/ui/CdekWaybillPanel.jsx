import { CDEK_DELIVERY_MODE_POINT_TO_POINT } from "@molha/api-contract";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";

import { CDEK_WAYBILL_UI } from "../../../shared/config/appUiCopy.js";
import { downloadBlob } from "../../../shared/lib/downloadBlob.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  createCdekWaybill,
  fetchCdekLabel,
  fetchCdekReceptionPoints,
} from "../api/cdekWaybillApi.js";

import { resolveShipmentStatusTone } from "../../../shared/lib/shipmentStatusTone.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { ShipmentStatusPill } from "../../../shared/ui/ShipmentStatus/ShipmentStatus.jsx";
import { Package } from "lucide-react";

import { CdekIntakeSection } from "./CdekIntakeSection.jsx";

import "./CdekWaybillPanel.css";

/**
 * Накладная СДЭК в карточке продажи: куда едет посылка, кнопка создания и,
 * когда накладная есть, номер СДЭК со статусом.
 *
 * @param {{
 *   orderId: string;
 *   shipment: {
 *     cdekShipmentAtOrder?: Record<string, any> | null;
 *     cdekWaybill?: Record<string, any> | null;
 *   };
 *   onChanged?: () => void;
 *   closed?: boolean;
 *   awaitingPayment?: boolean;
 * }} props
 *   closed: заказ закрыт (подтверждён, отменён или вернулся) — показываем
 *   только итог, без кнопок.
 */
export function CdekWaybillPanel({
  orderId,
  shipment,
  onChanged,
  closed = false,
  awaitingPayment = false,
}) {
  const snapshot = shipment.cdekShipmentAtOrder ?? {};
  const [waybill, setWaybill] = useState(shipment.cdekWaybill ?? null);
  const pointToPoint = snapshot.deliveryMode === CDEK_DELIVERY_MODE_POINT_TO_POINT;

  const createMutation = useMutation({
    mutationFn: createCdekWaybill,
    onSuccess: (next) => {
      setWaybill(next);
      onChanged?.();
    },
  });
  const error = createMutation.error;

  return (
    <section
      className="cdek-waybill-panel"
      data-carrier="cdek"
      aria-label={CDEK_WAYBILL_UI.TITLE}
    >
      <h4 className="cdek-waybill-panel__title">
        <span className="cdek-waybill-panel__title-icon" aria-hidden="true">
          <AppIcon icon={Package} size="sm" strokeWidth={2.25} />
        </span>
        {CDEK_WAYBILL_UI.TITLE}
      </h4>

      <dl className="cdek-waybill-panel__facts">
        {snapshot.deliverySumRub ? (
          <div className="cdek-waybill-panel__fact cdek-waybill-panel__fact--money">
            <dt>{CDEK_WAYBILL_UI.DELIVERY_PAID_BY_BUYER}</dt>
            <dd>{formatPriceRub(snapshot.deliverySumRub)}</dd>
          </div>
        ) : null}
      </dl>

      {waybill?.uuid ? (
        <WaybillState
          orderId={orderId}
          waybill={waybill}
          closed={closed}
          pointToPoint={pointToPoint}
          onWaybillChange={(next) => {
            setWaybill(next);
            onChanged?.();
          }}
        />
      ) : closed ? null : awaitingPayment ? (
        <p className="cdek-waybill-panel__hint">{CDEK_WAYBILL_UI.AWAITING_PAYMENT}</p>
      ) : (
        <WaybillCreateForm
          pointToPoint={pointToPoint}
          isPending={createMutation.isPending}
          onCreate={(shipmentPointCode) =>
            createMutation.mutate({ orderId, shipmentPointCode })
          }
        />
      )}

      {error ? (
        <p className="cdek-waybill-panel__error" role="alert">
          {error.message}
        </p>
      ) : null}
    </section>
  );
}

/**
 * @param {{
 *   orderId: string;
 *   waybill: Record<string, any>;
 *   closed: boolean;
 *   pointToPoint: boolean;
 *   onWaybillChange: (waybill: Record<string, any>) => void;
 * }} props
 */
function WaybillState({ orderId, waybill, closed, pointToPoint, onWaybillChange }) {
  const returnDelivered =
    waybill.returnStatusCode === "DELIVERED" ||
    waybill.returnStatusCode === "POSTOMAT_RECEIVED";
  const isOpen = !closed && !waybill.cancelledAt;
  // Пока СДЭК посылку не принял: есть смысл в этикетке и курьере.
  const beforeHandover =
    isOpen && ["", "ACCEPTED", "CREATED"].includes(String(waybill.statusCode ?? ""));
  const labelMutation = useMutation({
    mutationFn: fetchCdekLabel,
    onSuccess: (blob) => downloadBlob(blob, `cdek-${waybill.cdekNumber}.pdf`),
  });

  return (
    <div className="cdek-waybill-panel__state">
      <dl className="cdek-waybill-panel__facts">
        {waybill.status ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{CDEK_WAYBILL_UI.STATUS}</dt>
            <dd>
              <ShipmentStatusPill
                tone={resolveShipmentStatusTone(waybill.statusCode, {
                  cancelled: Boolean(waybill.cancelledAt),
                })}
              >
                {waybill.status}
              </ShipmentStatusPill>
            </dd>
          </div>
        ) : null}
      </dl>
      {waybill.returnUuid ? (
        <div className="cdek-waybill-panel__notice">
          <p className="cdek-waybill-panel__notice-text">
            {returnDelivered ? CDEK_WAYBILL_UI.RETURNED : CDEK_WAYBILL_UI.RETURNING}
          </p>
          {!returnDelivered && waybill.returnStatus ? (
            <p className="cdek-waybill-panel__hint">
              {CDEK_WAYBILL_UI.RETURN_STATUS}: {waybill.returnStatus}
            </p>
          ) : null}
        </div>
      ) : null}
      {waybill.cancelledAt ? (
        <p className="cdek-waybill-panel__hint">{CDEK_WAYBILL_UI.CANCELLED}</p>
      ) : null}
      {waybill.cancelError && !waybill.cancelledAt ? (
        <p className="cdek-waybill-panel__error" role="alert">
          {CDEK_WAYBILL_UI.CANCEL_FAILED(waybill.cancelError)}
        </p>
      ) : null}
      {waybill.error ? (
        <p className="cdek-waybill-panel__error" role="alert">
          {CDEK_WAYBILL_UI.REJECTED}: {waybill.error}
        </p>
      ) : null}
      {beforeHandover && waybill.cdekNumber ? (
        <div className="cdek-waybill-panel__form">
          <button
            type="button"
            className="cdek-waybill-panel__button cdek-waybill-panel__button--secondary"
            onClick={() => labelMutation.mutate(orderId)}
            disabled={labelMutation.isPending}
          >
            {labelMutation.isPending
              ? CDEK_WAYBILL_UI.LABEL_PENDING
              : CDEK_WAYBILL_UI.LABEL}
          </button>
          <p className="cdek-waybill-panel__hint">{CDEK_WAYBILL_UI.LABEL_HINT}</p>
          {labelMutation.isError ? (
            <p className="cdek-waybill-panel__error" role="alert">
              {labelMutation.error.message}
            </p>
          ) : null}
        </div>
      ) : null}
      {!pointToPoint && beforeHandover && waybill.cdekNumber ? (
        <CdekIntakeSection
          orderId={orderId}
          intake={waybill.intake}
          onBooked={onWaybillChange}
        />
      ) : null}
    </div>
  );
}

/**
 * Для тарифа «склад-склад» продавец сам везёт посылку в пункт — его и
 * выбираем. Для «дверь-склад» курьер СДЭК приедет по адресу товара.
 *
 * @param {{
 *   pointToPoint: boolean;
 *   isPending: boolean;
 *   onCreate: (shipmentPointCode: string | null) => void;
 * }} props
 */
function WaybillCreateForm({ pointToPoint, isPending, onCreate }) {
  const cityId = useId();
  const pointId = useId();
  const [city, setCity] = useState("");
  const [pointCode, setPointCode] = useState("");

  const pointsMutation = useMutation({
    mutationFn: fetchCdekReceptionPoints,
    onSuccess: () => setPointCode(""),
  });
  const points = pointsMutation.data ?? [];
  const canCreate = !isPending && (!pointToPoint || Boolean(pointCode));

  return (
    <div className="cdek-waybill-panel__form">
      {pointToPoint ? (
        <>
          <label className="cdek-waybill-panel__label" htmlFor={cityId}>
            {CDEK_WAYBILL_UI.RECEPTION_CITY_LABEL}
          </label>
          <div className="cdek-waybill-panel__row">
            <input
              id={cityId}
              className="cdek-waybill-panel__input"
              value={city}
              placeholder={CDEK_WAYBILL_UI.RECEPTION_CITY_PLACEHOLDER}
              onChange={(event) => setCity(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && city.trim().length >= 2) {
                  event.preventDefault();
                  pointsMutation.mutate(city.trim());
                }
              }}
            />
            <button
              type="button"
              className="cdek-waybill-panel__button cdek-waybill-panel__button--secondary"
              disabled={city.trim().length < 2 || pointsMutation.isPending}
              onClick={() => pointsMutation.mutate(city.trim())}
            >
              {pointsMutation.isPending
                ? CDEK_WAYBILL_UI.RECEPTION_SEARCH_PENDING
                : CDEK_WAYBILL_UI.RECEPTION_SEARCH}
            </button>
          </div>
          {pointsMutation.isError ? (
            <p className="cdek-waybill-panel__error" role="alert">
              {pointsMutation.error.message}
            </p>
          ) : null}
          {pointsMutation.isSuccess && points.length === 0 ? (
            <p className="cdek-waybill-panel__hint">
              {CDEK_WAYBILL_UI.RECEPTION_EMPTY}
            </p>
          ) : null}
          {points.length > 0 ? (
            <>
              <label className="cdek-waybill-panel__label" htmlFor={pointId}>
                {CDEK_WAYBILL_UI.RECEPTION_POINT_LABEL}
              </label>
              <select
                id={pointId}
                className="cdek-waybill-panel__input"
                value={pointCode}
                onChange={(event) => setPointCode(event.target.value)}
              >
                <option value="">{CDEK_WAYBILL_UI.RECEPTION_POINT_PLACEHOLDER}</option>
                {points.map((point) => (
                  <option key={point.code} value={point.code}>
                    {point.address || point.name}
                  </option>
                ))}
              </select>
            </>
          ) : null}
        </>
      ) : (
        <p className="cdek-waybill-panel__hint">{CDEK_WAYBILL_UI.DOOR_HINT}</p>
      )}

      <button
        type="button"
        className="cdek-waybill-panel__button"
        disabled={!canCreate}
        onClick={() => onCreate(pointToPoint ? pointCode : null)}
      >
        {isPending ? CDEK_WAYBILL_UI.CREATE_PENDING : CDEK_WAYBILL_UI.CREATE}
      </button>
    </div>
  );
}
