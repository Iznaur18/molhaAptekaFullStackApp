import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { InstallmentDispute } from "@/entities/installment/api/installmentStaffApi";
import {
  useInstallmentStaffMutations,
  usePendingInstallmentDisputesQuery,
} from "@/entities/installment/model/useInstallmentStaffMutations";
import { InstallmentDisputesQueueCard } from "@/entities/installment/ui/InstallmentDisputesQueueCard";
import { InstallmentDisputesPageToolbar } from "@/features/installment-disputes-page/ui/InstallmentDisputesPageToolbar";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { installmentQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import { INSTALLMENT_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useInstallmentDisputesPageStyles } from "@/shared/theme/installmentDisputesPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const InstallmentDisputesPage = () => {
  const router = useRouter();
  const styles = useInstallmentDisputesPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const disputesQuery = usePendingInstallmentDisputesQuery();
  const { resolveDisputeMutation } = useInstallmentStaffMutations();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingDisputeId, setPendingDisputeId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [partialRefundRub, setPartialRefundRub] = useState<Record<string, string>>({});

  const disputes = disputesQuery.data ?? [];

  useFocusEffect(
    useCallback(() => {
      void disputesQuery.refetch();
    }, [disputesQuery.refetch]),
  );

  const removeFromQueue = useCallback(
    (disputeId: string) => {
      queryClient.setQueryData(
        installmentQueryKeys.disputesPending(),
        (old: InstallmentDispute[] | undefined) => {
          if (!Array.isArray(old)) {
            return old;
          }
          return old.filter((row) => row._id !== disputeId);
        },
      );
    },
    [queryClient],
  );

  const syncStaffQueueCaches = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: installmentQueryKeys.disputesPending() }),
      queryClient.invalidateQueries({ queryKey: installmentQueryKeys.disputesPendingCount() }),
      queryClient.invalidateQueries({
        queryKey: [...staffBadgeQueryKeys.all, "installment-disputes"],
      }),
    ]);
  }, [queryClient]);

  const handleResolve = async (disputeId: string, action: string) => {
    try {
      setPendingDisputeId(disputeId);
      setActionError("");
      await resolveDisputeMutation.mutateAsync({
        disputeId,
        body: {
          action,
          resolutionNote: resolutionNotes[disputeId] ?? "",
          ...(action === "partial_refund"
            ? { partialRefundRub: Number(partialRefundRub[disputeId]) || 0 }
            : {}),
        },
      });
      removeFromQueue(disputeId);
      await syncStaffQueueCaches();
    } catch (error) {
      setActionError(formatApiErrorMessage(error, INSTALLMENT_UI.ERROR_GENERIC));
    } finally {
      setPendingDisputeId(null);
    }
  };

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_DISPUTES}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="installment-disputes"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

  if (disputesQuery.isPending && disputes.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>
            {sectionToggle}
            <InstallmentDisputesPageToolbar disputesCount={0} />
          </View>
          <Text style={styles.state}>{INSTALLMENT_UI.DISPUTES_PAGE_LOADING}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  if (disputesQuery.isError && disputes.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>
            {sectionToggle}
            <InstallmentDisputesPageToolbar disputesCount={0} />
          </View>
          <ScreenErrorState
            message={formatApiErrorMessage(disputesQuery.error, INSTALLMENT_UI.ERROR_GENERIC)}
            onRetry={() => disputesQuery.refetch()}
          />
        </View>
        {navSheet}
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[styles.scroll, { paddingBottom: contentPaddingBottom }]}
        accessibilityLabel={INSTALLMENT_UI.DISPUTES_PAGE_TITLE}
        refreshControl={
          <ThemedRefreshControl
            refreshing={disputesQuery.isFetching}
            onRefresh={async () => {
              await disputesQuery.refetch();
              await syncStaffQueueCaches();
            }}
          />
        }
      >
        <View style={styles.header}>
          {sectionToggle}
          <InstallmentDisputesPageToolbar disputesCount={disputes.length} />
        </View>

        {actionError ? (
          <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
            {actionError}
          </Text>
        ) : null}

        {disputes.length === 0 ? (
          <Text style={styles.state}>{INSTALLMENT_UI.DISPUTES_PAGE_EMPTY}</Text>
        ) : (
          <View style={styles.list}>
            {disputes.map((dispute) => {
              const disputeId = dispute._id;
              const isBusy = pendingDisputeId === disputeId;

              return (
                <InstallmentDisputesQueueCard
                  key={disputeId}
                  dispute={dispute}
                  isBusy={isBusy}
                  resolutionNote={resolutionNotes[disputeId] ?? ""}
                  partialRefundRub={partialRefundRub[disputeId] ?? ""}
                  onResolutionNoteChange={(value) =>
                    setResolutionNotes((prev) => ({ ...prev, [disputeId]: value }))
                  }
                  onPartialRefundChange={(value) =>
                    setPartialRefundRub((prev) => ({ ...prev, [disputeId]: value }))
                  }
                  onResolve={(action) => {
                    void handleResolve(disputeId, action);
                  }}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {navSheet}
    </>
  );
};
