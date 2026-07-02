import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { ModerationProduct } from "@/entities/product/api/productModerationApi";
import {
  usePendingModerationProductsQuery,
  useProductModerationMutations,
} from "@/entities/product/model/useProductModerationMutations";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { resolveCatalogGridListContentStyle } from "@/features/catalog-grid/lib/catalogGridLayout";
import { ProductModerationGridRowItem } from "@/features/product-moderation-page/ui/ProductModerationGridRowItem";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { API_CLIENT_UI, MY_PROFILE_PAGE_UI, PRODUCT_MODERATION_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProductGridLayout, type ProductGridLayoutResolvers } from "@/shared/model/useProductGridLayout";
import { resolveProductGridGap } from "@/shared/lib/screenBreakpoints";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { moderationQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import { useProductModerationPageStyles } from "@/shared/theme/productModerationPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

const MODERATION_QUEUE_LIMIT = 100;

const moderationQueueGridResolvers: ProductGridLayoutResolvers = {
  resolveColumns: () => 1,
  resolveGap: resolveProductGridGap,
};

export const ProductModerationPage = () => {
  const router = useRouter();
  const styles = useProductModerationPageStyles();
  const productGrid = useProductGridLayout(undefined, moderationQueueGridResolvers);
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const queueQuery = usePendingModerationProductsQuery();
  const { approveMutation, rejectMutation } = useProductModerationMutations();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [rejectComments, setRejectComments] = useState<Record<string, string>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const products = queueQuery.data ?? [];
  const catalogGridRows = useMemo(
    () => buildCatalogGridRows(products, productGrid.columns),
    [productGrid.columns, products],
  );

  useFocusEffect(
    useCallback(() => {
      void queueQuery.refetch();
    }, [queueQuery.refetch]),
  );

  const invalidateModerationBadges = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...staffBadgeQueryKeys.all, "moderation"],
    });
  }, [queryClient]);

  const removeFromQueue = useCallback(
    (productId: string) => {
      queryClient.setQueryData(
        moderationQueryKeys.pending({ limit: MODERATION_QUEUE_LIMIT }),
        (old: ModerationProduct[] | undefined) => {
          if (!Array.isArray(old)) {
            return old;
          }
          return old.filter((product) => String(product._id) !== productId);
        },
      );
      setRejectComments((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      setCardErrors((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    },
    [queryClient],
  );

  const handleQueueChanged = useCallback(async () => {
    await invalidateModerationBadges();
  }, [invalidateModerationBadges]);

  const handleApprove = async (productId: string) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      setCardErrors((prev) => ({ ...prev, [productId]: "" }));
      await approveMutation.mutateAsync(productId);
      removeFromQueue(productId);
      await handleQueueChanged();
    } catch (error) {
      const message = formatApiErrorMessage(
        error,
        API_CLIENT_UI.APPROVE_PRODUCT_MODERATION_FALLBACK,
      );
      setActionError(message);
      setCardErrors((prev) => ({ ...prev, [productId]: message }));
    } finally {
      setPendingProductId(null);
    }
  };

  const handleReject = async (productId: string) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      setCardErrors((prev) => ({ ...prev, [productId]: "" }));
      const comment = rejectComments[productId] ?? "";
      await rejectMutation.mutateAsync({ productId, comment });
      removeFromQueue(productId);
      await handleQueueChanged();
    } catch (error) {
      const message = formatApiErrorMessage(
        error,
        API_CLIENT_UI.REJECT_PRODUCT_MODERATION_FALLBACK,
      );
      setActionError(message);
      setCardErrors((prev) => ({ ...prev, [productId]: message }));
    } finally {
      setPendingProductId(null);
    }
  };

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_PRODUCT_MODERATION}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="product-moderation"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
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

  if (queueQuery.isPending && products.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <Text style={styles.state}>{PRODUCT_MODERATION_PAGE_UI.LOADING}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  if (queueQuery.isError && products.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <ScreenErrorState
            message={formatApiErrorMessage(
              queueQuery.error,
              API_CLIENT_UI.FETCH_MODERATION_QUEUE_FALLBACK,
            )}
            onRetry={() => queueQuery.refetch()}
          />
        </View>
        {navSheet}
      </>
    );
  }

  if (products.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          {listHeader}
          <Text style={styles.empty}>{PRODUCT_MODERATION_PAGE_UI.EMPTY}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  return (
    <>
      <FlatList
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[
          styles.list,
          resolveCatalogGridListContentStyle(productGrid.gap),
          { paddingBottom: contentPaddingBottom },
        ]}
        data={catalogGridRows}
        key={productGrid.listKey}
        numColumns={1}
        keyExtractor={(item) => item.key}
        accessibilityLabel={PRODUCT_MODERATION_PAGE_UI.PRODUCTS_LIST_ARIA}
        ListHeaderComponent={listHeader}
        refreshControl={
          <ThemedRefreshControl
            refreshing={queueQuery.isFetching}
            onRefresh={async () => {
              await queueQuery.refetch();
              await invalidateModerationBadges();
            }}
          />
        }
        renderItem={({ item }) => (
          <ProductModerationGridRowItem
            row={item}
            columns={productGrid.columns}
            gap={productGrid.gap}
            tileWidth={productGrid.tileWidth}
            rejectComments={rejectComments}
            cardErrors={cardErrors}
            pendingProductId={pendingProductId}
            onRejectCommentChange={(productId, value) =>
              setRejectComments((prev) => ({ ...prev, [productId]: value }))
            }
            onApprove={(productId) => {
              void handleApprove(productId);
            }}
            onReject={(productId) => {
              void handleReject(productId);
            }}
          />
        )}
      />

      {navSheet}
    </>
  );
};
