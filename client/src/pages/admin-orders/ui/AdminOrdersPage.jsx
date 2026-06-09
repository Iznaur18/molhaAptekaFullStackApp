import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

import { useOrderMutations } from "../../../entities/order/model/useOrderMutations.js";
import { orderQueryKeys } from "../../../entities/order/model/orderQueryKeys.js";
import { useAllOrdersQuery } from "../../../entities/order/model/useAllOrdersQuery.js";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
} from "../../../entities/order/model/constants.js";
import { OrderCard } from "../../../entities/order/ui/OrderCard.jsx";
import { OrderStatusSelect } from "../../../features/admin-order-status/ui/OrderStatusSelect.jsx";
import {
  ADMIN_ORDERS_PAGE_UI,
  API_CLIENT_UI,
} from "../../../shared/config/appUiCopy.js";

import "./AdminOrdersPage.css";

const ALL_STATUSES = "";

const ADMIN_ORDERS_STATUS_FILTER_OPTIONS = [
  { value: ALL_STATUSES, label: ADMIN_ORDERS_PAGE_UI.STATUS_FILTER_ALL },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL_RU[status],
  })),
];

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { updateStatusMutation } = useOrderMutations();
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const queryParams = {
    limit: ADMIN_ORDERS_PAGE_UI.PAGE_LIMIT,
    ...(statusFilter ? { status: statusFilter } : {}),
  };
  const ordersQuery = useAllOrdersQuery(queryParams);
  const orders = ordersQuery.data?.orders ?? [];
  const phase = ordersQuery.isPending
    ? "loading"
    : ordersQuery.isError
      ? "error"
      : "success";
  const error =
    ordersQuery.error instanceof Error
      ? ordersQuery.error.message
      : API_CLIENT_UI.FETCH_ALL_ORDERS_FALLBACK;

  const reloadOrders = useCallback(async () => {
    await ordersQuery.refetch();
  }, [ordersQuery]);

  useRefetchOnVisible(reloadOrders, phase === "success");

  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [statusError, setStatusError] = useState({});

  const handleStatusChange = async (orderId, nextStatus) => {
    setPendingOrderId(orderId);
    setStatusError((prev) => ({ ...prev, [orderId]: "" }));
    try {
      const updated = await updateStatusMutation.mutateAsync({ orderId, status: nextStatus });
      queryClient.setQueryData(orderQueryKeys.admin(queryParams), (old) => {
        if (!old?.orders) {
          return old;
        }
        return {
          ...old,
          orders: old.orders.map((order) => (order._id === orderId ? updated : order)),
        };
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setStatusError((prev) => ({ ...prev, [orderId]: message }));
    } finally {
      setPendingOrderId(null);
    }
  };

  return (
    <div className="admin-orders-page">
      <AdminOrdersToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ordersCount={orders.length}
      />
      <AdminOrdersBody
        phase={phase}
        orders={orders}
        error={error}
        statusFilter={statusFilter}
        pendingOrderId={pendingOrderId}
        statusError={statusError}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

/**
 * @param {{
 *   statusFilter: string;
 *   onStatusFilterChange: (value: string) => void;
 *   ordersCount: number;
 * }} props
 */
function AdminOrdersToolbar({ statusFilter, onStatusFilterChange, ordersCount }) {
  return (
    <div className="admin-orders-page__toolbar">
      <div className="admin-orders-page__toolbar-head">
        <h3 className="admin-orders-page__heading">{ADMIN_ORDERS_PAGE_UI.TITLE}</h3>
        <span className="admin-orders-page__count">
          {ADMIN_ORDERS_PAGE_UI.COUNT(ordersCount)}
        </span>
      </div>

      <div
        className="admin-orders-page__status-chips"
        role="group"
        aria-label={ADMIN_ORDERS_PAGE_UI.STATUS_FILTER_LABEL}
      >
        {ADMIN_ORDERS_STATUS_FILTER_OPTIONS.map((option) => {
          const isActive = statusFilter === option.value;

          return (
            <button
              key={option.value || "all"}
              type="button"
              className={[
                "admin-orders-page__status-chip",
                isActive ? "admin-orders-page__status-chip_active" : "",
                option.value ? `admin-orders-page__status-chip_${option.value}` : "",
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

/**
 * @param {{
 *   phase: 'loading' | 'success' | 'error';
 *   orders: import('../../../entities/order/model/types.js').Order[];
 *   error: string;
 *   statusFilter: string;
 *   pendingOrderId: string | null;
 *   statusError: Record<string, string>;
 *   onStatusChange: (orderId: string, nextStatus: string) => void;
 * }} props
 */
function AdminOrdersBody({
  phase,
  orders,
  error,
  statusFilter,
  pendingOrderId,
  statusError,
  onStatusChange,
}) {
  if (phase === "loading") {
    return <p className="admin-orders-page__state">{ADMIN_ORDERS_PAGE_UI.LOADING}</p>;
  }

  if (phase === "error") {
    return (
      <p className="admin-orders-page__state admin-orders-page__state_error" role="alert">
        {error}
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="admin-orders-page__state">
        {statusFilter
          ? ADMIN_ORDERS_PAGE_UI.EMPTY_BY_FILTER
          : ADMIN_ORDERS_PAGE_UI.EMPTY}
      </p>
    );
  }

  return (
    <ul className="admin-orders-page__list" role="list">
      {orders.map((order) => (
        <li key={order._id} className="admin-orders-page__item" role="listitem">
          <OrderCard
            compact
            order={order}
            showBuyer
            statusSlot={
              <OrderStatusSelect
                value={order.status}
                isPending={pendingOrderId === order._id}
                error={statusError[order._id] ?? ""}
                onChange={(next) => onStatusChange(order._id, next)}
              />
            }
          />
        </li>
      ))}
    </ul>
  );
}
