import { useEffect, useId, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { ADDRESS_DELIVERY_UI } from "../../../shared/config/appUiCopy.js";
import {
  MAP_DEFAULT_CENTER,
  MAP_PIN_COLOR,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
} from "../lib/mapPointPickerStyle.js";

import "./MapPointPicker.css";

function createActionPinIcon() {
  return L.divIcon({
    className: "map-point-picker__marker",
    html: `<span class="map-point-picker__pin" style="--map-pin-color:${MAP_PIN_COLOR}" aria-hidden="true">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 24 16 24s16-12.5 16-24C32 7.163 24.837 0 16 0z" fill="var(--map-pin-color)"/>
        <circle cx="16" cy="15" r="5.5" fill="#fff"/>
      </svg>
    </span>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  });
}

/**
 * @param {{
 *   lat: number | null;
 *   lon: number | null;
 *   disabled?: boolean;
 *   ariaLabel?: string;
 *   className?: string;
 *   onPointChange: (point: { lat: number; lon: number }) => void;
 * }} props
 */
export function MapPointPicker({
  lat,
  lon,
  disabled = false,
  ariaLabel = ADDRESS_DELIVERY_UI.MAP_ARIA,
  className = "",
  onPointChange,
}) {
  const mapHostId = useId().replace(/:/g, "");
  const hostRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const mapRef = useRef(/** @type {L.Map | null} */ (null));
  const markerRef = useRef(/** @type {L.Marker | null} */ (null));
  const onPointChangeRef = useRef(onPointChange);
  onPointChangeRef.current = onPointChange;

  useEffect(() => {
    if (disabled) {
      return undefined;
    }

    const host = hostRef.current;
    if (!host) {
      return undefined;
    }

    const hasPoint =
      lat != null && lon != null && Number.isFinite(lat) && Number.isFinite(lon);
    const center = hasPoint ? [lat, lon] : MAP_DEFAULT_CENTER;

    const map = L.map(host, {
      center,
      zoom: hasPoint ? 16 : 10,
      zoomControl: false,
      attributionControl: true,
    });
    mapRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker(center, {
      icon: createActionPinIcon(),
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    const emitPoint = (coords) => {
      onPointChangeRef.current({
        lat: Number(coords.lat),
        lon: Number(coords.lng),
      });
    };

    map.on("click", (event) => {
      marker.setLatLng(event.latlng);
      emitPoint(event.latlng);
    });

    marker.on("dragend", () => {
      emitPoint(marker.getLatLng());
    });

    const invalidateMapSize = () => {
      map.invalidateSize();
    };
    requestAnimationFrame(invalidateMapSize);
    const resizeTimerShort = window.setTimeout(invalidateMapSize, 80);
    const resizeTimerLong = window.setTimeout(invalidateMapSize, 240);
    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            invalidateMapSize();
          })
        : null;
    observer?.observe(host);

    return () => {
      observer?.disconnect();
      window.clearTimeout(resizeTimerShort);
      window.clearTimeout(resizeTimerLong);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, mapHostId]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (
      !map ||
      !marker ||
      lat == null ||
      lon == null ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      return;
    }
    const next = L.latLng(lat, lon);
    marker.setLatLng(next);
    map.invalidateSize();
    map.setView(next, Math.max(map.getZoom(), 15), { animate: true });
  }, [lat, lon]);

  return (
    <div
      id={mapHostId}
      ref={hostRef}
      className={["map-point-picker", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
    />
  );
}
