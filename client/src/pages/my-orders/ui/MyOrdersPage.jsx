import { useEffect, useState } from "react";

import { fetchMyOrders } from "../../../entities/order/api/fetchMyOrders.js";
import { confirmOrderItem } from "../../../entities/order/api/updateOrderItemStatus.js";
import { ORDER_STATUS_CONFIRMED } from "../../../entities/order/model/constants.js";
import { OrderCard } from "../../../entities/order/ui/OrderCard.jsx";
import { ProductDetailsModal } from "../../../entities/product/ui/ProductDetailsModal.jsx";
import {
  API_CLIENT_UI,
  MY_ORDERS_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

import "./MyOrdersPage.css";

/**
 * @param {{ onSellerNameClick?: (userId: string) => void }} [props]
 */
export function MyOrdersPage({ onSellerNameClick }) {
  const [phase, setPhase] = useState("loading");
  const [orders, setOrders] = useState(
    /** @type {import('../../../entities/order/model/types.js').Order[]} */ ([]),
  );
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pendingActionKey, setPendingActionKey] = useState(null);
  const [itemActionErrors, setItemActionErrors] = useState({});

  const reloadOrders = async () => {
    const list = await fetchMyOrders();
    setOrders(list);
  };

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
          e instanceof Error
            ? e.message
            : API_CLIENT_UI.FETCH_MY_ORDERS_FALLBACK,
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
      const updatedOrder = await confirmOrderItem(orderId, itemIndex);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
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

  if (phase === "loading") {
    return <p className="my-orders-page__state">{MY_ORDERS_PAGE_UI.LOADING}</p>;
  }

  if (phase === "error") {
    return (
      <p
        className="my-orders-page__state my-orders-page__state_error"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (orders.length === 0) {
    return <p className="my-orders-page__state">{MY_ORDERS_PAGE_UI.EMPTY}</p>;
  }

  return (
    <>
      <ul className="my-orders-page__list" role="list">
        {orders.map((order) => (
          <li
            key={order._id}
            className="my-orders-page__item"
            role="listitem"
          >
            <OrderCard
              order={order}
              onProductClick={setSelectedProduct}
              onConfirmDelivered={handleConfirmDelivered}
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
    </>
  );
}
