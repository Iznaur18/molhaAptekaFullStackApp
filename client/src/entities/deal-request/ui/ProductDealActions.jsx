import {
  isCartDealType,
  isSellerPhoneOpenBeforeRequest,
  normalizeCategoryDealType,
  resolveProductViewingSchedule,
} from "@molha/api-contract";
import { useCallback, useState } from "react";

import {
  PRODUCT_DEAL_ACTIONS_UI,
  PRODUCT_DEAL_TERMS_UI,
} from "../../../shared/config/appUiCopy.js";
import { fetchDealRequestSellerPhone } from "../api/dealRequestApi.js";
import { DealRequestSheet } from "./DealRequestSheet.jsx";

import "./ProductDealActions.css";

/**
 * Что покупатель делает в объявлении без корзины: записывается на осмотр или
 * оставляет заявку на услугу, а у осмотра ещё и видит телефон продавца.
 *
 * @param {{
 *   product: {
 *     _id: unknown;
 *     productDealType?: unknown;
 *     productServiceLocations?: unknown;
 *     productViewingSchedule?: unknown;
 *   };
 *   isAuthorized: boolean;
 *   isOwnProduct: boolean;
 *   onRequestLogin: () => void;
 *   variant?: "full" | "dock" | "details" | "card";
 * }} props
 *
 * `variant` — где стоит блок. Кнопки живут там же, где у товара «В корзину»:
 * на компьютере под ценой (`full`), на телефоне в нижней панели (`dock`). Под
 * ценой на телефоне остаются только условия (`details`). Форма заявки — в
 * окне, которое выезжает снизу.
 */
export function ProductDealActions({
  product,
  isAuthorized,
  isOwnProduct,
  onRequestLogin,
  variant = "full",
}) {
  const dealType = normalizeCategoryDealType(product?.productDealType);
  const productId = String(product?._id ?? "");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [phoneState, setPhoneState] = useState(
    /** @type {{ status: "idle" | "loading" | "ready" | "error"; phone?: string | null; message?: string }} */ ({
      status: "idle",
    }),
  );
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  if (isCartDealType(dealType) || isOwnProduct || !productId) {
    return null;
  }

  const isDock = variant === "dock";
  // Карточка в ленте: одна кнопка на месте «В корзину».
  const isCard = variant === "card";
  const isCompact = isDock || isCard;
  const showButtons = variant !== "details";
  const showTerms = !isCompact;
  const viewingSchedule = resolveProductViewingSchedule(product);
  // В карточке ленты телефона нет: места хватает на одну кнопку.
  const canShowPhone = !isCard && isSellerPhoneOpenBeforeRequest(dealType);

  const requireLogin = () => {
    if (isAuthorized) {
      return false;
    }
    onRequestLogin();
    return true;
  };

  const handleShowPhone = async () => {
    if (requireLogin()) {
      return;
    }
    setPhoneState({ status: "loading" });
    try {
      const phone = await fetchDealRequestSellerPhone(productId);
      setPhoneState({ status: "ready", phone });
    } catch (error) {
      setPhoneState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : PRODUCT_DEAL_ACTIONS_UI.PHONE_FALLBACK_ERROR,
      });
    }
  };

  const handleOpenSheet = () => {
    if (requireLogin()) {
      return;
    }
    setIsSheetOpen(true);
  };

  return (
    <div
      className={[
        "product-deal-actions",
        isDock ? "product-deal-actions_dock" : "",
        isCard ? "product-deal-actions_card" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Где оказывается услуга — во вкладке «Адрес», здесь только время осмотра. */}
      {showTerms && viewingSchedule ? (
        <dl className="product-deal-actions__terms">
          {viewingSchedule ? (
            <div>
              <dt>{PRODUCT_DEAL_TERMS_UI.VIEW_SCHEDULE}</dt>
              <dd>{viewingSchedule}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {showButtons ? (
        <div className="product-deal-actions__row">
          <button
            type="button"
            className="app-btn app-btn--primary product-deal-actions__button"
            onClick={handleOpenSheet}
            aria-label={PRODUCT_DEAL_ACTIONS_UI.REQUEST_BUTTON[dealType]}
          >
            {isCompact
              ? PRODUCT_DEAL_ACTIONS_UI.REQUEST_BUTTON_SHORT[dealType]
              : PRODUCT_DEAL_ACTIONS_UI.REQUEST_BUTTON[dealType]}
          </button>
          {canShowPhone && phoneState.status !== "ready" ? (
            <button
              type="button"
              className="app-btn app-btn--secondary product-deal-actions__button"
              disabled={phoneState.status === "loading"}
              onClick={() => void handleShowPhone()}
              aria-label={PRODUCT_DEAL_ACTIONS_UI.SHOW_PHONE}
            >
              {phoneState.status === "loading"
                ? PRODUCT_DEAL_ACTIONS_UI.PHONE_LOADING
                : isCompact
                  ? PRODUCT_DEAL_ACTIONS_UI.SHOW_PHONE_SHORT
                  : PRODUCT_DEAL_ACTIONS_UI.SHOW_PHONE}
            </button>
          ) : null}
          {phoneState.status === "ready" && phoneState.phone ? (
            <a
              className="app-btn app-btn--secondary product-deal-actions__button"
              href={`tel:${phoneState.phone}`}
              aria-label={PRODUCT_DEAL_ACTIONS_UI.PHONE_CALL_ARIA(phoneState.phone)}
            >
              {phoneState.phone}
            </a>
          ) : null}
        </div>
      ) : null}

      {showButtons && phoneState.status === "ready" && !phoneState.phone ? (
        <p className="product-deal-actions__hint">
          {PRODUCT_DEAL_ACTIONS_UI.PHONE_MISSING}
        </p>
      ) : null}
      {showButtons && phoneState.status === "error" ? (
        <p className="product-deal-actions__error" role="alert">
          {phoneState.message}
        </p>
      ) : null}
      {showTerms && !canShowPhone ? (
        <p className="product-deal-actions__hint">
          {PRODUCT_DEAL_ACTIONS_UI.SERVICE_PHONE_HINT}
        </p>
      ) : null}

      {showButtons ? (
        <DealRequestSheet
          isOpen={isSheetOpen}
          onClose={closeSheet}
          productId={productId}
          dealType={/** @type {"viewing" | "service"} */ (dealType)}
        />
      ) : null}
    </div>
  );
}
