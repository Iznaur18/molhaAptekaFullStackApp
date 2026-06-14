import { useState } from "react";
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
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

type ProductInstallmentTabProps = {
  productId: string;
  installmentEnabled: boolean;
  isAuthorized: boolean;
  isUserDataConfirmed: boolean;
  isOwnProduct: boolean;
  defaultUser?: Record<string, unknown> | null;
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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (isOwnProduct) {
    return <Text style={styles.message}>{INSTALLMENT_UI.SELLER_TAB_HINT}</Text>;
  }

  if (!installmentEnabled) {
    return <Text style={styles.message}>{PRODUCT_UI.INSTALLMENT_EMPTY}</Text>;
  }

  if (programQuery.isPending) {
    return <ScreenLoadingState />;
  }

  const program = programQuery.data;
  const plans = program?.plans ?? [];
  const selectedPlan = plans.find((plan) => plan._id === selectedPlanId) ?? null;
  const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);

  const handleSubmit = async () => {
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
  };

  if (!program?.isEnabled || plans.length === 0) {
    const moderationHint =
      program?.moderationStatus === "pending"
        ? INSTALLMENT_UI.MODERATION_PENDING
        : INSTALLMENT_UI.MODERATION_REJECTED;
    return <Text style={styles.message}>{moderationHint}</Text>;
  }

  return (
    <View style={styles.tabContainer}>
      {!isAuthorized || !isUserDataConfirmed ? (
        <Text style={styles.hint}>{INSTALLMENT_UI.BUYER_HINT}</Text>
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
            <Text style={styles.planTitle}>{plan.title ?? "План"}</Text>
            <Text style={styles.planMeta}>
              {plan.monthsCount} мес. · {formatPriceRub(plan.monthlyAmountRub)} / мес.
            </Text>
            {!plan.firstPaymentRequiredNow ? (
              <Text style={styles.planMeta}>{INSTALLMENT_UI.FIRST_PAYMENT_LATER}</Text>
            ) : null}
            <Text style={styles.planTotal}>
              {INSTALLMENT_UI.TOTAL_LABEL}: {formatPriceRub(resolvePlanTotal(plan) * qty)}
            </Text>
          </Pressable>
        );
      })}

      <Text style={styles.label}>{INSTALLMENT_UI.QUANTITY_LABEL}</Text>
      <TextInput
        style={styles.compactInput}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="number-pad"
        placeholderTextColor={theme.colors.textMuted}
      />

      <AddressSuggestInput
        value={deliveryAddress}
        onChange={setDeliveryAddress}
        disabled={createContractMutation.isPending}
      />

      <Text style={styles.label}>{INSTALLMENT_UI.PAYMENT_METHOD_LABEL}</Text>
      {ORDER_PAYMENT_METHODS.map((method) => {
        const isActive = paymentMethod === method;
        return (
          <Pressable
            key={method}
            style={[styles.methodChip, isActive && styles.methodChipActive]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text style={[styles.methodText, isActive && styles.methodTextActive]}>
              {ORDER_PAYMENT_METHOD_LABEL_RU[method]}
            </Text>
          </Pressable>
        );
      })}

      {selectedPlan ? (
        <Text style={styles.summaryStrong}>
          {INSTALLMENT_UI.MONTHLY_LABEL}: {formatPriceRub(selectedPlan.monthlyAmountRub)}
        </Text>
      ) : null}

      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <AppButton
        label={INSTALLMENT_UI.SUBMIT}
        variant="contrast"
        onPress={() => void handleSubmit()}
        disabled={
          createContractMutation.isPending || !isAuthorized || !isUserDataConfirmed
        }
      />
    </View>
  );
};
