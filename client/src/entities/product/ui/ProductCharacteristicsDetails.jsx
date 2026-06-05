import { PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductCharacteristicsDetails.css";

/**
 * @param {{
 *   items?: import('../model/types.js').ProductCharacteristic[];
 * }} props
 */
export function ProductCharacteristicsDetails({ items }) {
  const rows = Array.isArray(items)
    ? items.filter((item) => item?.key?.trim() && item?.value?.trim())
    : [];

  if (rows.length === 0) {
    return null;
  }

  return (
    <section
      className="product-characteristics-details"
      aria-label={PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_SECTION_ARIA}
    >
      <h3 className="product-characteristics-details__title">
        {PRODUCT_DETAILS_MODAL_UI.CHARACTERISTICS_TITLE}
      </h3>
      <dl className="product-characteristics-details__list">
        {rows.map((item) => (
          <div key={item.key} className="product-characteristics-details__row">
            <dt className="product-characteristics-details__key">{item.key}</dt>
            <dd className="product-characteristics-details__value">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
