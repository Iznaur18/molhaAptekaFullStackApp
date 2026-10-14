import {
  CATEGORY_DEAL_TYPE_SERVICE,
  CATEGORY_DEAL_TYPE_VIEWING,
  PRODUCT_SERVICE_LOCATION_LABELS_RU,
  PRODUCT_SERVICE_LOCATIONS,
  PRODUCT_SERVICE_PRICE_MODE_LABELS_RU,
  PRODUCT_SERVICE_PRICE_MODE_NEGOTIABLE,
  PRODUCT_SERVICE_PRICE_MODES,
  PRODUCT_SERVICE_PRICE_UNIT_LABELS_RU,
  PRODUCT_SERVICE_PRICE_UNITS,
  PRODUCT_VIEWING_SCHEDULE_MAX_LENGTH,
  normalizeProductServiceLocations,
  normalizeProductServicePriceMode,
  normalizeProductServicePriceUnit,
} from "@molha/api-contract";

import { PRODUCT_DEAL_TERMS_UI } from "../../../../shared/config/appUiCopy.js";

import "./CreateProductDealTermsFields.css";

/**
 * Условия сделки в объявлении без корзины: у услуги — вид цены и место, у
 * осмотра — когда можно приехать.
 *
 * @param {{
 *   dealType: "goods" | "viewing" | "service";
 *   form: Record<string, unknown>;
 *   setForm: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
 *   disabled?: boolean;
 * }} props
 */
export function CreateProductDealTermsFields({
  dealType,
  form,
  setForm,
  disabled = false,
}) {
  /** @param {Record<string, unknown>} patch */
  const patchForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  if (dealType === CATEGORY_DEAL_TYPE_VIEWING) {
    return (
      <div className="create-product-deal-terms">
        <label className="create-product-deal-terms__field">
          <span>{PRODUCT_DEAL_TERMS_UI.SCHEDULE_LABEL}</span>
          <input
            type="text"
            value={String(form.productViewingSchedule ?? "")}
            maxLength={PRODUCT_VIEWING_SCHEDULE_MAX_LENGTH}
            placeholder={PRODUCT_DEAL_TERMS_UI.SCHEDULE_PLACEHOLDER}
            disabled={disabled}
            onChange={(event) =>
              patchForm({ productViewingSchedule: event.target.value })
            }
          />
        </label>
      </div>
    );
  }

  if (dealType !== CATEGORY_DEAL_TYPE_SERVICE) {
    return null;
  }

  const priceMode = normalizeProductServicePriceMode(form.productServicePriceMode);
  const priceUnit = normalizeProductServicePriceUnit(form.productServicePriceUnit);
  const locations = normalizeProductServiceLocations(form.productServiceLocations);

  /** @param {string} location */
  const toggleLocation = (location) => {
    const next = locations.includes(location)
      ? locations.filter((value) => value !== location)
      : [...locations, location];
    patchForm({ productServiceLocations: normalizeProductServiceLocations(next) });
  };

  return (
    <div className="create-product-deal-terms">
      <label className="create-product-deal-terms__field">
        <span>{PRODUCT_DEAL_TERMS_UI.PRICE_MODE_LABEL}</span>
        <select
          value={priceMode}
          disabled={disabled}
          onChange={(event) =>
            patchForm({ productServicePriceMode: event.target.value })
          }
        >
          {PRODUCT_SERVICE_PRICE_MODES.map((value) => (
            <option key={value} value={value}>
              {PRODUCT_SERVICE_PRICE_MODE_LABELS_RU[value]}
            </option>
          ))}
        </select>
      </label>
      {priceMode === PRODUCT_SERVICE_PRICE_MODE_NEGOTIABLE ? (
        <p className="create-product-section__lead">
          {PRODUCT_DEAL_TERMS_UI.PRICE_NEGOTIABLE_HINT}
        </p>
      ) : (
        <label className="create-product-deal-terms__field">
          <span>{PRODUCT_DEAL_TERMS_UI.PRICE_UNIT_LABEL}</span>
          <select
            value={priceUnit}
            disabled={disabled}
            onChange={(event) =>
              patchForm({ productServicePriceUnit: event.target.value })
            }
          >
            {PRODUCT_SERVICE_PRICE_UNITS.map((value) => (
              <option key={value} value={value}>
                {PRODUCT_SERVICE_PRICE_UNIT_LABELS_RU[value]}
              </option>
            ))}
          </select>
        </label>
      )}

      <fieldset className="create-product-deal-terms__group" disabled={disabled}>
        <legend>{PRODUCT_DEAL_TERMS_UI.LOCATIONS_LABEL}</legend>
        {PRODUCT_SERVICE_LOCATIONS.map((value) => (
          <label key={value} className="create-product-deal-terms__check">
            <input
              type="checkbox"
              checked={locations.includes(value)}
              onChange={() => toggleLocation(value)}
            />
            <span>{PRODUCT_SERVICE_LOCATION_LABELS_RU[value]}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
