import { Text, View } from "react-native";

import { AUCTION_PAGE_UI } from "@/shared/config";
import { useAuctionPageStyles } from "@/shared/theme/auctionPageStyles";

type AuctionPageToolbarProps = {
  buyerCount: number;
  sellerCount: number;
};

export const AuctionPageToolbar = ({ buyerCount, sellerCount }: AuctionPageToolbarProps) => {
  const styles = useAuctionPageStyles();

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarHeading}>{AUCTION_PAGE_UI.TITLE}</Text>
        <View style={styles.toolbarCounts}>
          <Text style={styles.toolbarCount}>{AUCTION_PAGE_UI.COUNT_BIDS(buyerCount)}</Text>
          <Text style={styles.toolbarCount}>{AUCTION_PAGE_UI.COUNT_OFFERS(sellerCount)}</Text>
        </View>
      </View>
    </View>
  );
};
