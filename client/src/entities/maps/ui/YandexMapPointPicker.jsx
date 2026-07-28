import { useEffect, useId, useRef } from "react";

import { isYandexMapsApiKeyConfigured, resolveYandexMapsApiKey } from "../lib/yandexMapsApiKey.js";
import { PRODUCT_PICKUP_UI } from "../../../shared/config/appUiCopy.js";

import "./YandexMapPointPicker.css";

const SCRIPT_ID = "yandex-maps-api-2-1";

/**
 * @returns {Promise<typeof window.ymaps>}
 */
function loadYmaps() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no window"));
  }
  if (window.ymaps?.ready) {
    return new Promise((resolve) => {
      window.ymaps.ready(() => resolve(window.ymaps));
    });
  }

  const key = resolveYandexMapsApiKey();
  if (!key) {
    return Promise.reject(new Error("no key"));
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => {
        window.ymaps.ready(() => resolve(window.ymaps));
      });
      existing.addEventListener("error", () => reject(new Error("script error")));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => resolve(window.ymaps));
    };
    script.onerror = () => reject(new Error("script error"));
    document.head.appendChild(script);
  });
}

/**
 * @param {{
 *   lat: number | null;
 *   lon: number | null;
 *   disabled?: boolean;
 *   onPointChange: (point: { lat: number; lon: number; address?: string }) => void;
 * }} props
 */
export function YandexMapPointPicker({ lat, lon, disabled = false, onPointChange }) {
  const mapHostId = useId().replace(/:/g, "");
  const mapRef = useRef(/** @type {unknown} */ (null));
  const placemarkRef = useRef(/** @type {unknown} */ (null));
  const onPointChangeRef = useRef(onPointChange);
  onPointChangeRef.current = onPointChange;

  const configured = isYandexMapsApiKeyConfigured();

  useEffect(() => {
    if (!configured || disabled) {
      return undefined;
    }

    let cancelled = false;

    loadYmaps()
      .then((ymaps) => {
        if (cancelled) {
          return;
        }
        const center =
          lat != null && lon != null && Number.isFinite(lat) && Number.isFinite(lon)
            ? [lat, lon]
            : [55.751244, 37.618423];

        const map = new ymaps.Map(mapHostId, {
          center,
          zoom: lat != null && lon != null ? 16 : 10,
          controls: ["zoomControl", "geolocationControl"],
        });
        mapRef.current = map;

        const placemark = new ymaps.Placemark(
          center,
          {},
          { draggable: true, preset: "islands#redDotIcon" },
        );
        placemarkRef.current = placemark;
        map.geoObjects.add(placemark);

        const emitPoint = (coords) => {
          const nextLat = Number(coords[0]);
          const nextLon = Number(coords[1]);
          ymaps.geocode(coords).then((res) => {
            const first = res.geoObjects.get(0);
            const address =
              first?.getAddressLine?.() ??
              first?.properties?.get?.("text") ??
              undefined;
            onPointChangeRef.current({
              lat: nextLat,
              lon: nextLon,
              address: typeof address === "string" ? address : undefined,
            });
          }).catch(() => {
            onPointChangeRef.current({ lat: nextLat, lon: nextLon });
          });
        };

        map.events.add("click", (event) => {
          const coords = event.get("coords");
          placemark.geometry.setCoordinates(coords);
          emitPoint(coords);
        });

        placemark.events.add("dragend", () => {
          emitPoint(placemark.geometry.getCoordinates());
        });
      })
      .catch(() => {
        /* ключ/сеть — UI покажет fallback */
      });

    return () => {
      cancelled = true;
      const map = mapRef.current;
      if (map && typeof map.destroy === "function") {
        map.destroy();
      }
      mapRef.current = null;
      placemarkRef.current = null;
    };
    // Mount once when key available; coords sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, disabled, mapHostId]);

  useEffect(() => {
    const placemark = placemarkRef.current;
    const map = mapRef.current;
    if (
      !placemark ||
      !map ||
      lat == null ||
      lon == null ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      return;
    }
    const coords = [lat, lon];
    placemark.geometry.setCoordinates(coords);
    map.setCenter(coords, Math.max(map.getZoom(), 15), { duration: 200 });
  }, [lat, lon]);

  if (!configured) {
    return (
      <div className="yandex-map-point-picker yandex-map-point-picker--fallback" role="status">
        <p className="yandex-map-point-picker__fallback-text">
          {PRODUCT_PICKUP_UI.MAP_KEY_MISSING}
        </p>
      </div>
    );
  }

  return (
    <div
      id={mapHostId}
      className="yandex-map-point-picker"
      aria-label={PRODUCT_PICKUP_UI.MAP_ARIA}
    />
  );
}
