import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { orderMatchesMyOrdersFilters } from "../../../entities/order/lib/filterMyOrders.js";
import { projectMyOrdersSellerBlocks } from "../../../entities/order/lib/projectMyOrdersSellerBlocks.js";
import { summarizeMyOrders } from "../../../entities/order/lib/summarizeMyOrders.js";
import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "../../../entities/order/model/myOrdersListFilters.js";
import { orderQueryKeys } from "../../../entities/order/model/orderQueryKeys.js";
import { useMyOrdersQuery } from "../../../entities/order/model/useMyOrdersQuery.js";
import { useOrderMutations } from "../../../entities/order/model/useOrderMutations.js";
import {
  useOpenShipmentDisputeMutation,
  useRaiseDeliveryFeeMutation,
  useReplaceShipmentCourierMutation,
} from "../../../entities/courier/model/courierQueries.js";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
} from "../../../entities/order/model/constants.js";
import { OrderCard } from "../../../entities/order/ui/OrderCard.jsx";
import { useCatalogProductDetailsOpener } from "../../../entities/product/lib/useCatalogProductDetailsOpener.js";
import {
  API_CLIENT_UI,
  MY_ORDERS_PAGE_UI,
  ORDER_CARD_UI,
} from "../../../shared/config/appUiCopy.js";
import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

import { MyOrdersPageOverview } from "./MyOrdersPageOverview.jsx";

import "./MyOrdersPage.css";
import "./MyOrdersPageOverview.css";

const EMPTY_ORDERS = [];

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onSellerNameClick?: (userId: string) => void;
 *   onQueueChanged?: () => void;
 * }} props
 */
