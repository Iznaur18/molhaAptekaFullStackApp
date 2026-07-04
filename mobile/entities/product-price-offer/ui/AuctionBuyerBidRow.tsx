import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useCreateOrderMutation } from "@/entities/order/model/useCreateOrderMutation";
import type { OrderPaymentMethod } from "@/entities/order/model/constants";
import type { MyPriceOfferBid } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import {
  bidNeedsAttention,
  resolveBuyerBidCollapsedPreview,
} from "@/entities/product-price-offer/lib/auctionDashboardAttention";
import { usePriceOfferMutations } from "@/entities/product-price-offer/model/usePriceOfferMutations";
import { AuctionDashboardBuyerPriceEditor } from "@/entities/product-price-offer/ui/AuctionDashboardBuyerPriceEditor";
import { AuctionDashboardProductThumb } from "@/entities/product-price-offer/ui/AuctionDashboardProductThumb";
import { AuctionDashboardRowStatus } from "@/entities/product-price-offer/ui/AuctionDashboardRowStatus";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import {
  AUCTION_PAGE_UI,
  PRODUCT_PRICE_OFFER_UI,
} from "@/shared/config";
import { formatIsoDateTime, formatPriceRub } from "@/shared/lib";
import {
  formatIntegerGroupRu,
  formatRubPriceInput,
  parseRubPriceInput,
  RUB_PRICE_INPUT_MAX_DIGITS,
} from "@/shared/lib/rubPriceInput";
import { useAuctionDashboardRowStyles } from "@/shared/theme/auctionPageStyles";

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
  const sessionQuery = useAuthSessionQuery();
  const [priceInput, setPriceInput] = useState(() => formatIntegerGroupRu(bid.offerPrice ?? ""));
  const [error, setError] = useState("");
  const { patchMutation, cancelMutation } = usePriceOfferMutations(bid.productId);
  const createOrderMutation = useCreateOrderMutation();
  const isBusy = patchMutation.isPending || cancelMutation.isPending;
  const isPaying = createOrderMutation.isPending;
  const [showPay, setShowPay] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");

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
      onChanged?.();
    } catch (patchError) {
      setError(patchError instanceof Error ? patchError.message : AUCTION_PAGE_UI.ERROR_GENERIC);
    }
  };

  const handleCancel = async () => {
    setError("");
    try {
      await cancelMutation.mutateAsync();
      onChanged?.();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : AUCTION_PAGE_UI.ERROR_GENERIC);
    }
  };

  const handlePay = async (payload: {
    deliveryAddress: string;
    deliveryAddressFlat: string;
    paymentMethod: OrderPaymentMethod;
  }) => {
    setPayError("");
    setPaySuccess("");
    try {
      await createOrderMutation.mutateAsync({
        items: [{ productId: bid.productId, quantity: 1 }],
        priceOfferId: bid._id,
        deliveryAddress: payload.deliveryAddress,
        deliveryAddressFlat: payload.deliveryAddressFlat,
        paymentMethod: payload.paymentMethod,
      });
      setPaySuccess(PRODUCT_PRICE_OFFER_UI.PAY_ORDER_PLACED);
      setShowPay(false);
      onChanged?.();
    } catch (payErrorValue) {
      setPayError(
        payErrorValue instanceof Error ? payErrorValue.message : AUCTION_PAGE_UI.ERROR_GENERIC,
      );
    }
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
              <Pressable
                style={styles.chevronButton}
                accessibilityRole="button"
                accessibilityLabel={AUCTION_PAGE_UI.EXPAND_TOGGLE(isExpanded)}
                onPress={toggleExpanded}
              >
                <Text style={[styles.chevron, isExpanded ? styles.chevronExpanded : null]}>▸</Text>
              </Pressable>
            ) : null}
          </View>
          {isExpanded ? (
            <>
              <Text style={styles.meta} numberOfLines={1}>
                {formatIsoDateTime(bid.createdAt)}
              </Text>
              <AuctionDashboardRowStatus isPending={isPending} isAccepted={isAccepted}>
                {isPending
                  ? PRODUCT_PRICE_OFFER_UI.STATUS_PENDING
                  : isAccepted && !showPay
                    ? PRODUCT_PRICE_OFFER_UI.STATUS_ACCEPTED
                    : null}
              </AuctionDashboardRowStatus>
              {isAccepted && bid.paymentDeadlineAt ? (
                <Text style={styles.meta}>
                  {AUCTION_PAGE_UI.PAY_DEADLINE_LABEL}: {formatIsoDateTime(bid.paymentDeadlineAt)}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.priceStrip}>
        <Text style={styles.priceLabel}>{AUCTION_PAGE_UI.BID_PRICE_LABEL}</Text>
        <Text style={styles.price}>{formatPriceRub(bid.offerPrice)}</Text>
      </View>

      {collapsedPreview ? <Text style={styles.preview}>{collapsedPreview}</Text> : null}

      {isExpanded ? (
        <>
          {isPending && isUserDataConfirmed ? (
            <AuctionDashboardBuyerPriceEditor
              label={AUCTION_PAGE_UI.EDIT_PRICE_LABEL}
              value={priceInput}
              onChange={(next) => setPriceInput(formatRubPriceInput(next))}
              onSubmit={() => {
                void handleUpdate();
              }}
              onCancel={() => {
                void handleCancel();
              }}
              disabled={isBusy}
              submitLabel={PRODUCT_PRICE_OFFER_UI.UPDATE}
              cancelLabel={PRODUCT_PRICE_OFFER_UI.CANCEL}
              pendingLabel={PRODUCT_PRICE_OFFER_UI.ACTION_PENDING}
            />
          ) : null}

          {isAccepted && !showPay ? (
            <Pressable style={styles.cta} onPress={() => setShowPay(true)}>
              <Text style={styles.ctaText}>{PRODUCT_PRICE_OFFER_UI.PAY_BUTTON}</Text>
            </Pressable>
          ) : null}

          {isAccepted && showPay ? (
            <View style={styles.checkout}>
              <CheckoutForm
                defaultUser={sessionQuery.data?.user ?? null}
                isSubmitting={isPaying}
                submitError={payError}
                submitSuccess={paySuccess}
                onSubmit={handlePay}
              />
            </View>
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
