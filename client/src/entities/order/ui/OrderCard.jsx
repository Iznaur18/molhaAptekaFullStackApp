import {
  ORDER_STATUS_PENDING,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_STATUS_LABEL_RU,
} from "../model/constants.js";
import {
  COMMON_UI,
  ORDER_CARD_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import "./OrderCard.css";

const formatPaymentMethod = (method) =>
  ORDER_PAYMENT_METHOD_LABEL_RU[method] ?? method ?? COMMON_UI.EM_DASH;

const formatStatus = (status) =>
  ORDER_STATUS_LABEL_RU[status] ?? status ?? COMMON_UI.EM_DASH;

const formatBuyer = (buyer) => {
  if (buyer == null || typeof buyer === "string") return COMMON_UI.EM_DASH;
  return buyer.userName?.trim() || buyer.email || COMMON_UI.EM_DASH;
};

/**
 * @param {{
 *   buyer: import("../model/types.js").Order["userBuyerId"];
 *   onBuyerNameClick?: (userId: string) => void;
 * }} props
 */
function renderBuyerValue(buyer, onBuyerNameClick) {
  if (buyer == null || typeof buyer === "string") {
    return COMMON_UI.EM_DASH;
  }
  const label = formatBuyer(buyer);
  const canLink =
    typeof onBuyerNameClick === "function" && buyer._id != null;

  if (canLink) {
    return (
      <button
        type="button"
        className="order-card__buyer-link"
        onClick={() => onBuyerNameClick(String(buyer._id))}
      >
        {label}
      </button>
    );
  }
  return label;
}

const formatProductName = (productId) => {
  if (productId == null || typeof productId === "string") return COMMON_UI.EM_DASH;
  return productId.productName?.trim() || COMMON_UI.EM_DASH;
};

/**
 * @param {{
 *   order: import('../model/types.js').Order;
 *   showBuyer?: boolean;
 *   statusSlot?: import('react').ReactNode;
 *   onProductClick?: (product: import('../../product/model/types.js').ProductFromApi) => void;
 *   onMarkShipped?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onMarkDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onConfirmDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   pendingActionKey?: string | null;
 *   itemActionErrors?: Record<string, string>;
 *   onBuyerNameClick?: (userId: string) => void;
 * }} props
 */
export function OrderCard({
  order,
  showBuyer = false,
  statusSlot = null,
  onProductClick,
  onMarkShipped,
  onMarkDelivered,
  onConfirmDelivered,
  pendingActionKey = null,
  itemActionErrors = {},
  onBuyerNameClick,
}) {
  return (
    <article className="order-card">
      <header className="order-card__header">
        <span className={`order-card__status order-card__status_${order.status}`}>
          {formatStatus(order.status)}
        </span>
        <span className="order-card__total">
          {formatPriceRub(order.totalAmount)}
        </span>
      </header>

      <dl className="order-card__meta">
        {showBuyer ? (
          <div className="order-card__meta-row">
            <dt>{ORDER_CARD_UI.BUYER_LABEL}</dt>
            <dd>{renderBuyerValue(order.userBuyerId, onBuyerNameClick)}</dd>
          </div>
        ) : null}
        <div className="order-card__meta-row">
          <dt>{ORDER_CARD_UI.CREATED_LABEL}</dt>
          <dd>{formatIsoDateTime(order.createdAt)}</dd>
        </div>
        <div className="order-card__meta-row">
          <dt>{ORDER_CARD_UI.ADDRESS_LABEL}</dt>
          <dd>{order.deliveryAddress || COMMON_UI.EM_DASH}</dd>
        </div>
        <div className="order-card__meta-row">
          <dt>{ORDER_CARD_UI.PAYMENT_LABEL}</dt>
          <dd>{formatPaymentMethod(order.paymentMethod)}</dd>
        </div>
      </dl>

      <h3 className="order-card__items-heading">
        {ORDER_CARD_UI.ITEMS_HEADING}
      </h3>
      <ul className="order-card__items" role="list">
        {order.items.map((item, index) => {
          const itemIndex =
            typeof item.itemIndex === "number" ? item.itemIndex : index;
          const actionKey = `${order._id}:${itemIndex}`;
          const isActionPending = pendingActionKey === actionKey;
          const actionError = itemActionErrors[actionKey] ?? "";
          const canMarkShipped = item.status === ORDER_STATUS_PENDING;
          const canMarkDelivered = item.status === ORDER_STATUS_SHIPPED;
          const canConfirmDelivered = item.status === ORDER_STATUS_DELIVERED;
          const deliveredAtText = item.deliveredAt
            ? formatIsoDateTime(item.deliveredAt)
            : "";
          const confirmedAtText = item.confirmedAt
            ? formatIsoDateTime(item.confirmedAt)
            : "";

          return (
          <li
            key={`${order._id}-${index}`}
            className="order-card__item"
            role="listitem"
          >
            {item.productId != null && typeof item.productId === "object" ? (
              <button
                type="button"
                className="order-card__item-name-button"
                onClick={() => onProductClick?.(item.productId)}
              >
                {formatProductName(item.productId)}
              </button>
            ) : (
              <span className="order-card__item-name">
                {formatProductName(item.productId)}
              </span>
            )}
            <span className="order-card__item-quantity">×{item.quantity}</span>
            <span className="order-card__item-price">
              {formatPriceRub(item.unitPriceAtOrder)}
            </span>
            <span className="order-card__item-status">
              {ORDER_CARD_UI.ITEM_STATUS_LABEL}: {formatStatus(item.status)}
            </span>
            {deliveredAtText ? (
              <span className="order-card__item-timestamp">
                {ORDER_CARD_UI.ITEM_DELIVERED_AT_LABEL}: {deliveredAtText}
              </span>
            ) : null}
            {confirmedAtText ? (
              <span className="order-card__item-timestamp">
                {ORDER_CARD_UI.ITEM_CONFIRMED_AT_LABEL}: {confirmedAtText}
              </span>
            ) : null}
            {canMarkShipped && onMarkShipped ? (
              <button
                type="button"
                className="order-card__item-action-button"
                onClick={() =>
                  onMarkShipped({ orderId: order._id, itemIndex })
                }
                disabled={isActionPending}
              >
                {isActionPending
                  ? ORDER_CARD_UI.ACTION_PENDING
                  : ORDER_CARD_UI.ACTION_SHIPPED}
              </button>
            ) : null}
            {canMarkDelivered && onMarkDelivered ? (
              <button
                type="button"
                className="order-card__item-action-button"
                onClick={() =>
                  onMarkDelivered({ orderId: order._id, itemIndex })
                }
                disabled={isActionPending}
              >
                {isActionPending
                  ? ORDER_CARD_UI.ACTION_PENDING
                  : ORDER_CARD_UI.ACTION_DELIVERED}
              </button>
            ) : null}
            {canConfirmDelivered && onConfirmDelivered ? (
              <button
                type="button"
                className="order-card__item-action-button"
                onClick={() =>
                  onConfirmDelivered({ orderId: order._id, itemIndex })
                }
                disabled={isActionPending}
              >
                {isActionPending
                  ? ORDER_CARD_UI.ACTION_PENDING
                  : ORDER_CARD_UI.ACTION_CONFIRM}
              </button>
            ) : null}
            {actionError ? (
              <span className="order-card__item-action-error" role="alert">
                {actionError}
              </span>
            ) : null}
          </li>
          );
        })}
      </ul>

      {statusSlot ? (
        <footer className="order-card__footer">{statusSlot}</footer>
      ) : null}
    </article>
  );
}
