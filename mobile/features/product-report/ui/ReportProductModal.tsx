import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSubmitProductReportMutation } from "@/entities/product-report/model/useSubmitProductReportMutation";
import {
  PRODUCT_REPORT_TEXT_MAX_CHARS,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useBottomSheetReportModalStyles } from "@/shared/theme/modalChromeStyles";

type ReportProductModalProps = {
  visible: boolean;
  productId: string;
  productName?: string;
  hasPendingReport?: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
};

export const ReportProductModal = ({
  visible,
  productId,
  productName = "",
  hasPendingReport = false,
  onClose,
  onSubmitted,
}: ReportProductModalProps) => {
  const styles = useBottomSheetReportModalStyles();
  const theme = useAppTheme();
  const submitMutation = useSubmitProductReportMutation();
  const [reportText, setReportText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const charCount = reportText.length;
  const isOverLimit = charCount > PRODUCT_REPORT_TEXT_MAX_CHARS;
  const isBlocked = hasPendingReport || !productId;
  const isSubmitting = submitMutation.isPending;

  const handleClose = () => {
    setReportText("");
    setErrorMessage("");
    onClose();
  };

  const handleSubmit = async () => {
    if (isBlocked || isOverLimit) {
      return;
    }

    setErrorMessage("");
    try {
      await submitMutation.mutateAsync({
        productId,
        reportText: reportText.trim(),
      });
      onSubmitted?.();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : PRODUCT_REPORT_UI.SUBMIT,
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{PRODUCT_REPORT_UI.MODAL_TITLE}</Text>
          {productName ? <Text style={styles.productName}>{productName}</Text> : null}

          {hasPendingReport ? (
            <Text style={styles.blocked}>{PRODUCT_REPORT_UI.ALREADY_REPORTED}</Text>
          ) : (
            <>
              <Text style={styles.label}>{PRODUCT_REPORT_UI.LABEL_TEXT}</Text>
              <TextInput
                style={[styles.input, isOverLimit && styles.inputError]}
                value={reportText}
                onChangeText={setReportText}
                placeholder={PRODUCT_REPORT_UI.PLACEHOLDER}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
              <Text style={[styles.charCount, isOverLimit && styles.charCountError]}>
                {PRODUCT_REPORT_UI.CHARS_USED(charCount, PRODUCT_REPORT_TEXT_MAX_CHARS)}
              </Text>
              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            </>
          )}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>{PRODUCT_REPORT_UI.CANCEL}</Text>
            </Pressable>
            {!hasPendingReport ? (
              <Pressable
                style={[
                  styles.submitButton,
                  (isSubmitting || isOverLimit || !reportText.trim()) && styles.submitDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || isOverLimit || !reportText.trim()}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={theme.colors.onContrast} />
                ) : (
                  <Text style={styles.submitButtonText}>{PRODUCT_REPORT_UI.SUBMIT}</Text>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};
