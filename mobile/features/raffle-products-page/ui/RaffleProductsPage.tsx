import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { buildFeaturedRaffleProgress } from "@/entities/raffle/lib/buildFeaturedRaffleProgressLabel";
import { canSellerEditRaffle } from "@/entities/raffle/lib/canSellerEditRaffle";
import { isRafflePrizeVideo } from "@/entities/raffle/lib/isRafflePrizeVideo";
import { RAFFLE_PRODUCTS_PAGE_LAYOUT as L } from "@/entities/raffle/lib/raffleProductsPageLayout";
import { resolveRafflePrizeVideoUrl } from "@/entities/raffle/lib/resolveRafflePrizeVideoUrl";
import { useFeaturedRafflesQuery } from "@/entities/raffle/model/useFeaturedRafflesQuery";
import { useMyRaffleMutations } from "@/entities/raffle/model/useMyRaffleMutations";
import { useRaffleByIdQuery } from "@/entities/raffle/model/useRaffleByIdQuery";
import { useRaffleProductsQuery } from "@/entities/raffle/model/useRaffleProductsQuery";
import { useRaffleStaffMutations } from "@/entities/raffle/model/useRaffleStaffMutations";
import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { FeaturedRaffleWinnerCard } from "@/entities/raffle/ui/FeaturedRaffleWinnerCard";
import { RaffleManageActions } from "@/entities/raffle/ui/RaffleManageActions";
import { RafflePrizeMedia, RafflePrizeMediaSoundToggle } from "@/entities/raffle/ui/RafflePrizeMedia";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { CatalogScrollAnimationProvider } from "@/features/catalog-grid/model/CatalogScrollAnimationContext";
import { CatalogAnimatedFlatList } from "@/features/catalog-grid/ui/CatalogAnimatedFlatList";
import { CatalogGridRowItem } from "@/features/catalog-grid/ui/CatalogGridRowItem";
import { CreateRaffleModal } from "@/features/create-raffle-page/ui/CreateRaffleModal";
import {
  API_CLIENT_UI,
  PRODUCT_REPORT_UI,
  RAFFLE_FEATURED_BANNER_UI,
  RAFFLE_MANAGE_UI,
  RAFFLE_PRODUCTS_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { useProductGridLayout } from "@/shared/model/useProductGridLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useRaffleProductsPageStyles } from "@/shared/theme/commerceScreenStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type ProgressUi = NonNullable<ReturnType<typeof buildFeaturedRaffleProgress>>;
type ManageProps = ComponentProps<typeof RaffleManageActions>;

const resolveRouteRaffleId = (id: string | string[] | undefined): string => {
  if (Array.isArray(id)) {
    return id[0] ?? "";
  }
  return id ?? "";
};

const RaffleProductsSummaryCopy = ({
  raffle,
  showManage,
  manage,
}: {
  raffle: RaffleFromApi | null;
  showManage: boolean;
  manage: ManageProps | null;
}) => {
  const styles = useRaffleProductsPageStyles();
  return (
    <View style={styles.copy}>
      <Text style={styles.eyebrow}>{RAFFLE_PRODUCTS_PAGE_UI.EYEBROW}</Text>
      <Text style={styles.title}>
        {raffle?.title?.trim() || RAFFLE_PRODUCTS_PAGE_UI.TITLE}
      </Text>
      {showManage && manage ? <RaffleManageActions {...manage} /> : null}
    </View>
  );
};

const RaffleProductsProgressBlock = ({
  progressUi,
  raffle,
  isWide,
}: {
  progressUi: ProgressUi;
  raffle: RaffleFromApi | null;
  isWide: boolean;
}) => {
  const styles = useRaffleProductsPageStyles();
  return (
    <View
      style={[styles.progress, isWide && styles.progressWide]}
      accessibilityLabel={progressUi.label}
    >
      <View
        style={[styles.progressBar, progressUi.isCompleted && styles.progressBarCompleted]}
      >
        <View
          style={[
            styles.progressFill,
            progressUi.isCompleted && styles.progressFillCompleted,
            { width: `${progressUi.percent}%` },
          ]}
        />
      </View>

      {progressUi.isCompleted && raffle?.winner?._id ? (
        <FeaturedRaffleWinnerCard winner={raffle.winner} />
      ) : null}

      <View style={[styles.stats, isWide && styles.statsWide]}>
        <View style={[styles.stat, styles.statAccent, isWide && styles.statWide]}>
          <Text style={styles.statLabel}>{RAFFLE_FEATURED_BANNER_UI.STAT_SOLD}</Text>
          <Text style={[styles.statValue, styles.statValueAccent]}>
            {RAFFLE_FEATURED_BANNER_UI.STAT_SOLD_VALUE(
              progressUi.progress,
              progressUi.target,
            )}
          </Text>
        </View>
        <View style={[styles.stat, isWide && styles.statWide]}>
          <Text style={styles.statLabel}>{RAFFLE_FEATURED_BANNER_UI.STAT_PARTICIPANTS}</Text>
          <Text style={styles.statValue}>{progressUi.participantsCount}</Text>
        </View>
        <View style={[styles.stat, isWide && styles.statWide]}>
          <Text style={styles.statLabel}>{RAFFLE_FEATURED_BANNER_UI.STAT_GOAL}</Text>
          <Text style={styles.statValue}>{progressUi.target}</Text>
        </View>
      </View>
    </View>
  );
};

const RaffleProductsSwipeDots = ({
  raffles,
  activeIndex,
  onSelect,
}: {
  raffles: RaffleFromApi[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) => {
  const styles = useRaffleProductsPageStyles();
  return (
    <View style={styles.swipeDots} accessibilityRole="tablist">
      {raffles.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={String(item._id)}
            style={[styles.swipeDot, isActive && styles.swipeDotActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onSelect(index)}
          />
        );
      })}
    </View>
  );
};

export const RaffleProductsPage = () => {
  const router = useRouter();
  const styles = useRaffleProductsPageStyles();
  const productGrid = useProductGridLayout();
  const { width: windowWidth } = useWindowDimensions();
  const { centeredContentStyle, contentPaddingBottom, contentPaddingHorizontal } =
    useScreenLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeRaffleId = resolveRouteRaffleId(id);

  const [activeRaffleId, setActiveRaffleId] = useState(routeRaffleId);
  const [activeSwipeIndex, setActiveSwipeIndex] = useState(0);
  const [mediaWidth, setMediaWidth] = useState(0);
  const [editingRaffle, setEditingRaffle] = useState<RaffleFromApi | null>(null);
  const [editUseStaffApi, setEditUseStaffApi] = useState(false);
  const [isRaffleMediaMuted, setIsRaffleMediaMuted] = useState(true);

  const swipeListRef = useRef<FlatList<RaffleFromApi>>(null);
  const activeRaffleIdRef = useRef(activeRaffleId);

  const sessionQuery = useAuthSessionQuery();
  const { canModerate } = useUserAccess();
  const { pauseMyMutation, deleteMyMutation } = useMyRaffleMutations();
  const { deleteStaffMutation } = useRaffleStaffMutations();

  const currentUserId =
    sessionQuery.data?.user?._id != null ? String(sessionQuery.data.user._id) : null;
  const isWide = windowWidth >= L.wideBreakpoint;

  useEffect(() => {
    setActiveRaffleId(routeRaffleId);
  }, [routeRaffleId]);

  useEffect(() => {
    setIsRaffleMediaMuted(true);
  }, [activeRaffleId]);

  useEffect(() => {
    activeRaffleIdRef.current = activeRaffleId;
  }, [activeRaffleId]);

  const featuredQuery = useFeaturedRafflesQuery({ enabled: true });
  const featuredRaffles = featuredQuery.data ?? [];
  const carouselRaffles = featuredRaffles.length > 0 ? featuredRaffles : [];
  const hasCarousel = carouselRaffles.length > 1;

  const raffleQuery = useRaffleByIdQuery({
    raffleId: activeRaffleId,
    enabled: Boolean(activeRaffleId),
  });
  const productsQuery = useRaffleProductsQuery({
    raffleId: activeRaffleId,
    enabled: Boolean(activeRaffleId),
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

  const isOwner =
    currentUserId != null && raffle?.sellerId != null
      ? String(raffle.sellerId) === String(currentUserId)
      : false;
  const canManage = Boolean(raffle) && (isOwner || canModerate);
  const actionsBusy =
    deleteMyMutation.isPending ||
    deleteStaffMutation.isPending ||
    pauseMyMutation.isPending;

  const handleMediaLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setMediaWidth(nextWidth);
    }
  }, []);

  const syncCarouselToActive = useCallback(
    (raffleId: string) => {
      if (!hasCarousel || mediaWidth <= 0) {
        return;
      }
      const index = carouselRaffles.findIndex((item) => String(item._id) === String(raffleId));
      const safeIndex = index < 0 ? 0 : index;
      setActiveSwipeIndex(safeIndex);
      if (index < 0) {
        return;
      }
      swipeListRef.current?.scrollToOffset({
        offset: safeIndex * mediaWidth,
        animated: false,
      });
    },
    [carouselRaffles, hasCarousel, mediaWidth],
  );

  useEffect(() => {
    syncCarouselToActive(activeRaffleId);
  }, [activeRaffleId, syncCarouselToActive]);

  const handleSwipeScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!hasCarousel || mediaWidth <= 0) {
        return;
      }
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / mediaWidth);
      const clamped = Math.max(0, Math.min(nextIndex, carouselRaffles.length - 1));
      setActiveSwipeIndex(clamped);
      const next = carouselRaffles[clamped];
      const nextId = next?._id ? String(next._id) : null;
      if (!nextId || nextId === String(activeRaffleIdRef.current)) {
        return;
      }
      setActiveRaffleId(nextId);
    },
    [carouselRaffles, hasCarousel, mediaWidth],
  );

  const handleSwipeMomentumEnd = handleSwipeScrollEnd;

  const handleSelectSwipeIndex = useCallback(
    (index: number) => {
      if (mediaWidth > 0) {
        swipeListRef.current?.scrollToOffset({
          offset: index * mediaWidth,
          animated: true,
        });
      }
      setActiveSwipeIndex(index);
      const next = carouselRaffles[index];
      if (next?._id) {
        setActiveRaffleId(String(next._id));
      }
    },
    [carouselRaffles, mediaWidth],
  );

  const handleRefresh = useCallback(() => {
    void raffleQuery.refetch();
    void productsQuery.refetch();
    void featuredQuery.refetch();
  }, [featuredQuery, productsQuery, raffleQuery]);

  const handleEditRaffle = useCallback(() => {
    if (!raffle) {
      return;
    }
    setEditUseStaffApi(canModerate && !isOwner);
    setEditingRaffle(raffle);
  }, [canModerate, isOwner, raffle]);

  const handleDeleteRaffle = useCallback(() => {
    if (!raffle?._id) {
      return;
    }
    const confirmMessage = isOwner
      ? RAFFLE_MANAGE_UI.DELETE_CONFIRM_OWNER
      : RAFFLE_MANAGE_UI.DELETE_CONFIRM_STAFF;
    Alert.alert(RAFFLE_MANAGE_UI.DELETE, confirmMessage, [
      { text: PRODUCT_REPORT_UI.CANCEL, style: "cancel" },
      {
        text: RAFFLE_MANAGE_UI.DELETE,
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              if (isOwner) {
                await deleteMyMutation.mutateAsync(String(raffle._id));
              } else {
                await deleteStaffMutation.mutateAsync(String(raffle._id));
              }
              router.back();
            } catch (error) {
              Alert.alert(
                RAFFLE_MANAGE_UI.DELETE,
                formatApiErrorMessage(error, API_CLIENT_UI.DELETE_RAFFLE_FALLBACK),
              );
            }
          })();
        },
      },
    ]);
  }, [deleteMyMutation, deleteStaffMutation, isOwner, raffle, router]);

  const handlePauseRaffle = useCallback(() => {
    if (!raffle?._id) {
      return;
    }
    void (async () => {
      try {
        await pauseMyMutation.mutateAsync(String(raffle._id));
        await handleRefresh();
      } catch (error) {
        Alert.alert(
          RAFFLE_MANAGE_UI.PAUSE,
          formatApiErrorMessage(error, API_CLIENT_UI.PAUSE_RAFFLE_FALLBACK),
        );
      }
    })();
  }, [handleRefresh, pauseMyMutation, raffle]);

  const manageProps = useMemo(() => {
    if (!canManage || !raffle) {
      return null;
    }
    return {
      showEdit: isOwner ? canSellerEditRaffle(raffle) : canModerate,
      showDelete: true,
      showPause: isOwner && raffle.status === "active",
      onEdit: handleEditRaffle,
      onDelete: handleDeleteRaffle,
      onPause: handlePauseRaffle,
      busy: actionsBusy,
    };
  }, [
    actionsBusy,
    canManage,
    canModerate,
    handleDeleteRaffle,
    handleEditRaffle,
    handlePauseRaffle,
    isOwner,
    raffle,
  ]);

  const description =
    typeof raffle?.description === "string" ? raffle.description.trim() : "";
  const showRaffleVideoSoundToggle = useMemo(() => {
    if (!raffle || !isRafflePrizeVideo(raffle)) {
      return false;
    }
    return Boolean(resolveRafflePrizeVideoUrl(raffle));
  }, [raffle]);

  const listHeader = (
    <>
      <View style={[styles.summaryLayout, isWide && styles.summaryLayoutWide]}>
        <View style={styles.hero}>
          <View
            style={[
              styles.media,
              isWide && styles.mediaWide,
              { height: isWide ? L.mediaHeightWide : L.mediaHeight },
            ]}
            onLayout={handleMediaLayout}
          >
            {raffle ? (
              <View style={styles.mediaForeground} pointerEvents="none">
                <RafflePrizeMedia
                  raffle={raffle}
                  isMuted={isRaffleMediaMuted}
                  onMutedChange={setIsRaffleMediaMuted}
                  isVideoActive
                  contentFit="contain"
                  blurBackground
                />
              </View>
            ) : null}

            {hasCarousel && mediaWidth > 0 ? (
              <FlatList
                ref={swipeListRef}
                style={styles.swipeOverlay}
                data={carouselRaffles}
                keyExtractor={(item) => String(item._id)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleSwipeMomentumEnd}
                onScrollEndDrag={handleSwipeScrollEnd}
                getItemLayout={(_, index) => ({
                  length: mediaWidth,
                  offset: mediaWidth * index,
                  index,
                })}
                renderItem={() => (
                  <View
                    style={{
                      width: mediaWidth,
                      height: isWide ? L.mediaHeightWide : L.mediaHeight,
                    }}
                  />
                )}
                {...nestedHorizontalScrollProps}
              />
            ) : null}

            {showRaffleVideoSoundToggle ? (
              <RafflePrizeMediaSoundToggle
                isMuted={isRaffleMediaMuted}
                onToggle={setIsRaffleMediaMuted}
                style={styles.swipeSoundToggle}
              />
            ) : null}

            {hasCarousel && mediaWidth > 0 ? (
              <RaffleProductsSwipeDots
                raffles={carouselRaffles}
                activeIndex={activeSwipeIndex}
                onSelect={handleSelectSwipeIndex}
              />
            ) : null}
          </View>

          {!isWide ? (
            <View style={styles.headerCard}>
              <RaffleProductsSummaryCopy
                raffle={raffle}
                showManage={Boolean(manageProps)}
                manage={manageProps}
              />
            </View>
          ) : null}
        </View>

        {progressUi ? (
          <View style={[styles.summarySide, isWide && styles.summarySideWide]}>
            <RaffleProductsProgressBlock
              progressUi={progressUi}
              raffle={raffle}
              isWide={isWide}
            />
            {isWide ? (
              <View style={[styles.headerCard, styles.headerCardWide]}>
                <RaffleProductsSummaryCopy
                  raffle={raffle}
                  showManage={false}
                  manage={null}
                />
              </View>
            ) : null}
            {isWide && description ? (
              <Text style={[styles.description, styles.descriptionDesktop]}>
                {description}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {!isWide && description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      <View style={styles.productsBlock}>
        {isWide && manageProps ? (
          <View style={styles.manageDesktop}>
            <RaffleManageActions {...manageProps} />
          </View>
        ) : null}
      </View>
    </>
  );

  if (!routeRaffleId) {
    return (
      <ScreenErrorState
        message={RAFFLE_PRODUCTS_PAGE_UI.FETCH_FALLBACK}
        onRetry={() => router.back()}
      />
    );
  }

  if (isLoading && !raffle) {
    return <ScreenLoadingState message={RAFFLE_PRODUCTS_PAGE_UI.LOADING} />;
  }

  if (queryError && !raffle) {
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
          key={`${productGrid.listKey}-${activeRaffleId}`}
          style={styles.flex}
          data={catalogGridRows}
          keyExtractor={(item) => item.key}
          numColumns={1}
          contentContainerStyle={[
            styles.list,
            styles.listContent,
            {
              paddingHorizontal: contentPaddingHorizontal,
              paddingBottom: contentPaddingBottom,
            },
          ]}
          refreshControl={
            <ThemedRefreshControl
              refreshing={
                raffleQuery.isRefetching ||
                productsQuery.isRefetching ||
                featuredQuery.isRefetching
              }
              onRefresh={handleRefresh}
            />
          }
          ListHeaderComponent={listHeader}
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
            <View style={index > 0 ? { marginTop: productGrid.gap } : undefined}>
              <CatalogGridRowItem
                row={item}
                columns={productGrid.columns}
                gap={productGrid.gap}
                contentWidth={productGrid.contentWidth}
                tileWidth={productGrid.tileWidth}
                rowIndex={index}
                highlightRaffleProduct
              />
            </View>
          )}
        />
      </View>

      <CreateRaffleModal
        visible={editingRaffle != null}
        raffleToEdit={editingRaffle}
        useStaffApi={editUseStaffApi}
        onClose={() => setEditingRaffle(null)}
        onSuccess={handleRefresh}
      />
    </CatalogScrollAnimationProvider>
  );
};
