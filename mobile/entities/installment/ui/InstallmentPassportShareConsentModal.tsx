import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { INSTALLMENT_UI } from "@/shared/config";
import { useInstallmentPassportShareConsentModalStyles } from "@/shared/theme/modalChromeStyles";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";

type InstallmentPassportShareConsentModalProps = {
  visible: boolean;
  isConfirming?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const InstallmentPassportShareConsentModal = ({
  visible,
  isConfirming = false,
  onClose,
  onConfirm,
}: InstallmentPassportShareConsentModalProps) => {
  const styles = useInstallmentPassportShareConsentModalStyles();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ModalSheetGradientBackdrop />
        <View
          style={styles.card}
          accessibilityRole="alert"
          accessibilityLabel={INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_TITLE}
        >
          <Text style={styles.title}>{INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_TITLE}</Text>
          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyScrollContent}
            showsVerticalScrollIndicator
          >
            {INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_PARAGRAPHS.map((paragraph, index) => (
              <Text key={index} style={styles.body}>
                {paragraph}
              </Text>
            ))}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isConfirming}
            >
              <Text style={styles.cancelButtonText}>
                {INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_CANCEL}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton, isConfirming ? styles.disabled : null]}
              onPress={onConfirm}
              disabled={isConfirming}
            >
              <Text style={styles.confirmButtonText}>
                {isConfirming
                  ? INSTALLMENT_UI.SUBMITTING
                  : INSTALLMENT_UI.PASSPORT_SHARE_CONSENT_CONFIRM}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
