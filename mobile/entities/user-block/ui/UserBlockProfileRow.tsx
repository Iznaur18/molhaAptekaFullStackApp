import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useUserBlockMutations } from "@/entities/user-block/model/useUserBlockMutations";
import { USER_BLOCK_BUTTON_UI } from "@/shared/config";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const useStyles = createThemedStyles((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
  },
  buttonBlocked: {
    borderColor: theme.colors.danger,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  buttonTextBlocked: {
    color: theme.colors.danger,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.danger,
  },
}));

type UserBlockProfileRowProps = {
  targetUserId: string;
  isBlockedByMe: boolean;
  isAuthorized: boolean;
  isSelf: boolean;
  disabled?: boolean;
  onRequestLogin: () => void;
  onBlockedChange?: (patch: { isBlockedByMe: boolean }) => void;
};

export const UserBlockProfileRow = ({
  targetUserId,
  isBlockedByMe,
  isAuthorized,
  isSelf,
  disabled = false,
  onRequestLogin,
  onBlockedChange,
}: UserBlockProfileRowProps) => {
  const styles = useStyles();
  const { blockMutation, unblockMutation } = useUserBlockMutations({ onBlockedChange });
  const [errorMessage, setErrorMessage] = useState("");

  if (isSelf) {
    return null;
  }

  const isBusy = blockMutation.isPending || unblockMutation.isPending;
  const label = isBlockedByMe ? USER_BLOCK_BUTTON_UI.UNBLOCK : USER_BLOCK_BUTTON_UI.BLOCK;

  const handlePress = async () => {
    if (!isAuthorized) {
      onRequestLogin();
      return;
    }
    if (isBusy || disabled) {
      return;
    }

    setErrorMessage("");

    try {
      if (isBlockedByMe) {
        await unblockMutation.mutateAsync(targetUserId);
      } else {
        await blockMutation.mutateAsync(targetUserId);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : USER_BLOCK_BUTTON_UI.ERROR,
      );
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{USER_BLOCK_BUTTON_UI.LABEL}</Text>
      <View>
        <Pressable
          style={[styles.button, isBlockedByMe && styles.buttonBlocked]}
          onPress={() => void handlePress()}
          disabled={isBusy || disabled}
        >
          <Text style={[styles.buttonText, isBlockedByMe && styles.buttonTextBlocked]}>
            {isBusy ? USER_BLOCK_BUTTON_UI.LOADING : label}
          </Text>
        </Pressable>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    </View>
  );
};
