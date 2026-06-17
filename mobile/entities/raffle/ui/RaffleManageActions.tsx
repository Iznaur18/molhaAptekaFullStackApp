import { Pressable, Text, View } from "react-native";

import type { FeaturedRaffleManage } from "@/entities/raffle/model/types";
import { RAFFLE_MANAGE_UI } from "@/shared/config";
import { useRaffleManageActionsStyles } from "@/shared/theme/raffleFeaturedStyles";

type RaffleManageActionsProps = FeaturedRaffleManage & {
  completed?: boolean;
};

export const RaffleManageActions = ({
  showEdit = false,
  showDelete = false,
  showPause = false,
  onEdit,
  onDelete,
  onPause,
  busy = false,
  completed = false,
}: RaffleManageActionsProps) => {
  const styles = useRaffleManageActionsStyles();

  if (!showEdit && !showDelete && !showPause) {
    return null;
  }

  return (
    <View
      style={[styles.root, completed ? undefined : undefined]}
      accessibilityRole="none"
      accessibilityLabel={RAFFLE_MANAGE_UI.GROUP_LABEL}
    >
      {showEdit && onEdit ? (
        <Pressable
          style={[styles.btn, styles.btnEdit, busy && styles.btnDisabled]}
          disabled={busy}
          accessibilityRole="button"
          onPress={onEdit}
        >
          <Text style={styles.btnEditText}>{RAFFLE_MANAGE_UI.EDIT}</Text>
        </Pressable>
      ) : null}
      {showDelete && onDelete ? (
        <Pressable
          style={[styles.btn, styles.btnDelete, busy && styles.btnDisabled]}
          disabled={busy}
          accessibilityRole="button"
          onPress={onDelete}
        >
          <Text style={styles.btnDeleteText}>{RAFFLE_MANAGE_UI.DELETE}</Text>
        </Pressable>
      ) : null}
      {showPause && onPause ? (
        <Pressable
          style={[styles.btn, styles.btnPause, busy && styles.btnDisabled]}
          disabled={busy}
          accessibilityRole="button"
          onPress={onPause}
        >
          <Text style={styles.btnPauseText}>{RAFFLE_MANAGE_UI.PAUSE}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
