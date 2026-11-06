import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import {
  ORDER_STATUSES,
  SALES_ORDER_STATUS_LABEL_RU,
} from "@/entities/order/model/constants";
import {
  isMyOrdersListGroupFilter,
  MY_ORDERS_LIST_FILTER_CLOSED,
  MY_ORDERS_LIST_FILTER_DONE,
  MY_ORDERS_LIST_FILTER_IN_PROGRESS,
} from "@/entities/order/model/myOrdersListFilters";
import { resolveMySalesStatusFilterChipActiveColors } from "@/entities/order/lib/resolveMySalesStatusFilterChipColors";
import { OrderStatusChipRow } from "@/entities/order/ui/OrderStatusChipRow";
import { MY_SALES_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useMySalesPageStyles } from "@/shared/theme/mySalesPageStyles";

const STATUS_FILTER_OPTIONS = ORDER_STATUSES.map((status) => ({
  value: status,
  label: SALES_ORDER_STATUS_LABEL_RU[status],
}));

const STATUS_GROUP_OPTIONS = [
  [MY_ORDERS_LIST_FILTER_IN_PROGRESS, MY_SALES_PAGE_UI.STATUS_GROUP_IN_PROGRESS],
  [MY_ORDERS_LIST_FILTER_DONE, MY_SALES_PAGE_UI.STATUS_GROUP_DONE],
  [MY_ORDERS_LIST_FILTER_CLOSED, MY_SALES_PAGE_UI.STATUS_GROUP_CLOSED],
] as const;

type StatusChipProps = {
  label: string;
  active: boolean;
  /** Цвет активного точного статуса; у групп — общий зелёный, как на сайте. */
  colorKey?: string;
  onPress: () => void;
};

const StatusChip = ({ label, active, colorKey = "", onPress }: StatusChipProps) => {
  const styles = useMySalesPageStyles();
  const activeColors = active
    ? resolveMySalesStatusFilterChipActiveColors(colorKey)
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.statusChip,
        activeColors
          ? {
              backgroundColor: activeColors.backgroundColor,
              borderColor: activeColors.borderColor,
            }
          : null,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
};

type MySalesPageToolbarProps = {
  summaryCountLabel: string;
  totalSalesCount: number;
  statusFilter: string;
  attentionOnly: boolean;
  onStatusFilterChange: (value: string) => void;
  onAttentionOnlyChange: (value: boolean) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  isSearchPending: boolean;
};

/**
 * Панель «Моих продаж» (паритет web `SalesToolbar`): группы статусов,
 * «Ещё статусы» со всеми точными статусами вторым рядом и поиск покупателя.
 */
export const MySalesPageToolbar = ({
  summaryCountLabel,
  totalSalesCount,
  statusFilter,
  attentionOnly,
  onStatusFilterChange,
  onAttentionOnlyChange,
  searchTerm,
  onSearchTermChange,
  isSearchPending,
}: MySalesPageToolbarProps) => {
  const styles = useMySalesPageStyles();
  const theme = useAppTheme();
  const showClearButton = searchTerm.length > 0;
  const exactStatusSelected =
    Boolean(statusFilter) && !isMyOrdersListGroupFilter(statusFilter);
  const [showAllStatuses, setShowAllStatuses] = useState(exactStatusSelected);

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

      <OrderStatusChipRow accessibilityLabel={MY_SALES_PAGE_UI.STATUS_FILTER_LABEL}>
        <StatusChip
          label={MY_SALES_PAGE_UI.STATUS_GROUP_ALL}
          active={!statusFilter && !attentionOnly}
          onPress={() => onStatusFilterChange("")}
        />
        <StatusChip
          label={MY_SALES_PAGE_UI.STATUS_GROUP_ATTENTION}
          active={attentionOnly}
          onPress={() => onAttentionOnlyChange(true)}
        />
        {STATUS_GROUP_OPTIONS.map(([value, label]) => (
          <StatusChip
            key={value}
            label={label}
            active={statusFilter === value}
            onPress={() => onStatusFilterChange(value)}
          />
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showAllStatuses }}
          style={styles.statusMore}
          onPress={() => setShowAllStatuses((value) => !value)}
        >
          <Text style={styles.statusMoreText}>
            {showAllStatuses
              ? MY_SALES_PAGE_UI.STATUS_LESS
              : MY_SALES_PAGE_UI.STATUS_MORE}
          </Text>
        </Pressable>
      </OrderStatusChipRow>

      {showAllStatuses ? (
        <OrderStatusChipRow
          style={styles.statusChipsAll}
          accessibilityLabel={MY_SALES_PAGE_UI.STATUS_FILTER_LABEL}
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <StatusChip
              key={option.value}
              label={option.label}
              active={statusFilter === option.value}
              colorKey={option.value}
              onPress={() => onStatusFilterChange(option.value)}
            />
          ))}
        </OrderStatusChipRow>
      ) : null}

      <View style={styles.searchRoot} accessibilityRole="search">
        <TextInput
          style={styles.searchField}
          value={searchTerm}
          onChangeText={onSearchTermChange}
          placeholder={MY_SALES_PAGE_UI.SEARCH_PLACEHOLDER}
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={MY_SALES_PAGE_UI.SEARCH_LABEL}
          allowFontScaling={false}
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
