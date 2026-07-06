import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useSubmitProductReportMutation } from "@/entities/product-report/model/useSubmitProductReportMutation";
import {
  PRODUCT_REPORT_TEXT_MAX_CHARS,
  PRODUCT_REPORT_UI,
} from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  REPORT_PRODUCT_MODAL_ANIMATION,
  useBottomSheetReportModalStyles,
} from "@/shared/theme/modalChromeStyles";

type ReportProductModalProps = {
  visible: boolean;
  productId: string;
  productName?: string;
  hasPendingReport?: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
};

const { enterMs, exitMs, sheetSlideDistance, sheetRestOffsetRatio } =
  REPORT_PRODUCT_MODAL_ANIMATION;

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
  const sheetRestOffset = useMemo(
    () => Dimensions.get("window").height * sheetRestOffsetRatio,
    [],
  );
  const submitMutation = useSubmitProductReportMutation();
  const [modalVisible, setModalVisible] = useState(visible);
  const [reportText, setReportText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue<number>(sheetSlideDistance);

  const charCount = reportText.length;
  const isOverLimit = charCount > PRODUCT_REPORT_TEXT_MAX_CHARS;
  const isBlocked = hasPendingReport || !productId;
  const isSubmitting = submitMutation.isPending;

  const resetForm = useCallback(() => {
    setReportText("");
    setErrorMessage("");
  }, []);

  const finishClose = useCallback(() => {
    setModalVisible(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      backdropOpacity.value = 0;
      sheetTranslateY.value = sheetSlideDistance;
      backdropOpacity.value = withTiming(1, {
        duration: enterMs,
        easing: Easing.out(Easing.cubic),
      });
      sheetTranslateY.value = withTiming(0, {
        duration: enterMs,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    if (!modalVisible) {
      return;
    }

    backdropOpacity.value = withTiming(0, {
      duration: exitMs,
      easing: Easing.in(Easing.cubic),
    });
    sheetTranslateY.value = withTiming(
      sheetSlideDistance,
      {
        duration: exitMs,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      },
    );
  }, [backdropOpacity, finishClose, modalVisible, sheetTranslateY, visible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
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

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={handleClose}>
      <View style={[styles.root, { paddingBottom: sheetRestOffset }]}>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} pointerEvents="box-none">
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={handleClose}
            disabled={isSubmitting}
            accessibilityLabel={PRODUCT_REPORT_UI.CANCEL}
          />
        </Animated.View>

        <Animated.View style={[styles.card, sheetAnimatedStyle]}>
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
        </Animated.View>
      </View>
    </Modal>
  );
};
