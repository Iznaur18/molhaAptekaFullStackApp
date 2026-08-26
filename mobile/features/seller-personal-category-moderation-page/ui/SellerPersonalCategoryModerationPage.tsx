import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import {
  useManagedSellerPersonalCategoryCampaignsQuery,
  usePendingSellerPersonalCategoryCampaignsQuery,
} from "@/entities/seller-personal-category/model/useSellerPersonalCategoryModerationMutations";
import { SellerPersonalCategoryCampaignModerationSection } from "@/features/intro-ad-moderation-page/ui/SellerPersonalCategoryCampaignModerationSection";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import {
  MY_PROFILE_PAGE_UI,
  SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useSellerPersonalCategoryModerationPageStyles } from "@/shared/theme/sellerPersonalCategoryModerationPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const SellerPersonalCategoryModerationPage = () => {
  const router = useRouter();
  const styles = useSellerPersonalCategoryModerationPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queueQuery = usePendingSellerPersonalCategoryCampaignsQuery();
  const managedQuery = useManagedSellerPersonalCategoryCampaignsQuery();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [actionError, setActionError] = useState("");

  const pendingCampaigns = queueQuery.data ?? [];
  const managedCampaigns = managedQuery.data ?? [];
  const hasContent = pendingCampaigns.length > 0 || managedCampaigns.length > 0;

  useFocusEffect(
    useCallback(() => {
      void queueQuery.refetch();
      void managedQuery.refetch();
    }, [managedQuery.refetch, queueQuery.refetch]),
  );

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_SELLER_PERSONAL_CATEGORY_MODERATION}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="seller-personal-category-moderation"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/me")}
    />
  );

  const listHeader = (
    <View style={styles.header}>
      {sectionToggle}
      {actionError ? (
        <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
          {actionError}
        </Text>
      ) : null}
    </View>
  );

  if (queueQuery.isPending && managedQuery.isPending && !hasContent) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <Text style={styles.state}>{SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.LOADING}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  if (queueQuery.isError && managedQuery.isError && !hasContent) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <ScreenErrorState
            message={formatApiErrorMessage(
              queueQuery.error ?? managedQuery.error,
              SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK,
            )}
            onRetry={() => {
              void queueQuery.refetch();
              void managedQuery.refetch();
            }}
          />
        </View>
        {navSheet}
      </>
    );
  }

  if (!hasContent) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          {listHeader}
          <Text style={styles.empty}>{SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.EMPTY}</Text>
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
        accessibilityLabel={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.TITLE}
        refreshControl={
          <ThemedRefreshControl
            refreshing={queueQuery.isFetching || managedQuery.isFetching}
            onRefresh={async () => {
              await queueQuery.refetch();
              await managedQuery.refetch();
            }}
          />
        }
      >
        {listHeader}

        <SellerPersonalCategoryCampaignModerationSection
          onActionError={setActionError}
        />
      </ScrollView>

      {navSheet}
    </>
  );
};
