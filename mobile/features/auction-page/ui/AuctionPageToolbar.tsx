import { Pressable, Text, View } from "react-native";

import { AUCTION_VIEW_FILTER_OPTIONS } from "@/entities/product-price-offer/model/auctionViewFilters";
import { AUCTION_PAGE_UI } from "@/shared/config";
import { useAuctionPageStyles } from "@/shared/theme/auctionPageStyles";

type AuctionPageToolbarProps = {
  viewFilter: string;
  onViewFilterChange: (value: string) => void;
};

export const AuctionPageToolbar = ({
  viewFilter,
  onViewFilterChange,
}: AuctionPageToolbarProps) => {
  const styles = useAuctionPageStyles();

  return (
    <View
      style={styles.viewSwitch}
      accessibilityRole="tablist"
      accessibilityLabel={AUCTION_PAGE_UI.VIEW_FILTER_LABEL}
    >
      {AUCTION_VIEW_FILTER_OPTIONS.map((option) => {
        const isActive = viewFilter === option.value;
        const label = AUCTION_PAGE_UI[option.labelKey];

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={[styles.viewSwitchTab, isActive ? styles.viewSwitchTabActive : null]}
            onPress={() => onViewFilterChange(option.value)}
          >
            <Text
              style={[
                styles.viewSwitchTabText,
                isActive ? styles.viewSwitchTabTextActive : null,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
