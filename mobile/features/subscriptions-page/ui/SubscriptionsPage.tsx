import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { useMyFollowingQuery } from "@/entities/user-follow/model/useMyFollowingQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { SubscriptionUserRow } from "@/features/subscriptions-page/ui/SubscriptionUserRow";
import { MY_PROFILE_PAGE_UI, SUBSCRIPTIONS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useSubscriptionsPageStyles } from "@/shared/theme/subscriptionsPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const SubscriptionsPage = () => {
  const router = useRouter();
  const styles = useSubscriptionsPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const isAuthorized = useIsAuthorized();
  const followingQuery = useMyFollowingQuery({ enabled: isAuthorized });
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const users = followingQuery.data?.users ?? [];

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void followingQuery.refetch();
      }
    }, [isAuthorized, followingQuery.refetch]),
  );

  const handleOpenProfile = useCallback(
    (userId: string) => {
      router.push({ pathname: "/user/[id]", params: { id: userId } });
    },
    [router],
  );

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_SUBSCRIPTIONS}
        onPress={() => setNavSheetVisible(true)}
      />
    </View>
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{SUBSCRIPTIONS_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.loginButtonText}>{SUBSCRIPTIONS_PAGE_UI.LOGIN_BUTTON}</Text>
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
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          {listHeader}
          <Text style={styles.state}>{SUBSCRIPTIONS_PAGE_UI.EMPTY}</Text>
        </View>
        <ProfileMobileNavSheet
          visible={navSheetVisible}
          activeSectionId="subscriptions"
          onClose={() => setNavSheetVisible(false)}
          onOverviewPress={() => router.replace("/(tabs)/profile")}
        />
      </>
    );
  }

  return (
    <>
      <FlatList
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: contentPaddingBottom },
        ]}
        data={users}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <SubscriptionUserRow user={item} onRowClick={handleOpenProfile} />
        )}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="subscriptions"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
