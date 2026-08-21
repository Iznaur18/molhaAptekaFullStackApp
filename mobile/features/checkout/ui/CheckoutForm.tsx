import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ORDER_FULFILLMENT_DELIVERY,
  ORDER_FULFILLMENT_PICKUP,
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT,
} from "@molha/api-contract";

import { addressValueFromUser } from "@/entities/address/lib/addressValueFromUser";
import { validateRuDeliveryAddressForm } from "@/entities/address/lib/validateRuDeliveryAddressForm";
import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import type { OrderFulfillmentMethod } from "@/entities/order/api/createOrder";
import {
  ORDER_PAYMENT_METHOD_DEFAULT,
  type OrderPaymentMethod,
} from "@/entities/order/model/constants";
import type { RuDeliveryAddressValue } from "@/entities/address/model/types";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useCheckoutFormStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { CheckoutPaymentMethodPicker } from "@/features/checkout/ui/CheckoutPaymentMethodPicker";
import { CheckoutShippingProviderPicker } from "@/features/checkout/ui/CheckoutShippingProviderPicker";
import type { CheckoutPickupLocation } from "@/entities/cart/lib/buildCheckoutPickupLocations";

type CheckoutFormProps = {
  defaultUser?: Record<string, unknown> | null;
  pickupLocations?: CheckoutPickupLocation[];
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
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
  pickupLocations = [],
  deliveryAvailable = false,
  pickupAvailable = true,
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
    ORDER_PAYMENT_METHOD_DEFAULT,
  );
  const [localError, setLocalError] = useState("");

  const deliverySelectable =
    PRODUCT_DELIVERY_FULFILLMENT_ENABLED && deliveryAvailable;
  const pickupSelectable = pickupAvailable;

  useEffect(() => {
    if (!deliverySelectable && fulfillmentMethod === ORDER_FULFILLMENT_DELIVERY) {
      if (pickupSelectable) {
        setFulfillmentMethod(ORDER_FULFILLMENT_PICKUP);
      }
      return;
    }
    if (!pickupSelectable && fulfillmentMethod === ORDER_FULFILLMENT_PICKUP) {
      if (deliverySelectable) {
        setFulfillmentMethod(ORDER_FULFILLMENT_DELIVERY);
      }
    }
  }, [deliverySelectable, pickupSelectable, fulfillmentMethod]);

  const isPickup = fulfillmentMethod === ORDER_FULFILLMENT_PICKUP;
  const pickupPoints = useMemo(
    () =>
      (Array.isArray(pickupLocations) ? pickupLocations : [])
        .map((item) => ({
          address: String(item?.address ?? "").trim(),
          productTitles: Array.isArray(item?.productTitles)
            ? item.productTitles.map((title) => String(title ?? "").trim()).filter(Boolean)
            : [],
        }))
        .filter((item) => item.address.length > 0),
    [pickupLocations],
  );
  const pickupReady = pickupPoints.length > 0;
  const showPickupTitles = pickupPoints.length > 1;

  const isAddressValid = useMemo(() => {
    if (isPickup) {
      return pickupSelectable && pickupReady;
    }
    return (
      deliverySelectable &&
      validateRuDeliveryAddressForm(deliveryAddress, { required: true }) === null
    );
  }, [deliveryAddress, deliverySelectable, isPickup, pickupReady, pickupSelectable]);

  const deliveryOptionHint = !PRODUCT_DELIVERY_FULFILLMENT_ENABLED
    ? SHIPPING_PROVIDERS_CHECKOUT_SOON_HINT
    : !deliveryAvailable
      ? CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE
      : null;

  const pickupOptionHint = !pickupAvailable
    ? CHECKOUT_FORM_UI.FULFILLMENT_PICKUP_UNAVAILABLE
    : null;

  const handleSubmit = () => {
    if (isPickup) {
      if (!pickupSelectable || !pickupReady) {
        setLocalError(pickupOptionHint || CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED);
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

    if (!deliverySelectable) {
      setLocalError(
        deliveryOptionHint || CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE,
      );
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
            accessibilityState={{
              disabled: !pickupSelectable || isDisabled || isSubmitting,
              checked: isPickup,
            }}
            onPress={() => {
              if (!pickupSelectable) {
                Alert.alert(
                  CHECKOUT_FORM_UI.FULFILLMENT_PICKUP,
                  pickupOptionHint || CHECKOUT_FORM_UI.FULFILLMENT_PICKUP_UNAVAILABLE,
                );
                return;
              }
              setLocalError("");
              setFulfillmentMethod(ORDER_FULFILLMENT_PICKUP);
            }}
            style={[
              checkoutStyles.fulfillmentOption,
              isPickup && checkoutStyles.fulfillmentOptionActive,
              !pickupSelectable && checkoutStyles.fulfillmentOptionDisabled,
            ]}
          >
            <Text
              style={[
                checkoutStyles.fulfillmentOptionText,
                isPickup && checkoutStyles.fulfillmentOptionTextActive,
                !pickupSelectable && checkoutStyles.fulfillmentOptionTextDisabled,
              ]}
            >
              {CHECKOUT_FORM_UI.FULFILLMENT_PICKUP}
            </Text>
          </Pressable>
          <Pressable
            disabled={isDisabled || isSubmitting}
            accessibilityState={{
              disabled: !deliverySelectable || isDisabled || isSubmitting,
              checked: !isPickup,
            }}
            onPress={() => {
              if (!deliverySelectable) {
                Alert.alert(
                  CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY,
                  deliveryOptionHint ||
                    CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY_UNAVAILABLE,
                );
                return;
              }
              setLocalError("");
              setFulfillmentMethod(ORDER_FULFILLMENT_DELIVERY);
            }}
            style={[
              checkoutStyles.fulfillmentOption,
              !isPickup && checkoutStyles.fulfillmentOptionActive,
              !deliverySelectable && checkoutStyles.fulfillmentOptionDisabled,
            ]}
          >
            <Text
              style={[
                checkoutStyles.fulfillmentOptionText,
                !isPickup && checkoutStyles.fulfillmentOptionTextActive,
                !deliverySelectable && checkoutStyles.fulfillmentOptionTextDisabled,
              ]}
            >
              {CHECKOUT_FORM_UI.FULFILLMENT_DELIVERY}
            </Text>
          </Pressable>
        </View>

        {isPickup ? (
          <View style={checkoutStyles.fieldGroup}>
            <Text style={checkoutStyles.fieldLabel}>{CHECKOUT_FORM_UI.PICKUP_ADDRESS_LABEL}</Text>
            {pickupReady ? (
              <>
                {pickupPoints.length > 1 ? (
                  <Text style={checkoutStyles.pickupHint}>{CHECKOUT_FORM_UI.PICKUP_MULTI_HINT}</Text>
                ) : null}
                <View style={checkoutStyles.pickupList}>
                  {pickupPoints.map((point, index) => (
                    <View
                      key={`${point.address}-${index}`}
                      style={checkoutStyles.pickupItem}
                    >
                      <View style={checkoutStyles.pickupIndex}>
                        <Text style={checkoutStyles.pickupIndexText}>{index + 1}</Text>
                      </View>
                      <View style={checkoutStyles.pickupBody}>
                        {showPickupTitles && point.productTitles.length > 0 ? (
                          <Text style={checkoutStyles.pickupProducts}>
                            {point.productTitles.join(", ")}
                          </Text>
                        ) : null}
                        <Text style={checkoutStyles.pickupAddressText}>{point.address}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={[checkoutStyles.pickupAddressText, checkoutStyles.pickupAddressError]}>
                {CHECKOUT_FORM_UI.ERROR_PICKUP_REQUIRED}
              </Text>
            )}
          </View>
        ) : (
          <>
            <AddressSuggestInput
              value={deliveryAddress}
              onChange={setDeliveryAddress}
              disabled={isDisabled || isSubmitting}
              displayOnly
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

            <CheckoutShippingProviderPicker disabled={isDisabled || isSubmitting} />
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
