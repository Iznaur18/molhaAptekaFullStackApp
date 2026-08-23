import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";

import { useMyFavoritesQuery } from "@/entities/wishlist/model/useMyFavoritesQuery";
import { useReplaceMyFavoritesMutation } from "@/entities/wishlist/model/useReplaceMyFavoritesMutation";
import { useWishlist } from "@/entities/wishlist/model/WishlistProvider";
import { wishlistQueryKeys } from "@/entities/wishlist/model/wishlistQueryKeys";
import type { WishlistItemsByProductId } from "@/entities/wishlist/model/types";
import type { WishlistFromApi } from "@/entities/wishlist/model/types";

const DEBOUNCE_MS = 450;

const packItems = (obj: WishlistItemsByProductId) =>
  JSON.stringify(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));

export const WishlistServerSync = () => {
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const { items, clearWishlist, hydrateWishlist } = useWishlist();
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const lastAckedItemsRef = useRef<WishlistItemsByProductId>({});
  const [remoteReady, setRemoteReady] = useState(false);
  const favoritesQuery = useMyFavoritesQuery({ enabled: isAuthorized });
  const { mutate: replaceWishlist } = useReplaceMyFavoritesMutation();

  useEffect(() => {
    if (!isAuthorized) {
      setRemoteReady(false);
      lastAckedItemsRef.current = {};
      clearWishlist();
      queryClient.removeQueries({ queryKey: wishlistQueryKeys.my() });
    }
  }, [clearWishlist, isAuthorized, queryClient]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    if (favoritesQuery.isSuccess && favoritesQuery.data) {
      const remoteItems = favoritesQuery.data.items;
      const hasPendingLocalChanges =
        packItems(itemsRef.current) !== packItems(lastAckedItemsRef.current);

      if (!remoteReady) {
        hydrateWishlist(remoteItems);
        lastAckedItemsRef.current = remoteItems;
        setRemoteReady(true);
        return;
      }

      if (
        !hasPendingLocalChanges &&
        packItems(remoteItems) !== packItems(lastAckedItemsRef.current)
      ) {
        hydrateWishlist(remoteItems);
        lastAckedItemsRef.current = remoteItems;
      }

      return;
    }

    if (favoritesQuery.isError) {
      setRemoteReady(false);
    }
  }, [
    favoritesQuery.data,
    favoritesQuery.isError,
    favoritesQuery.isSuccess,
    hydrateWishlist,
    isAuthorized,
    remoteReady,
  ]);

  useEffect(() => {
    if (!isAuthorized || !remoteReady) {
      return undefined;
    }

    if (packItems(items) === packItems(lastAckedItemsRef.current)) {
      return undefined;
    }

    const itemsSnapshot = { ...itemsRef.current };
    const timerId = setTimeout(() => {
      replaceWishlist(itemsSnapshot, {
        onSuccess: (saved: WishlistFromApi) => {
          lastAckedItemsRef.current = saved.items;
          if (packItems(saved.items) !== packItems(itemsRef.current)) {
            hydrateWishlist(saved.items);
          }
          queryClient.setQueryData(wishlistQueryKeys.my(), saved);
        },
        onError: () => {
          hydrateWishlist(lastAckedItemsRef.current);
        },
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerId);
  }, [hydrateWishlist, isAuthorized, items, queryClient, remoteReady, replaceWishlist]);

  return null;
};
