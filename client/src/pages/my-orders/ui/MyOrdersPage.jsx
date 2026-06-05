import { useCallback, useEffect, useState } from "react";

import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

import { fetchMyOrders } from "../../../entities/order/api/fetchMyOrders.js";
import { confirmOrderItem } from "../../../entities/order/api/updateOrderItemStatus.js";
import { ORDER_STATUS_CONFIRMED } from "../../../entities/order/model/constants.js";
import { OrderCard } from "../../../entities/order/ui/OrderCard.jsx";
import { isCurrentUserProductSeller } from "../../../entities/product/lib/isCurrentUserProductSeller.js";
import { useCatalogProductDetailsOpener } from "../../../entities/product/lib/useCatalogProductDetailsOpener.js";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import { API_CLIENT_UI, MY_ORDERS_PAGE_UI } from "../../../shared/config/appUiCopy.js";

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
  const [phase, setPhase] = useState("loading");
  const [orders, setOrders] = useState(
    /** @type {import('../../../entities/order/model/types.js').Order[]} */ ([]),
  );
  const [error, setError] = useState("");
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
    try {
      const list = await fetchMyOrders();
      setOrders(list);
      setPhase("success");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : API_CLIENT_UI.FETCH_MY_ORDERS_FALLBACK);
      setPhase("error");
    }
  }, []);

  useRefetchOnVisible(reloadOrders, phase === "success");

  useEffect(() => {
    if (!loyaltyFlash) return undefined;
    const timerId = window.setTimeout(() => setLoyaltyFlash(""), 4000);
    return () => window.clearTimeout(timerId);
  }, [loyaltyFlash]);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      try {
        const list = await fetchMyOrders();
        if (isCancelled) return;
        setOrders(list);
        setPhase("success");
      } catch (e) {
        if (isCancelled) return;
        setError(
          e instanceof Error ? e.message : API_CLIENT_UI.FETCH_MY_ORDERS_FALLBACK,
        );
        setPhase("error");
      }
    };

    void load();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleConfirmDelivered = async ({ orderId, itemIndex }) => {
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
          return { ...item, status: ORDER_STATUS_CONFIRMED };
        });
        return { ...order, items: nextItems };
      }),
    );

    try {
      const { order: updatedOrder, pointsEarned } = await confirmOrderItem(
        orderId,
        itemIndex,
      );
      if (pointsEarned > 0) {
        setLoyaltyFlash(MY_ORDERS_PAGE_UI.LOYALTY_POINTS_EARNED(pointsEarned));
      }
      setOrders((prev) =>
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
