import { useCallback, useEffect, useMemo, useState } from "react";
import {
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

import { useEmailVerificationMutations } from "@/entities/session/model/useEmailVerificationMutations";
import { EMAIL_VERIFICATION_UI } from "@/shared/config";
import { useRegisterBlockingOverlay } from "@/shared/lib/useBlockingOverlayOccupancy";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  EMAIL_VERIFY_MODAL_CORNER_RADIUS,
  useBottomSheetFormStyles,
  useFormFieldStyles,
} from "@/shared/theme/formChromeStyles";
import { EMAIL_VERIFY_MODAL_ANIMATION } from "@/shared/theme/modalChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { SquircleView } from "@/shared/ui/SquircleView";

const CODE_LENGTH = 6;
const { enterMs, exitMs, sheetSlideDistance, sheetRestOffsetRatio } =
  EMAIL_VERIFY_MODAL_ANIMATION;

type EmailVerificationModalProps = {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerified?: () => void;
};

const keepDigitsOnly = (value: string): string => value.replace(/\D/g, "");

export const EmailVerificationModal = ({
  visible,
  email,
  onClose,
  onVerified,
}: EmailVerificationModalProps) => {
  const theme = useAppTheme();
  const sheetStyles = useBottomSheetFormStyles();
  const fieldStyles = useFormFieldStyles();
  const { verifyMutation, resendMutation } = useEmailVerificationMutations();
  const [modalVisible, setModalVisible] = useState(visible);
  useRegisterBlockingOverlay(modalVisible);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue<number>(sheetSlideDistance);

  const sheetRestOffset = useMemo(
    () => Dimensions.get("window").height * sheetRestOffsetRatio,
    [],
  );

  const isBusy = verifyMutation.isPending || resendMutation.isPending;

  const resetForm = useCallback(() => {
    setCode("");
    setErrorMessage("");
    setSuccessMessage("");
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

  const handleCodeChange = (value: string) => {
    setCode(keepDigitsOnly(value).slice(0, CODE_LENGTH));
    setErrorMessage("");
  };

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      setErrorMessage(EMAIL_VERIFICATION_UI.CODE_REQUIRED);
      return;
    }
    try {
      await verifyMutation.mutateAsync(code);
      setCode("");
      setSuccessMessage(EMAIL_VERIFICATION_UI.VERIFIED_SUCCESS);
      onVerified?.();
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(error instanceof Error ? error.message : EMAIL_VERIFICATION_UI.CONFIRM_ERROR);
    }
  };

  const handleResend = async () => {
    try {
      const message = await resendMutation.mutateAsync();
      setCode("");
      setErrorMessage("");
      setSuccessMessage(message || EMAIL_VERIFICATION_UI.RESENT);
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(error instanceof Error ? error.message : EMAIL_VERIFICATION_UI.RESEND_ERROR);
    }
  };

  const handleClose = () => {
    if (isBusy) {
      return;
    }
    onClose();
  };

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal visible={modalVisible} animationType="none" transparent onRequestClose={handleClose}>
      <View style={sheetStyles.emailVerifyRoot}>
        <Animated.View
          style={[sheetStyles.emailVerifyBackdropLayer, backdropAnimatedStyle]}
          pointerEvents="box-none"
        >
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={handleClose}
            disabled={isBusy}
            accessibilityRole="button"
          />
        </Animated.View>

        <View style={[sheetStyles.emailVerifySheetHost, { paddingBottom: sheetRestOffset }]}>
          <Animated.View
            style={[sheetStyles.emailVerifySheetAnimated, sheetAnimatedStyle]}
            pointerEvents="box-none"
          >
            <SquircleView
              radius={EMAIL_VERIFY_MODAL_CORNER_RADIUS}
              style={sheetStyles.emailVerifyCard}
            >
            <View style={sheetStyles.emailVerifyCardContent}>
              <Text style={sheetStyles.emailVerifyTitle}>
                {EMAIL_VERIFICATION_UI.MODAL_TITLE}
              </Text>
              <Text style={sheetStyles.modalText}>{EMAIL_VERIFICATION_UI.MODAL_TEXT(email)}</Text>

              <Text style={fieldStyles.label}>{EMAIL_VERIFICATION_UI.LABEL_CODE}</Text>
              <TextInput
                style={[fieldStyles.input, fieldStyles.inputCode]}
                value={code}
                onChangeText={handleCodeChange}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                placeholder={EMAIL_VERIFICATION_UI.CODE_PLACEHOLDER}
                placeholderTextColor={theme.colors.textMuted}
                editable={!isBusy}
              />

              {errorMessage ? <Text style={fieldStyles.error}>{errorMessage}</Text> : null}
              {successMessage ? <Text style={fieldStyles.success}>{successMessage}</Text> : null}

              <AppButton
                label={EMAIL_VERIFICATION_UI.CONFIRM_BUTTON}
                variant="primary"
                onPress={handleVerify}
                disabled={isBusy}
              />

              <Pressable
                style={sheetStyles.secondaryAction}
                onPress={handleResend}
                disabled={isBusy}
              >
                <Text style={sheetStyles.secondaryActionText}>
                  {resendMutation.isPending
                    ? EMAIL_VERIFICATION_UI.RESEND_LOADING
                    : EMAIL_VERIFICATION_UI.RESEND_BUTTON}
                </Text>
              </Pressable>

              <Pressable onPress={handleClose} disabled={isBusy}>
                <Text style={sheetStyles.dismiss}>{EMAIL_VERIFICATION_UI.CLOSE}</Text>
              </Pressable>
            </View>
            </SquircleView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};
