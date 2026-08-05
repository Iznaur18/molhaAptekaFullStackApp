import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { ADDRESS_DELIVERY_UI } from "@/shared/config";

/** Синхрон с client mapPointPickerStyle (Carto Voyager + action pin). */
const MAP_PIN_COLOR = "#1f6feb";
const MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

type MapPointPickerProps = {
  lat: number | null;
  lon: number | null;
  disabled?: boolean;
  /** When true, fills parent instead of fixed 280 height. */
  fill?: boolean;
  onPointChange: (point: { lat: number; lon: number }) => void;
};

function buildMapHtml(lat: number | null, lon: number | null): string {
  const hasPoint =
    lat != null && lon != null && Number.isFinite(lat) && Number.isFinite(lon);
  const centerLat = hasPoint ? lat : 55.751244;
  const centerLon = hasPoint ? lon : 37.618423;
  const zoom = hasPoint ? 16 : 10;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #e8f0ea; }
    .leaflet-control-attribution { font-size: 10px; max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .map-pin-marker { background: transparent; border: none; }
    .map-pin { display: block; width: 32px; height: 40px; filter: drop-shadow(0 2px 4px rgba(15,23,42,.28)); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function () {
      var center = [${centerLat}, ${centerLon}];
      var map = L.map("map", { zoomControl: false, attributionControl: true }).setView(center, ${zoom});
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer(${JSON.stringify(MAP_TILE_URL)}, {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
        subdomains: "abcd"
      }).addTo(map);
      var pinHtml = '<span class="map-pin" aria-hidden="true"><svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 24 16 24s16-12.5 16-24C32 7.163 24.837 0 16 0z" fill="${MAP_PIN_COLOR}"/><circle cx="16" cy="15" r="5.5" fill="#fff"/></svg></span>';
      var icon = L.divIcon({
        className: "map-pin-marker",
        html: pinHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 40]
      });
      var marker = L.marker(center, { icon: icon, draggable: true }).addTo(map);
      function emit(latlng) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            lat: Number(latlng.lat),
            lon: Number(latlng.lng)
          }));
        }
      }
      map.on("click", function (e) {
        marker.setLatLng(e.latlng);
        emit(e.latlng);
      });
      marker.on("dragend", function () {
        emit(marker.getLatLng());
      });
      setTimeout(function () { map.invalidateSize(); }, 100);
    })();
  </script>
</body>
</html>`;
}

export const MapPointPicker = ({
  lat,
  lon,
  disabled = false,
  fill = false,
  onPointChange,
}: MapPointPickerProps) => {
  const html = useMemo(
    () => buildMapHtml(lat, lon),
    // Seed once when opening; parent syncs address via geolocate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lat == null, lon == null],
  );

  return (
    <View
      style={[styles.mapWrap, fill ? styles.mapWrapFill : null]}
      accessibilityLabel={ADDRESS_DELIVERY_UI.MAP_ARIA}
    >
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.map}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          if (disabled) {
            return;
          }
          try {
            const parsed = JSON.parse(event.nativeEvent.data) as {
              lat?: number;
              lon?: number;
            };
            const nextLat = Number(parsed.lat);
            const nextLon = Number(parsed.lon);
            if (!Number.isFinite(nextLat) || !Number.isFinite(nextLon)) {
              return;
            }
            onPointChange({ lat: nextLat, lon: nextLon });
          } catch {
            /* ignore malformed */
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: {
    height: 280,
    borderRadius: 12,
    overflow: "hidden",
  },
  mapWrapFill: {
    flex: 1,
    height: undefined,
    minHeight: 0,
    borderRadius: 0,
  },
  map: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
