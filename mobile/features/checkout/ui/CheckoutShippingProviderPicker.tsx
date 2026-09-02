import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  CHECKOUT_SHIPPING_PROVIDER_SELLER,
  hasCheckoutLiveCarrierProviders,
  listCheckoutShippingProviderOptions,
  listCheckoutShippingServiceOptions,
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
  const serviceOptions = listCheckoutShippingServiceOptions();
  const showCarrierServices =
    hasCheckoutLiveCarrierProviders() && serviceOptions.length > 0;

  return (
    <View style={styles.root}>
      <Text style={[styles.legend, { color: theme.colors.textSecondary }]}>
        {CHECKOUT_FORM_UI.LABEL_SHIPPING_PROVIDER}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.wrap}
        accessibilityRole="radiogroup"
      >
        {providerOptions.map((option) => {
          const isSelected = option.id === CHECKOUT_SHIPPING_PROVIDER_SELLER;
          const label = resolveCheckoutShippingProviderLabel(option.id, {
            sellerLabel: CHECKOUT_FORM_UI.SHIPPING_PROVIDER_SELLER,
          });

          return (
            <Pressable
              key={option.id}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{
                checked: isSelected,
                disabled,
              }}
              accessibilityLabel={label}
              style={[
                styles.card,
                {
                  borderColor: isSelected ? theme.colors.action : theme.colors.actionSoft,
                  backgroundColor: isSelected ? theme.colors.surface : theme.colors.actionSoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardLabel,
                  {
                    color: isSelected ? theme.colors.text : theme.colors.action,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {showCarrierServices ? (
        <>
          <Text
            style={[
              styles.legend,
              styles.legendSub,
              { color: theme.colors.textSecondary },
            ]}
          >
            {CHECKOUT_FORM_UI.LABEL_SHIPPING_SERVICE}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            accessibilityRole="radiogroup"
          >
            {serviceOptions.map((option) => {
              const label = SERVICE_LABEL[option.id] ?? option.id;
              return (
                <Pressable
                  key={option.id}
                  disabled={disabled}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: false, disabled }}
                  style={[
                    styles.chip,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                    },
                  ]}
                >
                  <Text style={[styles.chipLabel, { color: theme.colors.text }]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}

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
    gap: 12,
    paddingRight: 4,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 4,
  },
  card: {
    width: 116,
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
    minWidth: 120,
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
