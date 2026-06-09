import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { orderQueryKeys } from "../../../entities/order/model/orderQueryKeys.js";
import { useMySalesQuery } from "../../../entities/order/model/useMySalesQuery.js";
import { useOrderMutations } from "../../../entities/order/model/useOrderMutations.js";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
} from "../../../entities/order/model/constants.js";
import { OrderCard } from "../../../entities/order/ui/OrderCard.jsx";
import { useCatalogProductDetailsOpener } from "../../../entities/product/lib/useCatalogProductDetailsOpener.js";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import {
  API_CLIENT_UI,
  MY_SALES_PAGE_UI,
  ORDER_CARD_UI,
} from "../../../shared/config/appUiCopy.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";
import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";

import "./MySalesPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   currentUserId?: string | null;
 *   onSellerNameClick?: (userId: string) => void;
 *   onQueueChanged?: () => void;
 * }} props
 */
export function MySalesPage({
  isAuthorized,
  currentUserId = null,
  onSellerNameClick,
  onQueueChanged,
}) {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(
    searchTerm,
    MY_SALES_PAGE_UI.SEARCH_DEBOUNCE_MS,
  );
  const isSearchPending = searchTerm !== debouncedSearchTerm;
  const hasSearchQuery = debouncedSearchTerm.trim() !== "";

  const queryClient = useQueryClient();
  const { cancelItemMutation, shipItemMutation, deliverItemMutation } = useOrderMutations();
  const {
    catalogProduct,
    openCatalogProductFromOrderLine,
    closeCatalogProduct,
    patchCatalogProduct,
  } = useCatalogProductDetailsOpener();
  const [pendingActionKey, setPendingActionKey] = useState(null);
  const [itemActionErrors, setItemActionErrors] = useState({});

  const salesParams = useMemo(
    () => ({
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(hasSearchQuery ? { search: debouncedSearchTerm.trim() } : {}),
    }),
    [statusFilter, hasSearchQuery, debouncedSearchTerm],
  );

  const salesQuery = useMySalesQuery({
    status: salesParams.status,
    search: salesParams.search,
    enabled: isAuthorized,
  });
  const orders = salesQuery.data?.orders ?? [];
  const phase = salesQuery.isPending
    ? "loading"
    : salesQuery.isError
      ? "error"
      : "success";
  const error =
    salesQuery.error instanceof Error
      ? salesQuery.error.message
      : API_CLIENT_UI.FETCH_MY_SALES_FALLBACK;

  const reloadSales = useCallback(async () => {
    await salesQuery.refetch();
  }, [salesQuery]);

  useRefetchOnVisible(reloadSales, phase === "success");

  const patchOrders = useCallback(
    (/** @type {(orders: import('../../../entities/order/model/types.js').Order[]) => import('../../../entities/order/model/types.js').Order[]} */ updater) => {
      queryClient.setQueryData(orderQueryKeys.sales(salesParams), (old) => {
        const page = Array.isArray(old)
          ? {
              orders: old,
              total: old.length,
              page: 1,
              limit: old.length || 20,
            }
          : (old ?? { orders: [], total: 0, page: 1, limit: 20 });

        return {
          ...page,
          orders: updater(page.orders),
        };
      });
    },
    [queryClient, salesParams],
  );

  const handleCancelItem = async ({ orderId, itemIndex }) => {
    if (!window.confirm(ORDER_CARD_UI.CANCEL_CONFIRM)) {
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
      void reloadSales();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      try {
        await reloadSales();
      } catch {
        /* откат списка не критичен при 429 после серии ошибок */
      }
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleMarkDelivered = async ({ orderId, itemIndex }) => {
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
          return { ...item, status: ORDER_STATUS_DELIVERED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const updatedOrder = await deliverItemMutation.mutateAsync({ orderId, itemIndex });
      patchOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      onQueueChanged?.();
      void reloadSales();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      try {
        await reloadSales();
      } catch {
        /* откат списка не критичен при 429 после серии ошибок */
      }
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleMarkShipped = async ({ orderId, itemIndex }) => {
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
          return { ...item, status: ORDER_STATUS_SHIPPED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const updatedOrder = await shipItemMutation.mutateAsync({ orderId, itemIndex });
      patchOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      onQueueChanged?.();
      void reloadSales();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
      try {
        await reloadSales();
      } catch {
        /* откат списка не критичен при 429 после серии ошибок */
      }
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

  const emptyMessage = hasSearchQuery
    ? MY_SALES_PAGE_UI.EMPTY_BY_SEARCH
    : statusFilter
      ? MY_SALES_PAGE_UI.EMPTY_BY_FILTER
      : MY_SALES_PAGE_UI.EMPTY;

  if (orders.length === 0) {
    return (
      <div className="my-sales-page">
        <SalesToolbar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          isSearchPending={isSearchPending}
          ordersCount={0}
        />
        <p className="my-sales-page__state">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="my-sales-page">
      <SalesToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        isSearchPending={isSearchPending}
        ordersCount={orders.length}
      />
      <ul className="my-sales-page__list" role="list">
        {orders.map((order) => (
          <li key={order._id} className="my-sales-page__item" role="listitem">
            <OrderCard
              order={order}
              compact
              showBuyer
              onBuyerNameClick={onSellerNameClick}
              onProductClick={openCatalogProductFromOrderLine}
              onMarkShipped={handleMarkShipped}
              onMarkDelivered={handleMarkDelivered}
              onCancelItem={handleCancelItem}
              pendingActionKey={pendingActionKey}
              itemActionErrors={itemActionErrors}
            />
          </li>
        ))}
      </ul>
      <ProductDetailsModal
        isOpen={catalogProduct != null}
        product={catalogProduct}
        onClose={closeCatalogProduct}
        onSellerNameClick={onSellerNameClick}
        isAuthorized={isAuthorized}
        onProductStatsUpdate={patchCatalogProduct}
        currentUserId={currentUserId}
      />
    </div>
  );
}

const SALES_STATUS_FILTER_OPTIONS = [
  { value: "", label: MY_SALES_PAGE_UI.STATUS_FILTER_ALL },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL_RU[status],
  })),
];

/**
 * @param {{
 *   statusFilter: string;
 *   onStatusFilterChange: (value: string) => void;
 *   searchTerm: string;
 *   onSearchTermChange: (value: string) => void;
 *   isSearchPending: boolean;
 *   ordersCount: number;
 * }} props
 */
function SalesToolbar({
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchTermChange,
  isSearchPending,
  ordersCount,
}) {
  return (
    <div className="my-sales-page__toolbar">
      <div className="my-sales-page__toolbar-head">
        <h3 className="my-sales-page__heading">{MY_SALES_PAGE_UI.TITLE}</h3>
        <span className="my-sales-page__count">{MY_SALES_PAGE_UI.COUNT(ordersCount)}</span>
      </div>

      <div
        className="my-sales-page__status-chips"
        role="group"
        aria-label={MY_SALES_PAGE_UI.STATUS_FILTER_LABEL}
      >
        {SALES_STATUS_FILTER_OPTIONS.map((option) => {
          const isActive = statusFilter === option.value;

          return (
            <button
              key={option.value || "all"}
              type="button"
              className={[
                "my-sales-page__status-chip",
                isActive ? "my-sales-page__status-chip_active" : "",
                option.value ? `my-sales-page__status-chip_${option.value}` : "",
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
