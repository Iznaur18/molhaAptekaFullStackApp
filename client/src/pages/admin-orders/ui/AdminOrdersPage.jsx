import { useCallback, useEffect, useState } from "react";

import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

import { fetchAllOrders } from "../../../entities/order/api/fetchAllOrders.js";
import { updateOrderStatus } from "../../../entities/order/api/updateOrderStatus.js";
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

const useAllOrders = (statusFilter) => {
  const [phase, setPhase] = useState("loading");
  const [orders, setOrders] = useState(
    /** @type {import('../../../entities/order/model/types.js').Order[]} */ ([]),
  );
  const [error, setError] = useState("");

  const reloadOrders = useCallback(async () => {
    try {
      const { orders: list } = await fetchAllOrders({
        limit: ADMIN_ORDERS_PAGE_UI.PAGE_LIMIT,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setOrders(list);
      setPhase("success");
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : API_CLIENT_UI.FETCH_ALL_ORDERS_FALLBACK,
      );
      setPhase("error");
    }
  }, [statusFilter]);

  useRefetchOnVisible(reloadOrders, phase === "success");

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setPhase("loading");
      try {
        const { orders: list } = await fetchAllOrders({
          limit: ADMIN_ORDERS_PAGE_UI.PAGE_LIMIT,
          ...(statusFilter ? { status: statusFilter } : {}),
        });
        if (isCancelled) return;
        setOrders(list);
        setPhase("success");
      } catch (e) {
        if (isCancelled) return;
        setError(
          e instanceof Error ? e.message : API_CLIENT_UI.FETCH_ALL_ORDERS_FALLBACK,
        );
        setPhase("error");
      }
    };

    void load();
    return () => {
      isCancelled = true;
    };
  }, [statusFilter]);

  return { phase, orders, error, setOrders };
};

export function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const { phase, orders, error, setOrders } = useAllOrders(statusFilter);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [statusError, setStatusError] = useState({});

  const handleStatusChange = async (orderId, nextStatus) => {
    setPendingOrderId(orderId);
    setStatusError((prev) => ({ ...prev, [orderId]: "" }));
    try {
      const updated = await updateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updated : order)),
      );
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
      <div className="admin-orders-page__filter">
        <label className="admin-orders-page__filter-label">
          <span>{ADMIN_ORDERS_PAGE_UI.STATUS_FILTER_LABEL}</span>
          <select
            className="admin-orders-page__filter-control"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value={ALL_STATUSES}>
              {ADMIN_ORDERS_PAGE_UI.STATUS_FILTER_ALL}
            </option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABEL_RU[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

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
      <p
        className="admin-orders-page__state admin-orders-page__state_error"
        role="alert"
      >
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
