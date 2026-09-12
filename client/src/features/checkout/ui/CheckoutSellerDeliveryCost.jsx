import { formatPriceRub } from "@izibuy/shared-lib";
import {
  SELLER_DELIVERY_DISTANCE_SOURCE_ESTIMATE,
  normalizeSellerDeliveryTariff,
} from "@molha/api-contract";

import { quoteCartSellerDelivery } from "../../../entities/cart/lib/quoteCartSellerDelivery.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

import "./CheckoutSellerDeliveryCost.css";

/**
 * Стоимость доставки по тарифу продавца — в dock корзины / оформлении.
 *
 * Расстояние по дорогам приходит котировкой с сервера, сумму собирает та же
 * функция контракта, что и сервер при создании заказа.
 *
 * @param {{
 *   tariff: unknown;
 *   goodsTotalRub: number;
 *   distance?: {
 *     distanceKm: number | null;
 *     distanceSource: string | null;
 *     isLoading: boolean;
 *     errorMessage: string;
 *   } | null;
 * }} props
 */
export function CheckoutSellerDeliveryCost({
  tariff,
  goodsTotalRub = 0,
  distance = null,
}) {
  const normalized = normalizeSellerDeliveryTariff(tariff);
  const distanceKm = distance?.distanceKm ?? null;
  const quote = quoteCartSellerDelivery({ tariff, distanceKm, goodsTotalRub });

  if (!quote) {
    return null;
  }

  const { feeRub, isFree, isEstimate, goodsTotalRub: goods, payableRub } = quote;
  // Расстояние влияет на сумму, только когда продавец берёт за километр.
  const needsDistance = normalized.perKmRub > 0;
  const isCalculating = needsDistance && isEstimate && distance?.isLoading === true;
  const errorMessage =
    needsDistance && isEstimate ? String(distance?.errorMessage ?? "") : "";
  const billableKm = distanceKm == null ? null : Math.ceil(distanceKm);

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

      {isCalculating ? (
        <p className="checkout-seller-delivery__hint" role="status">
          {CHECKOUT_FORM_UI.SELLER_DELIVERY_CALCULATING}
        </p>
      ) : null}

      {errorMessage ? (
        <p
          className="checkout-seller-delivery__hint checkout-seller-delivery__hint--error"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      {isEstimate && !isCalculating && !errorMessage ? (
        <p className="checkout-seller-delivery__hint">
          {CHECKOUT_FORM_UI.SELLER_DELIVERY_NEED_ADDRESS}
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
          {!isFree && billableKm != null ? (
            <div className="checkout-seller-delivery__hint checkout-seller-delivery__hint--under-delivery">
              {distance?.distanceSource === SELLER_DELIVERY_DISTANCE_SOURCE_ESTIMATE
                ? CHECKOUT_FORM_UI.SELLER_DELIVERY_DISTANCE_ESTIMATE(billableKm)
                : CHECKOUT_FORM_UI.SELLER_DELIVERY_DISTANCE(billableKm)}
            </div>
          ) : null}
          <div className="checkout-seller-delivery__total-row checkout-seller-delivery__total-row--sum">
            <dt>{CHECKOUT_FORM_UI.TOTAL_TO_PAY}</dt>
            <dd>
              {formatPriceRub(payableRub)}
              {isEstimate ? " …" : ""}
            </dd>
          </div>
        </dl>
      ) : null}

      {!isFree && billableKm != null ? (
        <p className="checkout-seller-delivery__attribution">
          {CHECKOUT_FORM_UI.SELLER_DELIVERY_MAP_ATTRIBUTION}
        </p>
      ) : null}
    </div>
  );
}
