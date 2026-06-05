import { useEffect, useId, useRef, useState } from "react";

import { fetchAddressSuggestions } from "../api/fetchAddressSuggestions.js";
import { mapDadataSuggestion } from "../lib/mapDadataSuggestion.js";
import {
  ADDRESS_FLAT_MAX_LENGTH,
  ADDRESS_LINE_MAX_LENGTH,
  ADDRESS_SUGGEST_DEBOUNCE_MS,
  ADDRESS_SUGGEST_MIN_QUERY_LENGTH,
} from "../model/constants.js";
import { ADDRESS_DELIVERY_UI } from "../../../shared/config/appUiCopy.js";

import "./AddressDeliveryFields.css";

const EMPTY_VALUE = {
  line: "",
  flat: "",
  fiasId: "",
  geo: null,
  selectedFromSuggest: false,
};

/**
 * @param {{
 *   value: import('../model/types.js').RuDeliveryAddressValue;
 *   onChange: (next: import('../model/types.js').RuDeliveryAddressValue) => void;
 *   disabled?: boolean;
 *   lineInputClassName?: string;
 *   flatInputClassName?: string;
 *   labels?: { line?: string; flat?: string };
 * }} props
 */
export function AddressDeliveryFields({
  value,
  onChange,
  disabled = false,
  lineInputClassName = "",
  flatInputClassName = "",
  labels = {},
}) {
  const listId = useId();
  const wrapRef = useRef(null);
  const [suggestions, setSuggestions] = useState(
    /** @type {import('../model/types.js').AddressSuggestionDto[]} */ ([]),
  );
  const [suggestPhase, setSuggestPhase] = useState("idle");
  const [suggestError, setSuggestError] = useState("");

  const lineLabel = labels.line ?? ADDRESS_DELIVERY_UI.LABEL_LINE;
  const flatLabel = labels.flat ?? ADDRESS_DELIVERY_UI.LABEL_FLAT;

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const query = value.line.trim();
    if (query.length < ADDRESS_SUGGEST_MIN_QUERY_LENGTH || value.selectedFromSuggest) {
      setSuggestions([]);
      setSuggestPhase("idle");
      return undefined;
    }

    let isCancelled = false;
    const timer = setTimeout(() => {
      setSuggestPhase("loading");
      setSuggestError("");
      void (async () => {
        try {
          const list = await fetchAddressSuggestions(query);
          if (isCancelled) return;
          setSuggestions(list);
          setSuggestPhase("success");
        } catch (e) {
          if (isCancelled) return;
          setSuggestions([]);
          setSuggestPhase("error");
          setSuggestError(
            e instanceof Error ? e.message : ADDRESS_DELIVERY_UI.SUGGEST_ERROR,
          );
        }
      })();
    }, ADDRESS_SUGGEST_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [value.line, value.selectedFromSuggest]);

  const patch = (patchValue) => {
    onChange({ ...EMPTY_VALUE, ...value, ...patchValue });
  };

  const handleLineChange = (event) => {
    patch({
      line: event.target.value,
      selectedFromSuggest: false,
      fiasId: "",
      geo: null,
    });
  };

  const handleFlatChange = (event) => {
    patch({ flat: event.target.value });
  };

  const handlePickSuggestion = (suggestion) => {
    const mapped = mapDadataSuggestion(suggestion);
    patch({
      line: mapped.line,
      fiasId: mapped.fiasId,
      geo: mapped.geo,
      selectedFromSuggest: true,
    });
    setSuggestions([]);
    setSuggestPhase("idle");
  };

  const showList =
    !disabled &&
    suggestions.length > 0 &&
    !value.selectedFromSuggest &&
    value.line.trim().length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH;

  return (
    <div className="address-delivery-fields">
      <label className="address-delivery-fields__line-wrap" ref={wrapRef}>
        <span>{lineLabel}</span>
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
        <span className="address-delivery-fields__hint">
          {suggestPhase === "loading"
            ? ADDRESS_DELIVERY_UI.SUGGEST_LOADING
            : ADDRESS_DELIVERY_UI.HINT_LINE}
        </span>
        {suggestError ? (
          <span className="address-delivery-fields__hint address-delivery-fields__hint_error">
            {suggestError}
          </span>
        ) : null}
      </label>

      <label className="address-delivery-fields__flat-row">
        <span>{flatLabel}</span>
        <input
          type="text"
          className={flatInputClassName}
          value={value.flat}
          onChange={handleFlatChange}
          disabled={disabled}
          maxLength={ADDRESS_FLAT_MAX_LENGTH}
          placeholder={ADDRESS_DELIVERY_UI.PLACEHOLDER_FLAT}
          autoComplete="off"
          inputMode="text"
          required={value.line.trim().length > 0}
        />
        <span className="address-delivery-fields__hint">
          {ADDRESS_DELIVERY_UI.HINT_FLAT}
        </span>
      </label>
    </div>
  );
}
