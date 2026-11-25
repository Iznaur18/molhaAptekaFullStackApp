import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useMyFollowersQuery } from "@/entities/user-follow/model/useMyFollowersQuery";
import { useMyFollowingQuery } from "@/entities/user-follow/model/useMyFollowingQuery";
import {
  SUBSCRIPTIONS_LIST_FOLLOWERS,
  SUBSCRIPTIONS_LIST_FOLLOWING,
} from "@/entities/user-follow/model/constants";
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
import { AppButton } from "@/shared/ui/AppButton";
import { ModalSectionTabs } from "@/shared/ui/ModalSectionTabs";

const SUBSCRIPTION_TABS = [
  { id: SUBSCRIPTIONS_LIST_FOLLOWING, label: SUBSCRIPTIONS_PAGE_UI.TAB_FOLLOWING },
  { id: SUBSCRIPTIONS_LIST_FOLLOWERS, label: SUBSCRIPTIONS_PAGE_UI.TAB_FOLLOWERS },
] as const;

function resolveListMode(listParam: string | undefined) {
  return listParam === SUBSCRIPTIONS_LIST_FOLLOWERS
    ? SUBSCRIPTIONS_LIST_FOLLOWERS
    : SUBSCRIPTIONS_LIST_FOLLOWING;
}

export const SubscriptionsPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useSubscriptionsPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const isAuthorized = useIsAuthorized();
  const params = useLocalSearchParams<{ list?: string | string[] }>();
  const listParam = Array.isArray(params.list) ? params.list[0] : params.list;
  const listMode = resolveListMode(listParam);
  const isFollowers = listMode === SUBSCRIPTIONS_LIST_FOLLOWERS;

  const followingQuery = useMyFollowingQuery({
    enabled: isAuthorized && !isFollowers,
  });
  const followersQuery = useMyFollowersQuery({
    enabled: isAuthorized && isFollowers,
  });
  const activeQuery = isFollowers ? followersQuery : followingQuery;
  const users = activeQuery.data?.users ?? [];

  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const setListMode = useCallback(
    (
      next: typeof SUBSCRIPTIONS_LIST_FOLLOWING | typeof SUBSCRIPTIONS_LIST_FOLLOWERS,
    ) => {
      if (next === SUBSCRIPTIONS_LIST_FOLLOWERS) {
        router.replace({
          pathname: "/(tabs)/hub/subscriptions",
          params: { list: SUBSCRIPTIONS_LIST_FOLLOWERS },
        } as never);
        return;
      }
      router.replace("/(tabs)/hub/subscriptions" as never);
    },
    [router],
  );

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void activeQuery.refetch();
      }
    }, [isAuthorized, activeQuery.refetch]),
  );

  const handleOpenProfile = useCallback(
    (userId: string) => {
      router.push({ pathname: "/user/[id]", params: { id: userId } });
    },
    [router],
  );

  const heroCaption = isFollowers
    ? SUBSCRIPTIONS_PAGE_UI.HERO_CAPTION_FOLLOWERS
    : SUBSCRIPTIONS_PAGE_UI.HERO_CAPTION;
  const heroUnitForms = isFollowers
    ? SUBSCRIPTIONS_PAGE_UI.HERO_UNIT_FORMS_FOLLOWERS
    : SUBSCRIPTIONS_PAGE_UI.HERO_UNIT_FORMS;
  const heroInfo = isFollowers
    ? SUBSCRIPTIONS_PAGE_UI.HERO_INFO_FOLLOWERS
    : SUBSCRIPTIONS_PAGE_UI.HERO_INFO;

  const fetchFallback = isFollowers
    ? SUBSCRIPTIONS_PAGE_UI.FETCH_FOLLOWERS_FALLBACK
    : SUBSCRIPTIONS_PAGE_UI.FETCH_FALLBACK;

  const emptyMessage = isFollowers
    ? SUBSCRIPTIONS_PAGE_UI.EMPTY_FOLLOWERS
    : SUBSCRIPTIONS_PAGE_UI.EMPTY;

  const heroAccessibilityLabel = useMemo(
    () => `${heroCaption}: ${users.length} ${pluralizeRu(users.length, heroUnitForms)}`,
    [heroCaption, users.length, heroUnitForms],
  );

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_SUBSCRIPTIONS}
        onPress={() => setNavSheetVisible(true)}
      />

      <ModalSectionTabs
        tabs={SUBSCRIPTION_TABS}
        activeTabId={listMode}
        onTabChange={(tabId) =>
          setListMode(
            tabId as
              | typeof SUBSCRIPTIONS_LIST_FOLLOWING
              | typeof SUBSCRIPTIONS_LIST_FOLLOWERS,
          )
        }
        ariaLabel={SUBSCRIPTIONS_PAGE_UI.TABS_ARIA}
        variant="segment"
      />

      <View style={styles.heroCard} accessibilityLabel={heroAccessibilityLabel}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroCaption}>{heroCaption}</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroValue}>{users.length}</Text>
            <Text style={styles.heroUnit}>
              {pluralizeRu(users.length, heroUnitForms)}
            </Text>
          </View>
          <Text style={styles.heroInfo}>{heroInfo}</Text>
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

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="subscriptions"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/me")}
    />
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{SUBSCRIPTIONS_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginButtonText}>
            {SUBSCRIPTIONS_PAGE_UI.LOGIN_BUTTON}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (activeQuery.isPending) {
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
          <Text style={styles.state}>{SUBSCRIPTIONS_PAGE_UI.LOADING}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  if (activeQuery.isError) {
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
          <View style={styles.errorBlock} accessibilityRole="alert">
            <Text style={[styles.state, styles.stateError]}>
              {formatApiErrorMessage(activeQuery.error, fetchFallback)}
            </Text>
            <AppButton
              label={SUBSCRIPTIONS_PAGE_UI.RETRY}
              variant="secondary"
              onPress={() => void activeQuery.refetch()}
            />
          </View>
        </View>
        {navSheet}
      </>
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
            <Text style={styles.state}>{emptyMessage}</Text>
          </View>
        </View>
        {navSheet}
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
      {navSheet}
    </>
  );
};
