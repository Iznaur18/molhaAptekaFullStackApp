import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import type { MyRaffleRecord } from "@/entities/raffle/api/fetchMyRaffle";
import { canSellerEditRaffle } from "@/entities/raffle/lib/canSellerEditRaffle";
import { useMyRaffleMutations } from "@/entities/raffle/model/useMyRaffleMutations";
import { useMyRaffleQuery } from "@/entities/raffle/model/useMyRaffleQuery";
import { API_CLIENT_UI, RAFFLE_SELLER_PANEL_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

const STATUS_LABEL: Record<string, string> = {
  pending_staff: RAFFLE_SELLER_PANEL_UI.STATUS_PENDING,
  active: RAFFLE_SELLER_PANEL_UI.STATUS_ACTIVE,
  paused: RAFFLE_SELLER_PANEL_UI.STATUS_PAUSED,
  completed: RAFFLE_SELLER_PANEL_UI.STATUS_COMPLETED,
  rejected: RAFFLE_SELLER_PANEL_UI.STATUS_REJECTED,
};

type RaffleSellerOverviewProps = {
  enabled?: boolean;
};

const useStyles = createThemedStyles((theme) => ({
  card: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: theme.spacing[4],
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: theme.spacing[2],
    color: theme.colors.text,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  current: {
    gap: theme.spacing[2],
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  status: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  comment: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
    marginTop: theme.spacing[1],
  },
  actionButton: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  archive: {
    marginTop: theme.spacing[3],
    gap: 6,
  },
  archiveTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  archiveItem: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  error: {
    fontSize: 13,
    marginBottom: theme.spacing[2],
    color: theme.colors.danger,
  },
}));

export const RaffleSellerOverview = ({ enabled = true }: RaffleSellerOverviewProps) => {
  const router = useRouter();
  const styles = useStyles();
  const myRaffleQuery = useMyRaffleQuery({ enabled });
  const { pauseMyMutation, deleteMyMutation } = useMyRaffleMutations();
  const [actionError, setActionError] = useState("");

  const raffle = myRaffleQuery.data?.raffle ?? null;
  const archive = myRaffleQuery.data?.archive ?? [];
  const actionsBusy = pauseMyMutation.isPending || deleteMyMutation.isPending;
  const showEdit = canSellerEditRaffle(raffle);

  const handlePause = async () => {
    if (!raffle?._id) {
      return;
    }

    try {
      setActionError("");
      await pauseMyMutation.mutateAsync(raffle._id);
    } catch (error) {
      setActionError(formatApiErrorMessage(error, API_CLIENT_UI.PAUSE_RAFFLE_FALLBACK));
    }
  };

  const handleDelete = () => {
    if (!raffle?._id) {
      return;
    }

    Alert.alert(RAFFLE_SELLER_PANEL_UI.DELETE, RAFFLE_SELLER_PANEL_UI.DELETE_CONFIRM, [
      { text: "Отмена", style: "cancel" },
      {
        text: RAFFLE_SELLER_PANEL_UI.DELETE,
        style: "destructive",
        onPress: () => {
          void runDelete(raffle._id);
        },
      },
    ]);
  };

  const runDelete = async (raffleId: string) => {
    try {
      setActionError("");
      await deleteMyMutation.mutateAsync(raffleId);
    } catch (error) {
      setActionError(formatApiErrorMessage(error, API_CLIENT_UI.DELETE_RAFFLE_FALLBACK));
    }
  };

  const handleEdit = (item: MyRaffleRecord) => {
    router.push(`/raffle/${item._id}` as never);
  };

  if (myRaffleQuery.isPending) {
    return <ScreenLoadingState message={RAFFLE_SELLER_PANEL_UI.TITLE} />;
  }

  if (myRaffleQuery.isError) {
    return (
      <Text style={styles.error}>
        {formatApiErrorMessage(myRaffleQuery.error, API_CLIENT_UI.FETCH_MY_RAFFLE_FALLBACK)}
      </Text>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{RAFFLE_SELLER_PANEL_UI.TITLE}</Text>

      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      {!raffle ? (
        <Text style={styles.empty}>{RAFFLE_SELLER_PANEL_UI.EMPTY}</Text>
      ) : (
        <View style={styles.current}>
          <Text style={styles.name}>{raffle.title}</Text>
          <Text style={styles.status}>
            {STATUS_LABEL[raffle.status] ?? raffle.status}
            {raffle.status === "active" || raffle.status === "completed"
              ? ` · ${raffle.salesProgress ?? 0} / ${raffle.targetSales ?? 0}`
              : ""}
          </Text>

          {raffle.status === "rejected" && raffle.moderationComment ? (
            <Text style={styles.comment}>
              {RAFFLE_SELLER_PANEL_UI.REJECTION_PREFIX} {raffle.moderationComment}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {showEdit ? (
              <AppButton
                label={RAFFLE_SELLER_PANEL_UI.EDIT}
                variant="contrast"
                onPress={() => handleEdit(raffle)}
                disabled={actionsBusy}
                style={styles.actionButton}
              />
            ) : null}
            {raffle.status === "active" ? (
              <AppButton
                label={RAFFLE_SELLER_PANEL_UI.PAUSE}
                variant="secondary"
                onPress={() => void handlePause()}
                disabled={actionsBusy}
                style={styles.actionButton}
              />
            ) : null}
            <AppButton
              label={RAFFLE_SELLER_PANEL_UI.DELETE}
              variant="danger"
              onPress={handleDelete}
              disabled={actionsBusy}
              style={styles.actionButton}
            />
          </View>
        </View>
      )}

      {archive.length > 0 ? (
        <View style={styles.archive}>
          <Text style={styles.archiveTitle}>{RAFFLE_SELLER_PANEL_UI.ARCHIVE_TITLE}</Text>
          {archive.map((row) => (
            <Text key={row._id} style={styles.archiveItem}>
              {row.title} — {STATUS_LABEL[row.status] ?? row.status}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};
