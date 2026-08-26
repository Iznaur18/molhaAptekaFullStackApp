import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import type { ModerationProduct } from "@/entities/product/api/productModerationApi";
import { useMyProductMutations } from "@/entities/product/model/useMyProductMutations";
import {
  usePendingModerationProductsQuery,
  useProductModerationMutations,
} from "@/entities/product/model/useProductModerationMutations";
import { buildCatalogGridRows } from "@/features/catalog-grid/lib/buildCatalogGridRows";
import { resolveCatalogGridListContentStyle } from "@/features/catalog-grid/lib/catalogGridLayout";
import { ProductModerationGridRowItem } from "@/features/product-moderation-page/ui/ProductModerationGridRowItem";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountList } from "@/features/profile-tab/ui/ProfileAccountList";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { API_CLIENT_UI, MY_PROFILE_PAGE_UI, PRODUCT_MODERATION_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { resolveProfileHubMainReservedWidth } from "@/shared/lib/guestProfileLayout";
import { useProductGridLayout, type ProductGridLayoutResolvers } from "@/shared/model/useProductGridLayout";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { moderationQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import { useProductModerationPageStyles } from "@/shared/theme/productModerationPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

const MODERATION_QUEUE_LIMIT = 100;
/** Паритет my-products list gap (0.75rem). */
const MODERATION_QUEUE_LIST_GAP = 12;

const moderationQueueGridResolvers: ProductGridLayoutResolvers = {
  resolveColumns: () => 1,
  resolveGap: () => MODERATION_QUEUE_LIST_GAP,
};

export const ProductModerationPage = () => {
  const router = useRouter();
  const styles = useProductModerationPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { outerScrollOwns } = useProfileAccountNestedListScroll();
  const productGrid = useProductGridLayout(undefined, moderationQueueGridResolvers, {
    reservedLeadingWidth: resolveProfileHubMainReservedWidth(isDrawerLayout),
  });
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const { isAdmin } = useUserAccess();
  const queueQuery = usePendingModerationProductsQuery();
  const { approveMutation, rejectMutation } = useProductModerationMutations();
  const { deleteMutation } = useMyProductMutations();
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

  const handleDelete = async (productId: string) => {
    try {
      setPendingProductId(productId);
      setActionError("");
      setCardErrors((prev) => ({ ...prev, [productId]: "" }));
      await deleteMutation.mutateAsync(productId);
      removeFromQueue(productId);
      await handleQueueChanged();
    } catch (error) {
      const message = formatApiErrorMessage(error, API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK);
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

  if (queueQuery.isPending && products.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.idleShell]}>
          <View style={styles.header}>{sectionToggle}</View>
          <View style={styles.idleMessageWrap}>
            <Text style={styles.state}>{PRODUCT_MODERATION_PAGE_UI.LOADING}</Text>
          </View>
        </View>
        {navSheet}
      </>
    );
  }

  if (queueQuery.isError && products.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.idleShell]}>
          <View style={styles.header}>{sectionToggle}</View>
          <View style={styles.idleMessageWrap}>
            <ScreenErrorState
              message={formatApiErrorMessage(
                queueQuery.error,
                API_CLIENT_UI.FETCH_MODERATION_QUEUE_FALLBACK,
              )}
              onRetry={() => queueQuery.refetch()}
            />
          </View>
        </View>
        {navSheet}
      </>
    );
  }

  if (products.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.idleShell]}>
          {listHeader}
          <View style={styles.idleMessageWrap}>
            <Text style={styles.empty}>{PRODUCT_MODERATION_PAGE_UI.EMPTY}</Text>
          </View>
        </View>
        {navSheet}
      </>
    );
  }

  return (
    <>
      <ProfileAccountList
        key={productGrid.listKey}
        data={catalogGridRows}
        keyExtractor={(item) => item.key}
        style={[
          styles.container,
          isDrawerLayout ? centeredContentStyle : null,
        ]}
        contentContainerStyle={[
          styles.list,
          !isDrawerLayout ? styles.listInAccountShell : null,
          resolveCatalogGridListContentStyle(productGrid.gap),
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
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
        renderItem={({ item, index }) => (
          <ProductModerationGridRowItem
            row={item}
            columns={productGrid.columns}
            gap={productGrid.gap}
            contentWidth={productGrid.contentWidth}
            tileWidth={productGrid.tileWidth}
            rowIndex={index}
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
            canDelete={isAdmin}
            onDelete={
              isAdmin
                ? (productId) => {
                    void handleDelete(productId);
                  }
                : undefined
            }
          />
        )}
      />

      {navSheet}
    </>
  );
};
