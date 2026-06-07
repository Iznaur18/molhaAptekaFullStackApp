import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

import { orderQueryKeys } from "../../../entities/order/model/orderQueryKeys.js";
import { useMyOrdersQuery } from "../../../entities/order/model/useMyOrdersQuery.js";
import { useOrderMutations } from "../../../entities/order/model/useOrderMutations.js";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
} from "../../../entities/order/model/constants.js";
import { OrderCard } from "../../../entities/order/ui/OrderCard.jsx";
import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { useCatalogProductDetailsOpener } from "../../../entities/product/lib/useCatalogProductDetailsOpener.js";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import {
  API_CLIENT_UI,
  MY_ORDERS_PAGE_UI,
  ORDER_CARD_UI,
} from "../../../shared/config/appUiCopy.js";

import "./MyOrdersPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   currentUserId?: string | null;
 *   onSellerNameClick?: (userId: string) => void;
 *   onRequestLogin?: () => void;
 *   onQueueChanged?: () => void;
 * }} props
 */
export function MyOrdersPage({
  isAuthorized,
  currentUserId = null,
  onSellerNameClick,
  onRequestLogin = () => {},
  onQueueChanged,
}) {
  const queryClient = useQueryClient();
  const { confirmItemMutation, cancelItemMutation } = useOrderMutations();
  const ordersQuery = useMyOrdersQuery({ enabled: isAuthorized });
  const orders = ordersQuery.data ?? [];
  const phase = ordersQuery.isPending
    ? "loading"
    : ordersQuery.isError
      ? "error"
      : "success";
  const error =
    ordersQuery.error instanceof Error
      ? ordersQuery.error.message
      : API_CLIENT_UI.FETCH_MY_ORDERS_FALLBACK;
  const [pendingActionKey, setPendingActionKey] = useState(null);
  const [itemActionErrors, setItemActionErrors] = useState({});
  const [loyaltyFlash, setLoyaltyFlash] = useState("");

  const {
    catalogProduct,
    catalogProductPhase,
    catalogProductError,
    openCatalogProductFromOrderLine,
    closeCatalogProduct,
    patchCatalogProduct,
  } = useCatalogProductDetailsOpener();

  const reloadOrders = useCallback(async () => {
    await ordersQuery.refetch();
  }, [ordersQuery]);

  useRefetchOnVisible(reloadOrders, phase === "success");

  useEffect(() => {
    if (!loyaltyFlash) return undefined;
    const timerId = window.setTimeout(() => setLoyaltyFlash(""), 4000);
    return () => window.clearTimeout(timerId);
  }, [loyaltyFlash]);

  const patchOrders = useCallback(
    (/** @type {(orders: import('../../../entities/order/model/types.js').Order[]) => import('../../../entities/order/model/types.js').Order[]} */ updater) => {
      queryClient.setQueryData(orderQueryKeys.my(), (old) => {
        if (!Array.isArray(old)) {
          return old;
        }
        return updater(old);
      });
    },
    [queryClient],
  );

  const handleConfirmDelivered = async ({ orderId, itemIndex }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    patchOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;
        const nextItems = order.items.map((item, index) => {
          const currentItemIndex =
            typeof item.itemIndex === "number" ? item.itemIndex : index;
          if (currentItemIndex !== itemIndex) return item;
          return { ...item, status: ORDER_STATUS_CONFIRMED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const { order: updatedOrder, pointsEarned } = await confirmItemMutation.mutateAsync({
        orderId,
        itemIndex,
      });
      if (pointsEarned > 0) {
        setLoyaltyFlash(MY_ORDERS_PAGE_UI.LOYALTY_POINTS_EARNED(pointsEarned));
      }
      patchOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      onQueueChanged?.();
      void reloadOrders();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void reloadOrders();
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleCancelItem = async ({ orderId, itemIndex }) => {
    if (!window.confirm(ORDER_CARD_UI.BUYER_CANCEL_CONFIRM)) {
      return;
    }

    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    patchOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;
        const nextItems = order.items.map((item, index) => {
          const currentItemIndex =
            typeof item.itemIndex === "number" ? item.itemIndex : index;
          if (currentItemIndex !== itemIndex) return item;
          return { ...item, status: ORDER_STATUS_CANCELLED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const updatedOrder = await cancelItemMutation.mutateAsync({ orderId, itemIndex });
      patchOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      onQueueChanged?.();
      void reloadOrders();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void reloadOrders();
    } finally {
      setPendingActionKey(null);
    }
  };

  const productDetailsShowAddToCart =
    catalogProduct != null &&
    !isCurrentUserProductSeller(catalogProduct, currentUserId);

  if (phase === "loading") {
    return <p className="my-orders-page__state">{MY_ORDERS_PAGE_UI.LOADING}</p>;
  }

  if (phase === "error") {
    return (
      <p className="my-orders-page__state my-orders-page__state_error" role="alert">
        {error}
      </p>
    );
  }

  if (orders.length === 0) {
    return <p className="my-orders-page__state">{MY_ORDERS_PAGE_UI.EMPTY}</p>;
  }

  return (
    <>
      {loyaltyFlash ? (
        <p className="my-orders-page__loyalty-flash" role="status">
          {loyaltyFlash}
        </p>
      ) : null}
      <ul className="my-orders-page__list" role="list">
        {orders.map((order) => (
          <li key={order._id} className="my-orders-page__item" role="listitem">
            <OrderCard
              order={order}
              onProductClick={openCatalogProductFromOrderLine}
              onConfirmDelivered={handleConfirmDelivered}
              onCancelItem={handleCancelItem}
              pendingActionKey={pendingActionKey}
              itemActionErrors={itemActionErrors}
            />
          </li>
        ))}
      </ul>
      {catalogProductPhase === "loading" ? (
        <p className="my-orders-page__product-loading" role="status">
          {MY_ORDERS_PAGE_UI.PRODUCT_DETAILS_LOADING}
        </p>
      ) : null}
      {catalogProductPhase === "error" ? (
        <p className="my-orders-page__product-error" role="alert">
          {catalogProductError}
        </p>
      ) : null}
      <ProductDetailsModal
        isOpen={catalogProduct != null}
        product={catalogProduct}
        onClose={closeCatalogProduct}
        onSellerNameClick={onSellerNameClick}
        isAuthorized={isAuthorized}
        onProductStatsUpdate={patchCatalogProduct}
        showAddToCart={productDetailsShowAddToCart}
        onRequestLogin={onRequestLogin}
        currentUserId={currentUserId}
      />
    </>
  );
}
