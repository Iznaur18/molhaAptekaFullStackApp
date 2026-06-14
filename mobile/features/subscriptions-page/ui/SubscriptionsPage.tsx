import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useMyFollowingQuery } from "@/entities/user-follow/model/useMyFollowingQuery";
import { useUnfollowUserMutation } from "@/entities/user-follow/model/useUnfollowUserMutation";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { SUBSCRIPTIONS_PAGE_UI, USER_FOLLOW_BUTTON_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const SubscriptionsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const isAuthorized = useIsAuthorized();
  const followingQuery = useMyFollowingQuery({ enabled: isAuthorized });
  const unfollowMutation = useUnfollowUserMutation();
  const users = followingQuery.data?.users ?? [];

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {SUBSCRIPTIONS_PAGE_UI.LOGIN_HINT}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>{SUBSCRIPTIONS_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (followingQuery.isPending) {
    return <ScreenLoadingState message={SUBSCRIPTIONS_PAGE_UI.LOADING} />;
  }

  if (followingQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          followingQuery.error,
          SUBSCRIPTIONS_PAGE_UI.FETCH_FALLBACK,
        )}
        onRetry={() => followingQuery.refetch()}
      />
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
          {SUBSCRIPTIONS_PAGE_UI.EMPTY}
        </Text>
      </View>
    );
  }

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowMutation.mutateAsync(userId);
    } catch {
      // mutation error state optional
    }
  };

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const displayName = item.userName?.trim() || "Пользователь";

        return (
          <View style={[styles.row, { borderColor: theme.colors.border }]}>
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.colors.text }]}>{displayName}</Text>
              {item.isPremiumUser ? (
                <Text style={[styles.badge, { color: theme.colors.warning }]}>Premium</Text>
              ) : null}
            </View>
            <Pressable
              style={[styles.unfollow, { borderColor: theme.colors.borderStrong }]}
              onPress={() => void handleUnfollow(item._id)}
              disabled={unfollowMutation.isPending}
            >
              <Text style={[styles.unfollowText, { color: theme.colors.textSecondary }]}>
                {unfollowMutation.isPending
                  ? USER_FOLLOW_BUTTON_UI.LOADING
                  : USER_FOLLOW_BUTTON_UI.UNFOLLOW}
              </Text>
            </Pressable>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    fontSize: 12,
    fontWeight: "600",
  },
  unfollow: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  unfollowText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
