import { Alert, Pressable, Text, View } from "react-native";

import type { MyPriceOfferBid } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { usePriceOfferMutations } from "@/entities/product-price-offer/model/usePriceOfferMutations";
import { AuctionDashboardProductThumb } from "@/entities/product-price-offer/ui/AuctionDashboardProductThumb";
import { CART_AUCTION_UI } from "@/shared/config";
import { formatIsoDateTime, formatPriceRub } from "@/shared/lib";
import { useCartAuctionStyles } from "@/shared/theme/cartAuctionStyles";
import { AppButton } from "@/shared/ui/AppButton";

type CartAuctionLineProps = {
  bid: MyPriceOfferBid;
  onCheckout: (bid: MyPriceOfferBid) => void;
};

/** Выигранный лот: оформляется отдельным заказом по цене принятой ставки. */
export const CartAuctionLine = ({ bid, onCheckout }: CartAuctionLineProps) => {
  const styles = useCartAuctionStyles();
  const { cancelMutation } = usePriceOfferMutations(bid.productId);

  const productName = bid.product?.productName ?? "Товар";

  const handleRemove = () => {
    Alert.alert(CART_AUCTION_UI.REMOVE_CONFIRM_TITLE, CART_AUCTION_UI.REMOVE_CONFIRM_MESSAGE, [
      { text: CART_AUCTION_UI.REMOVE_CONFIRM_CANCEL, style: "cancel" },
      {
        text: CART_AUCTION_UI.REMOVE_CONFIRM_OK,
        style: "destructive",
        onPress: () => {
          cancelMutation.mutate(undefined, {
            onError: (error) => {
              Alert.alert(
                CART_AUCTION_UI.ERROR_GENERIC,
                error instanceof Error ? error.message : "",
              );
            },
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.row}>
      <View style={styles.head}>
        <AuctionDashboardProductThumb product={bid.product} />
        <View style={styles.main}>
          <Text style={styles.badge}>{CART_AUCTION_UI.BADGE}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {productName}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{CART_AUCTION_UI.PRICE_LABEL}</Text>
            <Text style={styles.price}>{formatPriceRub(bid.offerPrice)}</Text>
          </View>
          {bid.paymentDeadlineAt ? (
            <Text style={styles.meta}>
              {CART_AUCTION_UI.DEADLINE_LABEL}: {formatIsoDateTime(bid.paymentDeadlineAt)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          label={CART_AUCTION_UI.CHECKOUT}
          variant="primary"
          style={styles.checkoutButton}
          disabled={cancelMutation.isPending}
          onPress={() => onCheckout(bid)}
        />
        <Pressable
          style={[styles.removeButton, cancelMutation.isPending && styles.buttonDisabled]}
          disabled={cancelMutation.isPending}
          onPress={handleRemove}
        >
          <Text style={styles.removeButtonText}>
            {cancelMutation.isPending ? CART_AUCTION_UI.REMOVE_PENDING : CART_AUCTION_UI.REMOVE}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
