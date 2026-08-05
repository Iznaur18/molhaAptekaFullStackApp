import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { fetchAddressGeolocate } from "../api/fetchAddressGeolocate.js";
import {
  isAddressServiceUnavailable,
  resetAddressServiceUnavailable,
  subscribeAddressServiceAvailability,
} from "../api/addressServiceAvailability.js";
import { mapDadataSuggestion } from "../lib/mapDadataSuggestion.js";
import { resolveMapGeolocatePick } from "../lib/resolveMapGeolocatePick.js";
import {
  ADDRESS_LINE_MAX_LENGTH,
  ADDRESS_SUGGEST_DEBOUNCE_MS,
  ADDRESS_SUGGEST_MIN_QUERY_LENGTH,
} from "../model/constants.js";
import { useAddressSuggestionsQuery } from "../model/useAddressSuggestionsQuery.js";
import { MapPointPicker } from "../../maps/ui/MapPointPicker.jsx";
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

const MAP_GEOLOCATE_DEBOUNCE_MS = 350;

/**
 * @param {{
 *   value: import('../model/types.js').RuDeliveryAddressValue;
 *   onChange: (next: import('../model/types.js').RuDeliveryAddressValue) => void;
 *   disabled?: boolean;
 *   lineInputClassName?: string;
 *   labels?: { line?: string };
 *   showMap?: boolean;
 * }} props
 */
