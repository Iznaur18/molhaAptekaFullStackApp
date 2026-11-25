import {
  CATEGORY_DEAL_TYPE_SERVICE,
  PRODUCT_SERVICE_LOCATION_LABELS_RU,
  PRODUCT_SERVICE_LOCATIONS,
  PRODUCT_SERVICE_PRICE_MODE_LABELS_RU,
  PRODUCT_SERVICE_PRICE_MODE_NEGOTIABLE,
  PRODUCT_SERVICE_PRICE_MODES,
  PRODUCT_SERVICE_PRICE_UNIT_LABELS_RU,
  PRODUCT_SERVICE_PRICE_UNITS,
  normalizeProductServiceLocations,
  normalizeProductServicePriceMode,
  normalizeProductServicePriceUnit,
} from "@molha/api-contract";
import { Pressable, Text, View } from "react-native";

import { PRODUCT_DEAL_TERMS_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { CheckboxBox } from "@/shared/ui/AppCheckbox";

type DealType = "goods" | "viewing" | "service";
type ServiceLocation = (typeof PRODUCT_SERVICE_LOCATIONS)[number];

type CreateProductDealTermsFieldsProps = {
  dealType: DealType;
  form: Record<string, unknown>;
  setForm: (updater: (prev: any) => any) => void;
  disabled?: boolean;
};

export const CreateProductDealTermsFields = ({
  dealType,
  form,
  setForm,
  disabled = false,
}: CreateProductDealTermsFieldsProps) => {
  const theme = useAppTheme();
  const styles = useStyles();

  if (dealType !== CATEGORY_DEAL_TYPE_SERVICE) {
    return null;
  }

  const priceMode = normalizeProductServicePriceMode(form.productServicePriceMode);
  const priceUnit = normalizeProductServicePriceUnit(form.productServicePriceUnit);
  const locations = normalizeProductServiceLocations(form.productServiceLocations);

  const patchForm = (patch: Record<string, unknown>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const toggleLocation = (location: ServiceLocation) => {
    const next = locations.includes(location)
      ? locations.filter((value) => value !== location)
      : [...locations, location];
    patchForm({ productServiceLocations: normalizeProductServiceLocations(next) });
  };

  return (
    <View
      style={styles.root}
      accessibilityLabel={PRODUCT_DEAL_TERMS_UI.SECTION_TITLE.service}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {PRODUCT_DEAL_TERMS_UI.SECTION_TITLE.service}
      </Text>

      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
        {PRODUCT_DEAL_TERMS_UI.PRICE_MODE_LABEL}
      </Text>
      <View style={styles.chipRow}>
        {PRODUCT_SERVICE_PRICE_MODES.map((value) => {
          const active = priceMode === value;
          return (
            <Pressable
              key={value}
              disabled={disabled}
              onPress={() => patchForm({ productServicePriceMode: value })}
              style={[
                styles.chip,
                {
                  borderColor: active ? theme.colors.action : theme.colors.border,
                  backgroundColor: active
                    ? theme.colors.actionSoft
                    : theme.colors.surface,
                },
                disabled ? styles.disabled : null,
              ]}
            >
              <Text
                style={{
                  color: active ? theme.colors.action : theme.colors.text,
                  fontWeight: active ? "700" : "500",
                  fontSize: 14,
                }}
              >
                {PRODUCT_SERVICE_PRICE_MODE_LABELS_RU[value]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {priceMode === PRODUCT_SERVICE_PRICE_MODE_NEGOTIABLE ? (
        <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
          {PRODUCT_DEAL_TERMS_UI.PRICE_NEGOTIABLE_HINT}
        </Text>
      ) : (
        <>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            {PRODUCT_DEAL_TERMS_UI.PRICE_UNIT_LABEL}
          </Text>
          <View style={styles.chipRow}>
            {PRODUCT_SERVICE_PRICE_UNITS.map((value) => {
              const active = priceUnit === value;
              return (
                <Pressable
                  key={value}
                  disabled={disabled}
                  onPress={() => patchForm({ productServicePriceUnit: value })}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? theme.colors.action : theme.colors.border,
                      backgroundColor: active
                        ? theme.colors.actionSoft
                        : theme.colors.surface,
                    },
                    disabled ? styles.disabled : null,
                  ]}
                >
                  <Text
                    style={{
                      color: active ? theme.colors.action : theme.colors.text,
                      fontWeight: active ? "700" : "500",
                      fontSize: 14,
                    }}
                  >
                    {PRODUCT_SERVICE_PRICE_UNIT_LABELS_RU[value]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
        {PRODUCT_DEAL_TERMS_UI.LOCATIONS_LABEL}
      </Text>
      <View style={styles.checkList}>
        {PRODUCT_SERVICE_LOCATIONS.map((value) => {
          const label = PRODUCT_SERVICE_LOCATION_LABELS_RU[value];
          return (
            <Pressable
              key={value}
              disabled={disabled}
              onPress={() => toggleLocation(value)}
              style={[styles.checkRow, disabled ? styles.disabled : null]}
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: locations.includes(value),
                disabled,
              }}
              accessibilityLabel={label}
            >
              <CheckboxBox checked={locations.includes(value)} disabled={disabled} />
              <Text style={{ color: theme.colors.text, fontSize: 15, flex: 1 }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const useStyles = createThemedStyles((theme) => ({
  root: {
    gap: 13.6,
    paddingVertical: 14.4,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceMuted,
  },
  title: {
    fontSize: 15.2,
    fontWeight: "700",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  hint: {
    fontSize: 13.6,
    lineHeight: 19,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkList: {
    gap: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8.8,
  },
  disabled: {
    opacity: 0.55,
  },
}));
