import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { MyPriceOfferBid } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import {
  bidNeedsAttention,
  resolveBuyerBidCollapsedPreview,
} from "@/entities/product-price-offer/lib/auctionDashboardAttention";
import { usePriceOfferMutations } from "@/entities/product-price-offer/model/usePriceOfferMutations";
import { AuctionDashboardBuyerPriceEditor } from "@/entities/product-price-offer/ui/AuctionDashboardBuyerPriceEditor";
import { AuctionDashboardProductThumb } from "@/entities/product-price-offer/ui/AuctionDashboardProductThumb";
import { AuctionDashboardRowPrice } from "@/entities/product-price-offer/ui/AuctionDashboardRowPrice";
import { AuctionDashboardRowStatus } from "@/entities/product-price-offer/ui/AuctionDashboardRowStatus";
import { AUCTION_PAGE_UI, PRODUCT_PRICE_OFFER_UI } from "@/shared/config";
import { formatIsoDateTime } from "@/shared/lib";
import {
  formatIntegerGroupRu,
  formatRubPriceInput,
  parseRubPriceInput,
  RUB_PRICE_INPUT_MAX_DIGITS,
} from "@/shared/lib/rubPriceInput";
import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";
import { CommerceCardExpandToggle } from "@/shared/ui/CommerceCardExpandToggle";

const PRICE_OFFER_STATUS_PENDING = "pending";
const PRICE_OFFER_STATUS_ACCEPTED = "accepted";

