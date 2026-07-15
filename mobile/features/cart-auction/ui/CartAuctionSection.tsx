import { Text, View } from "react-native";

import type { MyPriceOfferBid } from "@/entities/product-price-offer/api/incomingPriceOffersApi";
import { CART_AUCTION_UI } from "@/shared/config";
import { useCartAuctionStyles } from "@/shared/theme/cartAuctionStyles";

import { CartAuctionLine } from "./CartAuctionLine";

type CartAuctionSectionProps = {
  bids: MyPriceOfferBid[];
  onCheckout: (bid: MyPriceOfferBid) => void;
};

/** Блок выигранных аукционных лотов над обычными строками корзины. */
export const CartAuctionSection = ({ bids, onCheckout }: CartAuctionSectionProps) => {
  const styles = useCartAuctionStyles();

  if (bids.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.sectionTitle}>{CART_AUCTION_UI.SECTION_TITLE}</Text>
        <Text style={styles.sectionHint}>{CART_AUCTION_UI.SECTION_HINT}</Text>
      </View>
      {bids.map((bid) => (
        <CartAuctionLine key={bid._id} bid={bid} onCheckout={onCheckout} />
      ))}
    </View>
  );
};
