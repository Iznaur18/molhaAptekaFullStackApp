import {
  ADDRESS_LINE_MAX_LENGTH,
  CATEGORY_DEAL_TYPE_SERVICE,
  DEAL_REQUEST_COMMENT_MAX_LENGTH,
} from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PRODUCT_DEAL_ACTIONS_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useDealRequestSheetStyles } from "@/shared/theme/dealRequestStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

import {
  dealRequestTimePartsToIso,
  defaultDealRequestTime,
  isDealRequestTimeInPast,
  toDealRequestTimeParts,
} from "../lib/dealRequestTime";
import { useCreateDealRequestMutation } from "../model/useDealRequests";
import { DealRequestTimePicker } from "./DealRequestTimePicker";

export const DEAL_REQUESTS_HUB_ROUTE = "/hub/deal-requests";

type DealRequestSheetProps = {
  visible: boolean;
  onClose: () => void;
  productId: string;
  dealType: string;
};

/**
 * Окно заявки на осмотр или услугу — паритет web `DealRequestSheet`. После
 * отправки показывает итог прямо в окне: покупатель видит, что заявка ушла, и
 * не жмёт кнопку второй раз.
 */
export const DealRequestSheet = ({
  visible,
  onClose,
  productId,
  dealType,
}: DealRequestSheetProps) => {
  const styles = useDealRequestSheetStyles();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const createMutation = useCreateDealRequestMutation();

  const [when, setWhen] = useState(() =>
    toDealRequestTimeParts(defaultDealRequestTime()),
  );
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const isService = dealType === CATEGORY_DEAL_TYPE_SERVICE;
  const isSubmitting = createMutation.isPending;

  // Новое открытие — новая заявка: черновик и итог прошлой не переживают закрытие.
  useEffect(() => {
    if (visible) {
      return;
    }
    setWhen(toDealRequestTimeParts(defaultDealRequestTime()));
    setAddress("");
    setComment("");
    setFormError("");
    setIsSent(false);
  }, [visible]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    const preferredAt = dealRequestTimePartsToIso(when);
    if (!preferredAt) {
      setFormError(PRODUCT_DEAL_ACTIONS_UI.TIME_REQUIRED);
      return;
    }
    if (isDealRequestTimeInPast(preferredAt)) {
      setFormError(PRODUCT_DEAL_ACTIONS_UI.TIME_IN_PAST);
      return;
    }
    setFormError("");
    try {
      await createMutation.mutateAsync({
        productId,
        preferredAt,
        comment: comment.trim(),
        ...(isService ? { address: address.trim() } : {}),
      });
      setIsSent(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : PRODUCT_DEAL_ACTIONS_UI.SUBMIT_FALLBACK_ERROR,
      );
    }
  };

  const openRequests = () => {
    onClose();
    router.push(DEAL_REQUESTS_HUB_ROUTE as never);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ModalSheetGradientBackdrop />
        <Pressable
          style={styles.dismiss}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_DEAL_ACTIONS_UI.CANCEL}
        />
        <View style={styles.panel} accessibilityViewIsModal>
          <View style={styles.grabber} />
          {isSent ? (
            <View
              style={[styles.body, { paddingBottom: Math.max(insets.bottom, 20) }]}
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.title} accessibilityRole="header">
                {PRODUCT_DEAL_ACTIONS_UI.SENT_TITLE}
              </Text>
              <Text style={styles.hint}>{PRODUCT_DEAL_ACTIONS_UI.SENT_HINT}</Text>
              <View style={styles.actions}>
                <View style={styles.actionButton}>
                  <AppButton
                    label={PRODUCT_DEAL_ACTIONS_UI.OPEN_REQUESTS}
                    variant="primary"
                    onPress={openRequests}
                  />
                </View>
                <View style={styles.actionButton}>
                  <AppButton
                    label={PRODUCT_DEAL_ACTIONS_UI.CLOSE}
                    variant="secondary"
                    onPress={onClose}
                  />
                </View>
              </View>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={[
                styles.body,
                { paddingBottom: Math.max(insets.bottom, 20) },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title} accessibilityRole="header">
                {PRODUCT_DEAL_ACTIONS_UI.FORM_TITLE[dealType]}
              </Text>
              <DealRequestTimePicker value={when} onChange={setWhen} />
              {isService ? (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {PRODUCT_DEAL_ACTIONS_UI.FIELD_ADDRESS}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    maxLength={ADDRESS_LINE_MAX_LENGTH}
                    placeholder={PRODUCT_DEAL_ACTIONS_UI.FIELD_ADDRESS_PLACEHOLDER}
                    placeholderTextColor={theme.colors.textMuted}
                    editable={!isSubmitting}
                  />
                </View>
              ) : null}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  {PRODUCT_DEAL_ACTIONS_UI.FIELD_COMMENT}
                </Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={comment}
                  onChangeText={setComment}
                  maxLength={DEAL_REQUEST_COMMENT_MAX_LENGTH}
                  placeholder={
                    PRODUCT_DEAL_ACTIONS_UI.FIELD_COMMENT_PLACEHOLDER[dealType]
                  }
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  numberOfLines={3}
                  editable={!isSubmitting}
                />
              </View>
              {formError ? (
                <Text style={styles.error} accessibilityRole="alert">
                  {formError}
                </Text>
              ) : null}
              {/* «Отмена» слева, главное действие справа — под большим пальцем. */}
              <View style={styles.actions}>
                <View style={styles.actionButton}>
                  <AppButton
                    label={PRODUCT_DEAL_ACTIONS_UI.CANCEL}
                    variant="cancel"
                    onPress={handleClose}
                    disabled={isSubmitting}
                  />
                </View>
                <View style={styles.actionButton}>
                  <AppButton
                    label={
                      isSubmitting
                        ? PRODUCT_DEAL_ACTIONS_UI.SUBMITTING
                        : PRODUCT_DEAL_ACTIONS_UI.SUBMIT_BY_KIND[dealType]
                    }
                    variant="primary"
                    onPress={() => void handleSubmit()}
                    disabled={isSubmitting}
                  />
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
