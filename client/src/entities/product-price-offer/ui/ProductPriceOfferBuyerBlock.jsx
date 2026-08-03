import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { useMyPriceOfferQuery } from "../model/useMyPriceOfferQuery.js";
import { usePriceOfferMutations } from "../model/usePriceOfferMutations.js";
import {
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_PENDING,
} from "../model/constants.js";
import { getProductPriceRubMaxError } from "../../product/lib/productPriceRubValidation.js";
import { HOME_MAIN_VIEW_PATH } from "../../../shared/lib/homeMainViewPaths.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  formatIntegerGroupRu,
  formatRubPriceInput,
  parseRubPriceInput,
} from "../../../shared/lib/numericInput.js";
import { PRODUCT_PRICE_OFFER_UI } from "../../../shared/config/appUiCopy.js";
import {
  AccountRequirementModal,
  useAccountRequirementModal,
} from "../../../shared/ui/AccountRequirementModal/index.js";
import { useAppShellCompactLayout } from "../../../shared/lib/useAppShellCompactLayout.js";
import { useProductDetailsPageDockHost } from "../../../shared/lib/productDetailsPageDockHostContext.js";

import { ProductPriceOfferHintMessage } from "./ProductPriceOfferHintMessage.jsx";
import { ProductPriceOfferSectionTitle } from "./ProductPriceOfferSectionTitle.jsx";
import { ProductPriceOfferTopList } from "./ProductPriceOfferTopList.jsx";

import "./ProductPriceOffer.css";

/**
 * @param {{
 *   productId: string;
 *   isAuthorized: boolean;
 *   isUserDataConfirmed: boolean;
 *   isOwnProduct: boolean;
 *   top: import('../model/types.js').PriceOfferTopEntry[];
 *   onOpenBuyer?: (userId: string) => void;
 *   onRequestLogin?: () => void;
 *   onOffersChanged?: () => void;
 *   onCloseModal?: () => void;
 * }} props
 */
