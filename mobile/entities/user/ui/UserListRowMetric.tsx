import { Text, View } from "react-native";

import { useUserListRowStyles } from "@/shared/theme/userListRowStyles";

type UserListRowMetricProps = {
  label: string;
  value: string;
  variant?: "amount" | "muted";
  accessibilityLabel?: string;
  stacked?: boolean;
};

export const UserListRowMetric = ({
  label,
  value,
  variant = "amount",
  accessibilityLabel,
  stacked = false,
}: UserListRowMetricProps) => {
  const styles = useUserListRowStyles();
  const valueStyle =
    variant === "muted" ? styles.metricValueMuted : styles.metricValueAmount;

  return (
    <View
      style={[styles.metricCell, stacked && styles.metricCellStacked]}
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, valueStyle]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};
