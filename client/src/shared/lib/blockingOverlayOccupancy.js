let occupancy = 0;
/** @type {Set<(count: number) => void>} */
const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    listener(occupancy);
  }
}

export function getBlockingOverlayCount() {
  return occupancy;
}

export function acquireBlockingOverlay() {
  occupancy += 1;
  notify();
  return () => {
    occupancy = Math.max(0, occupancy - 1);
    notify();
  };
}

/**
 * @param {(count: number) => void} listener
 */
export function subscribeBlockingOverlayCount(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
