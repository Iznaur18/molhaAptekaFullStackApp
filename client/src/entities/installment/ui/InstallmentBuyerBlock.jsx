import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  doProductsSupportPickup,
  doProductsSupportSellerDelivery,
} from "@molha/api-contract";

import { buildCheckoutPickupLocations } from "../../cart/lib/buildCheckoutPickupLocations.js";
import { ORDER_PAYMENT_METHOD_DEFAULT } from "../../order/model/constants.js";
import { useAuthSession } from "../../user/model/useAuthSession.js";
import { userSavedAddressesFromUser } from "../../address/lib/userSavedAddressesFromUser.js";
import { CheckoutSheetModal } from "../../../features/checkout/ui/CheckoutSheetModal.jsx";
import { useInstallmentMutations } from "../model/useInstallmentMutations.js";
import { resolveInstallmentPlanPriceSummary } from "../lib/resolveInstallmentPlanPriceSummary.js";
import { resolveInstallmentDeliveryFromSheet } from "../lib/resolveInstallmentDeliveryFromSheet.js";
import { CHECKOUT_FORM_UI, INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
import { BlockedPurchaseButton } from "../../../shared/ui/BlockedPurchaseButton.jsx";
import { formatPriceRub } from "../../../shared/lib/formatPriceRub.js";
import { useAppShellCompactLayout } from "../../../shared/lib/useAppShellCompactLayout.js";
import { useProductDetailsPageDockHost } from "../../../shared/lib/productDetailsPageDockHostContext.js";
import { getProductPurchaseLimit } from "../../product/lib/getProductPurchaseLimit.js";
import { InstallmentPassportShareConsentModal } from "./InstallmentPassportShareConsentModal.jsx";

import "./InstallmentBuyerBlock.css";
import "./InstallmentBuyerBlockMobile.css";

/**
 * @param {{
 *   product: import("../../product/model/types.js").ProductFromApi;
 *   program: import("../model/types.js").InstallmentProgramFromApi;
 *   isAuthorized: boolean;
 *   isUserDataConfirmed: boolean;
 *   dockSubmit?: boolean;
 *   onSuccess?: () => void;
 *   onRequestLogin?: () => void;
 *   onSuccess?: () => void;
 *   isPurchaseBlocked?: boolean;
 *   blockedPurchaseLabel?: string;
 * }} props
 */
export function InstallmentBuyerBlock({
  product,
  program,
  isAuthorized,
  isUserDataConfirmed,
  dockSubmit: dockSubmitProp,
  onSuccess,
  onRequestLogin,
  isPurchaseBlocked = false,
  blockedPurchaseLabel = "",
}) {
  const { createContractMutation } = useInstallmentMutations();
  const { user: authUser } = useAuthSession();
  const formId = useId();
  const isCompactLayout = useAppShellCompactLayout();
  const pageDockHost = useProductDetailsPageDockHost();
  const dockSubmit = dockSubmitProp ?? isCompactLayout;
  const [selectedPlanId, setSelectedPlanId] = useState(program.plans[0]?._id ?? "");
  const [quantityRaw, setQuantityRaw] = useState("1");
  const isSubmitting = createContractMutation.isPending;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCheckoutSheetOpen, setIsCheckoutSheetOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(
    /** @type {null | { deliveryAddress: string; deliveryAddressFlat: string; paymentMethod: string }} */ (
      null
    ),
  );
  const [sheetSubmitError, setSheetSubmitError] = useState("");

  const purchaseLimit = getProductPurchaseLimit(product);
  const selectedPlan = program.plans.find(
    (plan) => String(plan._id) === String(selectedPlanId),
  );
  const productPrice = Number(product.productPrice) || 0;

  const priceSummary = useMemo(() => {
    if (selectedPlan == null) {
      return null;
    }
    return resolveInstallmentPlanPriceSummary(
      productPrice,
      selectedPlan.monthsCount,
      selectedPlan.monthlyAmountRub,
    );
  }, [productPrice, selectedPlan]);

  const qty = Math.max(1, Math.floor(Number(quantityRaw)) || 1);
  const baseTotalRub = (priceSummary?.productPriceRub ?? 0) * qty;
  const markupTotalRub = (priceSummary?.markupRub ?? 0) * qty;
  const monthlyTotal =
    selectedPlan != null ? selectedPlan.monthlyAmountRub * qty : 0;
  const contractTotal =
    selectedPlan != null ? monthlyTotal * selectedPlan.monthsCount : 0;

  const pickupLocations = useMemo(
    () => buildCheckoutPickupLocations([{ product }]),
    [product],
  );
  const pickupAvailable = useMemo(
    () => doProductsSupportPickup([product]),
    [product],
  );
  const deliveryAvailable = useMemo(
    () => doProductsSupportSellerDelivery([product]),
    [product],
  );

  const defaultDeliveryAddress = useMemo(() => {
    if (!isAuthorized || !authUser) {
      return {};
    }
    return {
      userAddress: authUser.userAddress,
      userAddressFlat: authUser.userAddressFlat,
      userAddressFiasId: authUser.userAddressFiasId,
      userAddressGeo: authUser.userAddressGeo,
    };
  }, [authUser, isAuthorized]);

  const savedDeliveryAddresses = useMemo(() => {
    if (!isAuthorized || !authUser) {
      return [];
    }
    return userSavedAddressesFromUser(authUser);
  }, [authUser, isAuthorized]);

  useEffect(() => {
    setSelectedPlanId(program.plans[0]?._id ?? "");
  }, [program.plans]);

  const normalizeQuantityRaw = () => {
    let next = Math.max(1, Math.floor(Number(quantityRaw)) || 1);
    if (purchaseLimit > 0) {
      next = Math.min(next, purchaseLimit);
    }
    setQuantityRaw(String(next));
    return next;
  };

  const validatePlanAndQuantity = () => {
    if (!isAuthorized) {
      onRequestLogin?.();
      return false;
    }
    if (!isUserDataConfirmed) {
      setError(INSTALLMENT_UI.BUYER_REQUIRES_CONFIRMED);
      return false;
    }
    if (!selectedPlanId) {
      setError(INSTALLMENT_UI.SELECT_PLAN);
      return false;
    }
    if (purchaseLimit <= 0) {
      setError(INSTALLMENT_UI.QUANTITY_EXCEEDS_STOCK(0));
      return false;
    }
    const parsedQty = Math.max(1, Math.floor(Number(quantityRaw)) || 1);
    if (parsedQty > purchaseLimit) {
      setQuantityRaw(String(purchaseLimit));
      setError(INSTALLMENT_UI.QUANTITY_EXCEEDS_STOCK(purchaseLimit));
      return false;
    }
    setQuantityRaw(String(parsedQty));
    return true;
  };

  const openCheckoutSheet = () => {
    setError("");
    setSuccess("");
    setSheetSubmitError("");
    if (!validatePlanAndQuantity()) {
      return;
    }
    setIsCheckoutSheetOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    openCheckoutSheet();
  };

  const handleCheckoutSheetSubmit = (sheetPayload) => {
    const resolved = resolveInstallmentDeliveryFromSheet(sheetPayload, product);
    if (!resolved.deliveryAddress) {
      setSheetSubmitError(CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED);
      return;
    }
    setPendingCheckout({
      deliveryAddress: resolved.deliveryAddress,
      deliveryAddressFlat: resolved.deliveryAddressFlat,
      paymentMethod: resolved.paymentMethod || ORDER_PAYMENT_METHOD_DEFAULT,
    });
    setSheetSubmitError("");
    setIsCheckoutSheetOpen(false);
    setIsConsentOpen(true);
  };

  const handleConsentConfirm = async () => {
    setError("");
    setSuccess("");
    if (pendingCheckout == null) {
      setIsConsentOpen(false);
      setError(INSTALLMENT_UI.ERROR_GENERIC);
      return;
    }
    const nextQty = normalizeQuantityRaw();
    if (purchaseLimit <= 0 || nextQty > purchaseLimit) {
      setIsConsentOpen(false);
      setError(INSTALLMENT_UI.QUANTITY_EXCEEDS_STOCK(Math.max(0, purchaseLimit)));
      return;
    }
    try {
      await createContractMutation.mutateAsync({
        productId: String(product._id),
        body: {
          planId: String(selectedPlanId),
          quantity: nextQty,
          deliveryAddress: pendingCheckout.deliveryAddress,
          deliveryAddressFlat: pendingCheckout.deliveryAddressFlat || undefined,
          paymentMethod: pendingCheckout.paymentMethod,
          passportShareConsent: true,
        },
      });
      setIsConsentOpen(false);
      setPendingCheckout(null);
      setSuccess(INSTALLMENT_UI.CONTRACT_SUCCESS);
      onSuccess?.();
    } catch (e) {
      setIsConsentOpen(false);
      setError(e instanceof Error ? e.message : INSTALLMENT_UI.ERROR_GENERIC);
    }
  };

  const planCardClassName = (planId) =>
    [
      "installment-buyer-block__plan-card",
      String(selectedPlanId) === String(planId)
        ? "installment-buyer-block__plan-card_selected"
        : "",
    ]
      .filter(Boolean)
      .join(" ");

  const isSubmitDisabled =
    isSubmitting || isPurchaseBlocked || (isAuthorized && !isUserDataConfirmed);
  const submitLabel = isPurchaseBlocked
    ? blockedPurchaseLabel
    : isSubmitting
      ? INSTALLMENT_UI.SUBMITTING
      : INSTALLMENT_UI.SUBMIT;

  const renderSubmitButton = (linkedToForm) => {
    if (isPurchaseBlocked) {
      return (
        <BlockedPurchaseButton
          label={blockedPurchaseLabel}
          variant="installment"
        />
      );
    }

    return (
      <button
        type={linkedToForm ? "submit" : "button"}
        className="installment-buyer-block__submit"
        form={linkedToForm ? formId : undefined}
        disabled={isSubmitDisabled}
        onClick={linkedToForm ? undefined : openCheckoutSheet}
      >
        {submitLabel}
      </button>
    );
  };

  const portalTarget =
    pageDockHost === undefined
      ? typeof document !== "undefined"
        ? document.body
        : null
      : pageDockHost;
  const dockedSubmit =
    dockSubmit && portalTarget
      ? createPortal(
          pageDockHost ? (
            renderSubmitButton(true)
          ) : (
            <div className="product-modal-shell__docked-footer installment-buyer-block__docked-footer">
              {renderSubmitButton(true)}
            </div>
          ),
          portalTarget,
        )
      : null;

  return (
    <section className="installment-buyer-block">
      {!isUserDataConfirmed ? (
        <p className="installment-buyer-block__hint installment-buyer-block__hint--blocked">
          {INSTALLMENT_UI.BUYER_HINT}
        </p>
      ) : null}

      <form
        id={formId}
        className="installment-buyer-block__form"
        onSubmit={handleSubmit}
      >
        <fieldset className="installment-buyer-block__plans">
          <legend className="installment-buyer-block__legend">
            {INSTALLMENT_UI.PLANS_LABEL}
          </legend>
          <div className="installment-buyer-block__plan-list">
            {program.plans.map((plan) => {
              const isSelected = String(selectedPlanId) === String(plan._id);
              return (
                <label key={plan._id} className={planCardClassName(plan._id)}>
                  <input
                    type="radio"
                    className="installment-buyer-block__plan-input"
                    name="installmentPlan"
                    value={plan._id}
                    checked={isSelected}
                    onChange={() => setSelectedPlanId(String(plan._id))}
                  />
                  <span
                    className={[
                      "installment-buyer-block__plan-radio",
                      isSelected ? "installment-buyer-block__plan-radio_selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden
                  >
                    {isSelected ? (
                      <span className="installment-buyer-block__plan-radio-dot" />
                    ) : null}
                  </span>
                  <span className="installment-buyer-block__plan-body">
                    <span className="installment-buyer-block__plan-title">
                      {plan.title || "План"}
                    </span>
                    <span className="installment-buyer-block__plan-meta">
                      {plan.monthsCount} мес × {formatPriceRub(plan.monthlyAmountRub)}
                    </span>
                    {!plan.firstPaymentRequiredNow ? (
                      <span className="installment-buyer-block__plan-note">
                        {INSTALLMENT_UI.FIRST_PAYMENT_LATER}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="installment-buyer-block__field installment-buyer-block__field_quantity">
          <span className="installment-buyer-block__label">
            {INSTALLMENT_UI.QUANTITY_LABEL}
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className="installment-buyer-block__input"
            value={quantityRaw}
            onChange={(event) => {
              const next = event.target.value;
              if (next === "" || /^\d+$/.test(next)) {
                setQuantityRaw(next);
              }
            }}
            onBlur={() => {
              normalizeQuantityRaw();
            }}
            disabled={isSubmitting}
          />
          {purchaseLimit > 0 ? (
            <span className="installment-buyer-block__qty-hint">
              {INSTALLMENT_UI.QUANTITY_AVAILABLE(purchaseLimit)}
            </span>
          ) : null}
        </label>

        {selectedPlan != null ? (
          <div className="installment-buyer-block__totals">
            <div className="installment-buyer-block__total-item">
              <span className="installment-buyer-block__total-label">
                {INSTALLMENT_UI.BUYER_PRODUCT_PRICE_LABEL}
              </span>
              <strong className="installment-buyer-block__total-value">
                {formatPriceRub(baseTotalRub)}
              </strong>
            </div>
            <div className="installment-buyer-block__total-item">
              <span className="installment-buyer-block__total-label">
                {INSTALLMENT_UI.BUYER_MARKUP_LABEL}
              </span>
              <strong className="installment-buyer-block__total-value">
                +{formatPriceRub(markupTotalRub)}
              </strong>
            </div>
            <div className="installment-buyer-block__total-item">
              <span className="installment-buyer-block__total-label">
                {INSTALLMENT_UI.MONTHLY_LABEL}
              </span>
              <strong className="installment-buyer-block__total-value">
                {formatPriceRub(monthlyTotal)}
              </strong>
            </div>
            <div className="installment-buyer-block__total-item">
              <span className="installment-buyer-block__total-label">
                {INSTALLMENT_UI.TOTAL_LABEL}
              </span>
              <strong className="installment-buyer-block__total-value">
                {formatPriceRub(contractTotal)}
              </strong>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="installment-buyer-block__error" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="installment-buyer-block__success" role="status">
            {success}
          </p>
        ) : null}

        {!dockSubmit ? renderSubmitButton(false) : null}
      </form>
      {dockedSubmit}

      <CheckoutSheetModal
        isOpen={isCheckoutSheetOpen}
        onClose={() => {
          setIsCheckoutSheetOpen(false);
          setSheetSubmitError("");
        }}
        defaultDeliveryAddress={defaultDeliveryAddress}
        savedDeliveryAddresses={savedDeliveryAddresses}
        pickupLocations={pickupLocations}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
        isSubmitting={false}
        submitError={sheetSubmitError}
        submitSuccess=""
        isDisabled={isSubmitDisabled}
        onSubmit={handleCheckoutSheetSubmit}
      />

      <InstallmentPassportShareConsentModal
        isOpen={isConsentOpen}
        isConfirming={isSubmitting}
        onClose={() => {
          setIsConsentOpen(false);
          setPendingCheckout(null);
        }}
        onConfirm={() => {
          void handleConsentConfirm();
        }}
      />
    </section>
  );
}
