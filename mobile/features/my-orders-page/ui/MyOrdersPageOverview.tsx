import { Pressable, Text, View } from "react-native";

import { MY_ORDERS_PAGE_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useMyOrdersPageStyles } from "@/shared/theme/myOrdersPageStyles";

type MyOrdersPageOverviewProps = {
  inProgressCount: number;
  attentionCount: number;
  totalAmountRub: number;
  attentionOnly: boolean;
  onInProgressFilterClick: () => void;
  onAttentionFilterChange: (value: boolean) => void;
};

export const MyOrdersPageOverview = ({
  inProgressCount,
  attentionCount,
  totalAmountRub,
  attentionOnly,
  onInProgressFilterClick,
  onAttentionFilterChange,
}: MyOrdersPageOverviewProps) => {
  const styles = useMyOrdersPageStyles();

  return (
    <View style={styles.overview} accessibilityRole="summary">
      <Pressable style={styles.overviewTile} onPress={onInProgressFilterClick}>
        <Text style={styles.overviewLabel}>{MY_ORDERS_PAGE_UI.OVERVIEW_IN_PROGRESS}</Text>
        <Text style={styles.overviewValue}>{inProgressCount}</Text>
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
        <Text style={styles.overviewLabel}>{MY_ORDERS_PAGE_UI.OVERVIEW_ATTENTION}</Text>
        <Text
          style={[
            styles.overviewValue,
            attentionCount > 0 ? styles.overviewValueAttention : null,
          ]}
        >
          {attentionCount}
        </Text>
      </Pressable>

      <View style={[styles.overviewTile, styles.overviewTileStatic]}>
        <Text style={styles.overviewLabel}>{MY_ORDERS_PAGE_UI.OVERVIEW_TOTAL}</Text>
        <Text style={styles.overviewValue}>{formatPriceRub(totalAmountRub)}</Text>
      </View>
    </View>
  );
};
