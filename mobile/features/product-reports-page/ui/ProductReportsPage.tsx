import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { ProductReportGroupCard } from "@/entities/product-report/ui/ProductReportGroupCard";
import { usePendingProductReportsQuery } from "@/entities/product-report/model/useProductReportStaffMutations";
import { usePendingUserStoryReportsQuery } from "@/entities/user-story/model/useUserStoryReportStaffMutations";
import { UserStoryReportGroupCard } from "@/entities/user-story/ui/UserStoryReportGroupCard";
import { ProductReportsToolbar } from "@/features/product-reports-page/ui/ProductReportsToolbar";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { staffBadgeQueryKeys } from "@/shared/api";
import { API_CLIENT_UI, MY_PROFILE_PAGE_UI, PRODUCT_REPORTS_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useProductReportsPageStyles } from "@/shared/theme/productReportsPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

type SectionFilter = "" | "products" | "stories";

export const ProductReportsPage = () => {
  const router = useRouter();
  const styles = useProductReportsPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const productReportsQuery = usePendingProductReportsQuery();
  const storyReportsQuery = usePendingUserStoryReportsQuery();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("");

  const productGroups = productReportsQuery.data?.groups ?? [];
  const storyGroups = storyReportsQuery.data?.groups ?? [];
  const totalGroupsCount = productGroups.length + storyGroups.length;
  const visibleProductGroups = sectionFilter === "stories" ? [] : productGroups;
  const visibleStoryGroups = sectionFilter === "products" ? [] : storyGroups;
  const visibleGroupsCount = visibleProductGroups.length + visibleStoryGroups.length;
  const isLoading = productReportsQuery.isPending || storyReportsQuery.isPending;
  const queryError = productReportsQuery.error ?? storyReportsQuery.error;
  const isEmpty = productGroups.length === 0 && storyGroups.length === 0;

  useFocusEffect(
    useCallback(() => {
      void productReportsQuery.refetch();
      void storyReportsQuery.refetch();
    }, [productReportsQuery.refetch, storyReportsQuery.refetch]),
  );

  const reloadQueue = useCallback(async () => {
    await Promise.all([
      productReportsQuery.refetch(),
      storyReportsQuery.refetch(),
      queryClient.invalidateQueries({
        queryKey: [...staffBadgeQueryKeys.all, "product-reports"],
      }),
    ]);
  }, [productReportsQuery, storyReportsQuery, queryClient]);

  const emptyMessage = useMemo(() => {
    if (totalGroupsCount === 0) {
      return PRODUCT_REPORTS_PAGE_UI.EMPTY;
    }
    if (sectionFilter) {
      return PRODUCT_REPORTS_PAGE_UI.EMPTY_BY_FILTER;
    }
    return PRODUCT_REPORTS_PAGE_UI.EMPTY;
  }, [sectionFilter, totalGroupsCount]);

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_PRODUCT_REPORTS}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="product-reports"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

  const toolbar = (
    <ProductReportsToolbar
      sectionFilter={sectionFilter}
      onSectionFilterChange={setSectionFilter}
      groupsCount={visibleGroupsCount}
    />
  );

  if (isLoading && isEmpty) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <Text style={styles.state}>{PRODUCT_REPORTS_PAGE_UI.LOADING}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  if (queryError && isEmpty) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <ScreenErrorState
            message={formatApiErrorMessage(
              queryError,
              API_CLIENT_UI.FETCH_PRODUCT_REPORTS_FALLBACK,
            )}
            onRetry={() => reloadQueue()}
          />
        </View>
        {navSheet}
      </>
    );
  }

  if (isEmpty) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>
            {sectionToggle}
            {toolbar}
          </View>
          <Text style={styles.empty}>{emptyMessage}</Text>
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
        accessibilityLabel={PRODUCT_REPORTS_PAGE_UI.TITLE}
        refreshControl={
          <ThemedRefreshControl
            refreshing={productReportsQuery.isFetching || storyReportsQuery.isFetching}
            onRefresh={() => reloadQueue()}
          />
        }
      >
        <View style={styles.header}>
          {sectionToggle}
          {toolbar}
        </View>

        {queryError ? (
          <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
            {formatApiErrorMessage(queryError, API_CLIENT_UI.FETCH_PRODUCT_REPORTS_FALLBACK)}
          </Text>
        ) : null}

        {visibleGroupsCount === 0 ? (
          <Text style={styles.empty}>{emptyMessage}</Text>
        ) : (
          <>
            {visibleProductGroups.length > 0 ? (
              <View
                style={styles.section}
                accessibilityLabel={PRODUCT_REPORTS_PAGE_UI.SECTION_PRODUCTS}
              >
                <Text style={styles.sectionTitle}>{PRODUCT_REPORTS_PAGE_UI.SECTION_PRODUCTS}</Text>
                <View style={styles.list}>
                  {visibleProductGroups.map((group) => (
                    <ProductReportGroupCard
                      key={String(group.product._id)}
                      group={group}
                      onResolved={() => {
                        void reloadQueue();
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {visibleStoryGroups.length > 0 ? (
              <View
                style={styles.section}
                accessibilityLabel={PRODUCT_REPORTS_PAGE_UI.SECTION_STORIES}
              >
                <Text style={styles.sectionTitle}>{PRODUCT_REPORTS_PAGE_UI.SECTION_STORIES}</Text>
                <View style={styles.list}>
                  {visibleStoryGroups.map((group) => (
                    <UserStoryReportGroupCard
                      key={String(group.story._id)}
                      group={group}
                      onResolved={() => {
                        void reloadQueue();
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      {navSheet}
    </>
  );
};
