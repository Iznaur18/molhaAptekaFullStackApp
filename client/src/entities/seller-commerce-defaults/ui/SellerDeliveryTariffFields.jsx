import { SELLER_COMMERCE_DEFAULTS_UI } from "../../../shared/config/appUiCopy.js";
import {
  SELLER_DELIVERY_BASE_FEE_MAX_RUB,
  SELLER_DELIVERY_FREE_FROM_MAX_RUB,
  SELLER_DELIVERY_PER_KM_MAX_RUB,
} from "@molha/api-contract";

import "./SellerDeliveryTariffFields.css";

/** Пустое поле читаем как 0, а не как NaN: продавец стирает цифру, а не тариф. */
const toRub = (value) => {
  const parsed = Math.floor(Number(String(value ?? "").replace(/\s/g, "")));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

/** 0 в инпуте мешает набору («05») — показываем пусто, в модели всё равно 0. */
const rubInputValue = (value) => {
  const rub = Number(value) || 0;
  return rub > 0 ? rub : "";
};

/**
 * Тариф собственной доставки продавца.
 *
 * Показывается только при «Доставка продавцом»: у курьеров Gitorg сумму
 * называет покупатель, у внешней службы — сама служба, и поля тарифа там
 * были бы обещанием, которое площадка не выполнит.
 *
 * @param {{
 *   value: { paid: boolean; baseFeeRub: number; perKmRub: number; freeFromRub: number };
 *   onChange: (next: { paid: boolean; baseFeeRub: number; perKmRub: number; freeFromRub: number }) => void;
 *   disabled?: boolean;
 * }} props
 */
export function SellerDeliveryTariffFields({ value, onChange, disabled = false }) {
  const tariff = {
    paid: value?.paid === true,
    baseFeeRub: Number(value?.baseFeeRub) || 0,
    perKmRub: Number(value?.perKmRub) || 0,
    freeFromRub: Number(value?.freeFromRub) || 0,
  };

  const patch = (next) => onChange({ ...tariff, ...next });

  return (
    <div className="seller-delivery-tariff">
      <p className="seller-delivery-tariff__hint">
        {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_ONLY_OWN_HINT}
      </p>

      <div className="seller-delivery-tariff__modes" role="radiogroup">
        <button
          type="button"
          role="radio"
          aria-checked={!tariff.paid}
          disabled={disabled}
          className={`seller-delivery-tariff__mode${
            tariff.paid ? "" : " seller-delivery-tariff__mode--selected"
          }`}
          onClick={() => patch({ paid: false })}
        >
          {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_FREE}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={tariff.paid}
          disabled={disabled}
          className={`seller-delivery-tariff__mode${
            tariff.paid ? " seller-delivery-tariff__mode--selected" : ""
          }`}
          onClick={() => patch({ paid: true })}
        >
          {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_PAID}
        </button>
      </div>

      {tariff.paid ? (
        <div className="seller-delivery-tariff__grid">
          <label className="seller-delivery-tariff__field">
            <span className="seller-delivery-tariff__label">
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_BASE_FEE_LABEL}
            </span>
            <input
              className="seller-delivery-tariff__input"
              type="number"
              inputMode="numeric"
              min={0}
              max={SELLER_DELIVERY_BASE_FEE_MAX_RUB}
              step={1}
              value={rubInputValue(tariff.baseFeeRub)}
              disabled={disabled}
              onChange={(event) => patch({ baseFeeRub: toRub(event.target.value) })}
            />
            <span className="seller-delivery-tariff__field-hint">
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_BASE_FEE_HINT}
            </span>
          </label>

          <label className="seller-delivery-tariff__field">
            <span className="seller-delivery-tariff__label">
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_PER_KM_LABEL}
            </span>
            <input
              className="seller-delivery-tariff__input"
              type="number"
              inputMode="numeric"
              min={0}
              max={SELLER_DELIVERY_PER_KM_MAX_RUB}
              step={1}
              value={rubInputValue(tariff.perKmRub)}
              disabled={disabled}
              onChange={(event) => patch({ perKmRub: toRub(event.target.value) })}
            />
            <span className="seller-delivery-tariff__field-hint">
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_PER_KM_HINT}
            </span>
          </label>

          <label className="seller-delivery-tariff__field">
            <span className="seller-delivery-tariff__label">
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_FREE_FROM_LABEL}
            </span>
            <input
              className="seller-delivery-tariff__input"
              type="number"
              inputMode="numeric"
              min={0}
              max={SELLER_DELIVERY_FREE_FROM_MAX_RUB}
              step={1}
              value={rubInputValue(tariff.freeFromRub)}
              disabled={disabled}
              onChange={(event) => patch({ freeFromRub: toRub(event.target.value) })}
            />
            <span className="seller-delivery-tariff__field-hint">
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_FREE_FROM_HINT}
            </span>
          </label>
        </div>
      ) : null}
    </div>
  );
}
