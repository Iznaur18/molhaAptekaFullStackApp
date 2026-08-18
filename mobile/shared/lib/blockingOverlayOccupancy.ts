let occupancy = 0;
const listeners = new Set<(count: number) => void>();

const notify = () => {
  for (const listener of listeners) {
    listener(occupancy);
  }
};

export const getBlockingOverlayCount = () => occupancy;

export const acquireBlockingOverlay = () => {
  occupancy += 1;
  notify();
  return () => {
    occupancy = Math.max(0, occupancy - 1);
    notify();
  };
};

export const subscribeBlockingOverlayCount = (listener: (count: number) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
