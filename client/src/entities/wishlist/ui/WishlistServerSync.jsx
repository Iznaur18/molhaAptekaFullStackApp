import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import {
  patchProductWishlistCount,
  syncProductWishlistCountsFromServer,
} from "../lib/patchProductWishlistCount.js";
import { diffWishlistItemIds } from "../lib/wishlistItemsDiff.js";
import { useMyFavoritesQuery } from "../model/useMyFavoritesQuery.js";
import { useReplaceMyFavoritesMutation } from "../model/useReplaceMyFavoritesMutation.js";
import { useWishlist } from "../model/useWishlist.js";
import { wishlistQueryKeys } from "../model/wishlistQueryKeys.js";

const DEBOUNCE_MS = 450;

const packItems = (obj) =>
  JSON.stringify(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {Record<string, number>} before
 * @param {Record<string, number>} after
 */
function revertOptimisticWishlistCounts(queryClient, before, after) {
  const { added, removed } = diffWishlistItemIds(before, after);
  for (const productId of added) {
    patchProductWishlistCount(queryClient, productId, -1);
  }
  for (const productId of removed) {
    patchProductWishlistCount(queryClient, productId, 1);
  }
}

/**
 * @param {{ isAuthorized: boolean }} props
 */
export function WishlistServerSync({ isAuthorized }) {
  const queryClient = useQueryClient();
  const { items, clearWishlist, hydrateWishlist } = useWishlist();
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const lastAckedItemsRef = useRef(/** @type {Record<string, number>} */ ({}));
  const [remoteReady, setRemoteReady] = useState(false);
  const favoritesQuery = useMyFavoritesQuery({ enabled: isAuthorized });
  const { mutate: replaceWishlist } = useReplaceMyFavoritesMutation();

  useEffect(() => {
    if (!isAuthorized) {
      setRemoteReady(false);
      lastAckedItemsRef.current = {};
      clearWishlist();
      queryClient.removeQueries({ queryKey: wishlistQueryKeys.my() });
      return undefined;
    }

    setRemoteReady(false);
    return undefined;
  }, [clearWishlist, isAuthorized, queryClient]);

  useEffect(() => {
    if (!isAuthorized) {
      return undefined;
    }

    if (favoritesQuery.isSuccess && favoritesQuery.data) {
      hydrateWishlist(favoritesQuery.data.items);
      lastAckedItemsRef.current = favoritesQuery.data.items;
      syncProductWishlistCountsFromServer(queryClient, favoritesQuery.data.products);
      setRemoteReady(true);
      return undefined;
    }

    if (favoritesQuery.isError) {
      if (import.meta.env.DEV) {
        console.warn("[wishlist] fetchMyFavorites failed", favoritesQuery.error);
      }
      setRemoteReady(false);
    }

    return undefined;
  }, [
    favoritesQuery.data,
    favoritesQuery.error,
    favoritesQuery.isError,
    favoritesQuery.isSuccess,
    hydrateWishlist,
    isAuthorized,
    queryClient,
  ]);

  useEffect(() => {
    if (!isAuthorized || !remoteReady) {
      return undefined;
    }

    if (packItems(items) === packItems(lastAckedItemsRef.current)) {
      return undefined;
    }

    const itemsSnapshot = { ...itemsRef.current };

    const timerId = window.setTimeout(() => {
      replaceWishlist(itemsSnapshot, {
        onSuccess: (saved) => {
          lastAckedItemsRef.current = saved.items;
          if (packItems(saved.items) !== packItems(itemsRef.current)) {
            hydrateWishlist(saved.items);
          }
          syncProductWishlistCountsFromServer(queryClient, saved.products);
          queryClient.setQueryData(wishlistQueryKeys.my(), saved);
        },
        onError: (e) => {
          if (import.meta.env.DEV) {
            console.warn("[wishlist] replaceMyFavorites failed", e);
          }
          const acked = lastAckedItemsRef.current;
          revertOptimisticWishlistCounts(queryClient, acked, itemsSnapshot);
          hydrateWishlist(acked);
        },
      });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [hydrateWishlist, isAuthorized, items, queryClient, remoteReady, replaceWishlist]);

  return null;
}
