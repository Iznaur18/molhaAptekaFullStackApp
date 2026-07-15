import { Platform, type FocusEvent as RNFocusEvent } from "react-native";

/** Small gap between focused field and keyboard top. */
const KEYBOARD_FIELD_COMFORT_GAP_PX = 12;
const KEYBOARD_SETTLE_MS = 220;
const VIEWPORT_LISTENER_TTL_MS = 700;

const isScrollableOverflowY = (overflowY: string) =>
  overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";

const findScrollableAncestor = (start: HTMLElement): HTMLElement | null => {
  let node: HTMLElement | null = start.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (isScrollableOverflowY(style.overflowY) && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

/** Scroll the field just enough to clear the keyboard — no centering jump. */
export const ensureTextInputVisibleAboveKeyboard = (target: HTMLElement) => {
  const visualViewport = window.visualViewport;
  const rect = target.getBoundingClientRect();

  if (!visualViewport) {
    const overflow = rect.bottom - (window.innerHeight - KEYBOARD_FIELD_COMFORT_GAP_PX);
    if (overflow <= 0) {
      return;
    }
    const scrollRoot = findScrollableAncestor(target);
    if (scrollRoot) {
      scrollRoot.scrollBy({ top: overflow, behavior: "smooth" });
      return;
    }
    window.scrollBy({ top: overflow, behavior: "smooth" });
    return;
  }

  const visibleBottom = visualViewport.offsetTop + visualViewport.height - KEYBOARD_FIELD_COMFORT_GAP_PX;
  const overflow = rect.bottom - visibleBottom;
  if (overflow <= 0) {
    return;
  }

  const scrollRoot = findScrollableAncestor(target);
  if (scrollRoot) {
    scrollRoot.scrollBy({ top: overflow, behavior: "smooth" });
    return;
  }

  window.scrollBy({ top: overflow, behavior: "smooth" });
};

export const scrollTextInputIntoViewOnFocus = (event: RNFocusEvent) => {
  if (Platform.OS !== "web") {
    return;
  }

  const target = event.nativeEvent.target as unknown as HTMLElement | null | undefined;
  if (!target) {
    return;
  }

  let settled = false;
  const nudgeOnce = () => {
    if (settled) {
      return;
    }
    ensureTextInputVisibleAboveKeyboard(target);
  };

  requestAnimationFrame(nudgeOnce);
  const settleTimer = setTimeout(() => {
    settled = false;
    ensureTextInputVisibleAboveKeyboard(target);
    settled = true;
  }, KEYBOARD_SETTLE_MS);

  const visualViewport = typeof window !== "undefined" ? window.visualViewport : null;
  if (!visualViewport) {
    return;
  }

  let frame = 0;
  const onViewportChange = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      ensureTextInputVisibleAboveKeyboard(target);
    });
  };

  visualViewport.addEventListener("resize", onViewportChange);
  setTimeout(() => {
    visualViewport.removeEventListener("resize", onViewportChange);
    clearTimeout(settleTimer);
  }, VIEWPORT_LISTENER_TTL_MS);
};

export const textInputFocusScrollProps =
  Platform.OS === "web"
    ? ({ onFocus: scrollTextInputIntoViewOnFocus } as const)
    : ({} as const);
