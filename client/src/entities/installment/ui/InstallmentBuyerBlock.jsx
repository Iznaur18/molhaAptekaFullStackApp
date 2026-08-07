import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { AddressDeliveryFields } from "../../address/ui/AddressDeliveryFields.jsx";
import { addressValueFromUser } from "../../address/lib/addressValueFromUser.js";
import { validateRuDeliveryAddressForm } from "../../address/lib/validateRuDeliveryAddressForm.js";
import { ORDER_PAYMENT_METHOD_DEFAULT } from "../../order/model/constants.js";
import { CheckoutPaymentMethodPicker } from "../../../features/checkout/ui/CheckoutPaymentMethodPicker.jsx";
import { useInstallmentMutations } from "../model/useInstallmentMutations.js";
import { resolveInstallmentPlanPriceSummary } from "../lib/resolveInstallmentPlanPriceSummary.js";
import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";
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
 *   defaultDeliveryAddress?: Partial<{
 *     userAddress?: string;
 *     userAddressFlat?: string;
 *     userAddressFiasId?: string;
 *   }>;
 *   dockSubmit?: boolean;
 *   onSuccess?: () => void;
 *   onRequestLogin?: () => void;
 * }} props
 */
export function InstallmentBuyerBlock({
  product,
  program,
  isAuthorized,
  isUserDataConfirmed,
  defaultDeliveryAddress = {},
  dockSubmit: dockSubmitProp,
  onSuccess,
  onRequestLogin,
}) {
  const { createContractMutation } = useInstallmentMutations();
  const formId = useId();
  const isCompactLayout = useAppShellCompactLayout();
  const pageDockHost = useProductDetailsPageDockHost();
  const dockSubmit = dockSubmitProp ?? isCompactLayout;
  const [selectedPlanId, setSelectedPlanId] = useState(program.plans[0]?._id ?? "");
  const [quantityRaw, setQuantityRaw] = useState("1");
  const [deliveryAddress, setDeliveryAddress] = useState(() =>
    addressValueFromUser(defaultDeliveryAddress),
  );
  const [paymentMethod, setPaymentMethod] = useState(ORDER_PAYMENT_METHOD_DEFAULT);
  const isSubmitting = createContractMutation.isPending;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConsentOpen, setIsConsentOpen] = useState(false);

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

  const validateCheckoutForm = () => {
    if (!isAuthorized) {
      onRequestLogin?.();
      return false;
    }
    if (!isUserDataConfirmed) {
      setError(INSTALLMENT_UI.BUYER_REQUIRES_CONFIRMED);
      return false;
    }

    const addressError = validateRuDeliveryAddressForm(deliveryAddress, {
      required: true,
    });
    if (addressError) {
      setError(addressError);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!validateCheckoutForm()) {
      return;
    }
    setIsConsentOpen(true);
  };

  const handleConsentConfirm = async () => {
    setError("");
    setSuccess("");
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
          deliveryAddress: deliveryAddress.line.trim(),
          deliveryAddressFlat: deliveryAddress.flat.trim() || undefined,
          paymentMethod,
          passportShareConsent: true,
        },
      });
      setIsConsentOpen(false);
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

  const isSubmitDisabled = isSubmitting || (isAuthorized && !isUserDataConfirmed);
  const submitLabel = isSubmitting ? INSTALLMENT_UI.SUBMITTING : INSTALLMENT_UI.SUBMIT;

  const renderSubmitButton = (linkedToForm) => (
    <button
      type="submit"
      className="installment-buyer-block__submit"
      form={linkedToForm ? formId : undefined}
      disabled={isSubmitDisabled}
    >
      {submitLabel}
    </button>
  );

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

        <div className="installment-buyer-block__section">
          <div className="installment-buyer-block__address">
            <AddressDeliveryFields
              value={deliveryAddress}
              onChange={setDeliveryAddress}
              disabled={isSubmitting}
              lineInputClassName="installment-buyer-block__input"
            />
          </div>

          <CheckoutPaymentMethodPicker
            value={paymentMethod}
            onChange={setPaymentMethod}
            disabled={isSubmitting}
            legend={INSTALLMENT_UI.PAYMENT_METHOD_LABEL}
          />
        </div>

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
      <InstallmentPassportShareConsentModal
        isOpen={isConsentOpen}
        isConfirming={isSubmitting}
        onClose={() => setIsConsentOpen(false)}
        onConfirm={() => {
          void handleConsentConfirm();
        }}
      />
    </section>
  );
}
