import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  ORDER_FULFILLMENT_PICKUP,
  doProductsSupportPickup,
  doProductsSupportSellerDelivery,
} from "@molha/api-contract";

import { buildCheckoutPickupLocations } from "@/entities/cart/lib/buildCheckoutPickupLocations";
import type { InstallmentPlan } from "@/entities/installment/api/installmentApi";
import { resolveInstallmentPlanPriceSummary } from "@/entities/installment/lib/resolveInstallmentPlanPriceSummary";
import { useInstallmentMutations } from "@/entities/installment/model/useInstallmentMutations";
import { useProductInstallmentProgramQuery } from "@/entities/installment/model/useProductInstallmentProgramQuery";
import { InstallmentPassportShareConsentModal } from "@/entities/installment/ui/InstallmentPassportShareConsentModal";
import {
  ORDER_PAYMENT_METHOD_DEFAULT,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import type { OrderFulfillmentMethod } from "@/entities/order/api/createOrder";
import { CheckoutSheetModal } from "@/features/checkout/ui/CheckoutSheetModal";
import { CHECKOUT_FORM_UI, INSTALLMENT_UI, PRODUCT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";
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
};

type PendingCheckout = {
  deliveryAddress: string;
  deliveryAddressFlat: string;
  paymentMethod: OrderPaymentMethod;
};

const resolvePlanTotal = (plan: InstallmentPlan) =>
  (plan.monthsCount ?? 0) * (plan.monthlyAmountRub ?? 0);

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
}: ProductInstallmentTabProps) => {
  const theme = useAppTheme();
  const styles = useProductDetailTabStyles();
  const programQuery = useProductInstallmentProgramQuery(productId, installmentEnabled);
  const { createContractMutation } = useInstallmentMutations();
  const { mutateAsync: createInstallmentContract, isPending: isCreateContractPending } =
    createContractMutation;
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [quantity, setQuantity] = useState("1");
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

  const pickupLocations = useMemo(
    () => buildCheckoutPickupLocations([{ product: productForCheckout }]),
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
    return true;
  }, [isAuthorized, isUserDataConfirmed, selectedPlanId]);

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
      const resolved = resolveInstallmentDeliveryFromSheet(sheetPayload, productForCheckout);
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
    const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);

    try {
      await createInstallmentContract({
        productId,
        body: {
          planId: selectedPlanId,
          quantity: qty,
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
      setErrorMessage(error instanceof Error ? error.message : INSTALLMENT_UI.ERROR_GENERIC);
    }
  }, [
    createInstallmentContract,
    pendingCheckout,
    productId,
    quantity,
    selectedPlanId,
  ]);

  const openCheckoutSheetRef = useRef(openCheckoutSheet);
  openCheckoutSheetRef.current = openCheckoutSheet;

  const program = programQuery.data;
  const plans = program?.plans ?? [];
  const selectedPlan = plans.find((plan) => plan._id === selectedPlanId) ?? null;
  const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
  const selectedPlanPriceSummary = selectedPlan
    ? resolveInstallmentPlanPriceSummary(
        productPrice,
        selectedPlan.monthsCount ?? 0,
        selectedPlan.monthlyAmountRub ?? 0,
      )
    : null;
  const baseTotalRub = (selectedPlanPriceSummary?.productPriceRub ?? 0) * qty;
  const markupTotalRub = (selectedPlanPriceSummary?.markupRub ?? 0) * qty;
  const isSubmitDisabled = isCreateContractPending || !isAuthorized || !isUserDataConfirmed;
  const dockLabel = isCreateContractPending ? INSTALLMENT_UI.SUBMITTING : INSTALLMENT_UI.SUBMIT;
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
    return <Text style={styles.message}>{INSTALLMENT_UI.SELLER_TAB_HINT}</Text>;
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
        <Text style={styles.installmentBuyerHintBlocked}>{INSTALLMENT_UI.BUYER_HINT}</Text>
      ) : null}

      <Text style={styles.label}>{INSTALLMENT_UI.PLANS_LABEL}</Text>
      {plans.map((plan) => {
        const isSelected = plan._id === selectedPlanId;
        return (
          <Pressable
            key={plan._id}
            style={[styles.planCard, isSelected && styles.planCardSelected]}
            onPress={() => setSelectedPlanId(plan._id)}
          >
            <View style={[styles.planRadioOuter, isSelected && styles.planRadioOuterSelected]}>
              {isSelected ? <View style={styles.planRadioInner} /> : null}
            </View>
            <View style={styles.planContent}>
              <Text style={styles.planTitle}>{plan.title ?? "План"}</Text>
              <Text style={styles.planMeta}>
                {plan.monthsCount} мес × {formatPriceRub(plan.monthlyAmountRub)}
              </Text>
              {!plan.firstPaymentRequiredNow ? (
                <Text style={styles.planMeta}>{INSTALLMENT_UI.FIRST_PAYMENT_LATER}</Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}

      <View>
        <Text style={styles.label}>{INSTALLMENT_UI.QUANTITY_LABEL}</Text>
        <TextInput
          style={[styles.compactInput, styles.quantityField, { marginTop: 6 }]}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
          placeholderTextColor={theme.colors.textMuted}
          {...textInputFocusScrollProps}
        />
      </View>

      {selectedPlan ? (
        <View style={{ gap: 8 }}>
          <View style={styles.totalBox}>
            <Text style={styles.totalBoxLabel}>{INSTALLMENT_UI.BUYER_PRODUCT_PRICE_LABEL}</Text>
            <Text style={styles.totalBoxValue}>{formatPriceRub(baseTotalRub)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalBoxLabel}>{INSTALLMENT_UI.BUYER_MARKUP_LABEL}</Text>
            <Text style={styles.totalBoxValue}>+{formatPriceRub(markupTotalRub)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalBoxLabel}>{INSTALLMENT_UI.MONTHLY_LABEL}</Text>
            <Text style={styles.totalBoxValue}>
              {formatPriceRub((selectedPlan.monthlyAmountRub ?? 0) * qty)}
            </Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalBoxLabel}>{INSTALLMENT_UI.TOTAL_LABEL}</Text>
            <Text style={styles.totalBoxValue}>
              {formatPriceRub(resolvePlanTotal(selectedPlan) * qty)}
            </Text>
          </View>
        </View>
      ) : null}

      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {!dockSubmit ? (
        <Pressable
          style={[styles.planCard, isSubmitDisabled && { opacity: 0.5 }]}
          disabled={isSubmitDisabled}
          onPress={openCheckoutSheet}
        >
          <Text style={styles.planTitle}>{dockLabel}</Text>
        </Pressable>
      ) : null}

      <CheckoutSheetModal
        visible={isCheckoutSheetOpen}
        defaultUser={defaultUser}
        pickupLocations={pickupLocations}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
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
