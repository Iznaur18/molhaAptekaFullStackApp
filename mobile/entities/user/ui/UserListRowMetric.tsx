import { Text, View } from "react-native";

import { useUserListRowStyles } from "@/shared/theme/userListRowStyles";

type UserListRowMetricProps = {
  label: string;
  value: string;
  variant?: "amount" | "muted";
  accessibilityLabel?: string;
};

export const UserListRowMetric = ({
  label,
  value,
  variant = "amount",
  accessibilityLabel,
}: UserListRowMetricProps) => {
  const styles = useUserListRowStyles();
  const valueStyle =
    variant === "muted" ? styles.metricValueMuted : styles.metricValueAmount;

  return (
    <View style={styles.metricCell} accessibilityLabel={accessibilityLabel}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, valueStyle]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
};
