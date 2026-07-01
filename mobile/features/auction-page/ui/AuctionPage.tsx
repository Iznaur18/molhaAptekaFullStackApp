import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type {
  IncomingPriceOffer,
  MyPriceOfferBid,
} from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { useIncomingPriceOffersQuery } from "@/entities/product-price-offer/model/useIncomingPriceOffersQuery";
import { useMyPriceOfferBidsQuery } from "@/entities/product-price-offer/model/useMyPriceOfferBidsQuery";
import { AuctionBuyerBidRow } from "@/entities/product-price-offer/ui/AuctionBuyerBidRow";
import { AuctionSellerOfferRow } from "@/entities/product-price-offer/ui/AuctionSellerOfferRow";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
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

  const isUserDataConfirmed = sessionQuery.data?.user?.isUserDataConfirmed === true;

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void bidsQuery.refetch();
        void offersQuery.refetch();
      }
    }, [isAuthorized, bidsQuery.refetch, offersQuery.refetch]),
  );

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

  const buyerBids = bidsQuery.data ?? [];
  const sellerOffers = offersQuery.data ?? [];

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

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_AUCTION}
        onPress={() => setNavSheetVisible(true)}
      />
      <AuctionPageToolbar buyerCount={buyerBids.length} sellerCount={sellerOffers.length} />
      {buyerBids.length === 0 && sellerOffers.length === 0 ? (
        <Text style={styles.emptyState} accessibilityRole="text">
          {AUCTION_PAGE_UI.BOTH_EMPTY}
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
            return (
              <AuctionBuyerBidRow
                bid={item.bid}
                isUserDataConfirmed={isUserDataConfirmed}
                onProductClick={handleProductClick}
                onChanged={() => {
                  void handleRefresh();
                }}
              />
            );
          }

          return (
            <AuctionSellerOfferRow
              offer={item.offer}
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
