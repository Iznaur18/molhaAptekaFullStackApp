import {
  ADDRESS_CITY_MAX_LENGTH,
  ADDRESS_DISTRICT_MAX_LENGTH,
  ADDRESS_FLAT_MAX_LENGTH,
  ADDRESS_HOUSE_MAX_LENGTH,
  ADDRESS_STREET_MAX_LENGTH,
} from "../model/constants.js";
import { ADDRESS_STRUCTURED_UI } from "../../../shared/config/appUiCopy.js";

import "./AddressStructuredFields.css";

const EMPTY_VALUE = {
  city: "",
  district: "",
  street: "",
  house: "",
  flat: "",
};

const FIELD_CONFIG = [
  {
    key: "city",
    label: ADDRESS_STRUCTURED_UI.LABEL_CITY,
    placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_CITY,
    maxLength: ADDRESS_CITY_MAX_LENGTH,
    required: true,
  },
  {
    key: "district",
    label: ADDRESS_STRUCTURED_UI.LABEL_DISTRICT,
    placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_DISTRICT,
    maxLength: ADDRESS_DISTRICT_MAX_LENGTH,
    required: false,
  },
  {
    key: "street",
    label: ADDRESS_STRUCTURED_UI.LABEL_STREET,
    placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_STREET,
    maxLength: ADDRESS_STREET_MAX_LENGTH,
    required: true,
  },
  {
    key: "house",
    label: ADDRESS_STRUCTURED_UI.LABEL_HOUSE,
    placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_HOUSE,
    maxLength: ADDRESS_HOUSE_MAX_LENGTH,
    required: true,
  },
  {
    key: "flat",
    label: ADDRESS_STRUCTURED_UI.LABEL_FLAT,
    placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_FLAT,
    maxLength: ADDRESS_FLAT_MAX_LENGTH,
    required: false,
  },
];

/**
 * @param {{
 *   value: import('../model/structuredTypes.js').RuStructuredDeliveryAddressValue;
 *   onChange: (next: import('../model/structuredTypes.js').RuStructuredDeliveryAddressValue) => void;
 *   disabled?: boolean;
 *   inputClassName?: string;
 * }} props
 */
export function AddressStructuredFields({
  value,
  onChange,
  disabled = false,
  inputClassName = "",
}) {
  const handleFieldChange = (fieldKey) => (event) => {
    onChange({
      ...EMPTY_VALUE,
      ...value,
      [fieldKey]: event.target.value,
    });
  };

  return (
    <fieldset className="address-structured-fields" disabled={disabled}>
      <legend className="address-structured-fields__legend">
        {ADDRESS_STRUCTURED_UI.FIELDSET_LEGEND}
      </legend>
      {FIELD_CONFIG.map((field) => (
        <label key={field.key} className="address-structured-fields__label">
          <span>
            {field.label}
            {field.required ? (
              <span className="address-structured-fields__required"> *</span>
            ) : null}
          </span>
          <input
            type="text"
            className={inputClassName}
            value={value[field.key] ?? ""}
            onChange={handleFieldChange(field.key)}
            disabled={disabled}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            autoComplete={
              field.key === "city"
                ? "address-level2"
                : field.key === "street"
                  ? "street-address"
                  : field.key === "flat"
                    ? "address-line2"
                    : "off"
            }
          />
        </label>
      ))}
    </fieldset>
  );
}
