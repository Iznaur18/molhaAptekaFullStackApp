import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { filterMyOrders } from "../../../entities/order/lib/filterMyOrders.js";
import {
  buildAttentionOrderIdsKey,
  mergeExpandedIdsFromKey,
} from "../../../entities/order/lib/expandedOrderIds.js";
import { orderNeedsBuyerAttention } from "../../../entities/order/lib/orderNeedsBuyerAttention.js";
import { summarizeMyOrders } from "../../../entities/order/lib/summarizeMyOrders.js";
import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "../../../entities/order/model/myOrdersListFilters.js";
import { orderQueryKeys } from "../../../entities/order/model/orderQueryKeys.js";
import { useMyOrdersQuery } from "../../../entities/order/model/useMyOrdersQuery.js";
import { useOrderMutations } from "../../../entities/order/model/useOrderMutations.js";
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
  const { confirmItemMutation, cancelItemMutation } = useOrderMutations();
  const ordersQuery = useMyOrdersQuery({ enabled: isAuthorized });
  const allOrders = ordersQuery.data ?? EMPTY_ORDERS;
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [pendingActionKey, setPendingActionKey] = useState(null);
  const [itemActionErrors, setItemActionErrors] = useState({});
  const [loyaltyFlash, setLoyaltyFlash] = useState("");

  const summary = useMemo(() => summarizeMyOrders(allOrders), [allOrders]);
  const attentionOrderIdsKey = useMemo(
    () => buildAttentionOrderIdsKey(allOrders, orderNeedsBuyerAttention),
    [allOrders],
  );
  const filteredOrders = useMemo(
    () => filterMyOrders(allOrders, { status: statusFilter, attentionOnly }),
    [allOrders, statusFilter, attentionOnly],
  );

  const totalAll = allOrders.length;
  const totalVisible = filteredOrders.length;
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

  useEffect(() => {
    setExpandedIds((prev) => mergeExpandedIdsFromKey(prev, attentionOrderIdsKey));
  }, [attentionOrderIdsKey]);

  const toggleExpanded = useCallback((orderId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(filteredOrders.map((order) => String(order._id))));
  }, [filteredOrders]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

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

  const listActions =
    totalVisible > 0 ? (
      <div className="my-orders-page__list-actions">
        <button type="button" className="my-orders-page__list-action" onClick={expandAll}>
          {MY_ORDERS_PAGE_UI.EXPAND_ALL}
        </button>
        <button type="button" className="my-orders-page__list-action" onClick={collapseAll}>
          {MY_ORDERS_PAGE_UI.COLLAPSE_ALL}
        </button>
        {attentionOnly ? (
          <p className="my-orders-page__filter-hint">{MY_ORDERS_PAGE_UI.ATTENTION_FILTER_HINT}</p>
        ) : null}
      </div>
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

  return (
    <div className="my-orders-page">
      {toolbar}
      {overview}
      {listActions}
      {loyaltyFlash ? (
        <p className="my-orders-page__loyalty-flash" role="status">
          {loyaltyFlash}
        </p>
      ) : null}
      {totalVisible === 0 ? (
        <p className="my-orders-page__state">{emptyMessage}</p>
      ) : (
        <ul className="my-orders-page__list" role="list">
          {filteredOrders.map((order) => {
            const orderId = String(order._id);
            return (
              <li key={order._id} className="my-orders-page__item" role="listitem">
                <OrderCard
                  order={order}
                  compact
                  collapsible
                  expanded={expandedIds.has(orderId)}
                  onExpandedChange={() => toggleExpanded(orderId)}
                  showSeller
                  onSellerNameClick={onSellerNameClick}
                  onProductClick={openCatalogProductFromOrderLine}
                  onConfirmDelivered={handleConfirmDelivered}
                  onCancelItem={handleCancelItem}
                  pendingActionKey={pendingActionKey}
                  itemActionErrors={itemActionErrors}
                />
              </li>
            );
          })}
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
