import { Pressable, StyleSheet, Text, View } from "react-native";

import { CHECKOUT_SAVED_ADDRESS_CUSTOM_ID } from "@/entities/address/lib/deliveryAddressFromSaved";
import { USER_SAVED_ADDRESSES_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

export type SavedAddressPickerItem = {
  id: string;
  label?: string;
  line: string;
  flat?: string;
  isDefault?: boolean;
};

type SavedAddressPickerProps = {
  addresses: SavedAddressPickerItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  /** Ниже этого числа адресов список не показываем. */
  minCount?: number;
  sectionLabel: string;
  otherLabel: string;
};

/**
 * Радиогруппа сохранённых адресов + пункт «указать другой».
 * Порт `client/src/entities/address/ui/SavedAddressPicker.jsx` (+ его CSS).
 */
export const SavedAddressPicker = ({
  addresses,
  selectedId,
  onSelect,
  disabled = false,
  minCount = 1,
  sectionLabel,
  otherLabel,
}: SavedAddressPickerProps) => {
  const theme = useAppTheme();

  if (!Array.isArray(addresses) || addresses.length < minCount) {
    return null;
  }

  const optionStyle = (active: boolean) => [
    styles.option,
    {
      borderColor: active ? theme.colors.action : theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    // Веб добавляет inset-обводку активному пункту — на RN это второй пиксель рамки.
    active && { borderWidth: 2 },
    disabled && styles.optionDisabled,
  ];

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{sectionLabel}</Text>
      <View style={styles.list} accessibilityRole="radiogroup">
        {addresses.map((item) => {
          const active = selectedId === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: active, disabled }}
              disabled={disabled}
              onPress={() => onSelect(item.id)}
              style={optionStyle(active)}
            >
              {item.label ? (
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {item.label}
                </Text>
              ) : null}
              <Text style={[styles.optionLine, { color: theme.colors.text }]}>
                {USER_SAVED_ADDRESSES_UI.FORMAT_LINE(item.line, item.flat ?? "")}
              </Text>
              {item.isDefault ? (
                <Text style={[styles.optionBadge, { color: theme.colors.textSecondary }]}>
                  {USER_SAVED_ADDRESSES_UI.LABEL_DEFAULT}
                </Text>
              ) : null}
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{
            checked: selectedId === CHECKOUT_SAVED_ADDRESS_CUSTOM_ID,
            disabled,
          }}
          disabled={disabled}
          onPress={() => onSelect(CHECKOUT_SAVED_ADDRESS_CUSTOM_ID)}
          style={optionStyle(selectedId === CHECKOUT_SAVED_ADDRESS_CUSTOM_ID)}
        >
          <Text style={[styles.optionLine, { color: theme.colors.text }]}>{otherLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  label: {
    fontSize: 15.2,
    fontWeight: "700",
  },
  list: {
    gap: 8,
  },
  option: {
    gap: 4,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 10,
  },
  optionDisabled: {
    opacity: 0.55,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  optionLine: {
    fontSize: 14,
    lineHeight: 19.6,
  },
  optionBadge: {
    fontSize: 12,
  },
});
