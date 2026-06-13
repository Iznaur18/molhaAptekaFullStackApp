import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { addressValueFromUser } from "@/entities/address/lib/addressValueFromUser";
import { validateRuDeliveryAddressForm } from "@/entities/address/lib/validateRuDeliveryAddressForm";
import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import {
  ORDER_PAYMENT_METHOD_CARD_PREPAID,
  ORDER_PAYMENT_METHOD_LABEL_RU,
  ORDER_PAYMENT_METHODS,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import type { RuDeliveryAddressValue } from "@/entities/address/model/types";
import { CHECKOUT_FORM_UI } from "@/shared/config";

type CheckoutFormProps = {
  defaultUser?: Record<string, unknown> | null;
  isSubmitting: boolean;
  submitError: string;
  submitSuccess: string;
  isDisabled?: boolean;
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
  onSubmit,
}: CheckoutFormProps) => {
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
    <View style={styles.form}>
      <Text style={styles.heading}>{CHECKOUT_FORM_UI.HEADING}</Text>

      <AddressSuggestInput
        value={deliveryAddress}
        onChange={setDeliveryAddress}
        disabled={isDisabled || isSubmitting}
        placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_DELIVERY_ADDRESS}
      />

      <Text style={styles.flatLabel}>{CHECKOUT_FORM_UI.LABEL_FLAT}</Text>
      <TextInput
        style={styles.flatInput}
        value={deliveryAddress.flat}
        onChangeText={(flat) => setDeliveryAddress((prev) => ({ ...prev, flat }))}
        placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_FLAT}
        editable={!isDisabled && !isSubmitting}
        keyboardType="default"
      />

      <Text style={styles.legend}>{CHECKOUT_FORM_UI.LABEL_PAYMENT_METHOD}</Text>
      {ORDER_PAYMENT_METHODS.map((method) => (
        <Pressable
          key={method}
          style={styles.radioRow}
          onPress={() => setPaymentMethod(method)}
          disabled={isDisabled || isSubmitting}
        >
          <View style={[styles.radio, paymentMethod === method && styles.radioChecked]} />
          <Text style={styles.radioLabel}>{ORDER_PAYMENT_METHOD_LABEL_RU[method]}</Text>
        </Pressable>
      ))}

      {displayError ? <Text style={styles.error}>{displayError}</Text> : null}
      {submitSuccess ? <Text style={styles.success}>{submitSuccess}</Text> : null}

      <Pressable
        style={[styles.submit, isFormDisabled && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={isFormDisabled}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{CHECKOUT_FORM_UI.SUBMIT_IDLE}</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  flatLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  flatInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  legend: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#999",
  },
  radioChecked: {
    borderColor: "#111",
    backgroundColor: "#111",
  },
  radioLabel: {
    fontSize: 15,
    color: "#222",
  },
  error: {
    color: "#c62828",
    marginTop: 8,
  },
  success: {
    color: "#2e7d32",
    marginTop: 8,
  },
  submit: {
    marginTop: 16,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
