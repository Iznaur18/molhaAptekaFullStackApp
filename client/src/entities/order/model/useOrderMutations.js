import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateOrderStatus } from "../api/updateOrderStatus.js";
import {
  confirmOrderItem,
  markOrderItemCancelled,
  markOrderItemDelivered,
  markOrderItemReturned,
  markOrderItemShipped,
} from "../api/updateOrderItemStatus.js";
import { invalidateOrderActionCounts, invalidateOrderQueries } from "../lib/orderQueryCache.js";

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const invalidateOrders = () => {
    void invalidateOrderQueries(queryClient);
    void invalidateOrderActionCounts(queryClient);
  };

  const confirmItemMutation = useMutation({
    mutationFn: ({ orderId, itemIndex }) => confirmOrderItem(orderId, itemIndex),
    onSuccess: invalidateOrders,
  });

  const cancelItemMutation = useMutation({
    mutationFn: ({ orderId, itemIndex }) => markOrderItemCancelled(orderId, itemIndex),
    onSuccess: invalidateOrders,
  });

  const shipItemMutation = useMutation({
    mutationFn: ({ orderId, itemIndex }) => markOrderItemShipped(orderId, itemIndex),
    onSuccess: invalidateOrders,
  });

  const deliverItemMutation = useMutation({
    mutationFn: ({ orderId, itemIndex }) => markOrderItemDelivered(orderId, itemIndex),
    onSuccess: invalidateOrders,
  });

  const returnItemMutation = useMutation({
    mutationFn: ({ orderId, itemIndex }) => markOrderItemReturned(orderId, itemIndex),
    onSuccess: invalidateOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: invalidateOrders,
  });

  return {
    confirmItemMutation,
    cancelItemMutation,
    shipItemMutation,
    deliverItemMutation,
    returnItemMutation,
    updateStatusMutation,
  };
}
