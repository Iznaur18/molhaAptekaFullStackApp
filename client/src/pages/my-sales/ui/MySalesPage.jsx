import { useEffect, useState } from "react";

import { fetchMySales } from "../../../entities/order/api/fetchMySales.js";
import {
  markOrderItemDelivered,
  markOrderItemShipped,
} from "../../../entities/order/api/updateOrderItemStatus.js";
import {
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
} from "../../../entities/order/model/constants.js";
import { OrderCard } from "../../../entities/order/ui/OrderCard.jsx";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import {
  API_CLIENT_UI,
  MY_SALES_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";

import "./MySalesPage.css";

/**
 * @param {{ onSellerNameClick?: (userId: string) => void }} [props]
 */
export function MySalesPage({ onSellerNameClick }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(
    searchTerm,
    MY_SALES_PAGE_UI.SEARCH_DEBOUNCE_MS,
  );
  const isSearchPending = searchTerm !== debouncedSearchTerm;
  const hasSearchQuery = debouncedSearchTerm.trim() !== "";
  const [phase, setPhase] = useState("loading");
  const [orders, setOrders] = useState(
    /** @type {import('../../../entities/order/model/types.js').Order[]} */ ([]),
  );
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pendingActionKey, setPendingActionKey] = useState(null);
  const [itemActionErrors, setItemActionErrors] = useState({});

  const reloadSales = async () => {
    const list = await fetchMySales({
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(hasSearchQuery ? { search: debouncedSearchTerm.trim() } : {}),
    });
    setOrders(list);
  };

  useEffect(() => {
    let isCancelled = false;
    setPhase("loading");

    const load = async () => {
      try {
        const list = await fetchMySales({
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(hasSearchQuery ? { search: debouncedSearchTerm.trim() } : {}),
        });
        if (isCancelled) return;
        setOrders(list);
        setPhase("success");
      } catch (e) {
        if (isCancelled) return;
        setError(
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.FETCH_MY_SALES_FALLBACK,
        );
        setPhase("error");
      }
    };

    void load();
    return () => {
      isCancelled = true;
    };
  }, [statusFilter, debouncedSearchTerm, hasSearchQuery]);

  const handleMarkDelivered = async ({ orderId, itemIndex }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    setOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;
        const nextItems = order.items.map((item, index) => {
          const currentItemIndex =
            typeof item.itemIndex === "number" ? item.itemIndex : index;
          if (currentItemIndex !== itemIndex) return item;
          return { ...item, status: ORDER_STATUS_DELIVERED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const updatedOrder = await markOrderItemDelivered(orderId, itemIndex);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      void reloadSales();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void reloadSales();
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleMarkShipped = async ({ orderId, itemIndex }) => {
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    setOrders((prev) =>
      prev.map((order) => {
        if (order._id !== orderId) return order;
        const nextItems = order.items.map((item, index) => {
          const currentItemIndex =
            typeof item.itemIndex === "number" ? item.itemIndex : index;
          if (currentItemIndex !== itemIndex) return item;
          return { ...item, status: ORDER_STATUS_SHIPPED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const updatedOrder = await markOrderItemShipped(orderId, itemIndex);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      void reloadSales();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      void reloadSales();
    } finally {
      setPendingActionKey(null);
    }
  };

  if (phase === "loading") {
    return <p className="my-sales-page__state">{MY_SALES_PAGE_UI.LOADING}</p>;
  }

  if (phase === "error") {
    return (
      <p className="my-sales-page__state my-sales-page__state_error" role="alert">
        {error}
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-sales-page">
        <SalesFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          isSearchPending={isSearchPending}
        />
        <p className="my-sales-page__state">
          {hasSearchQuery
            ? MY_SALES_PAGE_UI.EMPTY_BY_SEARCH
            : statusFilter
              ? MY_SALES_PAGE_UI.EMPTY_BY_FILTER
              : MY_SALES_PAGE_UI.EMPTY}
        </p>
      </div>
    );
  }

  return (
    <div className="my-sales-page">
      <SalesFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        isSearchPending={isSearchPending}
      />
      <ul className="my-sales-page__list" role="list">
        {orders.map((order) => (
          <li key={order._id} className="my-sales-page__item" role="listitem">
            <OrderCard
              order={order}
              showBuyer
              onProductClick={setSelectedProduct}
              onMarkShipped={handleMarkShipped}
              onMarkDelivered={handleMarkDelivered}
              pendingActionKey={pendingActionKey}
              itemActionErrors={itemActionErrors}
            />
          </li>
        ))}
      </ul>
      <ProductDetailsModal
        isOpen={selectedProduct != null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSellerNameClick={onSellerNameClick}
      />
    </div>
  );
}

function SalesFilters({
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchTermChange,
  isSearchPending,
}) {
  return (
    <div className="my-sales-page__filters">
      <label className="my-sales-page__filter-label">
        <span>{MY_SALES_PAGE_UI.STATUS_FILTER_LABEL}</span>
        <select
          className="my-sales-page__filter-control"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          <option value="">{MY_SALES_PAGE_UI.STATUS_FILTER_ALL}</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABEL_RU[status]}
            </option>
          ))}
        </select>
      </label>
      <div className="my-sales-page__search">
        <SearchInput
          value={searchTerm}
          onChange={onSearchTermChange}
          placeholder={MY_SALES_PAGE_UI.SEARCH_PLACEHOLDER}
          ariaLabel={MY_SALES_PAGE_UI.SEARCH_LABEL}
          clearAriaLabel={MY_SALES_PAGE_UI.SEARCH_LABEL}
          pendingAriaLabel={MY_SALES_PAGE_UI.SEARCH_LABEL}
          isPending={isSearchPending}
        />
      </div>
    </div>
  );
}
