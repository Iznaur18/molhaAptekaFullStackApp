import { orderFromApiSchema } from "@molha/api-contract";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import type { z } from "zod";

import { getOrderItemIndex } from "@/entities/order/lib/getOrderItemIndex";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_RETURNED,
} from "@/entities/order/model/constants";
import { useOrderMutations } from "@/entities/order/model/useOrderMutations";
import { orderShipmentActionKey } from "@/entities/order/ui/OrderCard";
import { useCreateOrderPaymentMutation } from "@/entities/payment/model/useCreateOrderPaymentMutation";
import { orderQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  MY_ORDERS_PAGE_UI,
  ORDER_CARD_UI,
  PAYMENT_UI,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { confirmDestructiveAction } from "@/shared/lib/confirmDestructiveAction";

type OrderRecord = z.infer<typeof orderFromApiSchema>;

/** Сервер принимает только web-путь; deep link откроет приложение. */
const MY_ORDERS_WEB_PATH = "/my-orders";

type UseBuyerOrderCardActionsParams = {
  refetchOrders: () => Promise<unknown>;
};

export const useBuyerOrderCardActions = ({
  refetchOrders,
}: UseBuyerOrderCardActionsParams) => {
  const queryClient = useQueryClient();
  const {
    confirmItemMutation,
    cancelItemMutation,
    returnItemMutation,
    cancelShipmentMutation,
  } = useOrderMutations();
  const createOrderPaymentMutation = useCreateOrderPaymentMutation();
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [itemActionErrors, setItemActionErrors] = useState<Record<string, string>>(
    {},
  );
  const [loyaltyFlash, setLoyaltyFlash] = useState("");

  useEffect(() => {
    if (!loyaltyFlash) {
      return undefined;
    }
    const timerId = setTimeout(() => setLoyaltyFlash(""), 4000);
    return () => clearTimeout(timerId);
  }, [loyaltyFlash]);

  const patchOrders = useCallback(
    (updater: (orders: OrderRecord[]) => OrderRecord[]) => {
      queryClient.setQueryData(orderQueryKeys.my(), (old) => {
        if (!Array.isArray(old)) {
          return old;
        }
        return updater(old as OrderRecord[]);
      });
    },
    [queryClient],
  );

  const invalidateOrderQueues = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: orderQueryKeys.myActionCount() });
  }, [queryClient]);

  const handleRefresh = useCallback(async () => {
    await refetchOrders();
    await invalidateOrderQueues();
  }, [refetchOrders, invalidateOrderQueues]);

  const handlePayOrder = async ({ orderId }: { orderId: string }) => {
    const actionKey = orderShipmentActionKey(orderId, "pay");
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));
    try {
      const payment = await createOrderPaymentMutation.mutateAsync({
        orderId,
        returnUrl: MY_ORDERS_WEB_PATH,
      });
      if (!payment.confirmationUrl) {
        throw new Error(PAYMENT_UI.CREATE_FALLBACK);
      }
      try {
        await Linking.openURL(payment.confirmationUrl);
      } catch (openError) {
        console.warn("[payment] open confirmation url failed", openError);
        throw new Error(PAYMENT_UI.OPEN_URL_ERROR);
      }
    } catch (error) {
      setItemActionErrors((prev) => ({
        ...prev,
        [actionKey]: formatApiErrorMessage(error, PAYMENT_UI.CREATE_FALLBACK),
      }));
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleConfirmDelivered = async ({
    orderId,
    itemIndex,
  }: {
    orderId: string;
    itemIndex: number;
  }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    patchOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) {
          return order;
        }
        const nextItems = (order.items ?? []).map((item, index) => {
          if (getOrderItemIndex(item as { itemIndex?: number }, index) !== itemIndex) {
            return item;
          }
          return { ...item, status: ORDER_STATUS_CONFIRMED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const { order: updatedOrder, pointsEarned } =
        await confirmItemMutation.mutateAsync({
          orderId,
          itemIndex,
        });
      if (pointsEarned > 0) {
        setLoyaltyFlash(MY_ORDERS_PAGE_UI.LOYALTY_POINTS_EARNED(pointsEarned));
      }
      patchOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      await invalidateOrderQueues();
      void refetchOrders();
    } catch (error) {
      const message = formatApiErrorMessage(
        error,
        API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK,
      );
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void refetchOrders();
    } finally {
      setPendingActionKey(null);
    }
  };

  const confirmAction = (
    title: string,
    question: string,
    confirmLabel: string,
    run: () => Promise<void>,
  ) => {
    confirmDestructiveAction({
      title,
      message: question,
      confirmLabel,
      cancelLabel: PRODUCT_REPORT_UI.CANCEL,
      onConfirm: () => {
        void run();
      },
    });
  };

  const runItemAction = async ({
    orderId,
    itemIndex,
    optimisticStatus,
    mutate,
  }: {
    orderId: string;
    itemIndex: number;
    optimisticStatus: string;
    mutate: () => Promise<OrderRecord>;
  }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    patchOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) {
          return order;
        }
        const nextItems = (order.items ?? []).map((item, index) => {
          if (getOrderItemIndex(item as { itemIndex?: number }, index) !== itemIndex) {
            return item;
          }
          return { ...item, status: optimisticStatus };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const updatedOrder = await mutate();
      patchOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      await invalidateOrderQueues();
      void refetchOrders();
    } catch (error) {
      const message = formatApiErrorMessage(
        error,
        API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK,
      );
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void refetchOrders();
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleCancelItem = ({
    orderId,
    itemIndex,
  }: {
    orderId: string;
    itemIndex: number;
  }) => {
    confirmAction(
      ORDER_CARD_UI.ACTION_CANCEL,
      ORDER_CARD_UI.ITEM_CANCEL_CONFIRM,
      ORDER_CARD_UI.ACTION_CANCEL,
      () =>
        runItemAction({
          orderId,
          itemIndex,
          optimisticStatus: ORDER_STATUS_CANCELLED,
          mutate: () => cancelItemMutation.mutateAsync({ orderId, itemIndex }),
        }),
    );
  };

  const handleMarkReturned = ({
    orderId,
    itemIndex,
  }: {
    orderId: string;
    itemIndex: number;
  }) => {
    confirmAction(
      ORDER_CARD_UI.ACTION_REFUSE,
      ORDER_CARD_UI.ACTION_REFUSE_CONFIRM,
      ORDER_CARD_UI.ACTION_REFUSE,
      () =>
        runItemAction({
          orderId,
          itemIndex,
          optimisticStatus: ORDER_STATUS_RETURNED,
          mutate: () => returnItemMutation.mutateAsync({ orderId, itemIndex }),
        }),
    );
  };

  const handleCancelOrder = ({
    orderId,
    sellerId,
  }: {
    orderId: string;
    sellerId: string;
  }) => {
    confirmAction(
      ORDER_CARD_UI.ACTION_CANCEL_ORDER,
      ORDER_CARD_UI.BUYER_CANCEL_CONFIRM,
      ORDER_CARD_UI.ACTION_CANCEL_ORDER,
      async () => {
        const actionKey = orderShipmentActionKey(orderId, "cancel");
        setPendingActionKey(actionKey);
        setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));
        try {
          const updatedOrder = await cancelShipmentMutation.mutateAsync({
            orderId,
            sellerId,
          });
          patchOrders((prev) =>
            prev.map((order) => (order._id === orderId ? updatedOrder : order)),
          );
          await invalidateOrderQueues();
          void refetchOrders();
        } catch (error) {
          const message = formatApiErrorMessage(
            error,
            API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK,
          );
          setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
          void refetchOrders();
        } finally {
          setPendingActionKey(null);
        }
      },
    );
  };

  return {
    pendingActionKey,
    itemActionErrors,
    loyaltyFlash,
    handleRefresh,
    handlePayOrder,
    handleConfirmDelivered,
    handleCancelItem,
    handleMarkReturned,
    handleCancelOrder,
  };
};
