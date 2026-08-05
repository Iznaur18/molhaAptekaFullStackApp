/** После 503 не долбим suggest/geolocate; через TTL пробуем снова. */
export const ADDRESS_SERVICE_UNAVAILABLE_TTL_MS = 60_000;

let unavailableUntil = 0;
let clearTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const isAddressServiceUnavailable = (): boolean => Date.now() < unavailableUntil;

export const markAddressServiceUnavailable = (): void => {
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
};

export const resetAddressServiceUnavailable = (): void => {
  unavailableUntil = 0;
  if (clearTimer != null) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }
  notify();
};

export const subscribeAddressServiceAvailability = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const resetAddressServiceAvailabilityForTests = (): void => {
  resetAddressServiceUnavailable();
};
