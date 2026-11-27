import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  ORDER_FULFILLMENT_PICKUP,
  doProductsSupportPickup,
  doProductsSupportSellerDelivery,
} from "@molha/api-contract";
import { resolveCartAllowedPaymentMethods } from "@izibuy/shared-lib";

import { buildCheckoutPickupGroups } from "@/entities/cart/lib/buildCheckoutPickupLocations";
import { resolveCheckoutSellers } from "@/entities/cart/lib/resolveCheckoutSellers";
import { resolveInstallmentPlanPriceSummary } from "@/entities/installment/lib/resolveInstallmentPlanPriceSummary";
import { useInstallmentMutations } from "@/entities/installment/model/useInstallmentMutations";
import { useProductInstallmentProgramQuery } from "@/entities/installment/model/useProductInstallmentProgramQuery";
import { InstallmentPassportShareConsentModal } from "@/entities/installment/ui/InstallmentPassportShareConsentModal";
import {
  ORDER_PAYMENT_METHOD_DEFAULT,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import type { OrderFulfillmentMethod } from "@/entities/order/api/createOrder";
import { getProductPurchaseLimit } from "@/entities/product/lib/getProductPurchaseLimit";
import { CheckoutSheetModal } from "@/features/checkout/ui/CheckoutSheetModal";
import { CHECKOUT_FORM_UI, INSTALLMENT_UI, PRODUCT_UI } from "@/shared/config";
import { BlockedPurchaseButton } from "@/shared/ui/BlockedPurchaseButton";
import { formatPriceRub } from "@/shared/lib";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";
import { Minus, Plus } from "@/shared/ui/productDetailsLucideIcons";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

export type ProductInstallmentDockFooter = {
  onSubmit: () => void;
  disabled: boolean;
  label: string;
};

type ProductForInstallmentCheckout = {
  _id?: string;
  productName?: string | null;
  productPickupAddress?: string | null;
  productPickupEnabled?: boolean | null;
  productDeliveryEnabled?: boolean | null;
  productOutOfStock?: boolean | null;
  productAvailableQuantity?: number | null;
  productStockQuantity?: number | null;
};

type ProductInstallmentTabProps = {
  productId: string;
  product?: ProductForInstallmentCheckout | null;
  productPrice?: number;
  installmentEnabled: boolean;
  isAuthorized: boolean;
  isUserDataConfirmed: boolean;
  isOwnProduct: boolean;
  defaultUser?: Record<string, unknown> | null;
  dockSubmit?: boolean;
  onDockFooterChange?: (footer: ProductInstallmentDockFooter | null) => void;
  isPurchaseBlocked?: boolean;
  blockedPurchaseLabel?: string;
};

type PendingCheckout = {
  deliveryAddress: string;
  deliveryAddressFlat: string;
  paymentMethod: OrderPaymentMethod;
};

const resolveInstallmentDeliveryFromSheet = (
  sheetPayload: {
    fulfillmentMethod: OrderFulfillmentMethod;
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  },
  product: ProductForInstallmentCheckout | null | undefined,
): PendingCheckout => {
  if (sheetPayload.fulfillmentMethod === ORDER_FULFILLMENT_PICKUP) {
    return {
      deliveryAddress: String(product?.productPickupAddress ?? "").trim(),
      deliveryAddressFlat: "",
      paymentMethod: sheetPayload.paymentMethod,
    };
  }
  return {
    deliveryAddress: String(sheetPayload.deliveryAddress ?? "").trim(),
    deliveryAddressFlat: String(sheetPayload.deliveryAddressFlat ?? "").trim(),
    paymentMethod: sheetPayload.paymentMethod,
  };
};

export const ProductInstallmentTab = ({
  productId,
  product = null,
  productPrice = 0,
  installmentEnabled,
  isAuthorized,
  isUserDataConfirmed,
  isOwnProduct,
  defaultUser,
  dockSubmit = true,
  onDockFooterChange,
  isPurchaseBlocked = false,
  blockedPurchaseLabel = "",
}: ProductInstallmentTabProps) => {
  const theme = useAppTheme();
  const styles = useProductDetailTabStyles();
  const programQuery = useProductInstallmentProgramQuery(productId, installmentEnabled);
  const { createContractMutation } = useInstallmentMutations();
  const { mutateAsync: createInstallmentContract, isPending: isCreateContractPending } =
    createContractMutation;
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isStepperFocused, setIsStepperFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isCheckoutSheetOpen, setIsCheckoutSheetOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null);
  const [sheetSubmitError, setSheetSubmitError] = useState("");

  const productForCheckout = useMemo(
    () => product ?? { _id: productId },
    [product, productId],
  );
  const purchaseLimit = getProductPurchaseLimit(productForCheckout);

  const pickupGroups = useMemo(
    () => buildCheckoutPickupGroups([{ product: productForCheckout }]),
    [productForCheckout],
  );
  // Тот же фильтр, что в корзине: только способы, которые принимает продавец.
  const allowedPaymentMethods = useMemo(
    () =>
      resolveCartAllowedPaymentMethods(resolveCheckoutSellers([productForCheckout])),
    [productForCheckout],
  );
  const pickupAvailable = useMemo(
    () => doProductsSupportPickup([productForCheckout]),
    [productForCheckout],
  );
  const deliveryAvailable = useMemo(
    () => doProductsSupportSellerDelivery([productForCheckout]),
    [productForCheckout],
  );

  const normalizeQuantity = useCallback(() => {
    let next = Math.max(1, Math.floor(Number(quantity)) || 1);
    if (purchaseLimit > 0) {
      next = Math.min(next, purchaseLimit);
    }
    setQuantity(String(next));
    return next;
  }, [purchaseLimit, quantity]);

  const stepQuantity = useCallback(
    (delta: number) => {
      const current = Math.max(1, Math.floor(Number(quantity)) || 1);
      let next = Math.max(1, current + delta);
      if (purchaseLimit > 0) {
        next = Math.min(next, purchaseLimit);
      }
      setQuantity(String(next));
    },
    [purchaseLimit, quantity],
  );

  const validatePlanAndQuantity = useCallback(() => {
    if (!isAuthorized) {
      setErrorMessage(INSTALLMENT_UI.BUYER_REQUIRES_CONFIRMED);
      return false;
    }
    if (!isUserDataConfirmed) {
      setErrorMessage(INSTALLMENT_UI.BUYER_REQUIRES_CONFIRMED);
      return false;
    }
    if (!selectedPlanId) {
      setErrorMessage(INSTALLMENT_UI.SELECT_PLAN);
      return false;
    }
    if (purchaseLimit <= 0) {
      setErrorMessage(INSTALLMENT_UI.QUANTITY_EXCEEDS_STOCK(0));
      return false;
    }
    const parsedQty = Math.max(1, Math.floor(Number(quantity)) || 1);
    if (parsedQty > purchaseLimit) {
      setQuantity(String(purchaseLimit));
      setErrorMessage(INSTALLMENT_UI.QUANTITY_EXCEEDS_STOCK(purchaseLimit));
      return false;
    }
    setQuantity(String(parsedQty));
    return true;
  }, [isAuthorized, isUserDataConfirmed, purchaseLimit, quantity, selectedPlanId]);

  const openCheckoutSheet = useCallback(() => {
    setErrorMessage("");
    setSuccessMessage("");
    setSheetSubmitError("");
    if (!validatePlanAndQuantity()) {
      return;
    }
    setIsCheckoutSheetOpen(true);
  }, [validatePlanAndQuantity]);

  const handleCheckoutSheetSubmit = useCallback(
    (sheetPayload: {
      fulfillmentMethod: OrderFulfillmentMethod;
      deliveryAddress: string;
      deliveryAddressFlat: string;
      paymentMethod: OrderPaymentMethod;
    }) => {
      const resolved = resolveInstallmentDeliveryFromSheet(
        sheetPayload,
        productForCheckout,
      );
      if (!resolved.deliveryAddress) {
        setSheetSubmitError(CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED);
        return;
      }
      setPendingCheckout({
        ...resolved,
        paymentMethod: resolved.paymentMethod || ORDER_PAYMENT_METHOD_DEFAULT,
      });
      setSheetSubmitError("");
      setIsCheckoutSheetOpen(false);
      setIsConsentOpen(true);
    },
    [productForCheckout],
  );

  const handleConsentConfirm = useCallback(async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (pendingCheckout == null) {
      setIsConsentOpen(false);
      setErrorMessage(INSTALLMENT_UI.ERROR_GENERIC);
      return;
    }
    const nextQty = normalizeQuantity();
    if (purchaseLimit <= 0 || nextQty > purchaseLimit) {
      setIsConsentOpen(false);
      setErrorMessage(
        INSTALLMENT_UI.QUANTITY_EXCEEDS_STOCK(Math.max(0, purchaseLimit)),
      );
      return;
    }

    try {
      await createInstallmentContract({
        productId,
        body: {
          planId: selectedPlanId,
          quantity: nextQty,
          deliveryAddress: pendingCheckout.deliveryAddress,
          deliveryAddressFlat: pendingCheckout.deliveryAddressFlat || undefined,
          paymentMethod: pendingCheckout.paymentMethod,
          passportShareConsent: true,
        },
      });
      setIsConsentOpen(false);
      setPendingCheckout(null);
      setSuccessMessage(INSTALLMENT_UI.CONTRACT_SUCCESS);
    } catch (error) {
      setIsConsentOpen(false);
      setErrorMessage(
        error instanceof Error ? error.message : INSTALLMENT_UI.ERROR_GENERIC,
      );
    }
  }, [
    createInstallmentContract,
    normalizeQuantity,
    pendingCheckout,
    productId,
    purchaseLimit,
    selectedPlanId,
  ]);

  const openCheckoutSheetRef = useRef(openCheckoutSheet);
  openCheckoutSheetRef.current = openCheckoutSheet;

  const program = programQuery.data;
  const plans = program?.plans ?? [];
  const selectedPlan = plans.find((plan) => plan._id === selectedPlanId) ?? null;
  const qty = Math.max(1, Math.floor(Number(quantity)) || 1);
  const selectedPlanPriceSummary = selectedPlan
    ? resolveInstallmentPlanPriceSummary(
        productPrice,
        selectedPlan.monthsCount ?? 0,
        selectedPlan.monthlyAmountRub ?? 0,
      )
    : null;
  const baseTotalRub = (selectedPlanPriceSummary?.productPriceRub ?? 0) * qty;
  const markupTotalRub = (selectedPlanPriceSummary?.markupRub ?? 0) * qty;
  const monthlyTotal =
    selectedPlan != null ? (selectedPlan.monthlyAmountRub ?? 0) * qty : 0;
  const contractTotal =
    selectedPlan != null ? monthlyTotal * (selectedPlan.monthsCount ?? 0) : 0;
  const canDecreaseQty = qty > 1 && !isCreateContractPending;
  const canIncreaseQty =
    !isCreateContractPending && (purchaseLimit <= 0 || qty < purchaseLimit);
  const isSubmitDisabled =
    isCreateContractPending ||
    isPurchaseBlocked ||
    !isAuthorized ||
    !isUserDataConfirmed;
  const dockLabel = isPurchaseBlocked
    ? blockedPurchaseLabel
    : isCreateContractPending
      ? INSTALLMENT_UI.SUBMITTING
      : INSTALLMENT_UI.SUBMIT;
  const showCheckoutForm =
    !isOwnProduct &&
    installmentEnabled &&
    !programQuery.isPending &&
    Boolean(program?.isEnabled) &&
    plans.length > 0;

  useEffect(() => {
    if (plans.length === 0) {
      setSelectedPlanId("");
      return;
    }

    setSelectedPlanId((prev) => {
      if (prev && plans.some((plan) => plan._id === prev)) {
        return prev;
      }
      return plans[0]?._id ?? "";
    });
  }, [plans]);

  useEffect(() => {
    if (!onDockFooterChange) {
      return;
    }

    if (!dockSubmit || !showCheckoutForm) {
      onDockFooterChange(null);
      return;
    }

    onDockFooterChange({
      onSubmit: () => {
        openCheckoutSheetRef.current();
      },
      disabled: isSubmitDisabled,
      label: dockLabel,
    });
  }, [dockLabel, dockSubmit, isSubmitDisabled, onDockFooterChange, showCheckoutForm]);

  useEffect(
    () => () => {
      onDockFooterChange?.(null);
    },
    [onDockFooterChange],
  );

  if (isOwnProduct) {
    // Продавцу — статус его программы, как на сайте
    // (`ProductDetailsModalInstallmentTab`): на модерации, отклонена, активна.
    if (installmentEnabled && programQuery.isPending) {
      return <ScreenLoadingState />;
    }
    const sellerProgramActive =
      installmentEnabled &&
      program?.isEnabled === true &&
      program?.moderationStatus === "approved" &&
      plans.length > 0;
    const sellerMessage =
      program?.moderationStatus === "pending"
        ? INSTALLMENT_UI.MODERATION_PENDING
        : program?.moderationStatus === "rejected"
          ? INSTALLMENT_UI.MODERATION_REJECTED
          : sellerProgramActive
            ? INSTALLMENT_UI.MODERATION_APPROVED
            : INSTALLMENT_UI.SELLER_TAB_HINT;
    return <Text style={styles.message}>{sellerMessage}</Text>;
  }

  if (!installmentEnabled) {
    return <Text style={styles.message}>{PRODUCT_UI.INSTALLMENT_EMPTY}</Text>;
  }

  if (programQuery.isPending) {
    return <ScreenLoadingState />;
  }

  if (!program?.isEnabled || plans.length === 0) {
    const moderationHint =
      program?.moderationStatus === "pending"
        ? INSTALLMENT_UI.MODERATION_PENDING
        : INSTALLMENT_UI.MODERATION_REJECTED;
    return <Text style={styles.message}>{moderationHint}</Text>;
  }

  return (
    <View style={styles.tabContainer}>
      {!isUserDataConfirmed ? (
        <Text style={styles.installmentBuyerHintBlocked}>
          {INSTALLMENT_UI.BUYER_HINT}
        </Text>
      ) : null}

      <View style={styles.installmentBuyerForm}>
        <View>
          <Text style={styles.label}>{INSTALLMENT_UI.PLANS_LABEL}</Text>
          <View style={styles.installmentPlanList}>
            {plans.map((plan) => {
              const isSelected = plan._id === selectedPlanId;
              return (
                <Pressable
                  key={plan._id}
                  style={[styles.planCard, isSelected && styles.planCardSelected]}
                  onPress={() => setSelectedPlanId(plan._id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View
                    style={[
                      styles.planRadioOuter,
                      isSelected && styles.planRadioOuterSelected,
                    ]}
                  >
                    {isSelected ? <View style={styles.planRadioInner} /> : null}
                  </View>
                  <View style={styles.planContent}>
                    <Text style={styles.planTitle} numberOfLines={1}>
                      {plan.title ?? "План"}
                    </Text>
                    <Text
                      style={[
                        styles.planMonthly,
                        isSelected && styles.planMonthlySelected,
                      ]}
                    >
                      {INSTALLMENT_UI.PLAN_PER_MONTH(
                        formatPriceRub(plan.monthlyAmountRub),
                      )}
                    </Text>
                    <View style={styles.planMeta}>
                      <Text style={styles.planMetaText}>
                        {INSTALLMENT_UI.PLAN_MONTHS(plan.monthsCount ?? 0)}
                      </Text>
                      {!plan.firstPaymentRequiredNow ? (
                        <Text style={styles.planNote}>
                          {INSTALLMENT_UI.FIRST_PAYMENT_LATER}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.installmentQuantityRow}>
          <Text style={styles.installmentQuantityLabel}>
            {INSTALLMENT_UI.QUANTITY_LABEL}
          </Text>
          <View
            style={[
              styles.installmentStepper,
              isStepperFocused && styles.installmentStepperFocused,
            ]}
          >
            <Pressable
              style={[
                styles.installmentStepperButton,
                !canDecreaseQty && styles.installmentStepperButtonDisabled,
              ]}
              disabled={!canDecreaseQty}
              onPress={() => stepQuantity(-1)}
              accessibilityRole="button"
              accessibilityLabel={INSTALLMENT_UI.QUANTITY_DECREASE}
            >
              <Minus size={16} strokeWidth={2.4} color={theme.colors.text} />
            </Pressable>
            <TextInput
              style={styles.installmentStepperInput}
              value={quantity}
              onChangeText={(next) => {
                if (next === "" || /^\d+$/.test(next)) {
                  setQuantity(next);
                }
              }}
              onFocus={() => setIsStepperFocused(true)}
              onBlur={() => {
                setIsStepperFocused(false);
                normalizeQuantity();
              }}
              keyboardType="number-pad"
              editable={!isCreateContractPending}
              selectTextOnFocus
              {...textInputFocusScrollProps}
            />
            <Pressable
              style={[
                styles.installmentStepperButton,
                !canIncreaseQty && styles.installmentStepperButtonDisabled,
              ]}
              disabled={!canIncreaseQty}
              onPress={() => stepQuantity(1)}
              accessibilityRole="button"
              accessibilityLabel={INSTALLMENT_UI.QUANTITY_INCREASE}
            >
              <Plus size={16} strokeWidth={2.4} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>

        {selectedPlan ? (
          <View style={styles.installmentSummary}>
            <View style={styles.installmentSummaryRow}>
              <Text style={styles.installmentSummaryLabel}>
                {INSTALLMENT_UI.BUYER_PRODUCT_PRICE_LABEL}
              </Text>
              <Text style={styles.installmentSummaryValue}>
                {formatPriceRub(baseTotalRub)}
              </Text>
            </View>
            <View style={styles.installmentSummaryRow}>
              <Text style={styles.installmentSummaryLabel}>
                {INSTALLMENT_UI.BUYER_MARKUP_LABEL}
              </Text>
              <Text
                style={[
                  styles.installmentSummaryValue,
                  styles.installmentSummaryMarkup,
                ]}
              >
                +{formatPriceRub(markupTotalRub)}
              </Text>
            </View>
            <View style={styles.installmentSummaryRow}>
              <Text style={styles.installmentSummaryLabel}>
                {INSTALLMENT_UI.MONTHLY_LABEL}
              </Text>
              <Text style={styles.installmentSummaryValue}>
                {formatPriceRub(monthlyTotal)} ×{" "}
                {INSTALLMENT_UI.PLAN_MONTHS(selectedPlan.monthsCount ?? 0)}
              </Text>
            </View>
            <View
              style={[styles.installmentSummaryRow, styles.installmentSummaryRowTotal]}
            >
              <Text style={styles.installmentSummaryTotalLabel}>
                {INSTALLMENT_UI.TOTAL_LABEL}
              </Text>
              <Text style={styles.installmentSummaryTotalValue}>
                {formatPriceRub(contractTotal)}
              </Text>
            </View>
          </View>
        ) : null}

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

        {!dockSubmit ? (
          isPurchaseBlocked ? (
            <BlockedPurchaseButton label={blockedPurchaseLabel} variant="installment" />
          ) : (
            <Pressable
              style={[
                styles.installmentBuyerSubmit,
                isSubmitDisabled && styles.installmentBuyerSubmitDisabled,
              ]}
              disabled={isSubmitDisabled}
              onPress={openCheckoutSheet}
              accessibilityRole="button"
              accessibilityLabel={INSTALLMENT_UI.SUBMIT}
            >
              <Text style={styles.installmentBuyerSubmitText}>{dockLabel}</Text>
            </Pressable>
          )
        ) : null}
      </View>

      <CheckoutSheetModal
        visible={isCheckoutSheetOpen}
        defaultUser={defaultUser}
        pickupGroups={pickupGroups}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
        allowedPaymentMethods={allowedPaymentMethods}
        isSubmitting={false}
        submitError={sheetSubmitError}
        submitSuccess=""
        isDisabled={isSubmitDisabled}
        onClose={() => {
          setIsCheckoutSheetOpen(false);
          setSheetSubmitError("");
        }}
        onSubmit={handleCheckoutSheetSubmit}
      />

      <InstallmentPassportShareConsentModal
        visible={isConsentOpen}
        isConfirming={isCreateContractPending}
        onClose={() => {
          setIsConsentOpen(false);
          setPendingCheckout(null);
        }}
        onConfirm={() => {
          void handleConsentConfirm();
        }}
      />
    </View>
  );
};
