import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirmOrderItem,
  markOrderItemCancelled,
} from "@/entities/order/api/updateOrderItemStatus";
import { orderQueryKeys } from "@/shared/api";

export const useOrderMutations = () => {
  const queryClient = useQueryClient();

  const invalidateOrders = () => {
    void queryClient.invalidateQueries({ queryKey: orderQueryKeys.my() });
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
    onSuccess: invalidateOrders,
  });

  return {
    confirmItemMutation,
    cancelItemMutation,
  };
};
