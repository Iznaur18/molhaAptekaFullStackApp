/** После 503 не долбим suggest/geolocate; через TTL пробуем снова. */
export const ADDRESS_SERVICE_UNAVAILABLE_TTL_MS = 60_000;

let unavailableUntil = 0;
/** @type {ReturnType<typeof setTimeout> | null} */
let clearTimer = null;
/** @type {Set<() => void>} */
const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function isAddressServiceUnavailable() {
  return Date.now() < unavailableUntil;
}

export function markAddressServiceUnavailable() {
  unavailableUntil = Date.now() + ADDRESS_SERVICE_UNAVAILABLE_TTL_MS;
  if (clearTimer != null) {
    clearTimeout(clearTimer);
  }
  clearTimer = setTimeout(() => {
    unavailableUntil = 0;
    clearTimer = null;
    notify();
  }, ADDRESS_SERVICE_UNAVAILABLE_TTL_MS);
  notify();
}

export function resetAddressServiceUnavailable() {
  unavailableUntil = 0;
  if (clearTimer != null) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }
  notify();
}

/** @param {() => void} listener */
export function subscribeAddressServiceAvailability(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetAddressServiceAvailabilityForTests() {
  resetAddressServiceUnavailable();
}
