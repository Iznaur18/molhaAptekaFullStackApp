import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { DataConfirmationRequest } from "@/entities/user-data-confirmation/api/dataConfirmationStaffApi";
import { usePendingDataConfirmationRequestsQuery } from "@/entities/user-data-confirmation/model/useDataConfirmationStaffMutations";
import { DataConfirmationRequestCard } from "@/entities/user-data-confirmation/ui/DataConfirmationRequestCard";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { dataConfirmationStaffQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import { API_CLIENT_UI, DATA_CONFIRMATION_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useDataConfirmationRequestsPageStyles } from "@/shared/theme/dataConfirmationRequestsPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const DataConfirmationRequestsPage = () => {
  const router = useRouter();
  const styles = useDataConfirmationRequestsPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled, resolveListStyle } =
    useProfileAccountNestedListScroll();
  const queryClient = useQueryClient();
  const queueQuery = usePendingDataConfirmationRequestsQuery();
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const requests = queueQuery.data ?? [];

  useFocusEffect(
    useCallback(() => {
      void queueQuery.refetch();
    }, [queueQuery.refetch]),
  );

  const removeRequestRow = useCallback(
    (requestId: string) => {
      queryClient.setQueryData(
        dataConfirmationStaffQueryKeys.pending(),
        (old: DataConfirmationRequest[] | undefined) => {
          if (!old) {
            return old;
          }
          return old.filter((row) => String(row._id) !== requestId);
        },
      );
    },
    [queryClient],
  );

  const syncStaffQueueCaches = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: dataConfirmationStaffQueryKeys.pending() }),
      queryClient.invalidateQueries({ queryKey: [...staffBadgeQueryKeys.all, "data-confirmation"] }),
    ]);
  }, [queryClient]);

  const handleResolved = useCallback(
    async (requestId: string) => {
      removeRequestRow(requestId);
      await syncStaffQueueCaches();
    },
    [removeRequestRow, syncStaffQueueCaches],
  );

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="data-confirmation-requests"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/me")}
    />
  );

  if (queueQuery.isPending && requests.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <Text style={styles.state}>{DATA_CONFIRMATION_PAGE_UI.LOADING}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  if (queueQuery.isError && requests.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <ScreenErrorState
            message={formatApiErrorMessage(
              queueQuery.error,
              API_CLIENT_UI.FETCH_DATA_CONFIRMATION_QUEUE_FALLBACK,
            )}
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
        style={resolveListStyle([
          styles.container,
          scrollEnabled ? centeredContentStyle : null,
        ])}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        accessibilityLabel={MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION}
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

        {requests.length === 0 ? (
          <Text style={styles.state}>{DATA_CONFIRMATION_PAGE_UI.EMPTY}</Text>
        ) : (
          <View style={styles.list}>
            {requests.map((request) => (
              <DataConfirmationRequestCard
                key={String(request._id)}
                request={request}
                onResolved={() => void handleResolved(String(request._id))}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {navSheet}
    </>
  );
};
