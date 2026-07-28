import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
} from "@molha/api-contract";

import { addressValueFromUser } from "@/entities/address/lib/addressValueFromUser";
import { validateRuDeliveryAddressForm } from "@/entities/address/lib/validateRuDeliveryAddressForm";
import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import type { OrderFulfillmentMethod } from "@/entities/order/api/createOrder";
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
  pickupAddressSummary?: string;
  isSubmitting: boolean;
  submitError: string;
  submitSuccess: string;
  isDisabled?: boolean;
  showHeading?: boolean;
  pinSubmitToBottom?: boolean;
  onSubmit: (payload: {
    fulfillmentMethod: OrderFulfillmentMethod;
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  }) => void | Promise<void>;
};

export const CheckoutForm = ({
  defaultUser,
  pickupAddressSummary = "",
  isSubmitting,
  submitError,
  submitSuccess,
  isDisabled = false,
  showHeading = true,
  pinSubmitToBottom = false,
  onSubmit,
}: CheckoutFormProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const checkoutStyles = useCheckoutFormStyles();
  const [fulfillmentMethod, setFulfillmentMethod] = useState<OrderFulfillmentMethod>(
    ORDER_FULFILLMENT_PICKUP,
  );
  const [deliveryAddress, setDeliveryAddress] = useState<RuDeliveryAddressValue>(() =>
    addressValueFromUser(defaultUser),
  );
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(
    ORDER_PAYMENT_METHOD_CARD_PREPAID,
  );
  const [localError, setLocalError] = useState("");

  const isPickup = fulfillmentMethod === ORDER_FULFILLMENT_PICKUP;
  const pickupReady = String(pickupAddressSummary ?? "").trim().length > 0;

  const isAddressValid = useMemo(() => {
    if (isPickup) {
      return pickupReady;
    }
    return validateRuDeliveryAddressForm(deliveryAddress, { required: true }) === null;
  }, [deliveryAddress, isPickup, pickupReady]);

  const handleSubmit = () => {
    if (isPickup) {
      if (!pickupReady) {
        setLocalError(CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED);
        return;
      }
      setLocalError("");
      void onSubmit({
        fulfillmentMethod: ORDER_FULFILLMENT_PICKUP,
        deliveryAddress: "",
        deliveryAddressFlat: "",
        paymentMethod,
      });
      return;
    }

    if (!PRODUCT_DELIVERY_FULFILLMENT_ENABLED) {
      setLocalError(CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_SOON);
      return;
    }

    const validationError = validateRuDeliveryAddressForm(deliveryAddress, { required: true });
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError("");
    void onSubmit({
      fulfillmentMethod: ORDER_FULFILLMENT_DELIVERY,
      deliveryAddress: deliveryAddress.line.trim(),
      deliveryAddressFlat: deliveryAddress.flat.trim(),
      paymentMethod,
    });
  };

  const isFormDisabled = isDisabled || isSubmitting || !isAddressValid;
  const displayError = localError || submitError;

  return (
    <View style={[checkoutStyles.form, pinSubmitToBottom && checkoutStyles.formPinned]}>
      <View style={checkoutStyles.fields}>
        {showHeading ? (
          <Text style={checkoutStyles.heading}>{CHECKOUT_FORM_UI.HEADING}</Text>
        ) : null}

        <Text style={checkoutStyles.fieldLabel}>{CHECKOUT_FORM_UI.LABEL_FULFILLMENT}</Text>
        <View style={checkoutStyles.fulfillmentRow}>
          <Pressable
            disabled={isDisabled || isSubmitting}
            onPress={() => setFulfillmentMethod(ORDER_FULFILLMENT_PICKUP)}
            style={[
              checkoutStyles.fulfillmentOption,
              isPickup && checkoutStyles.fulfillmentOptionActive,
            ]}
          >
            <Text
              style={[
                checkoutStyles.fulfillmentOptionText,
                isPickup && checkoutStyles.fulfillmentOptionTextActive,
              ]}
            >
              {CHECKOUT_FORM_UI.FULFILLMENT_PICKUP}
            </Text>
          </Pressable>
          <Pressable
            disabled={!PRODUCT_DELIVERY_FULFILLMENT_ENABLED || isDisabled || isSubmitting}
            style={[checkoutStyles.fulfillmentOption, checkoutStyles.fulfillmentOptionDisabled]}
          >
            <Text style={checkoutStyles.fulfillmentOptionTextDisabled}>
              {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}
              {" ("}
              {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_SOON}
              {")"}
            </Text>
          </Pressable>
        </View>

        {isPickup ? (
          <View style={checkoutStyles.fieldGroup}>
            <Text style={checkoutStyles.fieldLabel}>{CHECKOUT_FORM_UI.PICKUP_ADDRESS_LABEL}</Text>
            <Text style={checkoutStyles.pickupAddressText}>
              {pickupReady ? pickupAddressSummary : CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED}
            </Text>
          </View>
        ) : (
          <>
            <AddressSuggestInput
              value={deliveryAddress}
              onChange={setDeliveryAddress}
              disabled={isDisabled || isSubmitting}
              placeholder={CHECKOUT_FORM_UI.PLACEHOLDER_DELIVERY_ADDRESS}
              label={CHECKOUT_FORM_UI.LABEL_DELIVERY_ADDRESS}
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
          </>
        )}

        <CheckoutPaymentMethodPicker
          value={paymentMethod}
          onChange={setPaymentMethod}
          disabled={isDisabled || isSubmitting}
        />

        {displayError ? <Text style={checkoutStyles.feedbackError}>{displayError}</Text> : null}
        {submitSuccess ? <Text style={checkoutStyles.feedbackSuccess}>{submitSuccess}</Text> : null}
      </View>

      <AppButton
        label={CHECKOUT_FORM_UI.SUBMIT_IDLE}
        variant="primary"
        onPress={handleSubmit}
        disabled={isFormDisabled}
        style={[
          checkoutStyles.submitSpacer,
          pinSubmitToBottom && checkoutStyles.submitDocked,
          pinSubmitToBottom ? { marginBottom: Math.max(insets.bottom, 12) } : null,
        ]}
      />
    </View>
  );
};