export function AddressDeliveryFields({
  value,
  onChange,
  disabled = false,
  lineInputClassName = "",
  labels = {},
  showMap = true,
}) {
  const listId = useId();
  const mapTitleId = useId();
  const wrapRef = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const geolocateSeqRef = useRef(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [serviceDown, setServiceDown] = useState(() => isAddressServiceUnavailable());
  const [mapStatus, setMapStatus] = useState(
    /** @type {'idle' | 'loading' | 'error'} */ ("idle"),
  );
  const [mapError, setMapError] = useState(/** @type {string | null} */ (null));

  const lineLabel = labels.line ?? ADDRESS_DELIVERY_UI.LABEL_LINE;
  const trimmedLine = value.line.trim();
  const suggestEnabled =
    trimmedLine.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH &&
    !value.selectedFromSuggest &&
    !serviceDown;

  useEffect(() => {
    return subscribeAddressServiceAvailability(() => {
      setServiceDown(isAddressServiceUnavailable());
    });
  }, []);

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
    if (!mapOpen) {
      return undefined;
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMapOpen(false);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mapOpen]);

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
    onChange({ ...EMPTY_VALUE, ...valueRef.current, ...patchValue, flat: "" });
  };

  const handleLineChange = (event) => {
    setMapError(null);
    setMapStatus("idle");
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
    setMapError(null);
    setMapStatus("idle");
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

  const handleMapPointChange = ({ lat, lon }) => {
    if (disabled) {
      return;
    }

    const seq = ++geolocateSeqRef.current;
    patch({
      geo: { lat, lon },
      selectedFromSuggest: false,
      fiasId: "",
      regionCode: null,
    });
    setMapStatus("loading");
    setMapError(null);

    window.setTimeout(() => {
      if (seq !== geolocateSeqRef.current) {
        return;
      }

      void fetchAddressGeolocate({ lat, lon })
        .then((list) => {
          if (seq !== geolocateSeqRef.current) {
            return;
          }
          const pick = resolveMapGeolocatePick(list);
          if (!pick) {
            setMapStatus("error");
            setMapError(ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_EMPTY);
            return;
          }
          const mapped = mapDadataSuggestion(pick.suggestion);
          setMapStatus(pick.isHouse ? "idle" : "error");
          setMapError(pick.isHouse ? null : ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_NO_HOUSE);
          patch({
            line: mapped.line,
            fiasId: mapped.fiasId,
            geo: mapped.geo ?? { lat, lon },
            regionCode: mapped.regionCode,
            selectedFromSuggest: pick.isHouse,
          });
          setDebouncedQuery(pick.isHouse ? "" : mapped.line);
        })
        .catch((error) => {
          if (seq !== geolocateSeqRef.current) {
            return;
          }
          setMapStatus("error");
          setMapError(
            error instanceof Error && error.message
              ? error.message
              : ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_ERROR,
          );
        });
    }, MAP_GEOLOCATE_DEBOUNCE_MS);
  };

  const handleClearLine = () => {
    if (disabled) {
      return;
    }
    setMapError(null);
    setMapStatus("idle");
    setDebouncedQuery("");
    patch({
      line: "",
      selectedFromSuggest: false,
      fiasId: "",
      geo: null,
      regionCode: null,
    });
  };

  const showList =
    !disabled &&
    suggestions.length > 0 &&
    !value.selectedFromSuggest &&
    value.line.trim().length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH;

  const mapLat = value.geo?.lat ?? null;
  const mapLon = value.geo?.lon ?? null;

  const mapFullscreen =
    mapOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="address-delivery-fields__map-fullscreen"
            role="dialog"
            aria-modal="true"
            aria-labelledby={mapTitleId}
          >
            <h2 id={mapTitleId} className="address-delivery-fields__map-fullscreen-sr-title">
              {ADDRESS_DELIVERY_UI.MAP_ARIA}
            </h2>
            <div className="address-delivery-fields__map-fullscreen-body">
              <MapPointPicker
                lat={mapLat}
                lon={mapLon}
                disabled={disabled}
                ariaLabel={ADDRESS_DELIVERY_UI.MAP_ARIA}
                className="map-point-picker--fullscreen"
                onPointChange={handleMapPointChange}
              />
            </div>
            <div className="address-delivery-fields__map-fullscreen-overlay">
              {mapStatus === "loading" ? (
                <p className="address-delivery-fields__hint" role="status">
                  {ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_LOADING}
                </p>
              ) : null}
              {mapError ? (
                <p
                  className="address-delivery-fields__hint address-delivery-fields__hint_error"
                  role="alert"
                >
                  {mapError}
                </p>
              ) : null}
              {value.line ? (
                <p className="address-delivery-fields__map-fullscreen-selected">{value.line}</p>
              ) : null}
              <button
                type="button"
                className="address-delivery-fields__map-fullscreen-done"
                onClick={() => setMapOpen(false)}
              >
                {ADDRESS_DELIVERY_UI.MAP_DONE}
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="address-delivery-fields">
      <label className="address-delivery-fields__line-wrap" ref={wrapRef}>
        <span className="address-delivery-fields__label">{lineLabel}</span>
        <div className="address-delivery-fields__input-row">
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
          {value.line && !disabled ? (
            <button
              type="button"
              className="address-delivery-fields__clear"
              aria-label={ADDRESS_DELIVERY_UI.CLEAR_LINE_ARIA}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClearLine}
            >
              <svg
                className="address-delivery-fields__clear-icon"
                viewBox="0 0 12 12"
                width="11"
                height="11"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M2.2 2.2l7.6 7.6M9.8 2.2L2.2 9.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
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

      {serviceDown ? (
        <div className="address-delivery-fields__service-banner" role="status">
          <p className="address-delivery-fields__service-banner-text">
            {ADDRESS_DELIVERY_UI.SERVICE_UNAVAILABLE}
          </p>
          <button
            type="button"
            className="address-delivery-fields__service-retry"
            disabled={disabled}
            onClick={() => {
              resetAddressServiceUnavailable();
              setServiceDown(false);
            }}
          >
            {ADDRESS_DELIVERY_UI.SERVICE_RETRY}
          </button>
        </div>
      ) : null}

      {showMap ? (
        <div className="address-delivery-fields__map">
          <p className="address-delivery-fields__hint">
            {ADDRESS_DELIVERY_UI.MAP_PICK_HINT}
          </p>
          <button
            type="button"
            className="address-delivery-fields__map-open"
            disabled={disabled}
            onClick={() => setMapOpen(true)}
          >
            {ADDRESS_DELIVERY_UI.MAP_OPEN}
          </button>
          {mapStatus === "loading" && !mapOpen ? (
            <p className="address-delivery-fields__hint" role="status">
              {ADDRESS_DELIVERY_UI.MAP_GEOLOCATE_LOADING}
            </p>
          ) : null}
          {mapError && !mapOpen ? (
            <p
              className="address-delivery-fields__hint address-delivery-fields__hint_error"
              role="alert"
            >
              {mapError}
            </p>
          ) : null}
        </div>
      ) : null}

      {mapFullscreen}
    </div>
  );
}
