import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { useEmailVerificationMutations } from "@/entities/session/model/useEmailVerificationMutations";
import { EMAIL_VERIFICATION_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useBottomSheetFormStyles, useFormFieldStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

const CODE_LENGTH = 6;

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
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isBusy = verifyMutation.isPending || resendMutation.isPending;

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
    setCode("");
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={sheetStyles.backdrop}>
        <ModalSheetGradientBackdrop />
        <View style={[sheetStyles.sheet, sheetStyles.sheetPadding]}>
          <Text style={sheetStyles.title}>{EMAIL_VERIFICATION_UI.MODAL_TITLE}</Text>
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
            variant="contrast"
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
      </View>
    </Modal>
  );
};
