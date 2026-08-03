import { useEffect, useId, useRef, useState } from "react";

import { mapDadataSuggestion } from "../lib/mapDadataSuggestion.js";
import {
  ADDRESS_LINE_MAX_LENGTH,
  ADDRESS_SUGGEST_DEBOUNCE_MS,
  ADDRESS_SUGGEST_MIN_QUERY_LENGTH,
} from "../model/constants.js";
import { useAddressSuggestionsQuery } from "../model/useAddressSuggestionsQuery.js";
import { ADDRESS_DELIVERY_UI } from "../../../shared/config/appUiCopy.js";

import "./AddressDeliveryFields.css";

const EMPTY_VALUE = {
  line: "",
  flat: "",
  fiasId: "",
  geo: null,
  regionCode: null,
  selectedFromSuggest: false,
};

/**
 * @param {{
 *   value: import('../model/types.js').RuDeliveryAddressValue;
 *   onChange: (next: import('../model/types.js').RuDeliveryAddressValue) => void;
 *   disabled?: boolean;
 *   lineInputClassName?: string;
 *   labels?: { line?: string };
 * }} props
 */
export function AddressDeliveryFields({
  value,
  onChange,
  disabled = false,
  lineInputClassName = "",
  labels = {},
}) {
  const listId = useId();
  const wrapRef = useRef(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const lineLabel = labels.line ?? ADDRESS_DELIVERY_UI.LABEL_LINE;
  const trimmedLine = value.line.trim();
  const suggestEnabled =
    trimmedLine.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH &&
    !value.selectedFromSuggest;

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setDebouncedQuery("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!suggestEnabled) {
      setDebouncedQuery("");
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setDebouncedQuery(trimmedLine);
    }, ADDRESS_SUGGEST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [suggestEnabled, trimmedLine]);

  const suggestionsQuery = useAddressSuggestionsQuery({
    query: debouncedQuery,
    enabled: suggestEnabled && debouncedQuery.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH,
  });
  const suggestions = suggestEnabled ? (suggestionsQuery.data ?? []) : [];

  const patch = (patchValue) => {
    onChange({ ...EMPTY_VALUE, ...value, ...patchValue, flat: "" });
  };

  const handleLineChange = (event) => {
    patch({
      line: event.target.value,
      selectedFromSuggest: false,
      fiasId: "",
      geo: null,
      regionCode: null,
    });
  };

  const handlePickSuggestion = (suggestion) => {
    const mapped = mapDadataSuggestion(suggestion);
    const isHouse = mapped.fiasId.length > 0;
    patch({
      line: mapped.line,
      fiasId: mapped.fiasId,
      geo: mapped.geo,
      regionCode: mapped.regionCode,
      // Город/улица — уточнение запроса; финал только дом (house_fias_id).
      selectedFromSuggest: isHouse,
    });
    setDebouncedQuery(isHouse ? "" : mapped.line);
  };

  const showList =
    !disabled &&
    suggestions.length > 0 &&
    !value.selectedFromSuggest &&
    value.line.trim().length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH;

  return (
    <div className="address-delivery-fields">
      <label className="address-delivery-fields__line-wrap" ref={wrapRef}>
        <span className="address-delivery-fields__label">{lineLabel}</span>
        <input
          type="text"
          className={lineInputClassName}
          value={value.line}
          onChange={handleLineChange}
          disabled={disabled}
          maxLength={ADDRESS_LINE_MAX_LENGTH}
          placeholder={ADDRESS_DELIVERY_UI.PLACEHOLDER_LINE}
          autoComplete="off"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
        />
        {showList ? (
          <ul
            className="address-delivery-fields__suggestions"
            id={listId}
            role="listbox"
          >
            {suggestions.map((item) => (
              <li key={item.unrestrictedValue ?? item.value} role="option">
                <button
                  type="button"
                  className="address-delivery-fields__suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handlePickSuggestion(item)}
                >
                  {item.value}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </label>
    </div>
  );
}
