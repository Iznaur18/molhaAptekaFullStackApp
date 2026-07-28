import {
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  PRODUCT_PICKUP_ADDRESS_MAX_LENGTH,
} from "@molha/api-contract";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import { isYandexMapsApiKeyConfigured } from "@/entities/maps/lib/yandexMapsApiKey";
import { PRODUCT_PICKUP_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useFormFieldStyles } from "@/shared/theme/formChromeStyles";

import type { RuDeliveryAddressValue } from "@/entities/address/model/types";

export type ProductPickupLocationValue = {
  productPickupAddress: string;
  productPickupLat: number | null;
  productPickupLon: number | null;
  productDeliveryEnabled: boolean;
};

type ProductPickupLocationFieldsProps = {
  address: string;
  lat: number | null;
  lon: number | null;
  disabled?: boolean;
  onChange: (next: ProductPickupLocationValue) => void;
};

const toAddressValue = (
  address: string,
  lat: number | null,
  lon: number | null,
): RuDeliveryAddressValue => ({
  line: address,
  flat: "",
  fiasId: "",
  geo: lat != null && lon != null ? { lat, lon } : null,
  selectedFromSuggest: false,
});

export const ProductPickupLocationFields = ({
  address,
  lat,
  lon,
  disabled = false,
  onChange,
}: ProductPickupLocationFieldsProps) => {
  const theme = useAppTheme();
  const fieldStyles = useFormFieldStyles();

  const emit = (patch: Partial<ProductPickupLocationValue>) => {
    onChange({
      productPickupAddress: address,
      productPickupLat: lat,
      productPickupLon: lon,
      productDeliveryEnabled: false,
      ...patch,
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={fieldStyles.labelStrong}>{PRODUCT_PICKUP_UI.FULFILLMENT_LEGEND}</Text>

      <View style={styles.choiceRow}>
        <View
          style={[
            styles.choiceChip,
            {
              borderColor: theme.colors.action,
              backgroundColor: theme.colors.action,
            },
          ]}
        >
          <Text style={[styles.choiceChipText, { color: theme.colors.onContrast }]}>
            {PRODUCT_PICKUP_UI.FULFILLMENT_PICKUP}
          </Text>
        </View>

        <Pressable
          disabled={!PRODUCT_DELIVERY_FULFILLMENT_ENABLED || disabled}
          style={[
            styles.choiceChip,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surfaceMuted,
              opacity: 0.7,
            },
          ]}
        >
          <Text style={[styles.choiceChipText, { color: theme.colors.textMuted }]}>
            {PRODUCT_PICKUP_UI.FULFILLMENT_DELIVERY}
            {PRODUCT_PICKUP_UI.SOON_BADGE}
          </Text>
        </Pressable>
      </View>

      <Text style={fieldStyles.hint}>{PRODUCT_PICKUP_UI.PICKUP_HINT}</Text>

      <AddressSuggestInput
        value={toAddressValue(address, lat, lon)}
        onChange={(next) => {
          emit({
            productPickupAddress: next.line,
            productPickupLat: next.geo?.lat ?? null,
            productPickupLon: next.geo?.lon ?? null,
          });
        }}
        disabled={disabled}
        label={PRODUCT_PICKUP_UI.ADDRESS_LABEL}
        maxLength={PRODUCT_PICKUP_ADDRESS_MAX_LENGTH}
      />

      <Text style={fieldStyles.hint}>
        {isYandexMapsApiKeyConfigured()
          ? PRODUCT_PICKUP_UI.MAP_ARIA
          : PRODUCT_PICKUP_UI.MAP_KEY_MISSING}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  choiceRow: {
    flexDirection: "row",
    gap: 10,
  },
  choiceChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  choiceChipText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
