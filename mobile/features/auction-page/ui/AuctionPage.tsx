import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type {
  IncomingPriceOffer,
  MyPriceOfferBid,
} from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import {
  bidNeedsAttention,
  offerNeedsAttention,
} from "@/entities/product-price-offer/lib/auctionDashboardAttention";
import { filterAuctionDashboard } from "@/entities/product-price-offer/lib/filterAuctionDashboard";
import { summarizeAuctionDashboard } from "@/entities/product-price-offer/lib/summarizeAuctionDashboard";
import {
  AUCTION_VIEW_FILTER_BUYER,
  AUCTION_VIEW_FILTER_SELLER,
} from "@/entities/product-price-offer/model/auctionViewFilters";
import { useIncomingPriceOffersQuery } from "@/entities/product-price-offer/model/useIncomingPriceOffersQuery";
import { useMyPriceOfferBidsQuery } from "@/entities/product-price-offer/model/useMyPriceOfferBidsQuery";
import { AuctionBuyerBidRow } from "@/entities/product-price-offer/ui/AuctionBuyerBidRow";
import { AuctionSellerOfferRow } from "@/entities/product-price-offer/ui/AuctionSellerOfferRow";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { AuctionPageOverview } from "@/features/auction-page/ui/AuctionPageOverview";
import { AuctionPageSection } from "@/features/auction-page/ui/AuctionPageSection";
import { AuctionPageToolbar } from "@/features/auction-page/ui/AuctionPageToolbar";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { staffBadgeQueryKeys } from "@/shared/api";
import { AUCTION_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAuctionPageStyles } from "@/shared/theme/auctionPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

type AuctionListItem =
  | { kind: "section"; id: string; title: string; count: number }
  | { kind: "bid"; id: string; bid: MyPriceOfferBid }
  | { kind: "offer"; id: string; offer: IncomingPriceOffer };

