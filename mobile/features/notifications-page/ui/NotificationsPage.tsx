import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
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
  const theme = useAppTheme();
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
      <View style={[styles.centered, { backgroundColor: theme.colors.bg }]}>
        <Text style={[styles.empty, { color: theme.colors.textMuted }]}>
          {NOTIFICATIONS_PAGE_UI.AUTH_REQUIRED}
        </Text>
        <Pressable
          style={[styles.loginButton, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginButtonText}>{AUTH_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (sessionQuery.isPending) {
    return <ScreenLoadingState message={NOTIFICATIONS_PAGE_UI.LOADING} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.toolbar}>
        <Text style={[styles.count, { color: theme.colors.textMuted }]}>
          {NOTIFICATIONS_PAGE_UI.COUNT(notifications.length)}
        </Text>
        <Pressable
          style={[styles.clearButton, { borderColor: theme.colors.borderStrong }]}
          onPress={() => void handleClear()}
          disabled={notifications.length === 0 || markReadMutation.isPending}
          accessibilityLabel={NOTIFICATIONS_PAGE_UI.CLEAR_ARIA}
        >
          <Text style={[styles.clearText, { color: theme.colors.action }]}>
            {markReadMutation.isPending
              ? NOTIFICATIONS_PAGE_UI.CLEAR_PENDING
              : NOTIFICATIONS_PAGE_UI.CLEAR}
          </Text>
        </Pressable>
      </View>

      {clearError ? (
        <Text style={[styles.error, { color: theme.colors.danger }]}>{clearError}</Text>
      ) : null}

      {notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.empty, { color: theme.colors.textMuted }]}>
            {NOTIFICATIONS_PAGE_UI.EMPTY}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
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
                style={[
                  styles.item,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                  !isClickable && styles.itemStatic,
                ]}
                onPress={() => openNotificationTarget(router, item)}
                disabled={!isClickable}
              >
                <Text style={[styles.message, { color: theme.colors.text }]}>{item.message}</Text>
                <Text style={[styles.createdAt, { color: theme.colors.textMuted }]}>
                  {formatIsoDateTime(item.createdAt)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  count: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  empty: {
    fontSize: 15,
    textAlign: "center",
  },
  loginButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 10,
  },
  item: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 14,
  },
  itemStatic: {
    opacity: 0.85,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  createdAt: {
    marginTop: 6,
    fontSize: 12,
  },
});
