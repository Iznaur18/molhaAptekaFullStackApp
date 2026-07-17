import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { cartQueryKeys } from "@/shared/api";

import {
  addCartItem,
  clearCartItems,
  removeCartItem,
  removeCartItems,
  setCartItemQuantity,
} from "../lib/cartItemsReducer";
import type { CartItemsByProductId } from "./types";
import { useMyCartQuery } from "./useMyCartQuery";
import { useReplaceMyCartMutation } from "./useReplaceMyCartMutation";

export const useCartActions = () => {
  const queryClient = useQueryClient();
  const cartQuery = useMyCartQuery();
  const replaceMutation = useReplaceMyCartMutation();

  const getItems = useCallback(
    () => queryClient.getQueryData<CartItemsByProductId>(cartQueryKeys.all) ?? {},
    [queryClient],
  );

  const commitItems = useCallback(
    async (nextItems: CartItemsByProductId) => {
      await replaceMutation.mutateAsync(nextItems);
    },
    [replaceMutation],
  );

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      await commitItems(addCartItem(getItems(), productId, quantity));
    },
    [commitItems, getItems],
  );

  const setItemQuantity = useCallback(
    async (productId: string, quantity: number) => {
      await commitItems(setCartItemQuantity(getItems(), productId, quantity));
    },
    [commitItems, getItems],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      await commitItems(removeCartItem(getItems(), productId));
    },
    [commitItems, getItems],
  );

  const removeItems = useCallback(
    async (productIds: readonly string[]) => {
      await commitItems(removeCartItems(getItems(), productIds));
    },
    [commitItems, getItems],
  );

  const clearCart = useCallback(async () => {
    await commitItems(clearCartItems());
  }, [commitItems]);

  return {
    items: cartQuery.data ?? {},
    addItem,
    setItemQuantity,
    removeItem,
    removeItems,
    clearCart,
    isUpdating: replaceMutation.isPending,
  };
};
