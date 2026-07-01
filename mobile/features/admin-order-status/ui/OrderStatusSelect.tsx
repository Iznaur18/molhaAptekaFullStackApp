import { Pressable, Text, View } from "react-native";

import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL_RU,
  type OrderStatus,
} from "@/entities/order/model/constants";
import { ADMIN_ORDERS_PAGE_UI } from "@/shared/config";
import { useOrderStatusSelectStyles } from "@/shared/theme/adminOrdersPageStyles";

type OrderStatusSelectProps = {
  value: string;
  onChange: (nextStatus: OrderStatus) => void;
  isPending: boolean;
  error?: string;
};

export const OrderStatusSelect = ({
  value,
  onChange,
  isPending,
  error = "",
}: OrderStatusSelectProps) => {
  const styles = useOrderStatusSelectStyles();

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{ADMIN_ORDERS_PAGE_UI.STATUS_CHANGE_LABEL}</Text>
      <View style={styles.options}>
        {ORDER_STATUSES.map((status) => {
          const isSelected = value === status;

          return (
            <Pressable
              key={status}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                isPending && styles.optionDisabled,
              ]}
              disabled={isPending}
              onPress={() => onChange(status)}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {ORDER_STATUS_LABEL_RU[status]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {isPending ? (
        <Text style={styles.pending} accessibilityRole="status">
          {ADMIN_ORDERS_PAGE_UI.STATUS_CHANGE_PENDING}
        </Text>
      ) : null}
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
};
