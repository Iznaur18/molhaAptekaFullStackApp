import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { resolveMyOrdersStatusFilterChipActiveColors } from "@/entities/order/lib/resolveMyOrdersStatusFilterChipColors";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
} from "@/entities/order/model/constants";
import {
  isMyOrdersListGroupFilter,
  MY_ORDERS_LIST_FILTER_CLOSED,
  MY_ORDERS_LIST_FILTER_DONE,
  MY_ORDERS_LIST_FILTER_IN_PROGRESS,
} from "@/entities/order/model/myOrdersListFilters";
import { OrderStatusChipRow } from "@/entities/order/ui/OrderStatusChipRow";
import { MY_ORDERS_PAGE_UI } from "@/shared/config";
import { useMyOrdersPageStyles } from "@/shared/theme/myOrdersPageStyles";

const STATUS_FILTER_OPTIONS = ORDER_STATUSES.map((status) => ({
  value: status,
  label: ORDER_STATUS_LABEL_RU[status],
}));

const STATUS_GROUP_OPTIONS = [
  [MY_ORDERS_LIST_FILTER_IN_PROGRESS, MY_ORDERS_PAGE_UI.STATUS_GROUP_IN_PROGRESS],
  [MY_ORDERS_LIST_FILTER_DONE, MY_ORDERS_PAGE_UI.STATUS_GROUP_DONE],
  [MY_ORDERS_LIST_FILTER_CLOSED, MY_ORDERS_PAGE_UI.STATUS_GROUP_CLOSED],
] as const;

type MyOrdersPageToolbarProps = {
  summaryCountLabel: string;
  statusFilter: string;
  attentionOnly: boolean;
  onStatusFilterChange: (value: string) => void;
  onAttentionOnlyChange: (value: boolean) => void;
};

type ChipProps = {
  label: string;
  active: boolean;
  /** Цвет активного точного статуса; у групп — общий. */
  colorKey?: string;
  onPress: () => void;
};

const StatusChip = ({ label, active, colorKey = "", onPress }: ChipProps) => {
  const styles = useMyOrdersPageStyles();
  const activeColors = active
    ? resolveMyOrdersStatusFilterChipActiveColors(colorKey)
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

/**
 * Панель «Моих покупок» (паритет web `OrdersToolbar`): группы статусов
 * и «Ещё статусы» со всеми точными статусами вторым рядом.
 */
export const MyOrdersPageToolbar = ({
  summaryCountLabel,
  statusFilter,
  attentionOnly,
  onStatusFilterChange,
  onAttentionOnlyChange,
}: MyOrdersPageToolbarProps) => {
  const styles = useMyOrdersPageStyles();
  const exactStatusSelected =
    Boolean(statusFilter) && !isMyOrdersListGroupFilter(statusFilter);
  const [showAllStatuses, setShowAllStatuses] = useState(exactStatusSelected);

  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarHead}>
        <Text style={styles.toolbarHeading}>{MY_ORDERS_PAGE_UI.TITLE}</Text>
        <Text style={styles.ordersCount}>{summaryCountLabel}</Text>
      </View>

      <>
        <OrderStatusChipRow accessibilityLabel={MY_ORDERS_PAGE_UI.STATUS_FILTER_LABEL}>
          <StatusChip
            label={MY_ORDERS_PAGE_UI.STATUS_GROUP_ALL}
            active={!statusFilter && !attentionOnly}
            onPress={() => onStatusFilterChange("")}
          />
          <StatusChip
            label={MY_ORDERS_PAGE_UI.STATUS_GROUP_ATTENTION}
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
                ? MY_ORDERS_PAGE_UI.STATUS_LESS
                : MY_ORDERS_PAGE_UI.STATUS_MORE}
            </Text>
          </Pressable>
        </OrderStatusChipRow>

        {showAllStatuses ? (
          <OrderStatusChipRow
            style={styles.statusChipsAll}
            accessibilityLabel={MY_ORDERS_PAGE_UI.STATUS_FILTER_LABEL}
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
      </>
    </View>
  );
};
