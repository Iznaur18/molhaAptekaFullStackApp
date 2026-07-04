import { Pressable, Text, View } from "react-native";

import { INSTALLMENT_UI } from "@/shared/config";
import { formatPriceRub } from "@/shared/lib";
import { useInstallmentPaymentsPageStyles } from "@/shared/theme/installmentPaymentsPageStyles";

type InstallmentPaymentsOverviewProps = {
  activeCount: number;
  attentionCount: number;
  totalRemainingRub: number;
  attentionOnly: boolean;
  onAttentionFilterChange: (value: boolean) => void;
  onActiveFilterClick: () => void;
  remainingLabel?: string;
};

export const InstallmentPaymentsOverview = ({
  activeCount,
  attentionCount,
  totalRemainingRub,
  attentionOnly,
  onAttentionFilterChange,
  onActiveFilterClick,
  remainingLabel = INSTALLMENT_UI.PAYMENTS_OVERVIEW_REMAINING,
}: InstallmentPaymentsOverviewProps) => {
  const styles = useInstallmentPaymentsPageStyles();

  return (
    <View style={styles.overview} accessibilityRole="summary">
      <Pressable style={styles.overviewTile} onPress={onActiveFilterClick}>
        <Text style={styles.overviewLabel}>{INSTALLMENT_UI.PAYMENTS_OVERVIEW_ACTIVE}</Text>
        <Text style={styles.overviewValue}>{activeCount}</Text>
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
        <Text style={styles.overviewLabel}>{INSTALLMENT_UI.PAYMENTS_OVERVIEW_ATTENTION}</Text>
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
        <Text style={styles.overviewLabel}>{remainingLabel}</Text>
        <Text style={styles.overviewValue}>{formatPriceRub(totalRemainingRub)}</Text>
      </View>
    </View>
  );
};
