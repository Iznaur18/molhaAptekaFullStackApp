import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { isNotificationRouteAvailable } from "@/entities/notification/lib/resolveNotificationRoute";
import { resolveInAppNotificationRoute } from "@/entities/notification/lib/resolveInAppNotificationRoute";
import {
  useInAppNotifications,
  type InAppNotification,
} from "@/entities/notification/model/useInAppNotifications";
import { useMarkInAppNotificationsReadMutation } from "@/entities/notification/model/useMarkInAppNotificationsReadMutation";
import { useMarkInAppNotificationsReadOnView } from "@/entities/notification/model/useMarkInAppNotificationsReadOnView";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { API_CLIENT_UI, AUTH_UI, NOTIFICATIONS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage, formatIsoDateTime } from "@/shared/lib";
import { useNotificationsPageStyles } from "@/shared/theme/accountFeatureStyles";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

const openNotificationTarget = (
  router: ReturnType<typeof useRouter>,
  item: InAppNotification,
) => {
  const route = resolveInAppNotificationRoute(item);
  if (route) {
    router.push(route);
  }
};

export const NotificationsPage = () => {
  const router = useRouter();
  const styles = useNotificationsPageStyles();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const notifications = useInAppNotifications();
  const markReadMutation = useMarkInAppNotificationsReadMutation();
  const [clearError, setClearError] = useState("");

  useMarkInAppNotificationsReadOnView(isAuthorized);

  const handleRefresh = useCallback(async () => {
    await sessionQuery.refetch();
  }, [sessionQuery]);

  const handleClear = async () => {
    if (notifications.length === 0 || markReadMutation.isPending) {
      return;
    }

    try {
      setClearError("");
      await markReadMutation.mutateAsync();
    } catch (error) {
      setClearError(
        formatApiErrorMessage(error, API_CLIENT_UI.MARK_NOTIFICATIONS_READ_FALLBACK),
      );
    }
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>{NOTIFICATIONS_PAGE_UI.AUTH_REQUIRED}</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>{AUTH_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (sessionQuery.isPending) {
    return <ScreenLoadingState message={NOTIFICATIONS_PAGE_UI.LOADING} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <Text style={styles.count}>{NOTIFICATIONS_PAGE_UI.COUNT(notifications.length)}</Text>
        <Pressable
          style={styles.clearButton}
          onPress={() => void handleClear()}
          disabled={notifications.length === 0 || markReadMutation.isPending}
          accessibilityLabel={NOTIFICATIONS_PAGE_UI.CLEAR_ARIA}
        >
          <Text style={styles.clearText}>
            {markReadMutation.isPending
              ? NOTIFICATIONS_PAGE_UI.CLEAR_PENDING
              : NOTIFICATIONS_PAGE_UI.CLEAR}
          </Text>
        </Pressable>
      </View>

      {clearError ? <Text style={styles.error}>{clearError}</Text> : null}

      {notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.empty}>{NOTIFICATIONS_PAGE_UI.EMPTY}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <ThemedRefreshControl
              refreshing={sessionQuery.isRefetching}
              onRefresh={handleRefresh}
            />
          }
          renderItem={({ item }) => {
            const isClickable = isNotificationRouteAvailable({
              kind: item.kind,
              productId: item.productId,
              actorUserId: item.actorUserId,
              notificationId: item._id,
            });

            return (
              <Pressable
                style={[styles.item, !isClickable && styles.itemStatic]}
                onPress={() => openNotificationTarget(router, item)}
                disabled={!isClickable}
              >
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.createdAt}>{formatIsoDateTime(item.createdAt)}</Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
};
