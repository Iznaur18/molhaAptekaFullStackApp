import { Navigation } from "lucide-react";
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
import {
  formatGeolocationLowAccuracyMessage,
  isGeolocationAccuracyLow,
} from "../../maps/lib/geolocationAccuracy.js";
import { requestBrowserGeolocation } from "../../maps/lib/requestBrowserGeolocation.js";
import { ADDRESS_DELIVERY_UI } from "../../../shared/config/appUiCopy.js";
import { FormFieldLabel } from "../../../shared/ui/FormFieldLabel/FormFieldLabel.jsx";
import { AppIcon } from "../../../shared/ui/icon/index.js";

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
 *   displayOnly?: boolean;
 *   lineInputClassName?: string;
 *   labels?: { line?: string };
 *   showMap?: boolean;
 *   hideMapOpenButton?: boolean;
 *   lineOpensMap?: boolean;
 *   mapOpen?: boolean;
 *   onMapOpenChange?: (open: boolean) => void;
 *   rootId?: string;
 * }} props
 */
export function AddressDeliveryFields({
  value,
  onChange,
  disabled = false,
  displayOnly = false,
  lineInputClassName = "",
  labels = {},
  showMap = true,
  hideMapOpenButton = false,
  lineOpensMap = false,
  mapOpen: mapOpenProp,
  onMapOpenChange,
  rootId = "edit-profile-address",
}) {
  const listId = useId();
  const mapTitleId = useId();
  const wrapRef = useRef(null);
  const mapInputRef = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const geolocateSeqRef = useRef(0);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [internalMapOpen, setInternalMapOpen] = useState(false);
  const mapOpen = mapOpenProp ?? internalMapOpen;
  const setMapOpen = (next) => {
    if (onMapOpenChange) {
      onMapOpenChange(next);
      return;
    }
    setInternalMapOpen(next);
  };
  const [mapSuggestPanelOpen, setMapSuggestPanelOpen] = useState(true);
  const [serviceDown, setServiceDown] = useState(() => isAddressServiceUnavailable());
  const [mapStatus, setMapStatus] = useState(
    /** @type {'idle' | 'loading' | 'error'} */ ("idle"),
  );
  const [mapError, setMapError] = useState(/** @type {string | null} */ (null));
  const [myLocationStatus, setMyLocationStatus] = useState(
    /** @type {'idle' | 'loading'} */ ("idle"),
  );
  const [myLocationError, setMyLocationError] = useState(/** @type {string | null} */ (null));

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
    if (mapOpen) {
      return undefined;
    }
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setDebouncedQuery("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [mapOpen]);

  useEffect(() => {
    if (!mapOpen) {
      return undefined;
    }
    setMapSuggestPanelOpen(true);
    setMyLocationError(null);
    setMyLocationStatus("idle");
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMapOpen(false);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => {
      mapInputRef.current?.focus({ preventScroll: true });
    }, 40);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
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
  const isSuggestFetching = suggestionsQuery.fetchStatus === "fetching";
  const showMapSuggestEmpty =
    mapOpen &&
    !serviceDown &&
    debouncedQuery.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH &&
    !isSuggestFetching &&
    !suggestionsQuery.isError &&
    suggestions.length === 0;

  const patch = (patchValue) => {
    onChange({ ...EMPTY_VALUE, ...valueRef.current, ...patchValue, flat: "" });
  };

  const handleLineChange = (event) => {
    if (mapOpen) {
      setMapSuggestPanelOpen(true);
    }
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
    if (mapOpen) {
      setMapSuggestPanelOpen(!isHouse);
    }
  };

  const handleMapPointChange = ({ lat, lon }) => {
    if (disabled) {
      return;
    }

    setMapSuggestPanelOpen(false);
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
            // Keep the user-chosen pin; DaData house centroid often differs.
            geo: { lat, lon },
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

  const handleMyLocationClick = () => {
    if (disabled || myLocationStatus === "loading") {
      return;
    }

    setMyLocationError(null);
    setMyLocationStatus("loading");

    void requestBrowserGeolocation()
      .then(({ lat, lon, accuracyMeters }) => {
        if (isGeolocationAccuracyLow(accuracyMeters)) {
          setMyLocationError(
            formatGeolocationLowAccuracyMessage(
              accuracyMeters,
              ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_LOW_ACCURACY,
            ),
          );
          setMapStatus("idle");
          setMapError(null);
          setDebouncedQuery("");
          patch({
            line: "",
            geo: { lat, lon },
            selectedFromSuggest: false,
            fiasId: "",
            regionCode: null,
          });
          return;
        }

        handleMapPointChange({ lat, lon });
      })
      .catch((error) => {
        setMyLocationError(
          error instanceof Error && error.message
            ? error.message
            : ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_ERROR,
        );
      })
      .finally(() => {
        setMyLocationStatus("idle");
      });
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
    !displayOnly &&
    suggestions.length > 0 &&
    !value.selectedFromSuggest &&
    value.line.trim().length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH;

  const showMapSearchList =
    mapOpen &&
    mapSuggestPanelOpen &&
    !disabled &&
    suggestions.length > 0 &&
    !value.selectedFromSuggest &&
    value.line.trim().length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH;

  const showMapSuggestPanelNotes =
    mapOpen && mapSuggestPanelOpen && debouncedQuery.length >= ADDRESS_SUGGEST_MIN_QUERY_LENGTH;

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
              <div className="address-delivery-fields__map-fullscreen-top">
                <div
                  className="address-delivery-fields__map-fullscreen-search"
                  onClick={() => {
                    setMapSuggestPanelOpen(true);
                    mapInputRef.current?.focus({ preventScroll: true });
                  }}
                >
                  <input
                    ref={mapInputRef}
                    type="search"
                    className="address-delivery-fields__map-fullscreen-input"
                    value={value.line}
                    onChange={handleLineChange}
                    onFocus={() => setMapSuggestPanelOpen(true)}
                    disabled={disabled}
                    maxLength={ADDRESS_LINE_MAX_LENGTH}
                    placeholder={ADDRESS_DELIVERY_UI.PLACEHOLDER_LINE}
                    autoComplete="off"
                    enterKeyHint="search"
                    aria-label={lineLabel}
                    aria-expanded={showMapSearchList}
                    aria-controls={`${listId}-map`}
                  />
                </div>
                {showMapSearchList ? (
                  <ul
                    className="address-delivery-fields__map-fullscreen-suggestions"
                    id={`${listId}-map`}
                    role="listbox"
                  >
                    {suggestions.map((item) => (
                      <li key={item.unrestrictedValue ?? item.value} role="option">
                        <button
                          type="button"
                          className="address-delivery-fields__map-fullscreen-suggestion"
                          onClick={() => handlePickSuggestion(item)}
                        >
                          {item.value}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {showMapSuggestPanelNotes && isSuggestFetching ? (
                  <p className="address-delivery-fields__map-fullscreen-note" role="status">
                    {ADDRESS_DELIVERY_UI.SUGGEST_LOADING}
                  </p>
                ) : null}
                {showMapSuggestPanelNotes && suggestionsQuery.isError ? (
                  <p
                    className="address-delivery-fields__map-fullscreen-note address-delivery-fields__hint_error"
                    role="alert"
                  >
                    {ADDRESS_DELIVERY_UI.SUGGEST_ERROR}
                  </p>
                ) : null}
                {showMapSuggestPanelNotes && showMapSuggestEmpty ? (
                  <p className="address-delivery-fields__map-fullscreen-note">
                    {ADDRESS_DELIVERY_UI.SUGGEST_EMPTY}
                  </p>
                ) : null}
              </div>
              <div className="address-delivery-fields__map-fullscreen-bottom">
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
                <button
                  type="button"
                  className="address-delivery-fields__map-fullscreen-my-location"
                  disabled={disabled || myLocationStatus === "loading" || mapStatus === "loading"}
                  onClick={handleMyLocationClick}
                  aria-label={ADDRESS_DELIVERY_UI.MAP_MY_LOCATION}
                  title={ADDRESS_DELIVERY_UI.MAP_MY_LOCATION}
                  aria-busy={myLocationStatus === "loading" || undefined}
                >
                  <AppIcon icon={Navigation} size="md" strokeWidth={2.25} />
                </button>
                {myLocationError ? (
                  <p
                    className="address-delivery-fields__map-fullscreen-location-error"
                    role="alert"
                  >
                    {myLocationError}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="address-delivery-fields__map-fullscreen-done"
                  onClick={() => setMapOpen(false)}
                >
                  {ADDRESS_DELIVERY_UI.MAP_DONE}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  const mapOpensFromLine = displayOnly && showMap;
  const lineMapTrigger = lineOpensMap && showMap;
  const openMapFromLine = () => {
    if (disabled) {
      return;
    }
    if (mapOpensFromLine || lineMapTrigger) {
      setMapOpen(true);
    }
  };

  const showMapStatusHints =
    showMap && !mapOpen && (mapStatus === "loading" || Boolean(mapError));
  const mapStatusHints = showMapStatusHints ? (
    <>
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
    </>
  ) : null;

  return (
    <div className="address-delivery-fields" id={rootId}>
      <label className="address-delivery-fields__line-wrap" ref={wrapRef}>
        <FormFieldLabel>{lineLabel}</FormFieldLabel>
        <div className="address-delivery-fields__input-row">
          <input
            type="text"
            className={[
              lineInputClassName,
              mapOpensFromLine || lineMapTrigger
                ? "address-delivery-fields__line_map-trigger"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            value={value.line}
            onChange={displayOnly ? undefined : handleLineChange}
            disabled={disabled}
            readOnly={displayOnly}
            maxLength={ADDRESS_LINE_MAX_LENGTH}
            placeholder={ADDRESS_DELIVERY_UI.PLACEHOLDER_LINE}
            autoComplete="off"
            role={mapOpensFromLine ? "button" : "combobox"}
            aria-expanded={mapOpensFromLine ? undefined : showList}
            aria-controls={displayOnly ? undefined : listId}
            aria-haspopup={mapOpensFromLine ? "dialog" : undefined}
            aria-label={
              mapOpensFromLine
                ? `${lineLabel}. ${ADDRESS_DELIVERY_UI.MAP_OPEN}`
                : undefined
            }
            onClick={openMapFromLine}
            onKeyDown={
              mapOpensFromLine
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openMapFromLine();
                    }
                  }
                : undefined
            }
          />
          {value.line && !disabled && !displayOnly ? (
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

      {showMap && !displayOnly && !hideMapOpenButton ? (
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
          {mapStatusHints}
        </div>
      ) : null}

      {showMap && displayOnly && mapStatusHints ? (
        <div className="address-delivery-fields__map">{mapStatusHints}</div>
      ) : null}

      {mapFullscreen}
    </div>
  );
}
