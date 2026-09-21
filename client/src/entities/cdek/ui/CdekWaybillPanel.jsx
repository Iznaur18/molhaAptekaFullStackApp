import {
  CDEK_DELIVERY_MODE_POINT_TO_POINT,
  SHIPPING_PROVIDER_CDEK,
  buildShippingTrackingUrl,
} from "@molha/api-contract";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";

import { CDEK_WAYBILL_UI } from "../../../shared/config/appUiCopy.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  createCdekWaybill,
  fetchCdekReceptionPoints,
  refreshCdekWaybill,
} from "../api/cdekWaybillApi.js";

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
 * }} props
 */
export function CdekWaybillPanel({ orderId, shipment, onChanged }) {
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
  const refreshMutation = useMutation({
    mutationFn: refreshCdekWaybill,
    onSuccess: (next) => {
      setWaybill(next);
      onChanged?.();
    },
  });

  const error = createMutation.error ?? refreshMutation.error;

  return (
    <section className="cdek-waybill-panel" aria-label={CDEK_WAYBILL_UI.TITLE}>
      <h4 className="cdek-waybill-panel__title">{CDEK_WAYBILL_UI.TITLE}</h4>

      <dl className="cdek-waybill-panel__facts">
        {snapshot.pickupPoint?.address ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{CDEK_WAYBILL_UI.PICKUP_POINT}</dt>
            <dd>{snapshot.pickupPoint.address}</dd>
          </div>
        ) : null}
        {snapshot.deliverySumRub ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{CDEK_WAYBILL_UI.DELIVERY_PAID_BY_BUYER}</dt>
            <dd>{formatPriceRub(snapshot.deliverySumRub)}</dd>
          </div>
        ) : null}
      </dl>

      {waybill?.uuid ? (
        <WaybillState
          waybill={waybill}
          isRefreshing={refreshMutation.isPending}
          onRefresh={() => refreshMutation.mutate(orderId)}
        />
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
 *   waybill: Record<string, any>;
 *   isRefreshing: boolean;
 *   onRefresh: () => void;
 * }} props
 */
function WaybillState({ waybill, isRefreshing, onRefresh }) {
  const trackingUrl = waybill.cdekNumber
    ? buildShippingTrackingUrl(SHIPPING_PROVIDER_CDEK, waybill.cdekNumber)
    : null;

  return (
    <div className="cdek-waybill-panel__state">
      <dl className="cdek-waybill-panel__facts">
        <div className="cdek-waybill-panel__fact">
          <dt>{CDEK_WAYBILL_UI.NUMBER}</dt>
          <dd>
            {waybill.cdekNumber ? (
              <a
                href={trackingUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
              >
                {waybill.cdekNumber}
              </a>
            ) : (
              CDEK_WAYBILL_UI.NUMBER_PENDING
            )}
          </dd>
        </div>
        {waybill.status ? (
          <div className="cdek-waybill-panel__fact">
            <dt>{CDEK_WAYBILL_UI.STATUS}</dt>
            <dd>{waybill.status}</dd>
          </div>
        ) : null}
      </dl>
      {waybill.error ? (
        <p className="cdek-waybill-panel__error" role="alert">
          {CDEK_WAYBILL_UI.REJECTED}: {waybill.error}
        </p>
      ) : null}
      <button
        type="button"
        className="cdek-waybill-panel__button cdek-waybill-panel__button--secondary"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? CDEK_WAYBILL_UI.REFRESH_PENDING : CDEK_WAYBILL_UI.REFRESH}
      </button>
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
