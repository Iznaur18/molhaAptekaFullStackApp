import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { filterMySales } from "../../../entities/order/lib/filterMySales.js";
import { summarizeMySales } from "../../../entities/order/lib/summarizeMySales.js";
import { MY_ORDERS_LIST_FILTER_IN_PROGRESS } from "../../../entities/order/model/myOrdersListFilters.js";
import { orderQueryKeys } from "../../../entities/order/model/orderQueryKeys.js";
import { normalizeTotalSalesCount } from "../../../entities/user/lib/formatSearchRowTotalSalesCount.js";
import { useMySalesQuery } from "../../../entities/order/model/useMySalesQuery.js";
import { useOrderMutations } from "../../../entities/order/model/useOrderMutations.js";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUSES,
  SALES_ORDER_STATUS_LABEL_RU,
} from "../../../entities/order/model/constants.js";
import {
  useIssueHandoverCodeMutation,
  useOpenShipmentDisputeMutation,
  useReplaceShipmentCourierMutation,
  useSetShipmentPaymentConfirmedMutation,
} from "../../../entities/courier/model/courierQueries.js";
import { OrderCard } from "../../../entities/order/ui/OrderCard.jsx";
import { useCatalogProductDetailsOpener } from "../../../entities/product/lib/useCatalogProductDetailsOpener.js";
import {
  API_CLIENT_UI,
  MY_SALES_PAGE_UI,
  ORDER_CARD_UI,
} from "../../../shared/config/appUiCopy.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";
import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";
import { SearchInput } from "../../../shared/ui/SearchInput/SearchInput.jsx";

import { MySalesPageOverview } from "./MySalesPageOverview.jsx";

import "./MySalesPage.css";
import "./MySalesPageOverview.css";
import { resolveOrderLineSellerId } from "@izibuy/shared-lib";

const EMPTY_ORDERS = [];

/**
 * Чей это заказ со стороны продавца.
 *
 * Массив отправлений приходит целиком, включая чужие, поэтому `shipments[0]`
 * в смешанном заказе указывал не туда. Позиции же продавцу приходят только
 * его собственные — по ним и определяем.
 *
 * @param {{ items?: Array<Record<string, unknown>> } | null | undefined} order
 */
const resolveSaleSellerId = (order) =>
  order?.items?.length ? resolveOrderLineSellerId(order.items[0]) : "";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   totalSalesCount?: number;
 *   onSellerNameClick?: (userId: string) => void;
 *   onQueueChanged?: () => void;
 * }} props
 */
