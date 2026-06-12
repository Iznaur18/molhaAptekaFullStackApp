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

import { useEmailVerificationMutations } from "@/entities/session/model/useEmailVerificationMutations";
import { EMAIL_VERIFICATION_UI } from "@/shared/config";

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
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{EMAIL_VERIFICATION_UI.MODAL_TITLE}</Text>
          <Text style={styles.text}>{EMAIL_VERIFICATION_UI.MODAL_TEXT(email)}</Text>

          <Text style={styles.label}>{EMAIL_VERIFICATION_UI.LABEL_CODE}</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            placeholder={EMAIL_VERIFICATION_UI.CODE_PLACEHOLDER}
            editable={!isBusy}
          />

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

          <Pressable
            style={[styles.button, isBusy && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isBusy}
          >
            {verifyMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{EMAIL_VERIFICATION_UI.CONFIRM_BUTTON}</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, isBusy && styles.buttonDisabled]}
            onPress={handleResend}
            disabled={isBusy}
          >
            <Text style={styles.secondaryButtonText}>
              {resendMutation.isPending
                ? EMAIL_VERIFICATION_UI.RESEND_LOADING
                : EMAIL_VERIFICATION_UI.RESEND_BUTTON}
            </Text>
          </Pressable>

          <Pressable onPress={handleClose} disabled={isBusy}>
            <Text style={styles.close}>{EMAIL_VERIFICATION_UI.CLOSE}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: "#555",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 20,
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 12,
  },
  error: {
    color: "#c62828",
    marginBottom: 8,
  },
  success: {
    color: "#2e7d32",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#1565c0",
    fontSize: 15,
  },
  close: {
    marginTop: 16,
    textAlign: "center",
    color: "#666",
    fontSize: 15,
  },
});
