import { DEAL_REQUEST_ROLE_BUYER, DEAL_REQUEST_ROLE_SELLER } from "@molha/api-contract";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";

import type { DealRequestRole } from "@/entities/deal-request/api/dealRequestApi";
import {
  useDealRequestActionMutation,
  useMyDealRequestsQuery,
} from "@/entities/deal-request/model/useDealRequests";
import { DealRequestCard } from "@/entities/deal-request/ui/DealRequestCard";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountScrollBody } from "@/features/profile-tab/ui/ProfileAccountScrollBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { AUTH_UI, DEAL_REQUESTS_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useDealRequestsPageStyles } from "@/shared/theme/dealRequestStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ModalSectionTabs } from "@/shared/ui/ModalSectionTabs";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

const TABS = [
  { id: DEAL_REQUEST_ROLE_BUYER, label: DEAL_REQUESTS_PAGE_UI.TAB_BUYER },
  { id: DEAL_REQUEST_ROLE_SELLER, label: DEAL_REQUESTS_PAGE_UI.TAB_SELLER },
] as const;

/** Раздел «Заявки» в профиле — паритет web `DealRequestsPage`. */
export const DealRequestsPage = () => {
  const router = useRouter();
  const styles = useDealRequestsPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const isAuthorized = useIsAuthorized();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [role, setRole] = useState<DealRequestRole>(DEAL_REQUEST_ROLE_BUYER);
  const requestsQuery = useMyDealRequestsQuery({ role, enabled: isAuthorized });
  const actionMutation = useDealRequestActionMutation();
  const [actionError, setActionError] = useState<{
    requestId: string;
    message: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void requestsQuery.refetch();
      }
    }, [isAuthorized, requestsQuery.refetch]),
  );

  const requests = useMemo(
    () => (requestsQuery.data?.pages ?? []).flatMap((page) => page.requests),
    [requestsQuery.data],
  );

  const pendingRequestId = actionMutation.isPending
    ? actionMutation.variables?.requestId
    : null;

  const handleAction = async (
    requestId: string,
    action: string,
    body?: Record<string, unknown>,
  ) => {
    setActionError(null);
    try {
      await actionMutation.mutateAsync({ requestId, action, body });
    } catch (error) {
      setActionError({
        requestId,
        message:
          error instanceof Error
            ? error.message
            : DEAL_REQUESTS_PAGE_UI.ACTION_FALLBACK_ERROR,
      });
    }
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.stateText}>{DEAL_REQUESTS_PAGE_UI.LEAD}</Text>
        <AppButton
          label={AUTH_UI.LOGIN_BUTTON}
          variant="primary"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    );
  }

  return (
    <>
      <ProfileAccountScrollBody
        style={[styles.container, scrollEnabled ? centeredContentStyle : null]}
        contentContainerStyle={[
          styles.scroll,
          styles.content,
          !isDrawerLayout ? styles.contentInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={requestsQuery.isRefetching && !requestsQuery.isFetchingNextPage}
            onRefresh={() => {
              void requestsQuery.refetch();
            }}
          />
        }
        accessibilityLabel={DEAL_REQUESTS_PAGE_UI.TITLE}
      >
        <View style={styles.root}>
          <ProfileMobileSectionToggle
            activeLabel={MY_PROFILE_PAGE_UI.TAB_DEAL_REQUESTS}
            onPress={() => setNavSheetVisible(true)}
          />
          <Text style={styles.lead}>{DEAL_REQUESTS_PAGE_UI.LEAD}</Text>
          <ModalSectionTabs
            tabs={TABS}
            activeTabId={role}
            onTabChange={(next) => {
              setActionError(null);
              setRole(next as DealRequestRole);
            }}
            ariaLabel={DEAL_REQUESTS_PAGE_UI.TABS_ARIA}
            variant="segment"
          />

          {requestsQuery.isPending ? (
            <Text style={styles.stateText} accessibilityRole="text">
              {DEAL_REQUESTS_PAGE_UI.LOADING}
            </Text>
          ) : null}

          {requestsQuery.isError && requests.length === 0 ? (
            <View style={styles.state}>
              <Text style={styles.error} accessibilityRole="alert">
                {requestsQuery.error.message}
              </Text>
              <AppButton
                label={DEAL_REQUESTS_PAGE_UI.RETRY}
                variant="secondary"
                onPress={() => void requestsQuery.refetch()}
              />
            </View>
          ) : null}

          {requestsQuery.isSuccess && requests.length === 0 ? (
            <Text style={styles.stateText}>
              {role === DEAL_REQUEST_ROLE_SELLER
                ? DEAL_REQUESTS_PAGE_UI.EMPTY_SELLER
                : DEAL_REQUESTS_PAGE_UI.EMPTY_BUYER}
            </Text>
          ) : null}

          {requests.length > 0 ? (
            <View style={styles.list}>
              {requests.map((request) => (
                <DealRequestCard
                  // Статус в ключе: после действия форма принятия и её черновик
                  // не должны пережить смену состояния заявки.
                  key={`${request.id}:${request.status}`}
                  request={request}
                  isPending={pendingRequestId === request.id}
                  error={
                    actionError?.requestId === request.id ? actionError.message : ""
                  }
                  onAction={(action, body) =>
                    void handleAction(request.id, action, body)
                  }
                />
              ))}
            </View>
          ) : null}

          {requestsQuery.isFetchNextPageError ? (
            <Text style={styles.error} accessibilityRole="alert">
              {requestsQuery.error?.message ??
                DEAL_REQUESTS_PAGE_UI.LOAD_FALLBACK_ERROR}
            </Text>
          ) : null}

          {requestsQuery.hasNextPage ? (
            <AppButton
              label={DEAL_REQUESTS_PAGE_UI.LOAD_MORE}
              variant="secondary"
              disabled={requestsQuery.isFetchingNextPage}
              onPress={() => void requestsQuery.fetchNextPage()}
            />
          ) : null}
        </View>
      </ProfileAccountScrollBody>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="deal-requests"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
