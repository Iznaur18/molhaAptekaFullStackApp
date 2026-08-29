import { ADDRESS_DELIVERY_UI } from "../../../shared/config/appUiCopy.js";
import {
  GEOLOCATION_TARGET_ACCURACY_M,
  GEOLOCATION_TIMEOUT_MS,
  GEOLOCATION_WATCH_MAX_MS,
} from "./geolocationAccuracy.js";

const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

/**
 * @param {GeolocationPosition} position
 * @returns {{ lat: number; lon: number; accuracyMeters: number } | null}
 */
function readGeolocationPosition(position) {
  const lat = Number(position.coords.latitude);
  const lon = Number(position.coords.longitude);
  const accuracyMeters = Number(position.coords.accuracy);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return {
    lat,
    lon,
    accuracyMeters: Number.isFinite(accuracyMeters)
      ? accuracyMeters
      : Number.POSITIVE_INFINITY,
  };
}

/**
 * @param {GeolocationPositionError} error
 */
function mapGeolocationError(error) {
  if (error?.code === PERMISSION_DENIED) {
    return new Error(ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_DENIED);
  }
  if (error?.code === TIMEOUT) {
    return new Error(ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_TIMEOUT);
  }
  if (error?.code === POSITION_UNAVAILABLE) {
    return new Error(ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_ERROR);
  }
  return new Error(ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_ERROR);
}

/**
 * @returns {Promise<{ lat: number; lon: number; accuracyMeters: number }>}
 */
export function requestBrowserGeolocation() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || navigator.geolocation == null) {
      reject(new Error(ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_UNAVAILABLE));
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: GEOLOCATION_TIMEOUT_MS,
      maximumAge: 0,
    };

    let watchId = null;
    let watchTimer = null;
    let settled = false;
    /** @type {{ lat: number; lon: number; accuracyMeters: number } | null} */
    let best = null;

    const cleanup = () => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (watchTimer != null) {
        window.clearTimeout(watchTimer);
        watchTimer = null;
      }
    };

    const settleResolve = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(value);
    };

    const settleReject = (error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };

    const consider = (position) => {
      const candidate = readGeolocationPosition(position);
      if (!candidate) {
        return;
      }

      if (!best || candidate.accuracyMeters < best.accuracyMeters) {
        best = candidate;
      }

      if (candidate.accuracyMeters <= GEOLOCATION_TARGET_ACCURACY_M) {
        settleResolve(candidate);
      }
    };

    const onFatalError = (error) => {
      if (best) {
        settleResolve(best);
        return;
      }
      settleReject(mapGeolocationError(error));
    };

    const finishWatch = () => {
      if (best) {
        settleResolve(best);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          consider(position);
          if (best) {
            settleResolve(best);
            return;
          }
          settleReject(new Error(ADDRESS_DELIVERY_UI.MAP_MY_LOCATION_ERROR));
        },
        onFatalError,
        geoOptions,
      );
    };

    watchId = navigator.geolocation.watchPosition(
      consider,
      () => {
        // Ждём таймаут — иногда первые чтения приходят с задержкой.
      },
      geoOptions,
    );
    watchTimer = window.setTimeout(finishWatch, GEOLOCATION_WATCH_MAX_MS);

    if (settled && watchId != null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      if (watchTimer != null) {
        window.clearTimeout(watchTimer);
        watchTimer = null;
      }
    }
  });
}
