import {
  CATEGORY_DEAL_TYPE_SERVICE,
  PRODUCT_SERVICE_LOCATION_LABELS_RU,
  PRODUCT_SERVICE_LOCATIONS,
  PRODUCT_SERVICE_PRICE_MODE_LABELS_RU,
  PRODUCT_SERVICE_PRICE_MODE_NEGOTIABLE,
  PRODUCT_SERVICE_PRICE_MODES,
  PRODUCT_SERVICE_PRICE_UNIT_LABELS_RU,
  PRODUCT_SERVICE_PRICE_UNITS,
  normalizeProductServiceLocations,
  normalizeProductServicePriceMode,
  normalizeProductServicePriceUnit,
} from "@molha/api-contract";

import { PRODUCT_DEAL_TERMS_UI } from "../../../../shared/config/appUiCopy.js";

import "./CreateProductDealTermsFields.css";

/**
 * Условия услуги на шаге «Цена»: вид цены и место. У осмотра условий нет.
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
    <section
      className="create-product-deal-terms"
      aria-label={PRODUCT_DEAL_TERMS_UI.SECTION_TITLE[dealType]}
    >
      <p className="create-product-deal-terms__title">
        {PRODUCT_DEAL_TERMS_UI.SECTION_TITLE[dealType]}
      </p>
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
    </section>
  );
}
