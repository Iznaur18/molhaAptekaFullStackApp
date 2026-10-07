import { useEffect, useState } from "react";

import { PRODUCT_DELIVERY_CARRIER_LABEL_RU } from "@molha/api-contract";

import { fetchShippingEstimate } from "../../../entities/cart/api/shippingEstimate.js";
import { CHECKOUT_FORM_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Примерная стоимость доставки внешней службой.
 *
 * Показываем до оформления: платит покупатель курьеру при получении, и
 * узнавать сумму у двери — плохой сюрприз. Точную цифру всё равно называет
 * курьер, поэтому и пишем «примерно».
 *
 * @param {{
 *   productIds: string[];
 *   deliveryGeo: { lat: number; lon: number } | null;
 *   deliveryAddressLine?: string;
 *   onCost?: (cost: { feeRub: number; label: string; approximate: boolean } | null) => void;
 *   onBlock?: (message: string) => void;
 * }} props
 */
export function CheckoutShippingEstimate({
  productIds,
  deliveryGeo,
  deliveryAddressLine = "",
  onCost,
  onBlock,
}) {
  const [state, setState] = useState(/** @type {any} */ (null));

  const lat = Number(deliveryGeo?.lat);
  const lon = Number(deliveryGeo?.lon);
  const key = productIds.join(",");

  useEffect(() => {
    if (!key || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      setState(null);
      return undefined;
    }

    let cancelled = false;
    void (async () => {
      try {
        const result = await fetchShippingEstimate({
          productIds: key.split(","),
          deliveryLat: lat,
          deliveryLon: lon,
          deliveryAddress: deliveryAddressLine,
        });
        if (!cancelled) setState(result);
      } catch {
        // Неудачный расчёт не мешает оформить заказ: сумму назовёт курьер.
        if (!cancelled) setState({ available: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, lat, lon, deliveryAddressLine]);

  // Цену службы показывает и итог корзины: покупатель должен видеть, во
  // сколько обойдётся заказ вместе с доставкой.
  useEffect(() => {
    if (!onCost) return undefined;
    onCost(
      state?.available
        ? {
            feeRub: Number(state.finalCost) || 0,
            label:
              PRODUCT_DELIVERY_CARRIER_LABEL_RU[state.carrier] ?? String(state.carrier),
            approximate: state.approximate === true,
          }
        : null,
    );
    return () => onCost(null);
  }, [state, onCost]);

  // Служба не возит по этому адресу — форма не должна дать оформить заказ.
  const blockMessage =
    state && !state.available && state.blocking === true
      ? String(state.message ?? "") || CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_OUT_OF_ZONE
      : "";
  useEffect(() => {
    if (!onBlock) return undefined;
    onBlock(blockMessage);
    return () => onBlock("");
  }, [blockMessage, onBlock]);

  if (!state) return null;
  // Товар везёт продавец или курьеры Gitorg — считать нечего.
  if (!state.available && state.reason === "not_external") return null;

  if (blockMessage) {
    return (
      <p className="checkout-form__error" role="alert">
        <span className="checkout-form__error-text">{blockMessage}</span>
      </p>
    );
  }

  if (!state.available) {
    return (
      <p className="checkout-form__hint">
        {CHECKOUT_FORM_UI.SHIPPING_ESTIMATE_UNAVAILABLE}
      </p>
    );
  }

  // Посчитали — сумма уже в итоге корзины («Доставка» / «Итого»), отдельной
  // строки под адресом не нужно.
  return null;
}
