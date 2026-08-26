import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import type { StaffRafflesQueueData } from "@/entities/raffle/api/raffleStaffApi";
import {
  useRaffleStaffMutations,
  useStaffRafflesQueueQuery,
} from "@/entities/raffle/model/useRaffleStaffMutations";
import { RafflesStaffLiveRow } from "@/entities/raffle/ui/RafflesStaffLiveRow";
import { RafflesStaffPendingRow } from "@/entities/raffle/ui/RafflesStaffPendingRow";
import { CreateRaffleModal } from "@/features/create-raffle-page/ui/CreateRaffleModal";
import { UsersLoyaltyRaffleAdminPanel } from "@/features/raffles-staff-page/ui/UsersLoyaltyRaffleAdminPanel";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { raffleQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import {
  API_CLIENT_UI,
  MY_PROFILE_PAGE_UI,
  RAFFLE_MANAGE_UI,
  RAFFLES_STAFF_PAGE_UI,
  USERS_LOYALTY_RAFFLE_ADMIN_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useRafflesStaffPageStyles } from "@/shared/theme/rafflesStaffPageStyles";
import { ModalSectionTabs } from "@/shared/ui/ModalSectionTabs";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

const TAB_MODERATION = "moderation";
const TAB_USERS_RAFFLE = "users-raffle";

export const RafflesStaffPage = () => {
  const router = useRouter();
  const styles = useRafflesStaffPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { isAdmin } = useUserAccess();
  const queryClient = useQueryClient();
  const queueQuery = useStaffRafflesQueueQuery();
  const { approveMutation, rejectMutation, deleteStaffMutation } = useRaffleStaffMutations();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [activeTabId, setActiveTabId] = useState(TAB_MODERATION);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingRaffle, setEditingRaffle] = useState<RaffleFromApi | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [clearedLiveRaffleId, setClearedLiveRaffleId] = useState<string | null>(null);

  const tabs = useMemo(
    () =>
      isAdmin
        ? [
            { id: TAB_MODERATION, label: USERS_LOYALTY_RAFFLE_ADMIN_UI.TAB_MODERATION },
            { id: TAB_USERS_RAFFLE, label: USERS_LOYALTY_RAFFLE_ADMIN_UI.TAB_USERS_RAFFLE },
          ]
        : [{ id: TAB_MODERATION, label: USERS_LOYALTY_RAFFLE_ADMIN_UI.TAB_MODERATION }],
    [isAdmin],
  );

  const showUsersRaffleTab = isAdmin && activeTabId === TAB_USERS_RAFFLE;

  const pendingRaffles = queueQuery.data?.pendingRaffles ?? [];
  const liveRaffleFromQuery = queueQuery.data?.liveRaffle ?? null;
  const liveRaffle =
    clearedLiveRaffleId != null &&
    liveRaffleFromQuery?._id != null &&
    String(liveRaffleFromQuery._id) === clearedLiveRaffleId
      ? null
      : liveRaffleFromQuery;

  useFocusEffect(
    useCallback(() => {
      void queueQuery.refetch();
    }, [queueQuery.refetch]),
  );

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
      queryClient.invalidateQueries({ queryKey: [...staffBadgeQueryKeys.all, "raffles"] }),
    ]);
  }, [queryClient]);

  const handleApprove = async (raffleId: string) => {
    try {
      setPendingId(raffleId);
      setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
      await approveMutation.mutateAsync(raffleId);
      removePendingRow(raffleId);
      await syncStaffQueueCaches();
    } catch (error) {
      setRowErrors((prev) => ({
        ...prev,
        [raffleId]: formatApiErrorMessage(error, API_CLIENT_UI.APPROVE_RAFFLE_FALLBACK),
      }));
    } finally {
      setPendingId(null);
    }
  };

  const handleReject = async (raffleId: string) => {
    try {
      setPendingId(raffleId);
      setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
      await rejectMutation.mutateAsync(raffleId);
      removePendingRow(raffleId);
      await syncStaffQueueCaches();
    } catch (error) {
      setRowErrors((prev) => ({
        ...prev,
        [raffleId]: formatApiErrorMessage(error, API_CLIENT_UI.REJECT_RAFFLE_FALLBACK),
      }));
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
          setRowErrors((prev) => ({ ...prev, [raffleId]: "" }));
          await deleteStaffMutation.mutateAsync(raffleId);
          removePendingRow(raffleId);
          if (clearLive) {
            setClearedLiveRaffleId(raffleId);
          }
          await syncStaffQueueCaches();
        } catch (error) {
          setRowErrors((prev) => ({
            ...prev,
            [raffleId]: formatApiErrorMessage(error, API_CLIENT_UI.DELETE_RAFFLE_FALLBACK),
          }));
        } finally {
          setPendingId(null);
        }
      })();
    });
  };

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_RAFFLES}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="raffles"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/me")}
    />
  );

  if (
    !showUsersRaffleTab &&
    queueQuery.isPending &&
    pendingRaffles.length === 0 &&
    !liveRaffleFromQuery
  ) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <Text style={styles.state}>{RAFFLES_STAFF_PAGE_UI.LOADING}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  if (
    !showUsersRaffleTab &&
    queueQuery.isError &&
    pendingRaffles.length === 0 &&
    !liveRaffleFromQuery
  ) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <ScreenErrorState
            message={formatApiErrorMessage(
              queueQuery.error,
              API_CLIENT_UI.FETCH_RAFFLES_QUEUE_FALLBACK,
            )}
            onRetry={() => queueQuery.refetch()}
          />
        </View>
        {navSheet}
      </>
    );
  }

  const liveBusy = liveRaffle != null && pendingId === String(liveRaffle._id);

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[styles.scroll, { paddingBottom: contentPaddingBottom }]}
        accessibilityLabel={RAFFLES_STAFF_PAGE_UI.TITLE}
        refreshControl={
          <ThemedRefreshControl
            refreshing={queueQuery.isFetching}
            onRefresh={async () => {
              await queueQuery.refetch();
              await syncStaffQueueCaches();
            }}
          />
        }
      >
        <View style={styles.header}>{sectionToggle}</View>

        {tabs.length > 1 ? (
          <ModalSectionTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            variant="segment"
            ariaLabel={RAFFLES_STAFF_PAGE_UI.TITLE}
          />
        ) : null}

        {showUsersRaffleTab ? (
          <UsersLoyaltyRaffleAdminPanel />
        ) : (
          <>
            {liveRaffle ? (
              <View style={styles.liveSection}>
                <Text style={styles.sectionTitle}>{RAFFLE_MANAGE_UI.LIVE_SECTION_TITLE}</Text>
                <RafflesStaffLiveRow
                  raffle={liveRaffle}
                  busy={liveBusy}
                  errorMessage={rowErrors[String(liveRaffle._id)] ?? ""}
                  onEdit={() => setEditingRaffle(liveRaffle)}
                  onDelete={() => handleDelete(String(liveRaffle._id), { clearLive: true })}
                />
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>{RAFFLES_STAFF_PAGE_UI.QUEUE_TITLE}</Text>

            {pendingRaffles.length === 0 ? (
              <Text style={styles.empty}>{RAFFLES_STAFF_PAGE_UI.EMPTY}</Text>
            ) : (
              <View style={styles.list}>
                {pendingRaffles.map((raffle: RaffleFromApi) => {
                  const raffleId = String(raffle._id);
                  const busy = pendingId === raffleId;

                  return (
                    <RafflesStaffPendingRow
                      key={raffleId}
                      raffle={raffle}
                      busy={busy}
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
            )}
          </>
        )}
      </ScrollView>

      {navSheet}

      <CreateRaffleModal
        visible={editingRaffle != null}
        raffleToEdit={editingRaffle}
        useStaffApi
        onClose={() => setEditingRaffle(null)}
        onSuccess={() => {
          void syncStaffQueueCaches();
        }}
      />
    </>
  );
};