export function MyOrdersPage({ isAuthorized, onSellerNameClick, onQueueChanged }) {
  const queryClient = useQueryClient();
  const { confirmItemMutation, cancelItemMutation, returnItemMutation } =
    useOrderMutations();
  const ordersQuery = useMyOrdersQuery({ enabled: isAuthorized });
  const allOrders = ordersQuery.data ?? EMPTY_ORDERS;
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const replaceCourierMutation = useReplaceShipmentCourierMutation();
  const openDisputeMutation = useOpenShipmentDisputeMutation();
  const raiseDeliveryFeeMutation = useRaiseDeliveryFeeMutation();
  const [pendingActionKey, setPendingActionKey] = useState(null);
  const [itemActionErrors, setItemActionErrors] = useState({});
  const [loyaltyFlash, setLoyaltyFlash] = useState("");

  const sellerBlocks = useMemo(
    () => projectMyOrdersSellerBlocks(allOrders),
    [allOrders],
  );
  const summary = useMemo(
    () => summarizeMyOrders(sellerBlocks.map((block) => block.order)),
    [sellerBlocks],
  );
  const filteredBlocks = useMemo(
    () =>
      sellerBlocks.filter((block) =>
        orderMatchesMyOrdersFilters(block.order, {
          status: statusFilter,
          attentionOnly,
        }),
      ),
    [sellerBlocks, statusFilter, attentionOnly],
  );

  const totalAll = sellerBlocks.length;
  const totalVisible = filteredBlocks.length;
  const hasFilters = Boolean(statusFilter) || attentionOnly;
  const summaryCountLabel = hasFilters
    ? MY_ORDERS_PAGE_UI.COUNT_FILTERED(totalVisible, totalAll)
    : MY_ORDERS_PAGE_UI.COUNT_ITEMS(totalAll);

  const phase = ordersQuery.isPending
    ? "loading"
    : ordersQuery.isError
      ? "error"
      : "success";
  const error =
    ordersQuery.error instanceof Error
      ? ordersQuery.error.message
      : API_CLIENT_UI.FETCH_MY_ORDERS_FALLBACK;
  const isRefreshing = ordersQuery.isFetching;

  const { openCatalogProductFromOrderLine } = useCatalogProductDetailsOpener();

  const reloadOrders = useCallback(async () => {
    await ordersQuery.refetch();
    onQueueChanged?.();
  }, [ordersQuery, onQueueChanged]);

  useRefetchOnVisible(reloadOrders, phase === "success" && isAuthorized);

  useEffect(() => {
    if (!loyaltyFlash) return undefined;
    const timerId = window.setTimeout(() => setLoyaltyFlash(""), 4000);
    return () => window.clearTimeout(timerId);
  }, [loyaltyFlash]);

  const handleInProgressFilterClick = useCallback(() => {
    setStatusFilter(MY_ORDERS_LIST_FILTER_IN_PROGRESS);
    setAttentionOnly(false);
  }, []);

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

  /**
   * Отказ покупателя от уже отправленного товара: у двери, на выдаче.
   * До этого в статусе «Отправлен» у него не было ни одной кнопки.
   */
  const handleRefuseItem = async ({ orderId, itemIndex }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    try {
      const updatedOrder = await returnItemMutation.mutateAsync({ orderId, itemIndex });
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

  const emptyMessage =
    totalAll === 0
      ? MY_ORDERS_PAGE_UI.EMPTY
      : hasFilters
        ? MY_ORDERS_PAGE_UI.EMPTY_BY_FILTER
        : MY_ORDERS_PAGE_UI.EMPTY;

  const overview = (
    <MyOrdersPageOverview
      inProgressCount={summary.inProgressCount}
      attentionCount={summary.attentionCount}
      totalAmountRub={summary.totalAmountRub}
      attentionOnly={attentionOnly}
      onInProgressFilterClick={handleInProgressFilterClick}
      onAttentionFilterChange={setAttentionOnly}
    />
  );

  const attentionFilterHint =
    totalVisible > 0 && attentionOnly ? (
      <p className="my-orders-page__filter-hint">{MY_ORDERS_PAGE_UI.ATTENTION_FILTER_HINT}</p>
    ) : null;

  const toolbar = (
    <OrdersToolbar
      summaryCountLabel={summaryCountLabel}
      statusFilter={statusFilter}
      onStatusFilterChange={(value) => {
        setStatusFilter(value);
        if (value) {
          setAttentionOnly(false);
        }
      }}
      onRefresh={() => {
        void reloadOrders();
      }}
      isRefreshing={isRefreshing}
    />
  );

  if (phase === "loading") {
    return (
      <div className="my-orders-page">
        {toolbar}
        {overview}
        <p className="my-orders-page__state">{MY_ORDERS_PAGE_UI.LOADING}</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="my-orders-page">
        {toolbar}
        {overview}
        <p className="my-orders-page__state my-orders-page__state_error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  /**
   * Покупатель поднимает сумму, если заказ долго никто не берёт. Снижать
   * нельзя: курьер мог уже согласиться на объявленную цену.
   */
  const handleRaiseDeliveryFee = async ({ orderId, deliveryFeeRub }) => {
    const actionKey = `${orderId}:shipment`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));
    try {
      const block = sellerBlocks.find((row) => row.order._id === orderId);
      await raiseDeliveryFeeMutation.mutateAsync({
        orderId,
        sellerId: block?.sellerId,
        deliveryFeeRub,
      });
      void reloadOrders();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
    } finally {
      setPendingActionKey(null);
    }
  };

  /**
   * Товар уже у курьера, а курьер пропал. Дальше разбирается модератор:
   * вернуть заказ в общий список нельзя — неизвестно, где товар.
   */
  const handleOpenDispute = async ({ orderId }) => {
    const actionKey = `${orderId}:shipment`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));
    try {
      const block = sellerBlocks.find((row) => row.order._id === orderId);
      await openDisputeMutation.mutateAsync({
        orderId,
        sellerId: block?.sellerId,
      });
      void reloadOrders();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
    } finally {
      setPendingActionKey(null);
    }
  };

  /**
   * Покупатель отказывается от назначенного курьера. Заказ вернётся в общий
   * список, а этот курьер по нему больше не появится.
   */
  const handleReplaceCourier = async ({ orderId }) => {
    const actionKey = `${orderId}:shipment`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));
    try {
      const block = sellerBlocks.find((row) => row.order._id === orderId);
      await replaceCourierMutation.mutateAsync({
        orderId,
        sellerId: block?.sellerId,
      });
      void reloadOrders();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
    } finally {
      setPendingActionKey(null);
    }
  };

  return (
    <div className="my-orders-page">
      {toolbar}
      {overview}
      {attentionFilterHint}
      {loyaltyFlash ? (
        <p className="my-orders-page__loyalty-flash" role="status">
          {loyaltyFlash}
        </p>
      ) : null}
      {totalVisible === 0 ? (
        <p className="my-orders-page__state">{emptyMessage}</p>
      ) : (
        <ul className="my-orders-page__list" role="list">
          {filteredBlocks.map((block) => (
            <li key={block.blockKey} className="my-orders-page__item" role="listitem">
              <OrderCard
                order={block.order}
                compact
                showSeller
                onSellerNameClick={onSellerNameClick}
                onProductClick={openCatalogProductFromOrderLine}
                onConfirmDelivered={handleConfirmDelivered}
                onCancelItem={handleCancelItem}
                onMarkReturned={handleRefuseItem}
                onReplaceCourier={handleReplaceCourier}
                onOpenDispute={handleOpenDispute}
                onRaiseDeliveryFee={handleRaiseDeliveryFee}
                onCourierNameClick={onSellerNameClick}
                pendingActionKey={pendingActionKey}
                itemActionErrors={itemActionErrors}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const ORDERS_STATUS_FILTER_OPTIONS = [
  { value: "", label: MY_ORDERS_PAGE_UI.STATUS_FILTER_ALL },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL_RU[status],
  })),
];

/**
 * @param {{
 *   summaryCountLabel: string;
 *   statusFilter: string;
 *   onStatusFilterChange: (value: string) => void;
 *   onRefresh?: () => void;
 *   isRefreshing?: boolean;
 * }} props
 */
function OrdersToolbar({
  summaryCountLabel,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  isRefreshing = false,
}) {
  return (
    <div className="my-orders-page__toolbar">
      <div className="my-orders-page__toolbar-head">
        <h3 className="my-orders-page__heading">{MY_ORDERS_PAGE_UI.TITLE}</h3>
        <div className="my-orders-page__toolbar-meta">
          <span className="my-orders-page__count">{summaryCountLabel}</span>
          {typeof onRefresh === "function" ? (
            <button
              type="button"
              className="my-orders-page__refresh"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-busy={isRefreshing}
            >
              {MY_ORDERS_PAGE_UI.REFRESH}
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="my-orders-page__status-chips"
        role="group"
        aria-label={MY_ORDERS_PAGE_UI.STATUS_FILTER_LABEL}
      >
        {ORDERS_STATUS_FILTER_OPTIONS.map((option) => {
          const isActive = statusFilter === option.value;

          return (
            <button
              key={option.value || "all"}
              type="button"
              className={[
                "my-orders-page__status-chip",
                isActive ? "my-orders-page__status-chip_active" : "",
                option.value ? `my-orders-page__status-chip_${option.value}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isActive}
              onClick={() => onStatusFilterChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
