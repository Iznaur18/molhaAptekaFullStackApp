import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useMyFollowingQuery } from "@/entities/user-follow/model/useMyFollowingQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountList } from "@/features/profile-tab/ui/ProfileAccountList";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { SubscriptionUserRow } from "@/features/subscriptions-page/ui/SubscriptionUserRow";
import { MY_PROFILE_PAGE_UI, SUBSCRIPTIONS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { pluralizeRu } from "@/shared/lib/pluralizeRu";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useSubscriptionsPageStyles } from "@/shared/theme/subscriptionsPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const SubscriptionsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useSubscriptionsPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
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

      <View
        style={styles.heroCard}
        accessibilityLabel={`${SUBSCRIPTIONS_PAGE_UI.HERO_CAPTION}: ${users.length} ${pluralizeRu(users.length, SUBSCRIPTIONS_PAGE_UI.HERO_UNIT_FORMS)}`}
      >
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroCaption}>{SUBSCRIPTIONS_PAGE_UI.HERO_CAPTION}</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroValue}>{users.length}</Text>
            <Text style={styles.heroUnit}>
              {pluralizeRu(users.length, SUBSCRIPTIONS_PAGE_UI.HERO_UNIT_FORMS)}
            </Text>
          </View>
          <Text style={styles.heroInfo}>{SUBSCRIPTIONS_PAGE_UI.HERO_INFO}</Text>
        </View>
        <View style={styles.heroIconWrap}>
          <Feather
            name="users"
            size={24}
            color={theme.colors.onContrast}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </View>
      </View>
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
        <View
          style={[
            styles.container,
            centeredContentStyle,
            styles.emptyRoot,
            !isDrawerLayout ? styles.emptyInAccountShell : null,
          ]}
        >
          {listHeader}
          <View style={styles.emptyBody}>
            <Text style={styles.state}>{SUBSCRIPTIONS_PAGE_UI.EMPTY}</Text>
          </View>
        </View>
        <ProfileMobileNavSheet
          visible={navSheetVisible}
          activeSectionId="subscriptions"
          onClose={() => setNavSheetVisible(false)}
          onOverviewPress={() => router.replace("/(tabs)/me")}
        />
      </>
    );
  }

  return (
    <>
      <ProfileAccountList
        data={users}
        keyExtractor={(item) => item._id}
        style={[styles.container, scrollEnabled ? centeredContentStyle : null]}
        contentContainerStyle={[
          styles.listContent,
          !isDrawerLayout ? styles.listInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        ListHeaderComponent={listHeader}
        renderItem={({ item, index }) => (
          <View style={index === 0 ? null : styles.listItem}>
            <SubscriptionUserRow user={item} onRowClick={handleOpenProfile} />
          </View>
        )}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="subscriptions"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/me")}
      />
    </>
  );
};
