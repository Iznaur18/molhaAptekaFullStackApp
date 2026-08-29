import { useMemo } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

import type { OrderFulfillmentMethod } from "@/entities/order/api/createOrder";
import type { OrderPaymentMethod } from "@/entities/order/model/constants";
import type { CheckoutProductPickupGroup } from "@/entities/cart/lib/buildCheckoutPickupLocations";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import { useCheckoutSheetModalAnimation } from "@/features/checkout/model/useCheckoutSheetModalAnimation";
import { CHECKOUT_FORM_UI, CART_PAGE_UI } from "@/shared/config";
import { resolveAppShellMaxWidthStyle } from "@/shared/lib/appShellLayout";
import { useBottomSheetFormStyles } from "@/shared/theme/formChromeStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

type CheckoutSheetModalProps = {
  visible: boolean;
  defaultUser?: Record<string, unknown> | null;
  pickupGroups?: CheckoutProductPickupGroup[];
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
    pickupSelections?: Array<{ productId: string; pickupLocationId: string }>;
  }) => void | Promise<void>;
};

export const CheckoutSheetModal = ({
  visible,
  defaultUser,
  pickupGroups = [],
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
  const { width: windowWidth } = useWindowDimensions();
  const sheetSlideDistance = useMemo(() => Dimensions.get("window").height, []);
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle, useCssTransition } =
    useCheckoutSheetModalAnimation(visible, sheetSlideDistance);

  const sheetMaxWidthStyle = resolveAppShellMaxWidthStyle(windowWidth);
  const BackdropContainer = useCssTransition ? View : Animated.View;
  const SheetContainer = useCssTransition ? View : Animated.View;

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={onClose}>
      <View style={sheetStyles.backdrop}>
        <BackdropContainer
          style={[StyleSheet.absoluteFillObject, backdropAnimatedStyle]}
          pointerEvents="none"
        >
          <ModalSheetGradientBackdrop />
        </BackdropContainer>
        <Pressable
          style={sheetStyles.backdropDismiss}
          onPress={onClose}
          accessibilityRole="button"
        />
        <SheetContainer
          style={[
            sheetStyles.sheet,
            sheetStyles.checkoutSheet,
            // Веб ограничивает шторку той же лесенкой, что и контент
            // (`width: min(100%, --app-shell-max-width)`) и центрирует её.
            sheetMaxWidthStyle,
            sheetAnimatedStyle,
          ]}
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
              pickupGroups={pickupGroups}
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
        </SheetContainer>
      </View>
    </Modal>
  );
};
