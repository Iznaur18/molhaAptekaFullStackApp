import {
  ORDER_STATUS_PENDING,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_SHIPPED,
  ORDER_PAYMENT_METHOD_LABEL_RU,
} from "../model/constants.js";
import {
  orderNeedsBuyerAttention,
  resolveOrderCollapsedPreview,
} from "../lib/orderNeedsBuyerAttention.js";
import {
  orderNeedsSellerAttention,
  resolveSellerOrderCollapsedPreview,
} from "../lib/orderNeedsSellerAttention.js";
import { resolveOrderStatusLabelRu } from "../lib/resolveOrderStatusLabelRu.js";
import {
  COMMON_UI,
  INSTALLMENT_UI,
  MY_ORDERS_PAGE_UI,
  ORDER_CARD_UI,
  PRODUCT_CARD_UI,
} from "../../../shared/config/appUiCopy.js";
import {
  isOrderLineItemProductClickable,
  resolveOrderLineItemProductName,
} from "../lib/resolveOrderLineItemProductName.js";
import { OrderCardLineItemThumb } from "./OrderCardLineItemThumb.jsx";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";

import "./OrderCard.css";

const formatPaymentMethod = (method) =>
  ORDER_PAYMENT_METHOD_LABEL_RU[method] ?? method ?? COMMON_UI.EM_DASH;

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
  const canLink = typeof onBuyerNameClick === "function" && buyer._id != null;

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

/**
 * @param {{
 *   order: import("../model/types.js").Order;
 *   showBuyer?: boolean;
 *   onBuyerNameClick?: (userId: string) => void;
 *   isInstallmentOrder: boolean;
 * }} props
 */
