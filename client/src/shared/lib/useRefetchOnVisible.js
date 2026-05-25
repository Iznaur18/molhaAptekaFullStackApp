import { useEffect } from "react";

/**
 * Повторная загрузка при возврате на вкладку (другой ПК / браузер обновил заказ).
 *
 * @param {() => void | Promise<void>} refetch
 * @param {boolean} [enabled=true]
 */
export function useRefetchOnVisible(refetch, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      void refetch();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch, enabled]);
}
