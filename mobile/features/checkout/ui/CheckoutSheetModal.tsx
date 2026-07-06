import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { OrderPaymentMethod } from "@/entities/order/model/constants";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import { CHECKOUT_FORM_UI, CART_PAGE_UI } from "@/shared/config";
import { useBottomSheetFormStyles } from "@/shared/theme/formChromeStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

type CheckoutSheetModalProps = {
  visible: boolean;
  defaultUser?: Record<string, unknown> | null;
  isSubmitting: boolean;
  submitError: string;
  submitSuccess: string;
  isDisabled?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  }) => void | Promise<void>;
};

export const CheckoutSheetModal = ({
  visible,
  defaultUser,
  isSubmitting,
  submitError,
  submitSuccess,
  isDisabled = false,
  onClose,
  onSubmit,
}: CheckoutSheetModalProps) => {
  const sheetStyles = useBottomSheetFormStyles();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={sheetStyles.backdrop}>
        <ModalSheetGradientBackdrop />
        <Pressable style={sheetStyles.backdropDismiss} onPress={onClose} accessibilityRole="button" />
        <View style={[sheetStyles.sheet, sheetStyles.checkoutSheet]}>
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
            contentContainerStyle={[
              sheetStyles.form,
              sheetStyles.checkoutForm,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <CheckoutForm
              key={defaultUser?._id != null ? String(defaultUser._id) : "guest"}
              defaultUser={defaultUser}
              isSubmitting={isSubmitting}
              submitError={submitError}
              submitSuccess={submitSuccess}
              isDisabled={isDisabled}
              showHeading={false}
              onSubmit={onSubmit}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
