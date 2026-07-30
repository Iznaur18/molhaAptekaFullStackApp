import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  CHECKOUT_SHIPPING_PROVIDER_SELLER,
  CHECKOUT_SHIPPING_SERVICE_OPTIONS,
  listCheckoutShippingProviderOptions,
  resolveCheckoutShippingProviderLabel,
  SHIPPING_SERVICE_COURIER,
  SHIPPING_SERVICE_PICKUP_POINT,
} from "@/features/checkout/lib/checkoutShippingProviderOptions";
import { CHECKOUT_FORM_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

const SERVICE_LABEL: Record<string, string> = {
  [SHIPPING_SERVICE_COURIER]: CHECKOUT_FORM_UI.SHIPPING_SERVICE_COURIER,
  [SHIPPING_SERVICE_PICKUP_POINT]: CHECKOUT_FORM_UI.SHIPPING_SERVICE_PICKUP_POINT,
};

type CheckoutShippingProviderPickerProps = {
  disabled?: boolean;
};

export const CheckoutShippingProviderPicker = ({
  disabled = false,
}: CheckoutShippingProviderPickerProps) => {
  const theme = useAppTheme();
  const providerOptions = listCheckoutShippingProviderOptions();

  return (
    <View style={styles.root}>
      <Text style={[styles.legend, { color: theme.colors.textSecondary }]}>
        {CHECKOUT_FORM_UI.LABEL_SHIPPING_PROVIDER}
      </Text>
      <View style={styles.wrap} accessibilityRole="radiogroup">
        {providerOptions.map((option) => {
          const isSelected = option.id === CHECKOUT_SHIPPING_PROVIDER_SELLER;
          const isLocked = !option.live;
          const label = resolveCheckoutShippingProviderLabel(option.id, {
            sellerLabel: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER,
          });

          return (
            <Pressable
              key={option.id}
              disabled={disabled || isLocked}
              accessibilityRole="radio"
              accessibilityState={{
                checked: isSelected,
                disabled: disabled || isLocked,
              }}
              accessibilityLabel={
                isLocked
                  ? `${label} (${CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SOON})`
                  : label
              }
              style={[
                styles.card,
                {
                  borderColor: isSelected
                    ? theme.colors.action
                    : isLocked
                      ? theme.colors.border
                      : theme.colors.actionSoft,
                  backgroundColor: isSelected
                    ? theme.colors.surface
                    : isLocked
                      ? theme.colors.surfaceMuted
                      : theme.colors.actionSoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardLabel,
                  {
                    color: isLocked
                      ? theme.colors.textMuted
                      : isSelected
                        ? theme.colors.text
                        : theme.colors.action,
                  },
                ]}
              >
                {label}
                {isLocked
                  ? ` (${CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SOON})`
                  : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={[
          styles.legend,
          styles.legendSub,
          { color: theme.colors.textSecondary },
        ]}
      >
        {CHECKOUT_FORM_UI.LABEL_SHIPPING_SERVICE}
      </Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {CHECKOUT_SHIPPING_SERVICE_OPTIONS.map((option) => {
          const label = SERVICE_LABEL[option.id] ?? option.id;
          return (
            <Pressable
              key={option.id}
              disabled
              accessibilityRole="radio"
              accessibilityState={{ checked: false, disabled: true }}
              style={[
                styles.chip,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceMuted,
                },
              ]}
            >
              <Text style={[styles.chipLabel, { color: theme.colors.textMuted }]}>
                {label} ({CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SOON})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
        {CHECKOUT_FORM_UI.SHIPPING_PROVIDER_HINT}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 10,
    marginTop: 4,
  },
  legend: {
    fontSize: 14,
    fontWeight: "600",
  },
  legendSub: {
    marginTop: 4,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  card: {
    flexGrow: 1,
    flexBasis: "40%",
    minHeight: 72,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  chip: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
