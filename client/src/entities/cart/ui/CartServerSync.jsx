import { useEffect, useState } from "react";

import { fetchMyCart } from "../api/fetchMyCart.js";
import { replaceMyCart } from "../api/replaceMyCart.js";
import { useCart } from "../model/useCart.js";

const DEBOUNCE_MS = 450;

const packItems = (obj) =>
  JSON.stringify(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));

/**
 * Синхронизирует корзину с сервером: загрузка после входа, debounced PUT при изменениях, очистка после выхода.
 *
 * @param {{ isAuthorized: boolean }} props
 */
export function CartServerSync({ isAuthorized }) {
  const { items, clearCart, hydrateCart } = useCart();
  const [remoteReady, setRemoteReady] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      setRemoteReady(false);
      clearCart();
      return undefined;
    }

    let cancelled = false;
    setRemoteReady(false);

    void (async () => {
      try {
        const nextItems = await fetchMyCart();
        if (cancelled) return;
        hydrateCart(nextItems);
      } catch (e) {
        if (cancelled) return;
        if (import.meta.env.DEV) {
          console.warn("[cart] fetchMyCart failed", e);
        }
        hydrateCart({});
      } finally {
        if (!cancelled) {
          setRemoteReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthorized, clearCart, hydrateCart]);

  useEffect(() => {
    if (!isAuthorized || !remoteReady) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      void (async () => {
        try {
          const saved = await replaceMyCart(items);
          if (packItems(saved) !== packItems(items)) {
            hydrateCart(saved);
          }
        } catch (e) {
          if (import.meta.env.DEV) {
            console.warn("[cart] replaceMyCart failed", e);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [items, isAuthorized, remoteReady, hydrateCart]);

  return null;
}
