import { USER_SAVED_ADDRESSES_UI } from "../../../shared/config/appUiCopy.js";
import { CHECKOUT_SAVED_ADDRESS_CUSTOM_ID } from "../lib/deliveryAddressFromSaved.js";

import "./SavedAddressPicker.css";

/**
 * @param {{
 *   addresses: Array<{
 *     id: string;
 *     label?: string;
 *     line: string;
 *     flat?: string;
 *     isDefault?: boolean;
 *   }>;
 *   selectedId: string;
 *   onSelect: (id: string) => void;
 *   disabled?: boolean;
 *   minCount?: number;
 *   sectionLabel: string;
 *   otherLabel: string;
 *   layout?: "list" | "carousel";
 * }} props
 */
export function SavedAddressPicker({
  addresses,
  selectedId,
  onSelect,
  disabled = false,
  minCount = 1,
  sectionLabel,
  otherLabel,
  layout = "list",
}) {
  if (!Array.isArray(addresses) || addresses.length < minCount) {
    return null;
  }

  const isCarousel = layout === "carousel";
  const rootClassName = [
    "saved-address-picker",
    isCarousel ? "saved-address-picker--carousel" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const listClassName = [
    "saved-address-picker__list",
    isCarousel ? "saved-address-picker__list--carousel" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      {!isCarousel ? (
        <span className="saved-address-picker__label">{sectionLabel}</span>
      ) : null}
      <div className={listClassName} role="radiogroup">
        {addresses.map((item) => {
          const active = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              className={[
                "saved-address-picker__option",
                active ? "saved-address-picker__option_active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(item.id)}
            >
              {item.label ? (
                <span className="saved-address-picker__option-label">{item.label}</span>
              ) : null}
              <span className="saved-address-picker__option-line">
                {USER_SAVED_ADDRESSES_UI.FORMAT_LINE(item.line, item.flat ?? "")}
              </span>
              {item.isDefault ? (
                <span className="saved-address-picker__option-badge">
                  {USER_SAVED_ADDRESSES_UI.LABEL_DEFAULT}
                </span>
              ) : null}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={selectedId === CHECKOUT_SAVED_ADDRESS_CUSTOM_ID}
          disabled={disabled}
          className={[
            "saved-address-picker__option",
            selectedId === CHECKOUT_SAVED_ADDRESS_CUSTOM_ID
              ? "saved-address-picker__option_active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSelect(CHECKOUT_SAVED_ADDRESS_CUSTOM_ID)}
        >
          <span className="saved-address-picker__option-line">{otherLabel}</span>
        </button>
      </div>
    </div>
  );
}
