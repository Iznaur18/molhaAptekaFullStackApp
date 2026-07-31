import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { resolveCartFetchHydrate } from "../lib/resolveCartFetchHydrate.js";
import { cartQueryKeys } from "../model/cartQueryKeys.js";
import { useMyCartQuery } from "../model/useMyCartQuery.js";
import { useReplaceMyCartMutation } from "../model/useReplaceMyCartMutation.js";
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
  const queryClient = useQueryClient();
  const { items, clearCart, hydrateCart } = useCart();
  const [remoteReady, setRemoteReady] = useState(false);
  const cartQuery = useMyCartQuery({ enabled: isAuthorized });
  const { mutate: replaceCart } = useReplaceMyCartMutation();

  useEffect(() => {
    if (!isAuthorized) {
      setRemoteReady(false);
      clearCart();
      queryClient.removeQueries({ queryKey: cartQueryKeys.my() });
      return undefined;
    }

    setRemoteReady(false);
    return undefined;
  }, [clearCart, isAuthorized, queryClient]);

  useEffect(() => {
    if (!isAuthorized) {
      return undefined;
    }

    const hydrateAction = resolveCartFetchHydrate({
      isSuccess: cartQuery.isSuccess,
      isError: cartQuery.isError,
    });

    if (hydrateAction === "hydrate") {
      hydrateCart(cartQuery.data);
      setRemoteReady(true);
      return undefined;
    }

    if (hydrateAction === "block-sync") {
      if (import.meta.env.DEV) {
        console.warn("[cart] fetchMyCart failed", cartQuery.error);
      }
      // Как wishlist: не гидрируем {} — иначе debounced replaceCart({}) сотрёт сервер.
      setRemoteReady(false);
    }

    return undefined;
  }, [
    cartQuery.data,
    cartQuery.error,
    cartQuery.isError,
    cartQuery.isSuccess,
    hydrateCart,
    isAuthorized,
  ]);

  useEffect(() => {
    if (!isAuthorized || !remoteReady) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      replaceCart(items, {
        onSuccess: (saved) => {
          if (packItems(saved) !== packItems(items)) {
            hydrateCart(saved);
          }
        },
        onError: (e) => {
          if (import.meta.env.DEV) {
            console.warn("[cart] replaceMyCart failed", e);
          }
        },
      });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [hydrateCart, isAuthorized, items, remoteReady, replaceCart]);

  return null;
}
