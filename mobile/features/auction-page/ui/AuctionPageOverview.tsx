import { Pressable, Text, View } from "react-native";

import { AUCTION_PAGE_UI } from "@/shared/config";
import { useAuctionPageStyles } from "@/shared/theme/auctionPageStyles";

type AuctionPageOverviewProps = {
  buyerCount: number;
  sellerCount: number;
  attentionCount: number;
  attentionOnly: boolean;
  onBuyerFilterClick: () => void;
  onSellerFilterClick: () => void;
  onAttentionFilterChange: (value: boolean) => void;
};

export const AuctionPageOverview = ({
  buyerCount,
  sellerCount,
  attentionCount,
  attentionOnly,
  onBuyerFilterClick,
  onSellerFilterClick,
  onAttentionFilterChange,
}: AuctionPageOverviewProps) => {
  const styles = useAuctionPageStyles();

  return (
    <View style={styles.overview} accessibilityRole="summary">
      <Pressable style={styles.overviewTile} onPress={onBuyerFilterClick}>
        <Text style={styles.overviewLabel}>{AUCTION_PAGE_UI.OVERVIEW_BUYER_BIDS}</Text>
        <Text style={styles.overviewValue}>{buyerCount}</Text>
      </Pressable>

      <Pressable style={styles.overviewTile} onPress={onSellerFilterClick}>
        <Text style={styles.overviewLabel}>{AUCTION_PAGE_UI.OVERVIEW_INCOMING}</Text>
        <Text style={styles.overviewValue}>{sellerCount}</Text>
      </Pressable>

      <Pressable
        style={[
          styles.overviewTile,
          attentionOnly ? styles.overviewTileActive : null,
          attentionCount > 0 ? styles.overviewTileAttention : null,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: attentionOnly }}
        onPress={() => onAttentionFilterChange(!attentionOnly)}
      >
        <Text style={styles.overviewLabel}>{AUCTION_PAGE_UI.OVERVIEW_ATTENTION}</Text>
        <Text
          style={[
            styles.overviewValue,
            attentionCount > 0 ? styles.overviewValueAttention : null,
          ]}
        >
          {attentionCount}
        </Text>
      </Pressable>
    </View>
  );
};
