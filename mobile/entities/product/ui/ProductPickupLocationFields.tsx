import {
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  PRODUCT_PICKUP_ADDRESS_MAX_LENGTH,
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDERS,
} from "@molha/api-contract";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import { PRODUCT_PICKUP_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useFormFieldStyles } from "@/shared/theme/formChromeStyles";

import type { RuDeliveryAddressValue } from "@/entities/address/model/types";

export type ProductPickupLocationValue = {
  productPickupAddress: string;
  productPickupLat: number | null;
  productPickupLon: number | null;
  productPickupEnabled: boolean;
  productDeliveryEnabled: boolean;
  productRegionCode?: string | null;
  productPickupSelectedFromSuggest?: boolean;
};

type ProductPickupLocationFieldsProps = {
  address: string;
  lat: number | null;
  lon: number | null;
  pickupEnabled?: boolean;
  deliveryEnabled?: boolean;
  disabled?: boolean;
  selectedFromSuggest?: boolean;
  onChange: (next: ProductPickupLocationValue) => void;
};

const toAddressValue = (
  address: string,
  lat: number | null,
  lon: number | null,
  selectedFromSuggest: boolean,
): RuDeliveryAddressValue => ({
  line: address,
  flat: "",
  fiasId: "",
  geo: lat != null && lon != null ? { lat, lon } : null,
  selectedFromSuggest,
});

export const ProductPickupLocationFields = ({
  address,
  lat,
  lon,
  pickupEnabled = true,
  deliveryEnabled = false,
  disabled = false,
  selectedFromSuggest = false,
  onChange,
}: ProductPickupLocationFieldsProps) => {
  const theme = useAppTheme();
  const fieldStyles = useFormFieldStyles();

  const emit = (patch: Partial<ProductPickupLocationValue>) => {
    onChange({
      productPickupAddress: address,
      productPickupLat: lat,
      productPickupLon: lon,
      productPickupEnabled: pickupEnabled,
      productDeliveryEnabled: deliveryEnabled,
      productPickupSelectedFromSuggest: selectedFromSuggest,
      ...patch,
    });
  };

  const deliverySelectable = PRODUCT_DELIVERY_FULFILLMENT_ENABLED && !disabled;

  const togglePickup = () => {
    if (disabled) {
      return;
    }
    if (pickupEnabled && !deliveryEnabled) {
      return;
    }
    emit({ productPickupEnabled: !pickupEnabled });
  };

  const toggleDelivery = () => {
    if (!deliverySelectable) {
      return;
    }
    if (deliveryEnabled && !pickupEnabled) {
      return;
    }
    emit({ productDeliveryEnabled: !deliveryEnabled });
  };

  const methodsHint =
    pickupEnabled && deliveryEnabled
      ? PRODUCT_PICKUP_UI.METHODS_BOTH_HINT
      : deliveryEnabled
        ? PRODUCT_PICKUP_UI.DELIVERY_CARRIERS_HINT
        : PRODUCT_PICKUP_UI.PICKUP_HINT;

  return (
    <View style={styles.wrap}>
      <Text style={fieldStyles.labelStrong}>
        {PRODUCT_PICKUP_UI.FULFILLMENT_LEGEND}
      </Text>

      <View style={styles.methods}>
        <MethodCheckRow
          label={PRODUCT_PICKUP_UI.FULFILLMENT_PICKUP}
          checked={pickupEnabled}
          disabled={disabled || (pickupEnabled && !deliveryEnabled)}
          onPress={togglePickup}
          theme={theme}
        />
        <MethodCheckRow
          label={
            PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY +
            (!PRODUCT_DELIVERY_FULFILLMENT_ENABLED ? PRODUCT_PICKUP_UI.SOON_BADGE : "")
          }
          checked={deliveryEnabled}
          disabled={!deliverySelectable || (deliveryEnabled && !pickupEnabled)}
          soon={!PRODUCT_DELIVERY_FULFILLMENT_ENABLED}
          onPress={toggleDelivery}
          theme={theme}
        />
      </View>

      <Text style={[styles.sublegend, { color: theme.colors.textSecondary }]}>
        {PRODUCT_PICKUP_UI.CARRIERS_LEGEND}
      </Text>
      <View style={styles.methods}>
        {SHIPPING_PROVIDERS.map((providerId) => (
          <MethodCheckRow
            key={providerId}
            label={
              (SHIPPING_PROVIDER_LABEL_RU[providerId] ?? providerId) +
              PRODUCT_PICKUP_UI.SOON_BADGE
            }
            checked={false}
            disabled
            soon
            onPress={() => {}}
            theme={theme}
          />
        ))}
      </View>

      <Text style={fieldStyles.hint}>{PRODUCT_PICKUP_UI.METHODS_REQUIRED_HINT}</Text>
      <Text style={fieldStyles.hint}>{methodsHint}</Text>

      <AddressSuggestInput
        value={toAddressValue(address, lat, lon, selectedFromSuggest)}
        onChange={(next) => {
          emit({
            productPickupAddress: next.line,
            productPickupLat: next.geo?.lat ?? null,
            productPickupLon: next.geo?.lon ?? null,
            productRegionCode: next.regionCode ?? null,
            productPickupSelectedFromSuggest: next.selectedFromSuggest === true,
          });
        }}
        disabled={disabled}
        label={
          pickupEnabled
            ? PRODUCT_PICKUP_UI.ADDRESS_LABEL
            : PRODUCT_PICKUP_UI.ADDRESS_LABEL_WAREHOUSE
        }
        maxLength={PRODUCT_PICKUP_ADDRESS_MAX_LENGTH}
      />
    </View>
  );
};

function MethodCheckRow({
  label,
  checked,
  disabled,
  soon = false,
  onPress,
  theme,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  soon?: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.checkRow,
        {
          borderColor: checked ? theme.colors.action : theme.colors.border,
          backgroundColor: theme.colors.surfaceMuted,
          opacity: disabled || soon ? 0.72 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? theme.colors.action : theme.colors.border,
            backgroundColor: checked ? theme.colors.action : "transparent",
          },
        ]}
      >
        {checked ? (
          <Text style={[styles.tick, { color: theme.colors.onContrast }]}>✓</Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.checkLabel,
          {
            color: disabled || soon ? theme.colors.textMuted : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  methods: {
    gap: 8,
  },
  sublegend: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  box: {
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  tick: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
  },
  checkLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
});
