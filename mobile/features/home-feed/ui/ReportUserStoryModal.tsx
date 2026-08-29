import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUserStoryMutations } from "@/entities/user-story/model/useUserStoryMutations";
import {
  PRODUCT_REPORT_TEXT_MAX_CHARS,
  USER_STORY_UI,
} from "@/shared/config";
import { ModalSheetGradientBackdrop } from "@/shared/ui/ModalSheetGradientBackdrop";
import { useBottomSheetReportModalStyles } from "@/shared/theme/modalChromeStyles";

type ReportUserStoryModalProps = {
  visible: boolean;
  storyId: string;
  onClose: () => void;
};

export const ReportUserStoryModal = ({
  visible,
  storyId,
  onClose,
}: ReportUserStoryModalProps) => {
  const styles = useBottomSheetReportModalStyles();
  const theme = useAppTheme();
  const { reportMutation } = useUserStoryMutations();
  const [reportText, setReportText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = reportMutation.isPending;

  useEffect(() => {
    if (!visible) {
      setReportText("");
      setErrorMessage("");
    }
  }, [visible]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const text = reportText.trim();
    if (!text) {
      setErrorMessage(USER_STORY_UI.STORY_REPORT_EMPTY);
      return;
    }

    setErrorMessage("");
    try {
      await reportMutation.mutateAsync({ storyId, body: { reportText: text } });
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : USER_STORY_UI.ERROR_GENERIC,
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ModalSheetGradientBackdrop />
        <View style={styles.card}>
          <Text style={styles.title}>{USER_STORY_UI.STORY_REPORT_TITLE}</Text>

          <Text style={styles.label}>{USER_STORY_UI.STORY_REPORT_TEXT_LABEL}</Text>
          <TextInput
            style={styles.input}
            value={reportText}
            onChangeText={setReportText}
            placeholder={USER_STORY_UI.STORY_REPORT_TEXT_PLACEHOLDER}
            maxLength={PRODUCT_REPORT_TEXT_MAX_CHARS}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isSubmitting}
          />

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>{USER_STORY_UI.CLOSE}</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.onContrast} />
              ) : (
                <Text style={styles.submitButtonText}>{USER_STORY_UI.STORY_REPORT_SUBMIT}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
