import { useMemo } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import type { OrderFulfillmentMethod } from "@/entities/order/api/createOrder";
import type { OrderPaymentMethod } from "@/entities/order/model/constants";
import type { CheckoutPickupLocation } from "@/entities/cart/lib/buildCheckoutPickupLocations";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import { CHECKOUT_FORM_UI, CART_PAGE_UI } from "@/shared/config";
import { useAdminEditModalAnimation } from "@/shared/model/useAdminEditModalAnimation";
import { useBottomSheetFormStyles } from "@/shared/theme/formChromeStyles";
import { CHECKOUT_SHEET_MODAL_ANIMATION } from "@/shared/theme/modalChromeStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

type CheckoutSheetModalProps = {
  visible: boolean;
  defaultUser?: Record<string, unknown> | null;
  pickupLocations?: CheckoutPickupLocation[];
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  isSubmitting: boolean;
  submitError: string;
  submitSuccess: string;
  isDisabled?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    fulfillmentMethod: OrderFulfillmentMethod;
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  }) => void | Promise<void>;
};

export const CheckoutSheetModal = ({
  visible,
  defaultUser,
  pickupLocations = [],
  deliveryAvailable = false,
  pickupAvailable = true,
  isSubmitting,
  submitError,
  submitSuccess,
  isDisabled = false,
  onClose,
  onSubmit,
}: CheckoutSheetModalProps) => {
  const sheetStyles = useBottomSheetFormStyles();
  const sheetSlideDistance = useMemo(() => Dimensions.get("window").height, []);
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle } =
    useAdminEditModalAnimation(visible, {
      sheetSlideDistance,
      enterMs: CHECKOUT_SHEET_MODAL_ANIMATION.enterMs,
      exitMs: CHECKOUT_SHEET_MODAL_ANIMATION.exitMs,
    });

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <View style={sheetStyles.backdrop}>
        <Animated.View
          style={[StyleSheet.absoluteFillObject, backdropAnimatedStyle]}
          pointerEvents="none"
        >
          <ModalSheetGradientBackdrop />
        </Animated.View>
        <Pressable
          style={sheetStyles.backdropDismiss}
          onPress={onClose}
          accessibilityRole="button"
        />
        <Animated.View
          style={[sheetStyles.sheet, sheetStyles.checkoutSheet, sheetAnimatedStyle]}
        >
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.title}>{CHECKOUT_FORM_UI.HEADING}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={sheetStyles.close}>{CART_PAGE_UI.CHECKOUT_SHEET_CLOSE}</Text>
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            style={sheetStyles.checkoutScroll}
            contentContainerStyle={[sheetStyles.form, sheetStyles.checkoutForm]}
          >
            <CheckoutForm
              key={defaultUser?._id != null ? String(defaultUser._id) : "guest"}
              defaultUser={defaultUser}
              pickupLocations={pickupLocations}
              deliveryAvailable={deliveryAvailable}
              pickupAvailable={pickupAvailable}
              isSubmitting={isSubmitting}
              submitError={submitError}
              submitSuccess={submitSuccess}
              isDisabled={isDisabled}
              showHeading={false}
              pinSubmitToBottom
              onSubmit={onSubmit}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};
