import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import type { MyRaffleRecord } from "@/entities/raffle/api/fetchMyRaffle";
import { canSellerEditRaffle } from "@/entities/raffle/lib/canSellerEditRaffle";
import { useMyRaffleMutations } from "@/entities/raffle/model/useMyRaffleMutations";
import { useMyRaffleQuery } from "@/entities/raffle/model/useMyRaffleQuery";
import { API_CLIENT_UI, RAFFLE_SELLER_PANEL_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
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

export const RaffleSellerOverview = ({ enabled = true }: RaffleSellerOverviewProps) => {
  const router = useRouter();
  const theme = useAppTheme();
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
      <Text style={[styles.error, { color: theme.colors.danger }]}>
        {formatApiErrorMessage(myRaffleQuery.error, API_CLIENT_UI.FETCH_MY_RAFFLE_FALLBACK)}
      </Text>
    );
  }

  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{RAFFLE_SELLER_PANEL_UI.TITLE}</Text>

      {actionError ? (
        <Text style={[styles.error, { color: theme.colors.danger }]}>{actionError}</Text>
      ) : null}

      {!raffle ? (
        <Text style={[styles.empty, { color: theme.colors.textMuted }]}>
          {RAFFLE_SELLER_PANEL_UI.EMPTY}
        </Text>
      ) : (
        <View style={styles.current}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{raffle.title}</Text>
          <Text style={[styles.status, { color: theme.colors.textMuted }]}>
            {STATUS_LABEL[raffle.status] ?? raffle.status}
            {raffle.status === "active" || raffle.status === "completed"
              ? ` · ${raffle.salesProgress ?? 0} / ${raffle.targetSales ?? 0}`
              : ""}
          </Text>

          {raffle.status === "rejected" && raffle.moderationComment ? (
            <Text style={[styles.comment, { color: theme.colors.textMuted }]}>
              {RAFFLE_SELLER_PANEL_UI.REJECTION_PREFIX} {raffle.moderationComment}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {showEdit ? (
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.colors.nearBlack }]}
                onPress={() => handleEdit(raffle)}
                disabled={actionsBusy}
              >
                <Text style={styles.actionButtonText}>{RAFFLE_SELLER_PANEL_UI.EDIT}</Text>
              </Pressable>
            ) : null}
            {raffle.status === "active" ? (
              <Pressable
                style={[styles.actionButtonSecondary, { borderColor: theme.colors.border }]}
                onPress={() => void handlePause()}
                disabled={actionsBusy}
              >
                <Text style={[styles.actionButtonSecondaryText, { color: theme.colors.text }]}>
                  {RAFFLE_SELLER_PANEL_UI.PAUSE}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.actionButtonSecondary, styles.actionDanger, { borderColor: "#c62828" }]}
              onPress={handleDelete}
              disabled={actionsBusy}
            >
              <Text style={styles.actionDangerText}>{RAFFLE_SELLER_PANEL_UI.DELETE}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {archive.length > 0 ? (
        <View style={styles.archive}>
          <Text style={[styles.archiveTitle, { color: theme.colors.text }]}>
            {RAFFLE_SELLER_PANEL_UI.ARCHIVE_TITLE}
          </Text>
          {archive.map((row) => (
            <Text key={row._id} style={[styles.archiveItem, { color: theme.colors.textMuted }]}>
              {row.title} — {STATUS_LABEL[row.status] ?? row.status}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  current: {
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  status: {
    fontSize: 13,
  },
  comment: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  actionButtonSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonSecondaryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionDanger: {
    backgroundColor: "#fff",
  },
  actionDangerText: {
    color: "#c62828",
    fontSize: 13,
    fontWeight: "600",
  },
  archive: {
    marginTop: 12,
    gap: 6,
  },
  archiveTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  archiveItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    fontSize: 13,
    marginBottom: 8,
  },
});
