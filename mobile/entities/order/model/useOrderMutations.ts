import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirmOrderItem,
  markOrderItemCancelled,
  markOrderItemDelivered,
  markOrderItemShipped,
} from "@/entities/order/api/updateOrderItemStatus";
import { orderQueryKeys } from "@/shared/api";

export const useOrderMutations = () => {
  const queryClient = useQueryClient();

  const invalidateOrders = () => {
    void queryClient.invalidateQueries({ queryKey: orderQueryKeys.my() });
  };

  const invalidateSales = () => {
    void queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
  };

  const confirmItemMutation = useMutation({
    mutationFn: ({
      orderId,
      itemIndex,
    }: {
      orderId: string;
      itemIndex: number;
    }) => confirmOrderItem(orderId, itemIndex),
    onSuccess: invalidateOrders,
  });

  const cancelItemMutation = useMutation({
    mutationFn: ({
      orderId,
      itemIndex,
    }: {
      orderId: string;
      itemIndex: number;
    }) => markOrderItemCancelled(orderId, itemIndex),
    onSuccess: () => {
      invalidateOrders();
      invalidateSales();
    },
  });

  const shipItemMutation = useMutation({
    mutationFn: ({
      orderId,
      itemIndex,
    }: {
      orderId: string;
      itemIndex: number;
    }) => markOrderItemShipped(orderId, itemIndex),
    onSuccess: invalidateSales,
  });

  const deliverItemMutation = useMutation({
    mutationFn: ({
      orderId,
      itemIndex,
    }: {
      orderId: string;
      itemIndex: number;
    }) => markOrderItemDelivered(orderId, itemIndex),
    onSuccess: invalidateSales,
  });

  return {
    confirmItemMutation,
    cancelItemMutation,
    shipItemMutation,
    deliverItemMutation,
  };
};
