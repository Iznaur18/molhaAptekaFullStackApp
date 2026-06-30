import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { addressValueFromUser } from "@/entities/address/lib/addressValueFromUser";
import { validateRuDeliveryAddressForm } from "@/entities/address/lib/validateRuDeliveryAddressForm";
import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import type { RuDeliveryAddressValue } from "@/entities/address/model/types";
import type { InstallmentPlan } from "@/entities/installment/api/installmentApi";
import { useInstallmentMutations } from "@/entities/installment/model/useInstallmentMutations";
import { useProductInstallmentProgramQuery } from "@/entities/installment/model/useProductInstallmentProgramQuery";
import {
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_PAYMENT_METHODS,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import { INSTALLMENT_UI, PRODUCT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailTabStyles } from "@/shared/theme/catalogProductStyles";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

export type ProductInstallmentDockFooter = {
  onSubmit: () => void;
  disabled: boolean;
  label: string;
};

type ProductInstallmentTabProps = {
  productId: string;
  installmentEnabled: boolean;
  isAuthorized: boolean;
  isUserDataConfirmed: boolean;
  isOwnProduct: boolean;
  defaultUser?: Record<string, unknown> | null;
  dockSubmit?: boolean;
  onDockFooterChange?: (footer: ProductInstallmentDockFooter | null) => void;
};

const resolvePlanTotal = (plan: InstallmentPlan) =>
  (plan.monthsCount ?? 0) * (plan.monthlyAmountRub ?? 0);

export const ProductInstallmentTab = ({
  productId,
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
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [deliveryAddress, setDeliveryAddress] = useState<RuDeliveryAddressValue>(() =>
    addressValueFromUser(defaultUser),
  );
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(
    ORDER_PAYMENT_METHOD_CARD_PREPAID,
  );
  const [paymentMenuOpen, setPaymentMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = useCallback(async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!isAuthorized) {
      setErrorMessage(INSTALLMENT_UI.BUYER_REQUIRES_CONFIRMED);
      return;
    }
    if (!isUserDataConfirmed) {
      setErrorMessage(INSTALLMENT_UI.BUYER_REQUIRES_CONFIRMED);
      return;
    }
    if (!selectedPlanId) {
      setErrorMessage(INSTALLMENT_UI.SELECT_PLAN);
      return;
    }

    const addressError = validateRuDeliveryAddressForm(deliveryAddress, { required: true });
    if (addressError) {
      setErrorMessage(addressError);
      return;
    }

    const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);

    try {
      await createContractMutation.mutateAsync({
        productId,
        body: {
          planId: selectedPlanId,
          quantity: qty,
          deliveryAddress: deliveryAddress.line.trim(),
          deliveryAddressFlat: deliveryAddress.flat.trim() || undefined,
          paymentMethod,
        },
      });
      setSuccessMessage(INSTALLMENT_UI.CONTRACT_SUCCESS);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : INSTALLMENT_UI.ERROR_GENERIC);
    }
  }, [
    createContractMutation,
    deliveryAddress,
    isAuthorized,
    isUserDataConfirmed,
    paymentMethod,
    productId,
    quantity,
    selectedPlanId,
  ]);

  const program = programQuery.data;
  const plans = program?.plans ?? [];
  const selectedPlan = plans.find((plan) => plan._id === selectedPlanId) ?? null;
  const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
  const isSubmitDisabled =
    createContractMutation.isPending || !isAuthorized || !isUserDataConfirmed;
  const showCheckoutForm =
    !isOwnProduct &&
    installmentEnabled &&
    !programQuery.isPending &&
    Boolean(program?.isEnabled) &&
    plans.length > 0;

  useEffect(() => {
    if (!dockSubmit || !onDockFooterChange || !showCheckoutForm) {
      onDockFooterChange?.(null);
      return;
    }

    onDockFooterChange({
      onSubmit: () => {
        void handleSubmit();
      },
      disabled: isSubmitDisabled,
      label: createContractMutation.isPending
        ? INSTALLMENT_UI.SUBMITTING
        : INSTALLMENT_UI.SUBMIT,
    });

    return () => {
      onDockFooterChange(null);
    };
  }, [
    createContractMutation.isPending,
    dockSubmit,
    handleSubmit,
    isSubmitDisabled,
    onDockFooterChange,
    showCheckoutForm,
  ]);

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
      <Text style={styles.installmentBuyerHint}>{INSTALLMENT_UI.BUYER_HINT}</Text>

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
        />
      </View>

      {selectedPlan ? (
        <View style={{ gap: 8 }}>
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

      <View style={styles.addressSection}>
        <AddressSuggestInput
          value={deliveryAddress}
          onChange={setDeliveryAddress}
          disabled={createContractMutation.isPending}
        />

        <View>
          <Text style={styles.label}>{INSTALLMENT_UI.PAYMENT_METHOD_LABEL}</Text>
          <Pressable
            style={styles.paymentSelect}
            onPress={() => setPaymentMenuOpen((v) => !v)}
          >
            <Text style={styles.paymentSelectText}>
              {ORDER_PAYMENT_METHOD_LABEL_RU[paymentMethod]}
            </Text>
            <Text style={styles.paymentSelectChevron}>{paymentMenuOpen ? "▲" : "▾"}</Text>
          </Pressable>
          {paymentMenuOpen ? (
            <View style={styles.paymentDropdown}>
              {ORDER_PAYMENT_METHODS.map((method, index) => {
                const isActive = paymentMethod === method;
                const isLast = index === ORDER_PAYMENT_METHODS.length - 1;
                return (
                  <Pressable
                    key={method}
                    style={[
                      styles.paymentDropdownItem,
                      isLast && styles.paymentDropdownItemLast,
                      isActive && styles.paymentDropdownItemActive,
                    ]}
                    onPress={() => {
                      setPaymentMethod(method);
                      setPaymentMenuOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.paymentDropdownItemText,
                        isActive && styles.paymentDropdownItemTextActive,
                      ]}
                    >
                      {ORDER_PAYMENT_METHOD_LABEL_RU[method]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>

      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