export const AuctionPage = () => {
  const router = useRouter();
  const styles = useAuctionPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const isAuthorized = useIsAuthorized();
  const sessionQuery = useAuthSessionQuery();
  const bidsQuery = useMyPriceOfferBidsQuery(isAuthorized);
  const offersQuery = useIncomingPriceOffersQuery(isAuthorized);
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [viewFilter, setViewFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const isUserDataConfirmed = sessionQuery.data?.user?.isUserDataConfirmed === true;

  const allBuyerBids = bidsQuery.data ?? [];
  const allSellerOffers = offersQuery.data ?? [];

  const summary = useMemo(
    () => summarizeAuctionDashboard(allBuyerBids, allSellerOffers),
    [allBuyerBids, allSellerOffers],
  );

  const { buyerBids, sellerOffers } = useMemo(
    () =>
      filterAuctionDashboard(allBuyerBids, allSellerOffers, {
        viewFilter,
        attentionOnly,
      }),
    [allBuyerBids, allSellerOffers, viewFilter, attentionOnly],
  );

  const totalAll = allBuyerBids.length + allSellerOffers.length;
  const totalVisible = buyerBids.length + sellerOffers.length;
  const hasFilters = Boolean(viewFilter) || attentionOnly;
  const summaryCountLabel = hasFilters
    ? AUCTION_PAGE_UI.COUNT_FILTERED(totalVisible, totalAll)
    : AUCTION_PAGE_UI.COUNT_ITEMS(totalAll);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void bidsQuery.refetch();
        void offersQuery.refetch();
      }
    }, [isAuthorized, bidsQuery.refetch, offersQuery.refetch]),
  );

  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      allBuyerBids.filter(bidNeedsAttention).forEach((bid) => next.add(`bid:${bid._id}`));
      allSellerOffers
        .filter(offerNeedsAttention)
        .forEach((offer) => next.add(`offer:${offer._id}`));
      return next;
    });
  }, [allBuyerBids, allSellerOffers]);

  const invalidateAuctionQueues = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [...staffBadgeQueryKeys.all, "user-actions"],
    });
  }, [queryClient]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([bidsQuery.refetch(), offersQuery.refetch()]);
    await invalidateAuctionQueues();
  }, [bidsQuery, offersQuery, invalidateAuctionQueues]);

  const handleProductClick = useCallback(
    (productId: string) => {
      router.push({ pathname: "/product/[id]", params: { id: productId } });
    },
    [router],
  );

  const handleBuyerClick = useCallback(
    (userId: string) => {
      router.push({ pathname: "/user/[id]", params: { id: userId } });
    },
    [router],
  );

  const toggleExpanded = useCallback((rowId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(
      new Set([
        ...buyerBids.map((bid) => `bid:${bid._id}`),
        ...sellerOffers.map((offer) => `offer:${offer._id}`),
      ]),
    );
  }, [buyerBids, sellerOffers]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleBuyerFilterClick = useCallback(() => {
    setViewFilter(AUCTION_VIEW_FILTER_BUYER);
    setAttentionOnly(false);
  }, []);

  const handleSellerFilterClick = useCallback(() => {
    setViewFilter(AUCTION_VIEW_FILTER_SELLER);
    setAttentionOnly(false);
  }, []);

  const listItems = useMemo((): AuctionListItem[] => {
    const items: AuctionListItem[] = [];

    if (buyerBids.length > 0) {
      items.push({
        kind: "section",
        id: "buyer-section",
        title: AUCTION_PAGE_UI.BUYER_SECTION_TITLE,
        count: buyerBids.length,
      });
      buyerBids.forEach((bid) => {
        items.push({ kind: "bid", id: bid._id, bid });
      });
    }

    if (sellerOffers.length > 0) {
      items.push({
        kind: "section",
        id: "seller-section",
        title: AUCTION_PAGE_UI.SELLER_SECTION_TITLE,
        count: sellerOffers.length,
      });
      sellerOffers.forEach((offer) => {
        items.push({ kind: "offer", id: offer._id, offer });
      });
    }

    return items;
  }, [buyerBids, sellerOffers]);

  const emptyMessage =
    totalAll === 0
      ? AUCTION_PAGE_UI.BOTH_EMPTY
      : hasFilters
        ? AUCTION_PAGE_UI.EMPTY_BY_FILTER
        : AUCTION_PAGE_UI.BOTH_EMPTY;

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_AUCTION}
        onPress={() => setNavSheetVisible(true)}
      />
      <AuctionPageToolbar
        summaryCountLabel={summaryCountLabel}
        viewFilter={viewFilter}
        onViewFilterChange={(value) => {
          setViewFilter(value);
          if (value) {
            setAttentionOnly(false);
          }
        }}
      />
      <AuctionPageOverview
        buyerCount={summary.buyerCount}
        sellerCount={summary.sellerCount}
        attentionCount={summary.attentionCount}
        attentionOnly={attentionOnly}
        onBuyerFilterClick={handleBuyerFilterClick}
        onSellerFilterClick={handleSellerFilterClick}
        onAttentionFilterChange={setAttentionOnly}
      />
      {totalVisible > 0 ? (
        <View style={styles.listActions}>
          <Pressable style={styles.listAction} onPress={expandAll}>
            <Text style={styles.listActionText}>{AUCTION_PAGE_UI.EXPAND_ALL}</Text>
          </Pressable>
          <Pressable style={styles.listAction} onPress={collapseAll}>
            <Text style={styles.listActionText}>{AUCTION_PAGE_UI.COLLAPSE_ALL}</Text>
          </Pressable>
          {attentionOnly ? (
            <Text style={styles.filterHint}>{AUCTION_PAGE_UI.ATTENTION_FILTER_HINT}</Text>
          ) : null}
        </View>
      ) : null}
      {totalVisible === 0 ? (
        <Text style={styles.emptyState} accessibilityRole="text">
          {emptyMessage}
        </Text>
      ) : null}
    </View>
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{AUCTION_PAGE_UI.LOGIN_HINT}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.buttonText}>{AUCTION_PAGE_UI.LOGIN_BUTTON}</Text>
        </Pressable>
      </View>
    );
  }

  if (bidsQuery.isPending || offersQuery.isPending) {
    return <ScreenLoadingState message={AUCTION_PAGE_UI.LOADING} />;
  }

  if (bidsQuery.isError || offersQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(
          bidsQuery.error ?? offersQuery.error,
          AUCTION_PAGE_UI.ERROR_GENERIC,
        )}
        onRetry={() => {
          void handleRefresh();
        }}
      />
    );
  }

  return (
    <>
      <FlatList
        style={[styles.container, styles.listFlex, centeredContentStyle]}
        data={listItems}
        keyExtractor={(item) => `${item.kind}-${item.id}`}
        contentContainerStyle={[styles.list, { paddingBottom: contentPaddingBottom }]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={bidsQuery.isRefetching || offersQuery.isRefetching}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => {
          if (item.kind === "section") {
            return <AuctionPageSection title={item.title} count={item.count} />;
          }

          if (item.kind === "bid") {
            const rowId = `bid:${item.bid._id}`;
            return (
              <AuctionBuyerBidRow
                bid={item.bid}
                collapsible
                expanded={expandedIds.has(rowId)}
                onExpandedChange={() => toggleExpanded(rowId)}
                isUserDataConfirmed={isUserDataConfirmed}
                onProductClick={handleProductClick}
                onChanged={() => {
                  void handleRefresh();
                }}
              />
            );
          }

          const rowId = `offer:${item.offer._id}`;
          return (
            <AuctionSellerOfferRow
              offer={item.offer}
              collapsible
              expanded={expandedIds.has(rowId)}
              onExpandedChange={() => toggleExpanded(rowId)}
              onProductClick={handleProductClick}
              onBuyerClick={handleBuyerClick}
              onChanged={() => {
                void handleRefresh();
              }}
            />
          );
        }}
      />

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="auction"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
