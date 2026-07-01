import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { PendingInstallmentModerationQueue } from "@/entities/installment/api/installmentStaffApi";
import {
  useInstallmentStaffMutations,
  usePendingInstallmentModerationQuery,
} from "@/entities/installment/model/useInstallmentStaffMutations";
import { InstallmentModerationQueueCard } from "@/entities/installment/ui/InstallmentModerationQueueCard";
import { InstallmentModerationPageToolbar } from "@/features/installment-moderation-page/ui/InstallmentModerationPageToolbar";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { installmentQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import { INSTALLMENT_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useInstallmentModerationPageStyles } from "@/shared/theme/installmentModerationPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const InstallmentModerationPage = () => {
  const router = useRouter();
  const styles = useInstallmentModerationPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const queueQuery = usePendingInstallmentModerationQuery();
  const { approveModerationMutation, rejectModerationMutation } = useInstallmentStaffMutations();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [rejectComments, setRejectComments] = useState<Record<string, string>>({});

  const programs = queueQuery.data?.programs ?? [];

  useFocusEffect(
    useCallback(() => {
      void queueQuery.refetch();
    }, [queueQuery.refetch]),
  );

  const removeFromQueue = useCallback(
    (productId: string) => {
      queryClient.setQueryData(
        installmentQueryKeys.moderationPending(),
        (old: PendingInstallmentModerationQueue | undefined) => {
          if (!old?.programs) {
            return old;
          }
          return {
            ...old,
            programs: old.programs.filter((row) => String(row.productId) !== productId),
          };
        },
      );
    },
    [queryClient],
  );

  const syncStaffQueueCaches = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: installmentQueryKeys.moderationPending() }),
      queryClient.invalidateQueries({ queryKey: installmentQueryKeys.moderationPendingCount() }),
      queryClient.invalidateQueries({
        queryKey: [...staffBadgeQueryKeys.all, "installment-moderation"],
      }),
    ]);
  }, [queryClient]);

  const handleApprove = async (productId: string) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      await approveModerationMutation.mutateAsync(productId);
      removeFromQueue(productId);
      await syncStaffQueueCaches();
    } catch (error) {
      setActionError(formatApiErrorMessage(error, INSTALLMENT_UI.ERROR_GENERIC));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleReject = async (productId: string) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      await rejectModerationMutation.mutateAsync({
        productId,
        comment: rejectComments[productId] ?? "",
      });
      removeFromQueue(productId);
      await syncStaffQueueCaches();
    } catch (error) {
      setActionError(formatApiErrorMessage(error, INSTALLMENT_UI.ERROR_GENERIC));
    } finally {
      setPendingProductId(null);
    }
  };

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_MODERATION}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="installment-moderation"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

  if (queueQuery.isPending && programs.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>
            {sectionToggle}
            <InstallmentModerationPageToolbar programsCount={0} />
          </View>
          <Text style={styles.state}>{INSTALLMENT_UI.MODERATION_PAGE_LOADING}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  if (queueQuery.isError && programs.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>
            {sectionToggle}
            <InstallmentModerationPageToolbar programsCount={0} />
          </View>
          <ScreenErrorState
            message={formatApiErrorMessage(queueQuery.error, INSTALLMENT_UI.ERROR_GENERIC)}
            onRetry={() => queueQuery.refetch()}
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
        accessibilityLabel={INSTALLMENT_UI.MODERATION_PAGE_TITLE}
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
        <View style={styles.header}>
          {sectionToggle}
          <InstallmentModerationPageToolbar programsCount={programs.length} />
        </View>

        {actionError ? (
          <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
            {actionError}
          </Text>
        ) : null}

        {programs.length === 0 ? (
          <Text style={styles.state}>{INSTALLMENT_UI.MODERATION_PAGE_EMPTY}</Text>
        ) : (
          <View style={styles.list}>
            {programs.map((program) => {
              const productId = String(program.productId);
              const isBusy = pendingProductId === productId;

              return (
                <InstallmentModerationQueueCard
                  key={productId}
                  program={program}
                  isBusy={isBusy}
                  rejectComment={rejectComments[productId] ?? ""}
                  onRejectCommentChange={(value) =>
                    setRejectComments((prev) => ({ ...prev, [productId]: value }))
                  }
                  onApprove={() => {
                    void handleApprove(productId);
                  }}
                  onReject={() => {
                    void handleReject(productId);
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
