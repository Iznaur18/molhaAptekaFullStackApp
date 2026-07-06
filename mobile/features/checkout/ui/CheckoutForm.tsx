import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { addressValueFromUser } from "@/entities/address/lib/addressValueFromUser";
import { validateRuDeliveryAddressForm } from "@/entities/address/lib/validateRuDeliveryAddressForm";
import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import {
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import type { RuDeliveryAddressValue } from "@/entities/address/model/types";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCheckoutFormStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { CheckoutPaymentMethodPicker } from "@/features/checkout/ui/CheckoutPaymentMethodPicker";

type CheckoutFormProps = {
  defaultUser?: Record<string, unknown> | null;
  isSubmitting: boolean;
  submitError: string;
  submitSuccess: string;
  isDisabled?: boolean;
  showHeading?: boolean;
  onSubmit: (payload: {
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  }) => void | Promise<void>;
};

export const CheckoutForm = ({
  defaultUser,
  isSubmitting,
  submitError,
  submitSuccess,
  isDisabled = false,
  showHeading = true,
  onSubmit,
}: CheckoutFormProps) => {
  const theme = useAppTheme();
  const checkoutStyles = useCheckoutFormStyles();
  const [deliveryAddress, setDeliveryAddress] = useState<RuDeliveryAddressValue>(() =>
    addressValueFromUser(defaultUser),
  );
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(
    ORDER_PAYMENT_METHOD_CARD_PREPAID,
  );
  const [localError, setLocalError] = useState("");

  const handleSubmit = () => {
    const validationError = validateRuDeliveryAddressForm(deliveryAddress, { required: true });
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError("");
    void onSubmit({
      deliveryAddress: deliveryAddress.line.trim(),
      deliveryAddressFlat: deliveryAddress.flat.trim(),
      paymentMethod,
    });
  };

  const isAddressValid =
    validateRuDeliveryAddressForm(deliveryAddress, { required: true }) === null;
  const isFormDisabled = isDisabled || isSubmitting || !isAddressValid;
  const displayError = localError || submitError;

  return (
    <View style={checkoutStyles.form}>
      {showHeading ? (
        <Text style={checkoutStyles.heading}>{CHECKOUT_FORM_UI.HEADING}</Text>
      ) : null}

      <AddressSuggestInput
        value={deliveryAddress}
        onChange={setDeliveryAddress}
        disabled={isDisabled || isSubmitting}
        placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_DELIVERY_ADDRESS}
        containerStyle={checkoutStyles.fieldGroup}
        labelStyle={checkoutStyles.fieldLabel}
        inputStyle={checkoutStyles.fieldInput}
      />

      <Text style={checkoutStyles.fieldLabel}>{CHECKOUT_FORM_UI.LABEL_FLAT}</Text>
      <TextInput
        style={checkoutStyles.fieldInput}
        value={deliveryAddress.flat}
        onChangeText={(flat) => setDeliveryAddress((prev) => ({ ...prev, flat }))}
        placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_FLAT}
        placeholderTextColor={theme.colors.textMuted}
        editable={!isDisabled && !isSubmitting}
        keyboardType="default"
      />

      <CheckoutPaymentMethodPicker
        value={paymentMethod}
        onChange={setPaymentMethod}
        disabled={isDisabled || isSubmitting}
      />

      {displayError ? <Text style={checkoutStyles.feedbackError}>{displayError}</Text> : null}
      {submitSuccess ? <Text style={checkoutStyles.feedbackSuccess}>{submitSuccess}</Text> : null}

      <AppButton
        label={CHECKOUT_FORM_UI.SUBMIT_IDLE}
        variant="primary"
        onPress={handleSubmit}
        disabled={isFormDisabled}
        style={checkoutStyles.submitSpacer}
      />
    </View>
  );
};