function OrderCardMeta({
  order,
  showBuyer = false,
  onBuyerNameClick,
  isInstallmentOrder,
}) {
  return (
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
      {isInstallmentOrder && order.installmentContract ? (
        <div className="order-card__meta-row">
          <dt>{INSTALLMENT_UI.CONTRACT_PLAN}</dt>
          <dd>
            {order.installmentContract.planTitle} ·{" "}
            {order.installmentContract.monthsCount} мес ×{" "}
            {formatPriceRub(order.installmentContract.monthlyPaymentRub)}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

/**
 * @param {{
 *   orderId: string;
 *   item: import("../model/types.js").OrderLineItem;
 *   index: number;
 *   compact?: boolean;
 *   showSecondaryOnly?: boolean;
 *   onProductClick?: (item: import("../model/types.js").OrderLineItem) => void;
 *   onMarkShipped?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onMarkDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onCancelItem?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onConfirmDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   pendingActionKey?: string | null;
 *   itemActionErrors?: Record<string, string>;
 *   itemsCount?: number;
 * }} props
 */
function OrderCardLineItem({
  orderId,
  item,
  index,
  compact = false,
  showSecondaryOnly = false,
  itemsCount = 1,
  onProductClick,
  onMarkShipped,
  onMarkDelivered,
  onCancelItem,
  onConfirmDelivered,
  pendingActionKey = null,
  itemActionErrors = {},
  attentionRole = "buyer",
}) {
  const itemIndex = typeof item.itemIndex === "number" ? item.itemIndex : index;
  const actionKey = `${orderId}:${itemIndex}`;
  const isActionPending = pendingActionKey === actionKey;
  const actionError = itemActionErrors[actionKey] ?? "";
  const canMarkShipped = item.status === ORDER_STATUS_PENDING;
  const canMarkDelivered = item.status === ORDER_STATUS_SHIPPED;
  const canConfirmDelivered = item.status === ORDER_STATUS_DELIVERED;
  const deliveredAtText = item.deliveredAt ? formatIsoDateTime(item.deliveredAt) : "";
  const confirmedAtText = item.confirmedAt ? formatIsoDateTime(item.confirmedAt) : "";
  const loyaltyPoints = Math.floor(Number(item.loyaltyPointsPerUnitAtOrder));
  const productName = resolveOrderLineItemProductName(item);
  const showPrimary = !showSecondaryOnly;
  const showSecondary = !compact || showSecondaryOnly;

  if (showSecondaryOnly) {
    const hasSecondary =
      itemsCount > 1 || loyaltyPoints > 0 || deliveredAtText || confirmedAtText;

    if (!hasSecondary) {
      return null;
    }

    return (
      <div className="order-card__item-extras">
        {itemsCount > 1 ? (
          <span className="order-card__item-extras-name">{productName}</span>
        ) : null}
        {loyaltyPoints > 0 ? (
          <span className="order-card__item-loyalty">
            {ORDER_CARD_UI.LOYALTY_POINTS_LINE(loyaltyPoints)}
            {item.quantity > 1
              ? ` · всего ${Math.floor(Number(item.loyaltyPointsReservedTotal) || 0)}`
              : ""}
          </span>
        ) : null}
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
      </div>
    );
  }

  const hasItemActions =
    (canMarkShipped && (onMarkShipped || onCancelItem)) ||
    (canMarkDelivered && onMarkDelivered) ||
    (canConfirmDelivered && onConfirmDelivered);

  return (
    <li className="order-card__item" role="listitem">
      <OrderCardLineItemThumb
        item={item}
        productName={productName}
        onProductClick={onProductClick}
      />
      <div className="order-card__item-body">
        {showPrimary ? (
          <div className="order-card__item-main">
            {isOrderLineItemProductClickable(item) ? (
              <button
                type="button"
                className="order-card__item-name-button"
                onClick={() => onProductClick?.(item)}
              >
                {productName}
              </button>
            ) : (
              <span className="order-card__item-name">{productName}</span>
            )}
            <span className="order-card__item-quantity">×{item.quantity}</span>
            <span className="order-card__item-price">
              {formatPriceRub(item.unitPriceAtOrder)}
            </span>
          </div>
        ) : null}
        {showSecondary && !compact ? (
          <>
            {loyaltyPoints > 0 ? (
              <span className="order-card__item-loyalty">
                {ORDER_CARD_UI.LOYALTY_POINTS_LINE(loyaltyPoints)}
                {item.quantity > 1
                  ? ` · всего ${Math.floor(Number(item.loyaltyPointsReservedTotal) || 0)}`
                  : ""}
              </span>
            ) : null}
            <span className="order-card__item-status">
              {ORDER_CARD_UI.ITEM_STATUS_LABEL}:{" "}
              {resolveOrderStatusLabelRu(item.status, attentionRole)}
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
          </>
        ) : null}
      </div>
      {hasItemActions || actionError ? (
        <div className="order-card__item-actions-row">
          {canMarkShipped && (onMarkShipped || onCancelItem) ? (
            <>
              {onMarkShipped ? (
                <button
                  type="button"
                  className="order-card__item-action-button"
                  onClick={() => onMarkShipped({ orderId, itemIndex })}
                  disabled={isActionPending}
                >
                  {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_SHIPPED}
                </button>
              ) : null}
              {onCancelItem ? (
                <button
                  type="button"
                  className="order-card__item-action-button order-card__item-action-button_cancel"
                  onClick={() => onCancelItem({ orderId, itemIndex })}
                  disabled={isActionPending}
                >
                  {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_CANCEL}
                </button>
              ) : null}
            </>
          ) : null}
          {canMarkDelivered && onMarkDelivered ? (
            <button
              type="button"
              className="order-card__item-action-button"
              onClick={() => onMarkDelivered({ orderId, itemIndex })}
              disabled={isActionPending}
            >
              {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_DELIVERED}
            </button>
          ) : null}
          {canConfirmDelivered && onConfirmDelivered ? (
            <button
              type="button"
              className="order-card__item-action-button"
              onClick={() => onConfirmDelivered({ orderId, itemIndex })}
              disabled={isActionPending}
            >
              {isActionPending ? ORDER_CARD_UI.ACTION_PENDING : ORDER_CARD_UI.ACTION_CONFIRM}
            </button>
          ) : null}
          {actionError ? (
            <span className="order-card__item-action-error" role="alert">
              {actionError}
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

/**
 * @param {{
 *   order: import('../model/types.js').Order;
 *   showBuyer?: boolean;
 *   statusSlot?: import('react').ReactNode;
 *   onProductClick?: (item: import('../model/types.js').OrderLineItem) => void;
 *   onMarkShipped?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onMarkDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onCancelItem?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onConfirmDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   pendingActionKey?: string | null;
 *   itemActionErrors?: Record<string, string>;
 *   onBuyerNameClick?: (userId: string) => void;
 *   compact?: boolean;
 *   collapsible?: boolean;
 *   expanded?: boolean;
 *   onExpandedChange?: (expanded: boolean) => void;
 *   attentionRole?: "buyer" | "seller";
 * }} props
 */
export function OrderCard({
  order,
  showBuyer = false,
  compact = false,
  statusSlot = null,
  onProductClick,
  onMarkShipped,
  onMarkDelivered,
  onCancelItem,
  onConfirmDelivered,
  pendingActionKey = null,
  itemActionErrors = {},
  onBuyerNameClick,
  collapsible = false,
  expanded = true,
  onExpandedChange,
  attentionRole = "buyer",
}) {
  const isInstallmentOrder = Boolean(order.installmentContractId);
  const isAuctionOrder = Boolean(order.priceOfferId);
  const isExpanded = !collapsible || expanded;
  const needsAttention =
    attentionRole === "seller"
      ? orderNeedsSellerAttention(order)
      : orderNeedsBuyerAttention(order);
  const collapsedPreview = !isExpanded
    ? attentionRole === "seller"
      ? resolveSellerOrderCollapsedPreview(order)
      : resolveOrderCollapsedPreview(order)
    : null;

  const toggleExpanded = () => {
    onExpandedChange?.(!expanded);
  };

  const lineItemProps = {
    orderId: order._id,
    compact,
    itemsCount: order.items.length,
    onProductClick,
    onMarkShipped,
    onMarkDelivered,
    onCancelItem,
    onConfirmDelivered,
    pendingActionKey,
    itemActionErrors,
    attentionRole,
  };

  return (
    <article
      className={[
        "order-card",
        compact ? "order-card--compact" : "",
        needsAttention ? "order-card_attention" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="order-card__header">
        <div className="order-card__header-main">
          <div className="order-card__header-badges">
            <span className={`order-card__status order-card__status_${order.status}`}>
              {resolveOrderStatusLabelRu(order.status, attentionRole)}
            </span>
            {isAuctionOrder ? (
              <span className="order-card__auction-badge">{PRODUCT_CARD_UI.AUCTION_BADGE}</span>
            ) : null}
            {isInstallmentOrder ? (
              <span className="order-card__installment-badge">{INSTALLMENT_UI.BADGE}</span>
            ) : null}
          </div>
          {collapsible ? (
            <button
              type="button"
              className="order-card__chevron-button"
              aria-label={MY_ORDERS_PAGE_UI.EXPAND_TOGGLE(isExpanded)}
              aria-expanded={isExpanded}
              onClick={toggleExpanded}
            >
              <span
                className={[
                  "order-card__chevron",
                  isExpanded ? "order-card__chevron_expanded" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              >
                ▸
              </span>
            </button>
          ) : null}
        </div>
        <span className="order-card__total">{formatPriceRub(order.totalAmount)}</span>
      </header>

      {collapsedPreview ? (
        <p className="order-card__collapsed-preview">{collapsedPreview}</p>
      ) : null}

      {isExpanded ? (
        <>
          {compact ? null : (
            <OrderCardMeta
              order={order}
              showBuyer={showBuyer}
              onBuyerNameClick={onBuyerNameClick}
              isInstallmentOrder={isInstallmentOrder}
            />
          )}

          <h3 className="order-card__items-heading">{ORDER_CARD_UI.ITEMS_HEADING}</h3>
          <ul className="order-card__items" role="list">
            {order.items.map((item, index) => (
              <OrderCardLineItem
                key={`${order._id}-${index}`}
                item={item}
                index={index}
                {...lineItemProps}
              />
            ))}
          </ul>

          {compact ? (
            <details className="order-card__details-fold">
              <summary className="order-card__details-fold-summary">
                {ORDER_CARD_UI.DETAILS_FOLD_SUMMARY}
              </summary>
              <div className="order-card__details-fold-body">
                <OrderCardMeta
                  order={order}
                  showBuyer={showBuyer}
                  onBuyerNameClick={onBuyerNameClick}
                  isInstallmentOrder={isInstallmentOrder}
                />
                {order.items.map((item, index) => (
                  <OrderCardLineItem
                    key={`${order._id}-extras-${index}`}
                    item={item}
                    index={index}
                    showSecondaryOnly
                    {...lineItemProps}
                  />
                ))}
              </div>
            </details>
          ) : null}
        </>
      ) : null}

      {statusSlot ? <footer className="order-card__footer">{statusSlot}</footer> : null}
    </article>
  );
}
