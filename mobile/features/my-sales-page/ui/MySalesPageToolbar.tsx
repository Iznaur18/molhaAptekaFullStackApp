import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
} from "@/entities/order/model/constants";
import { resolveMySalesStatusFilterChipActiveColors } from "@/entities/order/lib/resolveMySalesStatusFilterChipColors";
import { MY_SALES_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useMySalesPageStyles } from "@/shared/theme/mySalesPageStyles";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: MY_SALES_PAGE_UI.STATUS_FILTER_ALL },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL_RU[status],
  })),
];

type MySalesPageToolbarProps = {
  summaryCountLabel: string;
  totalSalesCount: number;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  isSearchPending: boolean;
};

export const MySalesPageToolbar = ({
  summaryCountLabel,
  totalSalesCount,
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchTermChange,
  isSearchPending,
}: MySalesPageToolbarProps) => {
  const styles = useMySalesPageStyles();
  const theme = useAppTheme();
  const showClearButton = searchTerm.length > 0;

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarHeading}>{MY_SALES_PAGE_UI.TITLE}</Text>
        <View style={styles.toolbarMeta}>
          <Text style={styles.totalSalesCount}>
            {MY_SALES_PAGE_UI.TOTAL_SALES_COUNT(totalSalesCount)}
          </Text>
          <Text style={styles.ordersCount}>{summaryCountLabel}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusChips}
        accessibilityRole="tablist"
        accessibilityLabel={MY_SALES_PAGE_UI.STATUS_FILTER_LABEL}
      >
        {STATUS_FILTER_OPTIONS.map((option) => {
          const isActive = statusFilter === option.value;
          const activeColors = isActive
            ? resolveMySalesStatusFilterChipActiveColors(option.value)
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
              <Text
                style={[styles.statusChipText, isActive && styles.statusChipTextActive]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.searchRoot} accessibilityRole="search">
        <TextInput
          style={styles.searchField}
          value={searchTerm}
          onChangeText={onSearchTermChange}
          placeholder={MY_SALES_PAGE_UI.SEARCH_PLACEHOLDER}
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={MY_SALES_PAGE_UI.SEARCH_LABEL}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
        />
        {showClearButton ? (
          <Pressable
            style={styles.searchClearButton}
            accessibilityRole="button"
            accessibilityLabel={MY_SALES_PAGE_UI.SEARCH_LABEL}
            onPress={() => onSearchTermChange("")}
          >
            <Text style={styles.searchClearText}>×</Text>
          </Pressable>
        ) : null}
        {isSearchPending ? (
          <ActivityIndicator
            style={styles.searchSpinner}
            size="small"
            color={theme.colors.action}
            accessibilityLabel={MY_SALES_PAGE_UI.SEARCH_LABEL}
          />
        ) : null}
      </View>
    </View>
  );
};
