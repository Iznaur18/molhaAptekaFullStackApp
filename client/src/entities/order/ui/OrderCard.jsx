import { resolveOrderShippingTrackingUrl } from "@molha/api-contract";
import { useState } from "react";

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
import { ORDER_STATUS_RETURNED } from "../model/constants.js";
import { resolveOrderStatusLabelRu } from "../lib/resolveOrderStatusLabelRu.js";
import { resolveOrderSellers } from "../lib/resolveOrderSellers.js";
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
import { resolveOrderLineAffiliateSellerLine } from "../lib/resolveOrderLineAffiliateSellerLine.js";
import { BuyerPassportSharePanel } from "../../installment/ui/BuyerPassportSharePanel.jsx";
import { formatIsoDateTime } from "../../../shared/lib/formatIsoDateTime.js";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import {
  formatRuPhoneDisplayOrEmpty,
  toRuPhoneTelHref,
} from "../../user/lib/ruPhone.js";

import "./OrderCard.css";

const formatPaymentMethod = (method) =>
  ORDER_PAYMENT_METHOD_LABEL_RU[method] ?? method ?? COMMON_UI.EM_DASH;

const formatCounterparty = (user) => {
  if (user == null || typeof user === "string") return COMMON_UI.EM_DASH;
  return user.userName?.trim() || user.email || COMMON_UI.EM_DASH;
};

/**
 * @param {{
 *   user: { _id?: string; userName?: string; email?: string; userPhoneNumber?: string } | string | null | undefined;
 *   onNameClick?: (userId: string) => void;
 * }} props
 */
function renderCounterpartyValue(user, onNameClick) {
  if (user == null || typeof user === "string") {
    return COMMON_UI.EM_DASH;
  }
  const label = formatCounterparty(user);
  const canLink = typeof onNameClick === "function" && user._id != null;
  const phoneDisplay = formatRuPhoneDisplayOrEmpty(user.userPhoneNumber);
  const phoneHref = toRuPhoneTelHref(user.userPhoneNumber);

  return (
    <span className="order-card__counterparty">
      {canLink ? (
        <button
          type="button"
          className="order-card__buyer-link"
          onClick={() => onNameClick(String(user._id))}
        >
          {label}
        </button>
      ) : (
        <span className="order-card__counterparty-name">{label}</span>
      )}
      {phoneHref ? (
        <a className="order-card__counterparty-phone" href={phoneHref}>
          {phoneDisplay}
        </a>
      ) : phoneDisplay ? (
        <span className="order-card__counterparty-phone-text">{phoneDisplay}</span>
      ) : null}
    </span>
  );
}

/**
 * @param {{
 *   order: import("../model/types.js").Order;
 *   showBuyer?: boolean;
 *   showSeller?: boolean;
 *   onBuyerNameClick?: (userId: string) => void;
 *   onSellerNameClick?: (userId: string) => void;
 *   isInstallmentOrder: boolean;
 * }} props
 */
