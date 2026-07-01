import { Pressable, Text, View } from "react-native";

import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RafflesStaffRowMedia } from "@/entities/raffle/ui/RafflesStaffRowMedia";
import { RAFFLES_STAFF_PAGE_UI } from "@/shared/config";
import { useRafflesStaffPageStyles } from "@/shared/theme/rafflesStaffPageStyles";

type RafflesStaffPendingRowProps = {
  raffle: RaffleFromApi;
  busy: boolean;
  errorMessage?: string;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onEdit?: () => void;
};

export const RafflesStaffPendingRow = ({
  raffle,
  busy,
  errorMessage = "",
  onApprove,
  onReject,
  onDelete,
  onEdit,
}: RafflesStaffPendingRowProps) => {
  const styles = useRafflesStaffPageStyles();

  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <RafflesStaffRowMedia raffle={raffle} />
        <View style={styles.rowBody}>
          <Text style={styles.title}>{raffle.title}</Text>
          <Text style={styles.meta}>
            {RAFFLES_STAFF_PAGE_UI.ROW_SELLER}: {raffle.seller?.userName ?? "—"}
          </Text>
          <Text style={styles.meta}>
            {RAFFLES_STAFF_PAGE_UI.ROW_TARGET}: {raffle.targetSales}
          </Text>
        </View>
      </View>

      {errorMessage ? (
        <Text style={styles.rowError} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionPrimary, busy && styles.actionDisabled]}
          disabled={busy}
          onPress={onApprove}
        >
          <Text style={styles.actionPrimaryText}>
            {busy ? RAFFLES_STAFF_PAGE_UI.PENDING : RAFFLES_STAFF_PAGE_UI.APPROVE}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.actionDanger, busy && styles.actionDisabled]}
          disabled={busy}
          onPress={onReject}
        >
          <Text style={styles.actionDangerText}>{RAFFLES_STAFF_PAGE_UI.REJECT}</Text>
        </Pressable>
        {onEdit ? (
          <Pressable
            style={[styles.actionEdit, busy && styles.actionDisabled]}
            disabled={busy}
            onPress={onEdit}
          >
            <Text style={styles.actionEditText}>{RAFFLES_STAFF_PAGE_UI.EDIT}</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.actionDanger, busy && styles.actionDisabled]}
          disabled={busy}
          onPress={onDelete}
        >
          <Text style={styles.actionDangerText}>{RAFFLES_STAFF_PAGE_UI.DELETE}</Text>
        </Pressable>
      </View>
    </View>
  );
};
