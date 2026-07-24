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
import { getProductPurchaseLimit } from "../../product/lib/getProductPurchaseLimit.js";
import { InstallmentPassportShareConsentModal } from "./InstallmentPassportShareConsentModal.jsx";

import "./InstallmentBuyerBlock.css";

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
  const dockSubmit = dockSubmitProp ?? isCompactLayout;
  const [selectedPlanId, setSelectedPlanId] = useState(program.plans[0]?._id ?? "");
  const [quantity, setQuantity] = useState(1);
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

  const qty = Math.max(1, quantity);
  const baseTotalRub = (priceSummary?.productPriceRub ?? 0) * qty;
  const markupTotalRub = (priceSummary?.markupRub ?? 0) * qty;
  const monthlyTotal =
    selectedPlan != null ? selectedPlan.monthlyAmountRub * qty : 0;
  const contractTotal =
    selectedPlan != null ? monthlyTotal * selectedPlan.monthsCount : 0;

  useEffect(() => {
    setSelectedPlanId(program.plans[0]?._id ?? "");
  }, [program.plans]);

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
    try {
      await createContractMutation.mutateAsync({
        productId: String(product._id),
        body: {
          planId: String(selectedPlanId),
          quantity: qty,
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

  const dockedSubmit =
    dockSubmit && typeof document !== "undefined"
      ? createPortal(
          <div className="product-modal-shell__docked-footer installment-buyer-block__docked-footer">
            {renderSubmitButton(true)}
          </div>,
          document.body,
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
            type="number"
            className="installment-buyer-block__input"
            min={1}
            max={purchaseLimit}
            value={quantity}
            onChange={(event) =>
              setQuantity(Math.max(1, Number(event.target.value) || 1))
            }
            disabled={isSubmitting}
          />
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