type AuctionBuyerBidRowProps = {
  bid: MyPriceOfferBid;
  isUserDataConfirmed?: boolean;
  onProductClick?: (productId: string) => void;
  onChanged?: () => void;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export const AuctionBuyerBidRow = ({
  bid,
  isUserDataConfirmed = false,
  onProductClick,
  onChanged,
  collapsible = false,
  expanded = true,
  onExpandedChange,
}: AuctionBuyerBidRowProps) => {
  const styles = useAuctionDashboardRowStyles();
  const router = useRouter();
  const [priceInput, setPriceInput] = useState(() =>
    formatIntegerGroupRu(bid.offerPrice ?? ""),
  );
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { patchMutation, cancelMutation } = usePriceOfferMutations(bid.productId);
  const isBusy = patchMutation.isPending || cancelMutation.isPending;

  const productName = bid.product?.productName ?? "Товар";
  const isPending = bid.status === PRICE_OFFER_STATUS_PENDING;
  const isAccepted = bid.status === PRICE_OFFER_STATUS_ACCEPTED;
  const isExpanded = !collapsible || expanded;
  const needsAttention = bidNeedsAttention(bid);
  const collapsedPreview = !isExpanded ? resolveBuyerBidCollapsedPreview(bid) : null;

  const toggleExpanded = () => {
    onExpandedChange?.(!expanded);
  };

  useEffect(() => {
    setPriceInput(formatIntegerGroupRu(bid.offerPrice ?? ""));
  }, [bid.offerPrice, bid._id]);

  const handleUpdate = async () => {
    const price = parseRubPriceInput(priceInput);
    if (price == null || price < 1) {
      setError("Укажите целую цену больше 0");
      return;
    }
    if (price > 10 ** RUB_PRICE_INPUT_MAX_DIGITS - 1) {
      setError(PRODUCT_PRICE_OFFER_UI.ERROR_PRICE_MAX);
      return;
    }

    setError("");
    try {
      await patchMutation.mutateAsync(price);
      setIsEditing(false);
      onChanged?.();
    } catch (patchError) {
      setError(
        patchError instanceof Error
          ? patchError.message
          : AUCTION_PAGE_UI.ERROR_GENERIC,
      );
    }
  };

  const handleCancel = async () => {
    setError("");
    try {
      await cancelMutation.mutateAsync();
      onChanged?.();
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : AUCTION_PAGE_UI.ERROR_GENERIC,
      );
    }
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setError("");
    setPriceInput(formatIntegerGroupRu(bid.offerPrice ?? ""));
  };

  const handleGoToCart = () => {
    router.push("/(tabs)/cart");
  };

  return (
    <View style={[styles.row, needsAttention ? styles.rowAttention : null]}>
      <View style={styles.head}>
        <AuctionDashboardProductThumb product={bid.product} />
        <View style={styles.main}>
          <View style={styles.headLine}>
            {onProductClick ? (
              <Pressable
                style={styles.titlePressable}
                onPress={() => onProductClick(bid.productId)}
              >
                <Text style={styles.title} numberOfLines={2}>
                  {productName}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.titleStatic} numberOfLines={2}>
                {productName}
              </Text>
            )}
            {collapsible ? (
              <CommerceCardExpandToggle
                expanded={isExpanded}
                accessibilityLabel={AUCTION_PAGE_UI.EXPAND_TOGGLE(isExpanded)}
                onPress={toggleExpanded}
              />
            ) : null}
          </View>
          {isExpanded ? (
            <>
              <Text style={styles.meta} numberOfLines={1}>
                {formatIsoDateTime(bid.createdAt)}
              </Text>
              <AuctionDashboardRowStatus tone={isAccepted ? "success" : "neutral"}>
                {isPending
                  ? AUCTION_PAGE_UI.STATUS_BUYER_PENDING
                  : isAccepted
                    ? PRODUCT_PRICE_OFFER_UI.STATUS_ACCEPTED
                    : null}
              </AuctionDashboardRowStatus>
              {isAccepted && bid.paymentDeadlineAt ? (
                <Text style={styles.meta}>
                  {AUCTION_PAGE_UI.PAY_DEADLINE_LABEL}:{" "}
                  {formatIsoDateTime(bid.paymentDeadlineAt)}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
        <AuctionDashboardRowPrice
          price={bid.offerPrice}
          caption={AUCTION_PAGE_UI.PRICE_CAPTION_MINE}
        />
      </View>

      {collapsedPreview ? <Text style={styles.preview}>{collapsedPreview}</Text> : null}

      {isExpanded ? (
        <>
          {isPending && isUserDataConfirmed && isEditing ? (
            <AuctionDashboardBuyerPriceEditor
              label={AUCTION_PAGE_UI.EDIT_PRICE_LABEL}
              value={priceInput}
              onChange={(next) => setPriceInput(formatRubPriceInput(next))}
              onSubmit={() => {
                void handleUpdate();
              }}
              onClose={handleCloseEditor}
              disabled={isBusy}
              submitLabel={AUCTION_PAGE_UI.SAVE_BID}
              closeLabel={AUCTION_PAGE_UI.CLOSE_EDITOR}
              pendingLabel={PRODUCT_PRICE_OFFER_UI.ACTION_PENDING}
            />
          ) : null}

          {isPending && isUserDataConfirmed && !isEditing ? (
            <View style={styles.actions} accessibilityRole="toolbar">
              <Pressable
                style={[
                  styles.actionBtn,
                  styles.actionBtnSecondary,
                  isBusy ? styles.disabled : null,
                ]}
                disabled={isBusy}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.actionBtnSecondaryText}>
                  {`✎ ${AUCTION_PAGE_UI.EDIT_BID}`}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.textBtn, isBusy ? styles.disabled : null]}
                disabled={isBusy}
                onPress={() => {
                  void handleCancel();
                }}
              >
                <Text style={styles.textBtnDanger}>
                  {cancelMutation.isPending
                    ? PRODUCT_PRICE_OFFER_UI.ACTION_PENDING
                    : AUCTION_PAGE_UI.CANCEL_BID}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {isAccepted ? (
            <Pressable style={styles.cta} onPress={handleGoToCart}>
              <Text style={styles.ctaText}>{PRODUCT_PRICE_OFFER_UI.GO_TO_CART}</Text>
            </Pressable>
          ) : null}

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
};
