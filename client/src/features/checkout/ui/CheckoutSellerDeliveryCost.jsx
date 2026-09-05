import { formatPriceRub } from "@izibuy/shared-lib";
import {
  calculateSellerDeliveryFee,
  normalizeSellerDeliveryTariff,
  sellerDeliveryDistanceKm,
} from "@molha/api-contract";

import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

import "./CheckoutSellerDeliveryCost.css";

/**
 * Стоимость доставки по тарифу продавца — на оформлении, до нажатия кнопки.
 *
 * Считает та же функция контракта, что и сервер при создании заказа: разойдись
 * они — и это спор о деньгах, а не расхождение в вёрстке.
 *
 * @param {{
 *   tariff: unknown;
 *   origin?: { lat: number; lon: number } | null;
 *   deliveryGeo?: { lat: number; lon: number } | null;
 *   goodsTotalRub: number;
 * }} props
 */
export function CheckoutSellerDeliveryCost({
  tariff,
  origin = null,
  deliveryGeo = null,
  goodsTotalRub = 0,
}) {
  const normalized = normalizeSellerDeliveryTariff(tariff);
  if (!normalized.paid) {
    return null;
  }

  const distanceKm = sellerDeliveryDistanceKm(origin, deliveryGeo);
  const { feeRub, isFree, isEstimate } = calculateSellerDeliveryFee({
    tariff: normalized,
    goodsTotalRub,
    distanceKm,
  });

  const goods = Number(goodsTotalRub) || 0;

  return (
    <div className="checkout-seller-delivery">
      <div className="checkout-seller-delivery__row">
        <span className="checkout-seller-delivery__legend">
          {CHECKOUT_FORM_UI.SELLER_DELIVERY_LEGEND}
        </span>
        <span className="checkout-seller-delivery__value">
          {isFree
            ? CHECKOUT_FORM_UI.SELLER_DELIVERY_FREE
            : isEstimate
              ? CHECKOUT_FORM_UI.SELLER_DELIVERY_FROM(formatPriceRub(feeRub))
              : formatPriceRub(feeRub)}
        </span>
      </div>

      {isEstimate ? (
        <p className="checkout-seller-delivery__hint">
          {CHECKOUT_FORM_UI.SELLER_DELIVERY_NEED_ADDRESS}
        </p>
      ) : null}

      {!isFree && distanceKm != null ? (
        <p className="checkout-seller-delivery__hint">
          {CHECKOUT_FORM_UI.SELLER_DELIVERY_DISTANCE(
            Math.max(1, Math.ceil(distanceKm)),
          )}
        </p>
      ) : null}

      {!isFree && normalized.freeFromRub > 0 ? (
        <p className="checkout-seller-delivery__hint">
          {CHECKOUT_FORM_UI.SELLER_DELIVERY_FREE_FROM(
            formatPriceRub(normalized.freeFromRub),
          )}
        </p>
      ) : null}

      {goods > 0 ? (
        <dl className="checkout-seller-delivery__totals">
          <div className="checkout-seller-delivery__total-row">
            <dt>{CHECKOUT_FORM_UI.TOTAL_GOODS}</dt>
            <dd>{formatPriceRub(goods)}</dd>
          </div>
          <div className="checkout-seller-delivery__total-row">
            <dt>{CHECKOUT_FORM_UI.TOTAL_DELIVERY}</dt>
            <dd>
              {isFree ? CHECKOUT_FORM_UI.SELLER_DELIVERY_FREE : formatPriceRub(feeRub)}
            </dd>
          </div>
          <div className="checkout-seller-delivery__total-row checkout-seller-delivery__total-row--sum">
            <dt>{CHECKOUT_FORM_UI.TOTAL_TO_PAY}</dt>
            <dd>
              {formatPriceRub(goods + feeRub)}
              {/* «от» повторяем и в итоге: без адреса километраж ещё не в сумме,
                  и молчаливое «Итого» выглядело бы окончательным. */}
              {isEstimate ? " …" : ""}
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
