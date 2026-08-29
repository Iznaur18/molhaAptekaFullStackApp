import { useEffect } from "react";

/**
 * iOS rubber-band: `overflow: hidden` на body сам по себе не стопит скролл за модалкой.
 * Нужен там, где lock идёт стратегией `overflow` (модалки с полями ввода: `position: fixed`
 * на body ломает мобильную клавиатуру — фокус слетает после первого символа).
 *
 * @param {boolean} active
 * @param {string} contentSelector CSS-селектор контейнера модалки, внутри которого скролл разрешён
 */
export function useBlockBackgroundScroll(active, contentSelector) {
  useEffect(() => {
    if (!active || !contentSelector) {
      return undefined;
    }

    const blockBackgroundScroll = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(contentSelector)) {
        return;
      }
      event.preventDefault();
    };

    document.addEventListener("touchmove", blockBackgroundScroll, { passive: false });
    document.addEventListener("wheel", blockBackgroundScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", blockBackgroundScroll);
      document.removeEventListener("wheel", blockBackgroundScroll);
    };
  }, [active, contentSelector]);
}
