import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { canSellerEditRaffle } from "@/entities/raffle/lib/canSellerEditRaffle";
import { useMyRaffleMutations } from "@/entities/raffle/model/useMyRaffleMutations";
import { useMyRaffleQuery } from "@/entities/raffle/model/useMyRaffleQuery";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RaffleManageActions } from "@/entities/raffle/ui/RaffleManageActions";
import { CreateRaffleModal } from "@/features/create-raffle-page/ui/CreateRaffleModal";
import {
  API_CLIENT_UI,
  RAFFLE_MANAGE_UI,
  RAFFLE_SELLER_PANEL_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useRaffleSellerOverviewStyles } from "@/shared/theme/raffleSellerOverviewStyles";

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
  const styles = useRaffleSellerOverviewStyles();
  const myRaffleQuery = useMyRaffleQuery({ enabled });
  const { pauseMyMutation, deleteMyMutation } = useMyRaffleMutations();
  const [actionError, setActionError] = useState("");
  const [editingRaffle, setEditingRaffle] = useState<RaffleFromApi | null>(null);

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

    Alert.alert(RAFFLE_MANAGE_UI.DELETE, RAFFLE_MANAGE_UI.DELETE_CONFIRM_OWNER, [
      { text: "Отмена", style: "cancel" },
      {
        text: RAFFLE_MANAGE_UI.DELETE,
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

  if (myRaffleQuery.isPending) {
    return <Text style={styles.state}>Загрузка…</Text>;
  }

  if (myRaffleQuery.isError) {
    return (
      <Text style={styles.stateError} accessibilityRole="alert">
        {formatApiErrorMessage(myRaffleQuery.error, API_CLIENT_UI.FETCH_MY_RAFFLE_FALLBACK)}
      </Text>
    );
  }

  return (
    <>
      <View style={styles.root}>
        <Text style={styles.title}>{RAFFLE_SELLER_PANEL_UI.TITLE}</Text>

        {actionError ? (
          <Text style={styles.inlineError} accessibilityRole="alert">
            {actionError}
          </Text>
        ) : null}

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
              <RaffleManageActions
                showEdit={showEdit}
                showDelete
                showPause={raffle.status === "active"}
                onEdit={() => setEditingRaffle(raffle)}
                onDelete={handleDelete}
                onPause={() => {
                  void handlePause();
                }}
                busy={actionsBusy}
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

      <CreateRaffleModal
        visible={editingRaffle != null}
        raffleToEdit={editingRaffle}
        onClose={() => setEditingRaffle(null)}
      />
    </>
  );
};
