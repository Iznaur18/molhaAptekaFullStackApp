import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { buildFeaturedRaffleProgress } from "@/entities/raffle/lib/buildFeaturedRaffleProgressLabel";
import { useRaffleByIdQuery } from "@/entities/raffle/model/useRaffleByIdQuery";
import { useRaffleProductsQuery } from "@/entities/raffle/model/useRaffleProductsQuery";
import { RafflePrizeMedia } from "@/entities/raffle/ui/RafflePrizeMedia";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { resolveCatalogGridListContentStyle } from "@/features/catalog-grid/lib/catalogGridLayout";
import { CatalogScrollAnimationProvider } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";
import { CatalogAnimatedFlatList } from "@/features/catalog-grid/ui/CatalogAnimatedFlatList";
import { CatalogGridRowItem } from "@/features/catalog-grid/ui/CatalogGridRowItem";
import {
  RAFFLE_FEATURED_BANNER_UI,
  RAFFLE_PRODUCTS_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useRaffleProductsPageStyles } from "@/shared/theme/commerceScreenStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const RaffleProductsPage = () => {
  const router = useRouter();
  const styles = useRaffleProductsPageStyles();
  const productGrid = useProductGridLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const raffleId = Array.isArray(id) ? id[0] : id ?? "";

  const raffleQuery = useRaffleByIdQuery({
    raffleId,
    enabled: Boolean(raffleId),
  });
  const productsQuery = useRaffleProductsQuery({
    raffleId,
    enabled: Boolean(raffleId),
  });

  const raffle = raffleQuery.data ?? null;
  const products = productsQuery.data?.products ?? [];
  const isLoading = raffleQuery.isPending || productsQuery.isPending;
  const queryError = raffleQuery.error ?? productsQuery.error;
  const progressUi = useMemo(
    () => (raffle ? buildFeaturedRaffleProgress(raffle) : null),
    [raffle],
  );

  const catalogGridRows = useMemo(
    () =>
      buildCatalogGridRows(products, productGrid.columns, {
        showFullWidthTier3Banners: false,
      }),
    [products, productGrid.columns],
  );

  const handleRefresh = useCallback(() => {
    void raffleQuery.refetch();
    void productsQuery.refetch();
  }, [productsQuery, raffleQuery]);

  if (!raffleId) {
    return (
      <ScreenErrorState
        message={RAFFLE_PRODUCTS_PAGE_UI.FETCH_FALLBACK}
        onRetry={() => router.back()}
      />
    );
  }

  if (isLoading) {
    return <ScreenLoadingState message={RAFFLE_PRODUCTS_PAGE_UI.LOADING} />;
  }

  if (queryError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          queryError,
          RAFFLE_PRODUCTS_PAGE_UI.FETCH_FALLBACK,
        )}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <CatalogScrollAnimationProvider>
      <View style={[styles.flex, centeredContentStyle]}>
        <CatalogAnimatedFlatList
          key={productGrid.listKey}
          style={styles.flex}
          data={catalogGridRows}
          keyExtractor={(item) => item.key}
          numColumns={1}
          contentContainerStyle={[
            styles.list,
            resolveCatalogGridListContentStyle(productGrid.gap),
            { paddingBottom: contentPaddingBottom },
          ]}
          refreshControl={
            <ThemedRefreshControl
              refreshing={raffleQuery.isRefetching || productsQuery.isRefetching}
              onRefresh={handleRefresh}
            />
          }
          ListHeaderComponent={
            <View style={styles.pageHeader}>
              <View style={styles.headerCard}>
                {raffle ? (
                  <View
                    style={[
                      styles.media,
                      {
                        width: productGrid.tileWidth,
                        height: productGrid.tileWidth,
                        borderRadius: 14,
                      },
                    ]}
                  >
                    <RafflePrizeMedia
                      raffle={raffle}
                      showSoundToggle={false}
                      isVideoActive={false}
                    />
                  </View>
                ) : null}
                <View style={styles.copy}>
                  <Text style={styles.eyebrow}>{RAFFLE_PRODUCTS_PAGE_UI.EYEBROW}</Text>
                  <Text style={styles.title}>
                    {raffle?.title?.trim() || RAFFLE_PRODUCTS_PAGE_UI.TITLE}
                  </Text>
                </View>
              </View>

              {typeof raffle?.description === "string" &&
              raffle.description.trim() ? (
                <Text style={styles.description}>{raffle.description.trim()}</Text>
              ) : null}

              {progressUi ? (
                <View
                  style={styles.progress}
                  accessibilityLabel={progressUi.label}
                >
                  <View
                    style={[
                      styles.progressBar,
                      progressUi.isCompleted && styles.progressBarCompleted,
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        progressUi.isCompleted && styles.progressFillCompleted,
                        { width: `${progressUi.percent}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.stats}>
                    <View style={[styles.stat, styles.statAccent]}>
                      <Text style={styles.statLabel}>
                        {RAFFLE_FEATURED_BANNER_UI.STAT_SOLD}
                      </Text>
                      <Text style={[styles.statValue, styles.statValueAccent]}>
                        {RAFFLE_FEATURED_BANNER_UI.STAT_SOLD_VALUE(
                          progressUi.progress,
                          progressUi.target,
                        )}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>
                        {RAFFLE_FEATURED_BANNER_UI.STAT_PARTICIPANTS}
                      </Text>
                      <Text style={styles.statValue}>
                        {progressUi.participantsCount}
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>
                        {RAFFLE_FEATURED_BANNER_UI.STAT_GOAL}
                      </Text>
                      <Text style={styles.statValue}>{progressUi.target}</Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{RAFFLE_PRODUCTS_PAGE_UI.EMPTY}</Text>
            </View>
          }
          ListFooterComponent={
            productsQuery.isFetching && !productsQuery.isRefetching ? (
              <ActivityIndicator style={styles.footer} />
            ) : null
          }
          renderItem={({ item, index }) => (
            <CatalogGridRowItem
              row={item}
              columns={productGrid.columns}
              gap={productGrid.gap}
              tileWidth={productGrid.tileWidth}
              rowIndex={index}
              highlightRaffleProduct
            />
          )}
        />
      </View>
    </CatalogScrollAnimationProvider>
  );
};
