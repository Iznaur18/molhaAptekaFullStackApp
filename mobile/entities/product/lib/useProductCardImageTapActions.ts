import { useCallback, useEffect, useRef } from "react";

export const PRODUCT_CARD_DOUBLE_TAP_WINDOW_MS = 280;

type UseProductCardImageTapActionsOptions = {
  onOpen: () => void;
  onDoubleTap?: () => void;
  doubleTapEnabled?: boolean;
};

export const useProductCardImageTapActions = ({
  onOpen,
  onDoubleTap,
  doubleTapEnabled = false,
}: UseProductCardImageTapActionsOptions) => {
  const lastTapAtRef = useRef(0);
  const pendingOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pendingOpenTimeoutRef.current) {
        clearTimeout(pendingOpenTimeoutRef.current);
      }
    },
    [],
  );

  return useCallback(() => {
    if (!doubleTapEnabled || !onDoubleTap) {
      onOpen();
      return;
    }

    const now = Date.now();
    const delta = now - lastTapAtRef.current;

    if (delta > 0 && delta < PRODUCT_CARD_DOUBLE_TAP_WINDOW_MS) {
      if (pendingOpenTimeoutRef.current) {
        clearTimeout(pendingOpenTimeoutRef.current);
        pendingOpenTimeoutRef.current = null;
      }
      lastTapAtRef.current = 0;
      onDoubleTap();
      return;
    }

    lastTapAtRef.current = now;
    pendingOpenTimeoutRef.current = setTimeout(() => {
      pendingOpenTimeoutRef.current = null;
      onOpen();
    }, PRODUCT_CARD_DOUBLE_TAP_WINDOW_MS);
  }, [doubleTapEnabled, onDoubleTap, onOpen]);
};