export function ProductPriceOfferBuyerBlock({
  productId,
  isAuthorized,
  isUserDataConfirmed,
  isOwnProduct,
  top,
  onOpenBuyer,
  onRequestLogin,
  onOffersChanged,
  onCloseModal,
}) {
  const navigate = useNavigate();
  const myOfferQueryEnabled = isAuthorized && !isOwnProduct;
  const myOfferQuery = useMyPriceOfferQuery({
    productId,
    enabled: myOfferQueryEnabled,
  });
  const { submitMutation, patchMutation, cancelMutation } =
    usePriceOfferMutations(productId);
  const myOffer = myOfferQuery.data ?? null;
  const [priceInput, setPriceInput] = useState("");
  const [error, setError] = useState("");
  const isBusy =
    submitMutation.isPending || patchMutation.isPending || cancelMutation.isPending;
  const isMobileNav = useAppShellCompactLayout();
  const pageDockHost = useProductDetailsPageDockHost();
  // Page provider starts at `null` (slot not mounted). Treat only a real host as dock mode —
  // otherwise tablet/desktop page hides the inline CTA while the dock never mounts (≥767).
  const dockSubmit =
    pageDockHost != null || (pageDockHost === undefined && isMobileNav);
  const confirmGate = useAccountRequirementModal();

  useEffect(() => {
    if (myOffer?.offerPrice != null) {
      setPriceInput(formatIntegerGroupRu(myOffer.offerPrice));
      return;
    }
    if (!myOfferQueryEnabled || !myOfferQuery.isLoading) {
      setPriceInput("");
    }
  }, [myOffer?._id, myOffer?.offerPrice, myOfferQuery.isLoading, myOfferQueryEnabled]);

  const hasLinkedOrder =
    myOffer?.orderId != null && String(myOffer.orderId).trim() !== "";

  const handleSubmitOffer = async () => {
    if (!isAuthorized) {
      onRequestLogin?.();
      return;
    }
    const price = parseRubPriceInput(priceInput);
    if (price == null || price < 1) {
      setError("Укажите целую цену больше 0");
      return;
    }
    const priceMaxError = getProductPriceRubMaxError(price);
    if (priceMaxError) {
      setError(PRODUCT_PRICE_OFFER_UI.ERROR_PRICE_MAX);
      return;
    }

    setError("");
    try {
      if (myOffer?.status === PRICE_OFFER_STATUS_PENDING) {
        await patchMutation.mutateAsync(price);
      } else {
        await submitMutation.mutateAsync(price);
      }
      onOffersChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const handleCancel = async () => {
    setError("");
    try {
      await cancelMutation.mutateAsync();
      setPriceInput("");
      onOffersChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const showForm =
    !isOwnProduct &&
    isAuthorized &&
    isUserDataConfirmed &&
    myOffer?.status !== PRICE_OFFER_STATUS_ACCEPTED;

  const handleGoToCart = () => {
    onCloseModal?.();
    navigate(HOME_MAIN_VIEW_PATH.cart);
  };

  const statusText =
    myOffer?.status === PRICE_OFFER_STATUS_PENDING
      ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
      : myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED
        ? hasLinkedOrder
          ? PRODUCT_PRICE_OFFER_UI.STATUS_ORDERED
          : PRODUCT_PRICE_OFFER_UI.STATUS_ACCEPTED
        : myOffer?.status === "rejected"
          ? PRODUCT_PRICE_OFFER_UI.STATUS_REJECTED
          : null;

  /** Ставка принята и ждёт оплаты — товар лежит в корзине. */
  const showGoToCartButton =
    myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED && !hasLinkedOrder;

  const offerSubmitLabel = isBusy
    ? PRODUCT_PRICE_OFFER_UI.SUBMIT_LOADING
    : myOffer?.status === PRICE_OFFER_STATUS_PENDING
      ? PRODUCT_PRICE_OFFER_UI.UPDATE
      : PRODUCT_PRICE_OFFER_UI.SUBMIT;

  const showDockPrimaryAction =
    dockSubmit && !isOwnProduct && (showForm || !isAuthorized);

  const dockPrimaryAction = showDockPrimaryAction
    ? {
        label: !isAuthorized ? PRODUCT_PRICE_OFFER_UI.SUBMIT : offerSubmitLabel,
        onClick: () => {
          if (!isAuthorized) {
            onRequestLogin?.();
            return;
          }
          void handleSubmitOffer();
        },
        disabled: isAuthorized ? isBusy : false,
      }
    : null;

  const renderPrimaryButton = ({ label, onClick, disabled }) => (
    <button
      type="button"
      className="app-btn app-btn--contrast product-price-offer__btn"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );

  const portalTarget =
    pageDockHost === undefined
      ? typeof document !== "undefined"
        ? document.body
        : null
      : pageDockHost;
  const dockedPrimaryAction =
    dockPrimaryAction != null && portalTarget
      ? createPortal(
          pageDockHost ? (
            renderPrimaryButton(dockPrimaryAction)
          ) : (
            <div className="product-modal-shell__docked-footer product-price-offer__docked-footer">
              {renderPrimaryButton(dockPrimaryAction)}
            </div>
          ),
          portalTarget,
        )
      : null;

  return (
    <section className="product-price-offer">
      <ProductPriceOfferSectionTitle />

      {!isOwnProduct ? (
        <>
          {showForm ? (
            <div className="product-price-offer__form">
              <h2 className="product-price-offer__section-label">
                {PRODUCT_PRICE_OFFER_UI.SECTION_FORM_TITLE}
              </h2>
              <input
                {...INTEGER_INPUT_FIELD_PROPS}
                className="product-price-offer__input"
                aria-label={PRODUCT_PRICE_OFFER_UI.LABEL_PRICE}
                placeholder={PRODUCT_PRICE_OFFER_UI.INPUT_PLACEHOLDER}
                value={priceInput}
                onChange={(e) => setPriceInput(formatRubPriceInput(e.target.value))}
                disabled={isBusy}
              />
              {myOffer?.status === PRICE_OFFER_STATUS_PENDING || !showDockPrimaryAction ? (
                <div className="product-price-offer__actions">
                  {!showDockPrimaryAction
                    ? renderPrimaryButton({
                        label: offerSubmitLabel,
                        onClick: () => void handleSubmitOffer(),
                        disabled: isBusy,
                      })
                    : null}
                  {myOffer?.status === PRICE_OFFER_STATUS_PENDING ? (
                    <button
                      type="button"
                      className="app-btn app-btn--cancel product-price-offer__btn product-price-offer__btn--cancel"
                      disabled={isBusy}
                      onClick={() => void handleCancel()}
                    >
                      {PRODUCT_PRICE_OFFER_UI.CANCEL}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {!isAuthorized && !showDockPrimaryAction
            ? renderPrimaryButton({
                label: PRODUCT_PRICE_OFFER_UI.SUBMIT,
                onClick: () => onRequestLogin?.(),
                disabled: false,
              })
            : null}

          {isAuthorized && !isUserDataConfirmed ? (
            <>
              <ProductPriceOfferHintMessage>
                {PRODUCT_PRICE_OFFER_UI.CONFIRMED_DATA_REQUIRED}
              </ProductPriceOfferHintMessage>
              <div className="product-price-offer__actions">
                <button
                  type="button"
                  className="app-btn app-btn--contrast product-price-offer__btn"
                  onClick={() =>
                    confirmGate.require("data-confirmation", "сделать ставку на аукционе")
                  }
                >
                  {PRODUCT_PRICE_OFFER_UI.CONFIRM_DATA_CTA}
                </button>
              </div>
            </>
          ) : null}

          {statusText ? (
            <p
              className={[
                "product-price-offer__status",
                myOffer?.status === PRICE_OFFER_STATUS_PENDING
                  ? "product-price-offer__status--pending"
                  : myOffer?.status === PRICE_OFFER_STATUS_ACCEPTED
                    ? "product-price-offer__status--accepted"
                    : myOffer?.status === "rejected"
                      ? "product-price-offer__status--rejected"
                      : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {statusText}
            </p>
          ) : null}

          {showGoToCartButton ? (
            <div className="product-price-offer__pay">
              {renderPrimaryButton({
                label: PRODUCT_PRICE_OFFER_UI.GO_TO_CART,
                onClick: handleGoToCart,
                disabled: false,
              })}
            </div>
          ) : null}
        </>
      ) : null}

      {error ? (
        <p className="product-price-offer__error" role="alert">
          {error}
        </p>
      ) : null}

      <h2 className="product-price-offer__section-label">
        {PRODUCT_PRICE_OFFER_UI.SECTION_TOP_TITLE}
      </h2>
      <ProductPriceOfferTopList
        top={top}
        onOpenBuyer={onOpenBuyer}
        highlightedOfferId={myOffer?._id ?? null}
      />

      {dockedPrimaryAction}
      <AccountRequirementModal {...confirmGate.modalProps} />
    </section>
  );
}