export function MySalesPage({
  isAuthorized,
  totalSalesCount = 0,
  onSellerNameClick,
  onQueueChanged,
}) {
  const [statusFilter, setStatusFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(
    searchTerm,
    MY_SALES_PAGE_UI.SEARCH_DEBOUNCE_MS,
  );
  const isSearchPending = searchTerm !== debouncedSearchTerm;
  const hasSearchQuery = debouncedSearchTerm.trim() !== "";

  const queryClient = useQueryClient();
  const {
    cancelItemMutation,
    shipItemMutation,
    advanceShipmentMutation,
    deliverItemMutation,
    returnItemMutation,
  } = useOrderMutations();
  const { openCatalogProductFromOrderLine } = useCatalogProductDetailsOpener();
  const issueCodeMutation = useIssueHandoverCodeMutation();
  const replaceCourierMutation = useReplaceShipmentCourierMutation();
  const openDisputeMutation = useOpenShipmentDisputeMutation();
  const confirmPaymentMutation = useSetShipmentPaymentConfirmedMutation();
  /** Выданный код держим в памяти страницы: сервер его больше не отдаст. */
  const [issuedCodes, setIssuedCodes] = useState(
    /** @type {Record<string, string>} */ ({}),
  );
  const [pendingActionKey, setPendingActionKey] = useState(null);
  const [itemActionErrors, setItemActionErrors] = useState({});

  const sellerTotalSalesCount = useMemo(
    () => normalizeTotalSalesCount(totalSalesCount),
    [totalSalesCount],
  );

  const serverStatusFilter =
    statusFilter === MY_ORDERS_LIST_FILTER_IN_PROGRESS ? "" : statusFilter;

  const salesParams = useMemo(
    () => ({
      ...(serverStatusFilter ? { status: serverStatusFilter } : {}),
      ...(hasSearchQuery ? { search: debouncedSearchTerm.trim() } : {}),
    }),
    [serverStatusFilter, hasSearchQuery, debouncedSearchTerm],
  );

  const overviewQuery = useMySalesQuery({ enabled: isAuthorized });
  const salesQuery = useMySalesQuery({
    status: salesParams.status,
    search: salesParams.search,
    enabled: isAuthorized,
  });

  const allOrders = overviewQuery.data?.orders ?? EMPTY_ORDERS;
  const serverOrders = salesQuery.data?.orders ?? EMPTY_ORDERS;
  const summary = useMemo(() => summarizeMySales(allOrders), [allOrders]);
  const filteredOrders = useMemo(
    () => filterMySales(serverOrders, { statusFilter, attentionOnly }),
    [serverOrders, statusFilter, attentionOnly],
  );

  const totalServer = serverOrders.length;
  const totalVisible = filteredOrders.length;
  const hasClientFilters =
    statusFilter === MY_ORDERS_LIST_FILTER_IN_PROGRESS || attentionOnly;
  const hasFilters = Boolean(serverStatusFilter) || hasSearchQuery || hasClientFilters;
  const summaryCountLabel = hasFilters
    ? MY_SALES_PAGE_UI.COUNT_FILTERED(totalVisible, totalServer)
    : MY_SALES_PAGE_UI.COUNT_ITEMS(totalServer);

  const phase = salesQuery.isPending
    ? "loading"
    : salesQuery.isError
      ? "error"
      : "success";
  const error =
    salesQuery.error instanceof Error
      ? salesQuery.error.message
      : API_CLIENT_UI.FETCH_MY_SALES_FALLBACK;
  const isRefreshing = salesQuery.isFetching || overviewQuery.isFetching;

  const reloadSales = useCallback(async () => {
    await Promise.all([salesQuery.refetch(), overviewQuery.refetch()]);
    onQueueChanged?.();
  }, [salesQuery, overviewQuery, onQueueChanged]);

  useRefetchOnVisible(reloadSales, phase === "success");

  const handleInProgressFilterClick = useCallback(() => {
    setStatusFilter(MY_ORDERS_LIST_FILTER_IN_PROGRESS);
    setAttentionOnly(false);
  }, []);

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
      queryClient.setQueryData(orderQueryKeys.sales({}), (old) => {
        if (!old || typeof old !== "object" || !("orders" in old)) {
          return old;
        }
        return {
          ...old,
          orders: updater(/** @type {{ orders: import('../../../entities/order/model/types.js').Order[] }} */ (old).orders),
        };
      });
    },
    [queryClient, salesParams],
  );

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

  /**
   * Двигает отправление целиком, поэтому ключ действия — на заказ, а не на
   * позицию: кнопка одна, и блокировать надо её.
   */
  const handleAdvanceShipment = async ({ orderId, nextStatus }) => {
    const actionKey = `${orderId}:shipment`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    try {
      const updatedOrder = await advanceShipmentMutation.mutateAsync({
        orderId,
        nextStatus,
      });
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

  /**
   * Продавец выдаёт код курьеру. Код показывается один раз и живьём —
   * это и есть доказательство, что оба стоят рядом.
   */
  const handleIssueHandoverCode = async ({ orderId }) => {
    const actionKey = `${orderId}:shipment`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));
    try {
      const order = filteredOrders.find((row) => row._id === orderId);
      const sellerId = resolveSaleSellerId(order);
      const result = await issueCodeMutation.mutateAsync({ orderId, sellerId });
      setIssuedCodes((prev) => ({ ...prev, [orderId]: result.code }));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
    } finally {
      setPendingActionKey(null);
    }
  };

  /**
   * Товар уже у курьера, а курьер пропал: дальше разбирается модератор.
   * Остаток при этом не возвращается на витрину — неизвестно, где товар.
   */
  const handleOpenDispute = async ({ orderId }) => {
    const actionKey = `${orderId}:shipment`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));
    try {
      const order = filteredOrders.find((row) => row._id === orderId);
      const updatedOrder = await openDisputeMutation.mutateAsync({
        orderId,
        sellerId: resolveSaleSellerId(order),
      });
      patchOrders((prev) =>
        prev.map((row) => (row._id === orderId ? updatedOrder.order ?? row : row)),
      );
      void reloadSales();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
    } finally {
      setPendingActionKey(null);
    }
  };

  /**
   * Отказ от назначенного курьера. Заказ возвращается в общий список, а этот
   * курьер по нему больше не появится.
   */
  const handleReplaceCourier = async ({ orderId }) => {
    const actionKey = `${orderId}:shipment`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));
    try {
      const order = filteredOrders.find((row) => row._id === orderId);
      const sellerId = resolveSaleSellerId(order);
      const updatedOrder = await replaceCourierMutation.mutateAsync({
        orderId,
        sellerId,
      });
      patchOrders((prev) =>
        prev.map((row) => (row._id === orderId ? updatedOrder.order ?? row : row)),
      );
      void reloadSales();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
    } finally {
      setPendingActionKey(null);
    }
  };

  /** Продавец подтверждает, что перевод от покупателя дошёл. */
  const handleConfirmPayment = async ({ orderId }) => {
    const actionKey = `${orderId}:shipment`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));
    try {
      const order = filteredOrders.find((row) => row._id === orderId);
      await confirmPaymentMutation.mutateAsync({
        orderId,
        sellerId: resolveSaleSellerId(order),
        confirmed: true,
      });
      void reloadSales();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : API_CLIENT_UI.UPDATE_ORDER_STATUS_FALLBACK;
      setItemActionErrors((prev) => ({ ...prev, [actionKey]: message }));
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleMarkReturned = async ({ orderId, itemIndex }) => {
    // Возврат виден покупателю уведомлением — подтверждаем намерение.
    const actionKey = `${orderId}:${itemIndex}`;
    setPendingActionKey(actionKey);
    setItemActionErrors((prev) => ({ ...prev, [actionKey]: "" }));

    try {
      const updatedOrder = await returnItemMutation.mutateAsync({ orderId, itemIndex });
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

  const emptyMessage = hasSearchQuery
    ? MY_SALES_PAGE_UI.EMPTY_BY_SEARCH
    : hasFilters
      ? MY_SALES_PAGE_UI.EMPTY_BY_FILTER
      : MY_SALES_PAGE_UI.EMPTY;

  const overview = (
    <MySalesPageOverview
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
      <p className="my-sales-page__filter-hint">{MY_SALES_PAGE_UI.ATTENTION_FILTER_HINT}</p>
    ) : null;

  const toolbar = (
    <SalesToolbar
      summaryCountLabel={summaryCountLabel}
      totalSalesCount={sellerTotalSalesCount}
      statusFilter={statusFilter}
      onStatusFilterChange={(value) => {
        setStatusFilter(value);
        if (value) {
          setAttentionOnly(false);
        }
      }}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      isSearchPending={isSearchPending}
      onRefresh={() => {
        void reloadSales();
      }}
      isRefreshing={isRefreshing}
    />
  );

  if (phase === "loading") {
    return (
      <div className="my-sales-page">
        {toolbar}
        {overview}
        <p className="my-sales-page__state">{MY_SALES_PAGE_UI.LOADING}</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="my-sales-page">
        {toolbar}
        {overview}
        <p className="my-sales-page__state my-sales-page__state_error" role="alert">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="my-sales-page">
      {toolbar}
      {overview}
      {attentionFilterHint}
      {totalVisible === 0 ? (
        <p className="my-sales-page__state">{emptyMessage}</p>
      ) : (
        <ul className="my-sales-page__list" role="list">
          {filteredOrders.map((order) => (
            <li key={order._id} className="my-sales-page__item" role="listitem">
              <OrderCard
                order={order}
                compact
                attentionRole="seller"
                showBuyer
                onBuyerNameClick={onSellerNameClick}
                onProductClick={openCatalogProductFromOrderLine}
                onAdvanceShipment={handleAdvanceShipment}
                onIssueHandoverCode={handleIssueHandoverCode}
                onReplaceCourier={handleReplaceCourier}
                onOpenDispute={handleOpenDispute}
                onCourierNameClick={onSellerNameClick}
                onConfirmPayment={handleConfirmPayment}
                issuedHandoverCode={issuedCodes[order._id] ?? ""}
                onMarkShipped={handleMarkShipped}
                onMarkDelivered={handleMarkDelivered}
                onMarkReturned={handleMarkReturned}
                onCancelItem={handleCancelItem}
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

const SALES_STATUS_FILTER_OPTIONS = [
  { value: "", label: MY_SALES_PAGE_UI.STATUS_FILTER_ALL },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: SALES_ORDER_STATUS_LABEL_RU[status],
  })),
];

/**
 * @param {{
 *   summaryCountLabel: string;
 *   totalSalesCount: number;
 *   statusFilter: string;
 *   onStatusFilterChange: (value: string) => void;
 *   searchTerm: string;
 *   onSearchTermChange: (value: string) => void;
 *   isSearchPending: boolean;
 *   onRefresh?: () => void;
 *   isRefreshing?: boolean;
 * }} props
 */
function SalesToolbar({
  summaryCountLabel,
  totalSalesCount,
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchTermChange,
  isSearchPending,
  onRefresh,
  isRefreshing = false,
}) {
  return (
    <div className="my-sales-page__toolbar">
      <div className="my-sales-page__toolbar-head">
        <h3 className="my-sales-page__heading">{MY_SALES_PAGE_UI.TITLE}</h3>
        <div className="my-sales-page__toolbar-meta">
          <span className="my-sales-page__total-sales-count">
            {MY_SALES_PAGE_UI.TOTAL_SALES_COUNT(totalSalesCount)}
          </span>
          <div className="my-sales-page__toolbar-meta-row">
            <span className="my-sales-page__count">{summaryCountLabel}</span>
            {typeof onRefresh === "function" ? (
              <button
                type="button"
                className="my-sales-page__refresh"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-busy={isRefreshing}
              >
                {MY_SALES_PAGE_UI.REFRESH}
              </button>
            ) : null}
          </div>
        </div>
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
