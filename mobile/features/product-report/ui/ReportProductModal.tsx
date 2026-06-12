import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSubmitProductReportMutation } from "@/entities/product-report/model/useSubmitProductReportMutation";
import {
  PRODUCT_REPORT_TEXT_MAX_CHARS,
  PRODUCT_REPORT_UI,
} from "@/shared/config";

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
                  <ActivityIndicator color="#fff" />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  productName: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
  },
  blocked: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
  },
  label: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    marginTop: 8,
    minHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#111",
  },
  inputError: {
    borderColor: "#c62828",
  },
  charCount: {
    marginTop: 6,
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  charCountError: {
    color: "#c62828",
  },
  error: {
    marginTop: 8,
    fontSize: 13,
    color: "#c62828",
  },
  actions: {
    marginTop: 20,
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