function OrderCardMeta({
  order,
  showBuyer = false,
  showSeller = false,
  onBuyerNameClick,
  onSellerNameClick,
  isInstallmentOrder,
}) {
  const trackingUrl = order.shippingTrackingNumber
    ? resolveOrderShippingTrackingUrl(order)
    : null;
  const sellers = showSeller ? resolveOrderSellers(order) : [];

  return (
    <dl className="order-card__meta">
      {showBuyer ? (
        <div className="order-card__meta-row">
          <dt>{ORDER_CARD_UI.BUYER_LABEL}</dt>
          <dd>{renderCounterpartyValue(order.userBuyerId, onBuyerNameClick)}</dd>
        </div>
      ) : null}
      {showSeller ? (
        <div className="order-card__meta-row">
          <dt>{ORDER_CARD_UI.SELLER_LABEL}</dt>
          <dd>
            {sellers.length === 0
              ? COMMON_UI.EM_DASH
              : sellers.map((seller, index) => (
                  <span key={seller._id}>
                    {index > 0 ? ", " : null}
                    {renderCounterpartyValue(seller, onSellerNameClick)}
                  </span>
                ))}
          </dd>
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
      {order.shippingTrackingNumber ? (
        <div className="order-card__meta-row">
          <dt>{ORDER_CARD_UI.TRACKING_LABEL}</dt>
          <dd>
            {trackingUrl ? (
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                {order.shippingTrackingNumber}
              </a>
            ) : (
              order.shippingTrackingNumber
            )}
          </dd>
        </div>
      ) : null}
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
 *   onMarkReturned?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
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
  onMarkReturned,
  buyerUserId,
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
  // Возврат оформляется, пока покупатель не подтвердил получение: товар уже
  // уехал, но сделка не состоялась — отказ у двери, неудачное вручение.
  const canMarkReturned =
    item.status === ORDER_STATUS_SHIPPED || item.status === ORDER_STATUS_DELIVERED;
  // Для продавца «клиент отказался» и «я принял назад» — разные ситуации:
  // в первом случае товар ещё едет обратно.
  const returnedByLabel =
    item.status === ORDER_STATUS_RETURNED && item.returnedBy
      ? String(item.returnedBy) === String(buyerUserId)
        ? ORDER_CARD_UI.ITEM_RETURNED_BY_BUYER
        : ORDER_CARD_UI.ITEM_RETURNED_BY_SELLER
      : "";
  const deliveredAtText = item.deliveredAt ? formatIsoDateTime(item.deliveredAt) : "";
  const confirmedAtText = item.confirmedAt ? formatIsoDateTime(item.confirmedAt) : "";
  const loyaltyPoints = Math.floor(Number(item.loyaltyPointsPerUnitAtOrder));
  const productName = resolveOrderLineItemProductName(item);
  const affiliateSellerLine = resolveOrderLineAffiliateSellerLine({
    item,
    attentionRole,
  });
  const showPrimary = !showSecondaryOnly;
  const showSecondary = !compact || showSecondaryOnly;

  if (showSecondaryOnly) {
    const hasSecondary =
      itemsCount > 1 ||
      loyaltyPoints > 0 ||
      deliveredAtText ||
      confirmedAtText ||
      Boolean(affiliateSellerLine);

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
        {affiliateSellerLine ? (
          <span
            className="order-card__item-affiliate"
            aria-label={ORDER_CARD_UI.AFFILIATE_LINE_ARIA}
          >
            {affiliateSellerLine}
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
        {returnedByLabel ? (
          <span className="order-card__item-timestamp">
            {ORDER_CARD_UI.ITEM_RETURNED_AT_LABEL}: {returnedByLabel}
          </span>
        ) : null}
      </div>
    );
  }

  const hasItemActions =
    (canMarkShipped && (onMarkShipped || onCancelItem)) ||
    (canMarkDelivered && onMarkDelivered) ||
    (canConfirmDelivered && onConfirmDelivered) ||
    (canMarkReturned && onMarkReturned);

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
            {compact ? null : (
              <>
                <span className="order-card__item-quantity">×{item.quantity}</span>
                <span className="order-card__item-price">
                  {formatPriceRub(item.unitPriceAtOrder)}
                </span>
              </>
            )}
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
            {affiliateSellerLine ? (
              <span
                className="order-card__item-affiliate"
                aria-label={ORDER_CARD_UI.AFFILIATE_LINE_ARIA}
              >
                {affiliateSellerLine}
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
        {compact && affiliateSellerLine ? (
          <span
            className="order-card__item-affiliate"
            aria-label={ORDER_CARD_UI.AFFILIATE_LINE_ARIA}
          >
            {affiliateSellerLine}
          </span>
        ) : null}
      </div>
      {hasItemActions || actionError ? (
        <div className="order-card__item-actions-row">
          {canMarkShipped && (onMarkShipped || onCancelItem) ? (
            <>
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
          {canMarkReturned && onMarkReturned ? (
            <button
              type="button"
              className="order-card__item-action-button order-card__item-action-button_cancel"
              onClick={() => onMarkReturned({ orderId, itemIndex })}
              disabled={isActionPending}
            >
              {isActionPending
                ? ORDER_CARD_UI.ACTION_PENDING
                : attentionRole === "seller"
                  ? ORDER_CARD_UI.ACTION_RETURN
                  : ORDER_CARD_UI.ACTION_REFUSE}
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
 *   showSeller?: boolean;
 *   statusSlot?: import('react').ReactNode;
 *   onProductClick?: (item: import('../model/types.js').OrderLineItem) => void;
 *   onMarkShipped?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onMarkDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onMarkReturned?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onCancelItem?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   onConfirmDelivered?: (ctx: { orderId: string; itemIndex: number }) => void | Promise<void>;
 *   pendingActionKey?: string | null;
 *   itemActionErrors?: Record<string, string>;
 *   onBuyerNameClick?: (userId: string) => void;
 *   onSellerNameClick?: (userId: string) => void;
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
  showSeller = false,
  compact = false,
  statusSlot = null,
  onProductClick,
  onMarkShipped,
  onMarkDelivered,
  onMarkReturned,
  onCancelItem,
  onConfirmDelivered,
  pendingActionKey = null,
  itemActionErrors = {},
  onBuyerNameClick,
  onSellerNameClick,
  collapsible = false,
  expanded = true,
  onExpandedChange,
  attentionRole = "buyer",
}) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const isInstallmentOrder = Boolean(order.installmentContractId);
  const isAuctionOrder = Boolean(order.priceOfferId);
  const isExpanded = !collapsible || expanded;
  const needsAttention =
    attentionRole === "seller"
      ? orderNeedsSellerAttention(order)
      : orderNeedsBuyerAttention(order);
  const collapsedPreview =
    attentionRole === "seller"
      ? resolveSellerOrderCollapsedPreview(order)
      : resolveOrderCollapsedPreview(order);

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
    onMarkReturned,
    onCancelItem,
    onConfirmDelivered,
    buyerUserId: order.userBuyerId?._id ?? order.userBuyerId,
    pendingActionKey,
    itemActionErrors,
    attentionRole,
  };

  const totalQuantity = order.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );

  const expandedBody = (
    <>
      {compact ? null : (
        <>
          <OrderCardMeta
            order={order}
            showBuyer={showBuyer}
            showSeller={showSeller}
            onBuyerNameClick={onBuyerNameClick}
            onSellerNameClick={onSellerNameClick}
            isInstallmentOrder={isInstallmentOrder}
          />
          {showBuyer && order.buyerPassportShare ? (
            <BuyerPassportSharePanel share={order.buyerPassportShare} />
          ) : null}
        </>
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
        <div
          className={[
            "order-card__details-fold",
            detailsExpanded ? "order-card__details-fold_open" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            type="button"
            className="order-card__details-fold-summary"
            aria-expanded={detailsExpanded}
            onClick={() => setDetailsExpanded((value) => !value)}
          >
            {ORDER_CARD_UI.DETAILS_FOLD_SUMMARY}
          </button>
          <div
            className={[
              "order-card__details-fold-panel",
              detailsExpanded ? "order-card__details-fold-panel_open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="order-card__details-fold-panel-inner">
              <div className="order-card__details-fold-body">
                <OrderCardMeta
                  order={order}
                  showBuyer={showBuyer}
                  showSeller={showSeller}
                  onBuyerNameClick={onBuyerNameClick}
                  onSellerNameClick={onSellerNameClick}
                  isInstallmentOrder={isInstallmentOrder}
                />
                {showBuyer && order.buyerPassportShare ? (
                  <BuyerPassportSharePanel share={order.buyerPassportShare} />
                ) : null}
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
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <article
      className={[
        "order-card",
        compact ? "order-card--compact" : "",
        collapsible ? "order-card--collapsible" : "",
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
        <div className="order-card__header-totals">
          {compact && totalQuantity > 0 ? (
            <span className="order-card__quantity">×{totalQuantity}</span>
          ) : null}
          <span className="order-card__total">{formatPriceRub(order.totalAmount)}</span>
        </div>
      </header>

      {collapsible ? (
        <div className="order-card__collapsible-region">
          {collapsedPreview ? (
            <div
              className={[
                "order-card__fold",
                !isExpanded ? "order-card__fold_open" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden={isExpanded}
              inert={isExpanded ? true : undefined}
            >
              <div className="order-card__fold-inner">
                <p className="order-card__collapsed-preview">{collapsedPreview}</p>
              </div>
            </div>
          ) : null}
          <div
            className={[
              "order-card__fold",
              isExpanded ? "order-card__fold_open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden={!isExpanded}
            inert={!isExpanded ? true : undefined}
          >
            <div className="order-card__fold-inner order-card__fold-inner_body">
              {expandedBody}
            </div>
          </div>
        </div>
      ) : (
        expandedBody
      )}

      {statusSlot ? <footer className="order-card__footer">{statusSlot}</footer> : null}
    </article>
  );
}
