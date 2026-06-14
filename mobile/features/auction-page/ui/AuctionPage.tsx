import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import type { IncomingPriceOffer } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { useIncomingPriceOffersQuery } from "@/entities/product-price-offer/model/useIncomingPriceOffersQuery";
import { useMyPriceOfferBidsQuery } from "@/entities/product-price-offer/model/useMyPriceOfferBidsQuery";
import { usePriceOfferSellerMutations } from "@/entities/product-price-offer/model/usePriceOfferSellerMutations";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import {
  AUCTION_PAGE_UI,
  PRODUCT_PRICE_OFFER_UI,
} from "@/shared/config";
import { formatApiErrorMessage, formatIsoDateTime, formatPriceRub } from "@/shared/lib";
import { useAuctionPageStyles } from "@/shared/theme/sellerFlowStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const PRICE_OFFER_STATUS_PENDING = "pending";
const PRICE_OFFER_STATUS_ACCEPTED = "accepted";

type SellerOfferRowProps = {
  offer: IncomingPriceOffer;
  onChanged: () => void;
};

const SellerOfferRow = ({ offer, onChanged }: SellerOfferRowProps) => {
  const router = useRouter();
  const styles = useAuctionPageStyles();
  const { acceptMutation, rejectMutation } = usePriceOfferSellerMutations(
    String(offer.productId),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const isPending = offer.status === PRICE_OFFER_STATUS_PENDING;
  const isBusy = acceptMutation.isPending || rejectMutation.isPending;

  const handleAccept = async () => {
    setErrorMessage("");
    try {
      await acceptMutation.mutateAsync(offer._id);
      onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : AUCTION_PAGE_UI.ERROR_GENERIC,
      );
    }
  };

  const handleReject = async () => {
    setErrorMessage("");
    try {
      await rejectMutation.mutateAsync(offer._id);
      onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : AUCTION_PAGE_UI.ERROR_GENERIC,
      );
    }
  };

  return (
    <View style={styles.row}>
      {offer.product?.productImageUrl ? (
        <Image source={{ uri: offer.product.productImageUrl }} style={styles.thumb} />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Text>—</Text>
        </View>
      )}
      <View style={styles.rowMain}>
        <Pressable onPress={() => router.push(`/product/${offer.productId}`)}>
          <Text style={styles.rowTitle}>{offer.product?.productName ?? "Товар"}</Text>
        </Pressable>
        <Text style={styles.rowMeta}>
          {offer.buyer?.userName ?? "Покупатель"} · {formatIsoDateTime(offer.createdAt)}
        </Text>
        <Text style={styles.rowPrice}>{formatPriceRub(offer.offerPrice)}</Text>
        {offer.status === PRICE_OFFER_STATUS_ACCEPTED ? (
          <Text style={styles.accepted}>{PRODUCT_PRICE_OFFER_UI.ACCEPTED_BADGE}</Text>
        ) : null}
        {isPending ? (
          <View style={styles.actions}>
            <Pressable
              style={styles.primaryButton}
              disabled={isBusy}
              onPress={() => {
                void handleAccept();
              }}
            >
              <Text style={styles.primaryButtonText}>
                {isBusy ? PRODUCT_PRICE_OFFER_UI.ACTION_PENDING : PRODUCT_PRICE_OFFER_UI.ACTION_ACCEPT}
              </Text>
            </Pressable>
            <Pressable
              style={styles.rejectButton}
              disabled={isBusy}
              onPress={() => {
                void handleReject();
              }}
            >
              <Text style={styles.rejectButtonText}>{PRODUCT_PRICE_OFFER_UI.ACTION_REJECT}</Text>
            </Pressable>
          </View>
        ) : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    </View>
  );
};

type BuyerBidRowProps = {
  bid: {
    _id: string;
    productId: string;
    offerPrice?: number;
    status?: string;
    product?: { _id?: string; productName?: string };
  };
};

const BuyerBidRow = ({ bid }: BuyerBidRowProps) => {
  const router = useRouter();
  const styles = useAuctionPageStyles();

  return (
    <Pressable style={styles.bidRow} onPress={() => router.push(`/product/${bid.productId}`)}>
      <Text style={styles.rowTitle}>{bid.product?.productName ?? "Товар"}</Text>
      <Text style={styles.rowPrice}>{formatPriceRub(bid.offerPrice)}</Text>
      <Text style={styles.rowMeta}>
        {bid.status === PRICE_OFFER_STATUS_PENDING
          ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
          : bid.status === PRICE_OFFER_STATUS_ACCEPTED
            ? PRODUCT_PRICE_OFFER_UI.STATUS_ACCEPTED
            : PRODUCT_PRICE_OFFER_UI.STATUS_REJECTED}
      </Text>
    </Pressable>
  );
};

export const AuctionPage = () => {
  const router = useRouter();
  const styles = useAuctionPageStyles();
  const isAuthorized = useIsAuthorized();
  const bidsQuery = useMyPriceOfferBidsQuery(isAuthorized);
  const offersQuery = useIncomingPriceOffersQuery(isAuthorized);

  const handleRefresh = () => {
    void bidsQuery.refetch();
    void offersQuery.refetch();
  };

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
        onRetry={handleRefresh}
      />
    );
  }

  const buyerBids = bidsQuery.data ?? [];
  const sellerOffers = offersQuery.data ?? [];

  if (buyerBids.length === 0 && sellerOffers.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>{AUCTION_PAGE_UI.BOTH_EMPTY}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[{ type: "content" as const }]}
      keyExtractor={() => "auction"}
      refreshControl={
        <ThemedRefreshControl
          refreshing={bidsQuery.isRefetching || offersQuery.isRefetching}
          onRefresh={handleRefresh}
        />
      }
      contentContainerStyle={styles.list}
      renderItem={() => (
        <View>
          {buyerBids.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{AUCTION_PAGE_UI.BUYER_SECTION_TITLE}</Text>
              {buyerBids.map((bid) => (
                <BuyerBidRow key={bid._id} bid={bid} />
              ))}
            </View>
          ) : null}

          {sellerOffers.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{AUCTION_PAGE_UI.SELLER_SECTION_TITLE}</Text>
              {sellerOffers.map((offer) => (
                <SellerOfferRow key={offer._id} offer={offer} onChanged={handleRefresh} />
              ))}
            </View>
          ) : null}
        </View>
      )}
    />
  );
};
