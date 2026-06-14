import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUserStoryMutations } from "@/entities/user-story/model/useUserStoryMutations";
import {
  PRODUCT_REPORT_TEXT_MAX_CHARS,
  USER_STORY_UI,
} from "@/shared/config";

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
              <Text style={styles.cancelText}>{USER_STORY_UI.CLOSE}</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>{USER_STORY_UI.STORY_REPORT_SUBMIT}</Text>
              )}
            </Pressable>
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
  cancelText: {
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
  submitText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
