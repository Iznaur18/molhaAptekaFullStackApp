import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type StaffModerationActionsProps = {
  approveLabel: string;
  rejectLabel: string;
  pendingLabel: string;
  isBusy: boolean;
  note?: string;
  onNoteChange?: (value: string) => void;
  notePlaceholder?: string;
  onApprove: () => void;
  onReject: () => void;
  errorMessage?: string;
};

export const StaffModerationActions = ({
  approveLabel,
  rejectLabel,
  pendingLabel,
  isBusy,
  note,
  onNoteChange,
  notePlaceholder,
  onApprove,
  onReject,
  errorMessage,
}: StaffModerationActionsProps) => (
  <View style={styles.root}>
    {onNoteChange ? (
      <TextInput
        style={styles.noteInput}
        value={note ?? ""}
        onChangeText={onNoteChange}
        placeholder={notePlaceholder}
        multiline
      />
    ) : null}
    <View style={styles.actions}>
      <Pressable
        style={[styles.button, styles.approveButton, isBusy && styles.buttonDisabled]}
        onPress={onApprove}
        disabled={isBusy}
      >
        <Text style={styles.approveText}>{isBusy ? pendingLabel : approveLabel}</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.rejectButton, isBusy && styles.buttonDisabled]}
        onPress={onReject}
        disabled={isBusy}
      >
        <Text style={styles.rejectText}>{rejectLabel}</Text>
      </Pressable>
    </View>
    {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: 8,
    marginTop: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    minHeight: 44,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  approveButton: {
    backgroundColor: "#2e7d32",
  },
  rejectButton: {
    backgroundColor: "#c62828",
  },
  approveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  rejectText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  error: {
    color: "#c62828",
    fontSize: 13,
  },
});
