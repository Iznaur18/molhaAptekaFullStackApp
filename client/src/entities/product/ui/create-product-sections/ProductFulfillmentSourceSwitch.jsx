import {
  PRODUCT_DELIVERY_CARRIER_LABEL_RU,
  PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
  PRODUCT_FULFILLMENT_SOURCE_PROFILE,
} from "@molha/api-contract";

import { HOME_MAIN_VIEW_PATH } from "../../../../shared/lib/homeMainViewPaths.js";
import { PRODUCT_FULFILLMENT_SOURCE_UI } from "../../../../shared/config/appUiCopy.js";

import "./ProductFulfillmentSourceSwitch.css";

/**
 * Выбор: товар следует настройкам профиля или живёт своими.
 *
 * Смысл всей конструкции в том, что первый вариант — обычный: продавцу с
 * тысячей карточек переезд не должен стоить тысячи правок. Поэтому «как в
 * профиле» стоит первым и выбрано по умолчанию, когда настройки заведены.
 *
 * @param {{
 *   value: string;
 *   onChange: (next: string) => void;
 *   disabled?: boolean;
 *   defaults?: import("../../../seller-commerce-defaults/model/types.js").SellerCommerceDefaults | null;
 * }} props
 */
export function ProductFulfillmentSourceSwitch({
  value,
  onChange,
  disabled = false,
  defaults = null,
}) {
  const configured = defaults?.fulfillmentConfigured === true;
  const isProfile = value === PRODUCT_FULFILLMENT_SOURCE_PROFILE;

  return (
    <div className="product-fulfillment-source">
      <div className="product-fulfillment-source__legend">
        {PRODUCT_FULFILLMENT_SOURCE_UI.LEGEND}
      </div>

      <div className="product-fulfillment-source__options" role="radiogroup">
        <button
          type="button"
          role="radio"
          aria-checked={isProfile}
          // Без настроек в профиле наследовать нечего: кнопка осталась бы
          // выбором, который сразу же отклонит сервер.
          disabled={disabled || !configured}
          className={`product-fulfillment-source__option${
            isProfile ? " product-fulfillment-source__option--selected" : ""
          }`}
          onClick={() => onChange(PRODUCT_FULFILLMENT_SOURCE_PROFILE)}
        >
          {PRODUCT_FULFILLMENT_SOURCE_UI.OPTION_PROFILE}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!isProfile}
          disabled={disabled}
          className={`product-fulfillment-source__option${
            !isProfile ? " product-fulfillment-source__option--selected" : ""
          }`}
          onClick={() => onChange(PRODUCT_FULFILLMENT_SOURCE_CUSTOM)}
        >
          {PRODUCT_FULFILLMENT_SOURCE_UI.OPTION_CUSTOM}
        </button>
      </div>

      {!configured ? (
        <p className="product-fulfillment-source__hint">
          {PRODUCT_FULFILLMENT_SOURCE_UI.PROFILE_MISSING}{" "}
          <a
            className="product-fulfillment-source__link"
            href={HOME_MAIN_VIEW_PATH["delivery-payment"]}
          >
            {PRODUCT_FULFILLMENT_SOURCE_UI.PROFILE_LINK}
          </a>
        </p>
      ) : (
        <p className="product-fulfillment-source__hint">
          {isProfile
            ? PRODUCT_FULFILLMENT_SOURCE_UI.PROFILE_HINT
            : PRODUCT_FULFILLMENT_SOURCE_UI.CUSTOM_HINT}
        </p>
      )}

      {isProfile && configured ? (
        <ul className="product-fulfillment-source__summary">
          {defaults.pickupLocations.map((point) => (
            <li key={point.id}>{point.address}</li>
          ))}
          <li className="product-fulfillment-source__summary-meta">
            {defaults.pickupEnabled
              ? PRODUCT_FULFILLMENT_SOURCE_UI.SUMMARY_PICKUP_ON
              : PRODUCT_FULFILLMENT_SOURCE_UI.SUMMARY_PICKUP_OFF}
            {" · "}
            {defaults.deliveryCarrier
              ? (PRODUCT_DELIVERY_CARRIER_LABEL_RU[defaults.deliveryCarrier] ??
                defaults.deliveryCarrier)
              : PRODUCT_FULFILLMENT_SOURCE_UI.SUMMARY_NO_DELIVERY}
          </li>
        </ul>
      ) : null}
    </div>
  );
}
