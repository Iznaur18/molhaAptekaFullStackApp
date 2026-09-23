import { formatPriceRub } from "@izibuy/shared-lib";

import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

// Оформление общее с доставкой продавца: обе суммы стоят в одном месте.
import "./CheckoutSellerDeliveryCost.css";

/**
 * Доставка внешней службой в итоге корзины: сколько берёт служба и сколько
 * выйдет вместе с товарами.
 *
 * Цену называет сама служба: ЛОБО считает по адресу, СДЭК и Яндекс — по
 * выбранному пункту. У ЛОБО она примерная, точную назовёт курьер.
 *
 * @param {{
 *   cost: { feeRub: number; label: string; approximate: boolean } | null;
 *   goodsTotalRub: number;
 * }} props
 */
export function CheckoutCarrierDeliveryCost({ cost, goodsTotalRub = 0 }) {
  const feeRub = Number(cost?.feeRub) || 0;
  if (!cost || feeRub <= 0) {
    return null;
  }

  const goods = Number(goodsTotalRub) || 0;
  const approx = cost.approximate === true;

  return (
    <div className="checkout-seller-delivery">
      <div className="checkout-seller-delivery__row">
        <span className="checkout-seller-delivery__legend">{cost.label}</span>
        <span className="checkout-seller-delivery__value">
          {approx
            ? CHECKOUT_FORM_UI.CARRIER_DELIVERY_APPROX(formatPriceRub(feeRub))
            : formatPriceRub(feeRub)}
        </span>
      </div>

      <dl className="checkout-seller-delivery__totals">
        <div className="checkout-seller-delivery__total-row">
          <dt>{CHECKOUT_FORM_UI.TOTAL_GOODS}</dt>
          <dd>{formatPriceRub(goods)}</dd>
        </div>
        <div className="checkout-seller-delivery__total-row">
          <dt>{CHECKOUT_FORM_UI.TOTAL_DELIVERY}</dt>
          <dd>
            {approx
              ? CHECKOUT_FORM_UI.CARRIER_DELIVERY_APPROX(formatPriceRub(feeRub))
              : formatPriceRub(feeRub)}
          </dd>
        </div>
        <div className="checkout-seller-delivery__total-row checkout-seller-delivery__total-row--sum">
          <dt>{CHECKOUT_FORM_UI.TOTAL_TO_PAY}</dt>
          <dd>
            {approx
              ? CHECKOUT_FORM_UI.CARRIER_DELIVERY_APPROX(formatPriceRub(goods + feeRub))
              : formatPriceRub(goods + feeRub)}
          </dd>
        </div>
      </dl>

      <p className="checkout-seller-delivery__hint">
        {CHECKOUT_FORM_UI.CARRIER_DELIVERY_SPLIT_HINT(cost.label)}
      </p>
    </div>
  );
}
