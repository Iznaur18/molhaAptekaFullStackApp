import { Pressable, Text, TextInput, View } from "react-native";

import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

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

const useStyles = createThemedStyles((theme) => ({
  root: {
    gap: theme.spacing[2],
    marginTop: theme.spacing[2],
  },
  noteInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    padding: theme.spacing[3],
    minHeight: 44,
    fontSize: 14,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  button: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.danger,
  },
  actionText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 14,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
}));

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
}: StaffModerationActionsProps) => {
  const theme = useAppTheme();
  const styles = useStyles();

  return (
    <View style={styles.root}>
      {onNoteChange ? (
        <TextInput
          style={styles.noteInput}
          value={note ?? ""}
          onChangeText={onNoteChange}
          placeholder={notePlaceholder}
          placeholderTextColor={theme.colors.textMuted}
          multiline
        />
      ) : null}
      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.approveButton, isBusy && styles.buttonDisabled]}
          onPress={onApprove}
          disabled={isBusy}
        >
          <Text style={styles.actionText}>{isBusy ? pendingLabel : approveLabel}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.rejectButton, isBusy && styles.buttonDisabled]}
          onPress={onReject}
          disabled={isBusy}
        >
          <Text style={styles.actionText}>{rejectLabel}</Text>
        </Pressable>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};
