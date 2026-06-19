import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { useMyFollowingQuery } from "@/entities/user-follow/model/useMyFollowingQuery";
import { useUnfollowUserMutation } from "@/entities/user-follow/model/useUnfollowUserMutation";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { SubscriptionUserRow } from "@/features/subscriptions-page/ui/SubscriptionUserRow";
import { SUBSCRIPTIONS_PAGE_UI, USER_FOLLOW_BUTTON_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useSubscriptionsPageStyles } from "@/shared/theme/accountFeatureStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const SubscriptionsPage = () => {
  const router = useRouter();
  const styles = useSubscriptionsPageStyles();
  const isAuthorized = useIsAuthorized();
  const followingQuery = useMyFollowingQuery({ enabled: isAuthorized });
  const unfollowMutation = useUnfollowUserMutation();
  const users = followingQuery.data?.users ?? [];

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{SUBSCRIPTIONS_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
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
        <Text style={styles.hint}>{SUBSCRIPTIONS_PAGE_UI.EMPTY}</Text>
      </View>
    );
  }

  const handleOpenProfile = (userId: string) => {
    router.push({ pathname: "/user/[id]", params: { id: userId } });
  };

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
      renderItem={({ item }) => (
        <View style={styles.row}>
          <SubscriptionUserRow user={item} onPress={handleOpenProfile} />
          <Pressable
            style={styles.unfollow}
            onPress={() => void handleUnfollow(item._id)}
            disabled={unfollowMutation.isPending}
          >
            <Text style={styles.unfollowText}>
              {unfollowMutation.isPending
                ? USER_FOLLOW_BUTTON_UI.LOADING
                : USER_FOLLOW_BUTTON_UI.UNFOLLOW}
            </Text>
          </Pressable>
        </View>
      )}
    />
  );
};
