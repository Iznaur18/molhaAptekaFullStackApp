import {
  SELLER_DELIVERY_BASE_FEE_MAX_RUB,
  SELLER_DELIVERY_FREE_FROM_MAX_RUB,
  SELLER_DELIVERY_PER_KM_MAX_RUB,
} from "@molha/api-contract";
import { Pressable, Text, TextInput, View } from "react-native";

import type { SellerDeliveryTariff } from "@/entities/seller-commerce-defaults/api/sellerCommerceDefaultsApi";
import { SELLER_COMMERCE_DEFAULTS_UI } from "@/shared/config";
import { useDeliveryPaymentPageStyles } from "@/shared/theme/deliveryPaymentPageStyles";

type SellerDeliveryTariffFieldsProps = {
  value: SellerDeliveryTariff;
  onChange: (next: SellerDeliveryTariff) => void;
  disabled?: boolean;
};

const toRub = (value: string): number => {
  const parsed = Math.floor(Number(String(value ?? "").replace(/\s/g, "")));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const rubInputValue = (value: number): string => {
  const rub = Number(value) || 0;
  return rub > 0 ? String(rub) : "";
};

export const SellerDeliveryTariffFields = ({
  value,
  onChange,
  disabled = false,
}: SellerDeliveryTariffFieldsProps) => {
  const styles = useDeliveryPaymentPageStyles();
  const tariff: SellerDeliveryTariff = {
    paid: value?.paid === true,
    baseFeeRub: Number(value?.baseFeeRub) || 0,
    perKmRub: Number(value?.perKmRub) || 0,
    freeFromRub: Number(value?.freeFromRub) || 0,
  };

  const patch = (next: Partial<SellerDeliveryTariff>) =>
    onChange({ ...tariff, ...next });

  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.blockHint}>
        {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_ONLY_OWN_HINT}
      </Text>

      <View style={styles.tariffModes}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: !tariff.paid, disabled }}
          disabled={disabled}
          onPress={() => patch({ paid: false })}
          style={[styles.tariffMode, !tariff.paid && styles.tariffModeOn]}
        >
          <Text
            style={[styles.tariffModeText, !tariff.paid && styles.tariffModeTextOn]}
          >
            {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_FREE}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: tariff.paid, disabled }}
          disabled={disabled}
          onPress={() => patch({ paid: true })}
          style={[styles.tariffMode, tariff.paid && styles.tariffModeOn]}
        >
          <Text style={[styles.tariffModeText, tariff.paid && styles.tariffModeTextOn]}>
            {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_PAID}
          </Text>
        </Pressable>
      </View>

      {tariff.paid ? (
        <View style={styles.tariffGrid}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_BASE_FEE_LABEL}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={rubInputValue(tariff.baseFeeRub)}
              editable={!disabled}
              maxLength={String(SELLER_DELIVERY_BASE_FEE_MAX_RUB).length}
              onChangeText={(text) => patch({ baseFeeRub: toRub(text) })}
            />
            <Text style={styles.fieldHint}>
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_BASE_FEE_HINT}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_PER_KM_LABEL}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={rubInputValue(tariff.perKmRub)}
              editable={!disabled}
              maxLength={String(SELLER_DELIVERY_PER_KM_MAX_RUB).length}
              onChangeText={(text) => patch({ perKmRub: toRub(text) })}
            />
            <Text style={styles.fieldHint}>
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_PER_KM_HINT}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_FREE_FROM_LABEL}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={rubInputValue(tariff.freeFromRub)}
              editable={!disabled}
              maxLength={String(SELLER_DELIVERY_FREE_FROM_MAX_RUB).length}
              onChangeText={(text) => patch({ freeFromRub: toRub(text) })}
            />
            <Text style={styles.fieldHint}>
              {SELLER_COMMERCE_DEFAULTS_UI.TARIFF_FREE_FROM_HINT}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};
