import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Alert, View } from "react-native";

import type { RaffleFromApi } from "@/entities/raffle/model/types";
import type { StaffRafflesQueueData } from "@/entities/raffle/api/raffleStaffApi";
import {
  useRaffleStaffMutations,
  useStaffRafflesQueueQuery,
} from "@/entities/raffle/model/useRaffleStaffMutations";
import { RafflesStaffLiveRow } from "@/entities/raffle/ui/RafflesStaffLiveRow";
import { RafflesStaffPendingRow } from "@/entities/raffle/ui/RafflesStaffPendingRow";
import { CreateRaffleModal } from "@/features/create-raffle-page/ui/CreateRaffleModal";
import { INTRO_AD_MODERATION_SECTION_RAFFLE } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";
import { resolveIntroAdModerationListPanelStyles } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionZone";
import { ModerationSectionTitle } from "@/features/intro-ad-moderation-page/ui/ModerationSectionTitle";
import { introAdQueryKeys, raffleQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  RAFFLE_MANAGE_UI,
  RAFFLES_STAFF_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";

type RaffleModerationSectionProps = {
  onActionError?: (message: string) => void;
};

export const RaffleModerationSection = ({ onActionError }: RaffleModerationSectionProps) => {
  const styles = useIntroAdModerationPageStyles();
  const queryClient = useQueryClient();
  const queueQuery = useStaffRafflesQueueQuery();
  const { approveMutation, rejectMutation, deleteStaffMutation } = useRaffleStaffMutations();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingRaffle, setEditingRaffle] = useState<RaffleFromApi | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [clearedLiveRaffleId, setClearedLiveRaffleId] = useState<string | null>(null);

  const pendingRaffles = queueQuery.data?.pendingRaffles ?? [];
  const liveRaffleFromQuery = queueQuery.data?.liveRaffle ?? null;
  const liveRaffle =
    clearedLiveRaffleId != null &&
    liveRaffleFromQuery?._id != null &&
    String(liveRaffleFromQuery._id) === clearedLiveRaffleId
      ? null
      : liveRaffleFromQuery;

  const removePendingRow = useCallback(
    (raffleId: string) => {
      queryClient.setQueryData(raffleQueryKeys.staffQueue(), (old: StaffRafflesQueueData | undefined) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          pendingRaffles: old.pendingRaffles.filter((row) => String(row._id) !== raffleId),
        };
      });
      setRowErrors((prev) => {
        const next = { ...prev };
        delete next[raffleId];
        return next;
      });
    },
    [queryClient],
  );

  const syncStaffQueueCaches = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: raffleQueryKeys.staffQueue() }),
      queryClient.invalidateQueries({
        queryKey: [...raffleQueryKeys.all, "featured"],
      }),
      queryClient.invalidateQueries({ queryKey: introAdQueryKeys.moderationCount() }),
      queryClient.invalidateQueries({ queryKey: [...staffBadgeQueryKeys.all, "intro-ad"] }),
    ]);
  }, [queryClient]);

  const handleApprove = async (raffleId: string) => {
    try {
      setPendingId(raffleId);
      onActionError?.("");
      setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
      await approveMutation.mutateAsync(raffleId);
      removePendingRow(raffleId);
      await syncStaffQueueCaches();
    } catch (error) {
      const message = formatApiErrorMessage(error, API_CLIENT_UI.APPROVE_RAFFLE_FALLBACK);
      onActionError?.(message);
      setRowErrors((prev) => ({ ...prev, [raffleId]: message }));
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (raffleId: string) => {
    try {
      setPendingId(raffleId);
      onActionError?.("");
      setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
      await rejectMutation.mutateAsync(raffleId);
      removePendingRow(raffleId);
      await syncStaffQueueCaches();
    } catch (error) {
      const message = formatApiErrorMessage(error, API_CLIENT_UI.REJECT_RAFFLE_FALLBACK);
      onActionError?.(message);
      setRowErrors((prev) => ({ ...prev, [raffleId]: message }));
    } finally {
      setPendingId(null);
    }
  };

  const confirmDelete = (onConfirm: () => void) => {
    Alert.alert(RAFFLE_MANAGE_UI.DELETE, RAFFLE_MANAGE_UI.DELETE_CONFIRM_STAFF, [
      { text: "Отмена", style: "cancel" },
      { text: RAFFLE_MANAGE_UI.DELETE, style: "destructive", onPress: onConfirm },
    ]);
  };

  const handleDelete = (raffleId: string, { clearLive = false }: { clearLive?: boolean } = {}) => {
    confirmDelete(() => {
      void (async () => {
        try {
          setPendingId(raffleId);
          onActionError?.("");
          setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
          await deleteStaffMutation.mutateAsync(raffleId);
          removePendingRow(raffleId);
          if (clearLive) {
            setClearedLiveRaffleId(raffleId);
          }
          await syncStaffQueueCaches();
        } catch (error) {
          const message = formatApiErrorMessage(error, API_CLIENT_UI.DELETE_RAFFLE_FALLBACK);
          onActionError?.(message);
          setRowErrors((prev) => ({ ...prev, [raffleId]: message }));
        } finally {
          setPendingId(null);
        }
      })();
    });
  };

  if (pendingRaffles.length === 0 && !liveRaffle) {
    return null;
  }

  const isActionPending =
    approveMutation.isPending || rejectMutation.isPending || deleteStaffMutation.isPending;

  return (
    <View style={styles.section}>
      {liveRaffle ? (
        <View style={styles.section}>
          <ModerationSectionTitle title={RAFFLE_MANAGE_UI.LIVE_SECTION_TITLE} />
          <RafflesStaffLiveRow
            raffle={liveRaffle}
            busy={pendingId === liveRaffle._id || isActionPending}
            errorMessage={rowErrors[liveRaffle._id] ?? ""}
            onEdit={() => setEditingRaffle(liveRaffle)}
            onDelete={() => handleDelete(String(liveRaffle._id), { clearLive: true })}
          />
        </View>
      ) : null}

      {pendingRaffles.length > 0 ? (
        <View style={resolveIntroAdModerationListPanelStyles(INTRO_AD_MODERATION_SECTION_RAFFLE, styles)}>
          <ModerationSectionTitle
            title={RAFFLES_STAFF_PAGE_UI.QUEUE_TITLE}
            pendingCount={pendingRaffles.length}
          />
          {pendingRaffles.map((raffle) => {
            const raffleId = String(raffle._id);
            return (
              <RafflesStaffPendingRow
                key={raffleId}
                raffle={raffle}
                busy={pendingId === raffleId || isActionPending}
                errorMessage={rowErrors[raffleId] ?? ""}
                onApprove={() => {
                  void handleApprove(raffleId);
                }}
                onReject={() => {
                  void handleReject(raffleId);
                }}
                onEdit={() => setEditingRaffle(raffle)}
                onDelete={() => handleDelete(raffleId)}
              />
            );
          })}
        </View>
      ) : null}

      <CreateRaffleModal
        visible={editingRaffle != null}
        raffleToEdit={editingRaffle}
        useStaffApi
        onClose={() => setEditingRaffle(null)}
        onSuccess={async () => {
          setEditingRaffle(null);
          await syncStaffQueueCaches();
        }}
      />
    </View>
  );
};
