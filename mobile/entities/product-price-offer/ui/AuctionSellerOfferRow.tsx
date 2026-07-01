import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import type { IncomingPriceOffer } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { usePriceOfferSellerMutations } from "@/entities/product-price-offer/model/usePriceOfferSellerMutations";
import { AuctionDashboardRowStatus } from "@/entities/product-price-offer/ui/AuctionDashboardRowStatus";
import { AuctionDashboardSellerActions } from "@/entities/product-price-offer/ui/AuctionDashboardSellerActions";
import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import {
  AUCTION_PAGE_UI,
  PRODUCT_PRICE_OFFER_UI,
  USER_LIST_ROW_UI,
} from "@/shared/config";
import { formatIsoDateTime, formatPriceRub } from "@/shared/lib";
import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

const PRICE_OFFER_STATUS_PENDING = "pending";
const PRICE_OFFER_STATUS_ACCEPTED = "accepted";

type AuctionSellerOfferRowProps = {
  offer: IncomingPriceOffer;
  onProductClick?: (productId: string) => void;
  onBuyerClick?: (userId: string) => void;
  onChanged?: () => void;
};

export const AuctionSellerOfferRow = ({
  offer,
  onProductClick,
  onBuyerClick,
  onChanged,
}: AuctionSellerOfferRowProps) => {
  const styles = useAuctionDashboardRowStyles();
  const { acceptMutation, rejectMutation } = usePriceOfferSellerMutations(String(offer.productId));
  const [error, setError] = useState("");

  const isBusy = acceptMutation.isPending || rejectMutation.isPending;
  const productName = offer.product?.productName ?? "Товар";
  const imageUrl = offer.product?.productImageUrl ?? null;
  const buyer = offer.buyer;
  const buyerId = buyer?._id != null ? String(buyer._id) : null;
  const buyerName = buyer?.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isPending = offer.status === PRICE_OFFER_STATUS_PENDING;
  const isAccepted = offer.status === PRICE_OFFER_STATUS_ACCEPTED;

  const handleAccept = async () => {
    setError("");
    try {
      await acceptMutation.mutateAsync(offer._id);
      onChanged?.();
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : AUCTION_PAGE_UI.ERROR_GENERIC);
    }
  };

  const handleReject = async () => {
    setError("");
    try {
      await rejectMutation.mutateAsync(offer._id);
      onChanged?.();
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : AUCTION_PAGE_UI.ERROR_GENERIC);
    }
  };

  const buyerNameNode = (
    <UserPremiumDisplayName
      name={buyerName}
      isPremium={buyer?.isPremiumUser === true}
      isUserDataConfirmed={buyer?.isUserDataConfirmed === true}
      textStyle={buyerId && onBuyerClick ? styles.buyerLinkText : undefined}
    />
  );

  return (
    <View style={styles.row}>
      <View style={styles.head}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumb} accessibilityIgnoresInvertColors />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbPlaceholderText}>—</Text>
          </View>
        )}
        <View style={styles.main}>
          {onProductClick ? (
            <Pressable
              style={styles.titlePressable}
              onPress={() => onProductClick(String(offer.productId))}
            >
              <Text style={styles.title}>{productName}</Text>
            </Pressable>
          ) : (
            <Text style={styles.titleStatic}>{productName}</Text>
          )}
          <View style={styles.metaRow}>
            {buyerId && onBuyerClick ? (
              <Pressable style={styles.buyerLink} onPress={() => onBuyerClick(buyerId)}>
                {buyerNameNode}
              </Pressable>
            ) : (
              buyerNameNode
            )}
            <Text style={styles.meta}> · {formatIsoDateTime(offer.createdAt)}</Text>
          </View>
          <AuctionDashboardRowStatus isPending={isPending} isAccepted={isAccepted}>
            {isPending
              ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
              : isAccepted
                ? PRODUCT_PRICE_OFFER_UI.ACCEPTED_BADGE
                : null}
          </AuctionDashboardRowStatus>
        </View>
      </View>

      <View style={styles.priceStrip}>
        <Text style={styles.priceLabel}>{AUCTION_PAGE_UI.BID_PRICE_LABEL}</Text>
        <Text style={styles.price}>{formatPriceRub(offer.offerPrice)}</Text>
      </View>

      {isPending ? (
        <AuctionDashboardSellerActions
          onAccept={() => {
            void handleAccept();
          }}
          onReject={() => {
            void handleReject();
          }}
          disabled={isBusy}
          acceptLabel={PRODUCT_PRICE_OFFER_UI.ACTION_ACCEPT}
          rejectLabel={PRODUCT_PRICE_OFFER_UI.ACTION_REJECT}
          pendingLabel={PRODUCT_PRICE_OFFER_UI.ACTION_PENDING}
        />
      ) : null}

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
};
