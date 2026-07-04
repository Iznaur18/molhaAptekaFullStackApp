import { Pressable, Text, View } from "react-native";

import { AUCTION_VIEW_FILTER_OPTIONS } from "@/entities/product-price-offer/model/auctionViewFilters";
import { AUCTION_PAGE_UI } from "@/shared/config";
import { useAuctionPageStyles } from "@/shared/theme/auctionPageStyles";

type AuctionPageToolbarProps = {
  summaryCountLabel: string;
  viewFilter: string;
  onViewFilterChange: (value: string) => void;
};

export const AuctionPageToolbar = ({
  summaryCountLabel,
  viewFilter,
  onViewFilterChange,
}: AuctionPageToolbarProps) => {
  const styles = useAuctionPageStyles();

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarHeading}>{AUCTION_PAGE_UI.TITLE}</Text>
        <Text style={styles.toolbarCount}>{summaryCountLabel}</Text>
      </View>

      <View
        style={styles.viewChips}
        accessibilityRole="tablist"
        accessibilityLabel={AUCTION_PAGE_UI.VIEW_FILTER_LABEL}
      >
        {AUCTION_VIEW_FILTER_OPTIONS.map((option) => {
          const isActive = viewFilter === option.value;
          const label = AUCTION_PAGE_UI[option.labelKey];

          return (
            <Pressable
              key={option.value || "all"}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[styles.viewChip, isActive ? styles.viewChipActive : null]}
              onPress={() => onViewFilterChange(option.value)}
            >
              <Text style={[styles.viewChipText, isActive ? styles.viewChipTextActive : null]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
