import { Pressable, ScrollView, Text, View } from "react-native";

import { resolveMyOrdersStatusFilterChipActiveColors } from "@/entities/order/lib/resolveMyOrdersStatusFilterChipColors";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
} from "@/entities/order/model/constants";
import { ADMIN_ORDERS_PAGE_UI } from "@/shared/config";
import { useAdminOrdersPageStyles } from "@/shared/theme/adminOrdersPageStyles";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: ADMIN_ORDERS_PAGE_UI.STATUS_FILTER_ALL },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL_RU[status],
  })),
];

type AdminOrdersPageToolbarProps = {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  ordersCount: number;
};

export const AdminOrdersPageToolbar = ({
  statusFilter,
  onStatusFilterChange,
  ordersCount,
}: AdminOrdersPageToolbarProps) => {
  const styles = useAdminOrdersPageStyles();

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarHeading}>{ADMIN_ORDERS_PAGE_UI.TITLE}</Text>
        <Text style={styles.ordersCount}>{ADMIN_ORDERS_PAGE_UI.COUNT(ordersCount)}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusChips}
        accessibilityRole="tablist"
        accessibilityLabel={ADMIN_ORDERS_PAGE_UI.STATUS_FILTER_LABEL}
      >
        {STATUS_FILTER_OPTIONS.map((option) => {
          const isActive = statusFilter === option.value;
          const activeColors = isActive
            ? resolveMyOrdersStatusFilterChipActiveColors(option.value)
            : null;

          return (
            <Pressable
              key={option.value || "all"}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.statusChip,
                activeColors
                  ? {
                      backgroundColor: activeColors.backgroundColor,
                      borderColor: activeColors.borderColor,
                    }
                  : null,
              ]}
              onPress={() => onStatusFilterChange(option.value)}
            >
              <Text style={[styles.statusChipText, isActive && styles.statusChipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
