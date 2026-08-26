import {
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  PRODUCT_PICKUP_ADDRESS_MAX_LENGTH,
  PRODUCT_PICKUP_LOCATIONS_MAX,
  SHIPPING_PROVIDER_LABEL_RU,
  SHIPPING_PROVIDERS,
} from "@molha/api-contract";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { createUserSavedAddressId } from "@/entities/address/lib/createUserSavedAddressId";
import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import {
  SavedAddressPicker,
  type SavedAddressPickerItem,
} from "@/entities/address/ui/SavedAddressPicker";
import {
  canAddPickupLocationAddress,
  canUseSavedAddressAsPickupLocation,
  manualPickupLocations,
  normalizePickupLocations,
  pickupLocationsFromSelectedAddresses,
  type ProductPickupLocationValue as PickupPointValue,
} from "@/entities/product/lib/productPickupLocationsFromSavedAddresses";
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
  addressLineDisplayOnly?: boolean;
  onChange: (next: ProductPickupLocationValue) => void;
  /** Книга адресов профиля — из неё продавец отмечает точки самовывоза. */
  savedAddresses?: SavedAddressPickerItem[];
  pickupLocations?: PickupPointValue[];
  onPickupLocationsChange?: (next: PickupPointValue[]) => void;
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
  addressLineDisplayOnly = false,
  onChange,
  savedAddresses = [],
  pickupLocations = [],
  onPickupLocationsChange,
}: ProductPickupLocationFieldsProps) => {
  const theme = useAppTheme();
  const fieldStyles = useFormFieldStyles();

  const showSavedAddresses =
    typeof onPickupLocationsChange === "function" && savedAddresses.length > 0;
  const selectedPointIds = pickupLocations.map((item) => item.id);
  const defaultPointId = pickupLocations.find((item) => item.isDefault)?.id ?? null;

  /** Точки, добавленные вручную — их нельзя терять при клике по книге. */
  const manualPoints = manualPickupLocations(pickupLocations, savedAddresses);

  const commitPoints = (nextPoints: PickupPointValue[]) => {
    onPickupLocationsChange?.(normalizePickupLocations(nextPoints, defaultPointId));
  };

  const togglePickupPoint = (id: string) => {
    if (disabled) {
      return;
    }
    const nextIds = selectedPointIds.includes(id)
      ? selectedPointIds.filter((item) => item !== id)
      : [...selectedPointIds, id];
    const fromBook = pickupLocationsFromSelectedAddresses(
      savedAddresses,
      nextIds,
      defaultPointId,
    );
    commitPoints([...fromBook, ...manualPoints]);
  };

  const canAddTypedAddress =
    !disabled && canAddPickupLocationAddress(pickupLocations, address, lat, lon);

  /** Набранный в поле адрес становится ещё одной точкой — как «добавить» в вебе. */
  const addTypedAddressAsPoint = () => {
    if (!canAddTypedAddress || lat == null || lon == null) {
      return;
    }
    commitPoints([
      ...pickupLocations,
      {
        id: createUserSavedAddressId(),
        label: "",
        address: address.trim(),
        lat,
        lon,
        isDefault: pickupLocations.length === 0,
      },
    ]);
  };

  const removePickupPoint = (id: string) => {
    if (disabled) {
      return;
    }
    commitPoints(pickupLocations.filter((item) => item.id !== id));
  };

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

  return (
    <View style={styles.wrap}>
      {showSavedAddresses ? (
        <View style={styles.savedBlock}>
          <SavedAddressPicker
            addresses={savedAddresses}
            multiSelect
            selectedIds={selectedPointIds}
            onToggle={togglePickupPoint}
            // Радио-часть в этом режиме не используется.
            selectedId=""
            onSelect={() => {}}
            disabled={disabled}
            sectionLabel={PRODUCT_PICKUP_UI.SAVED_ADDRESSES_LABEL}
            isOptionDisabled={(id) => {
              const item = savedAddresses.find((address) => address.id === id);
              return !canUseSavedAddressAsPickupLocation(item);
            }}
            optionHint={(id) => {
              const item = savedAddresses.find((address) => address.id === id);
              if (!canUseSavedAddressAsPickupLocation(item)) {
                return PRODUCT_PICKUP_UI.LOCATION_NEEDS_COORDS;
              }
              return id === defaultPointId ? PRODUCT_PICKUP_UI.LOCATION_DEFAULT : null;
            }}
          />
          <Text style={fieldStyles.hint}>{PRODUCT_PICKUP_UI.PICKUP_MULTI_HINT}</Text>
        </View>
      ) : null}

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
        displayOnly={addressLineDisplayOnly}
        label={
          pickupEnabled
            ? PRODUCT_PICKUP_UI.ADDRESS_LABEL
            : PRODUCT_PICKUP_UI.ADDRESS_LABEL_WAREHOUSE
        }
        maxLength={PRODUCT_PICKUP_ADDRESS_MAX_LENGTH}
      />

      {typeof onPickupLocationsChange === "function" ? (
        <View style={styles.savedBlock}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canAddTypedAddress }}
            disabled={!canAddTypedAddress}
            onPress={addTypedAddressAsPoint}
            style={[
              styles.addPointButton,
              { borderColor: theme.colors.action },
              !canAddTypedAddress && styles.addPointDisabled,
            ]}
          >
            <Text style={[styles.addPointText, { color: theme.colors.action }]}>
              {PRODUCT_PICKUP_UI.ADD_LOCATION}
            </Text>
          </Pressable>

          {manualPoints.length > 0 ? (
            <View style={styles.savedBlock}>
              {manualPoints.map((point) => (
                <View
                  key={point.id}
                  style={[styles.manualPoint, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.manualPointLine, { color: theme.colors.text }]}>
                    {point.address}
                  </Text>
                  {point.isDefault ? (
                    <Text
                      style={[styles.manualPointHint, { color: theme.colors.textSecondary }]}
                    >
                      {PRODUCT_PICKUP_UI.LOCATION_DEFAULT}
                    </Text>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    disabled={disabled}
                    onPress={() => removePickupPoint(point.id)}
                    style={styles.manualPointRemove}
                  >
                    <Text style={{ color: theme.colors.danger }}>
                      {PRODUCT_PICKUP_UI.REMOVE_LOCATION}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          {pickupLocations.length >= PRODUCT_PICKUP_LOCATIONS_MAX ? (
            <Text style={fieldStyles.hint}>
              {PRODUCT_PICKUP_UI.LOCATIONS_MAX(PRODUCT_PICKUP_LOCATIONS_MAX)}
            </Text>
          ) : null}
        </View>
      ) : null}

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
  savedBlock: {
    gap: 6,
  },
  addPointButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 10,
  },
  addPointDisabled: {
    opacity: 0.5,
  },
  addPointText: {
    fontSize: 15,
    fontWeight: "600",
  },
  manualPoint: {
    gap: 4,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  manualPointLine: {
    fontSize: 14,
    lineHeight: 19.6,
  },
  manualPointHint: {
    fontSize: 12,
  },
  manualPointRemove: {
    alignSelf: "flex-end",
    paddingVertical: 4,
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
