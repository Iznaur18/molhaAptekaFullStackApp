import { Pressable, Text, TextInput, View } from "react-native";
import {
  PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
  PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
  PRODUCT_CHARACTERISTICS_MAX_ITEMS,
} from "@molha/api-contract";

import {
  createProductCharacteristicRow,
  type ProductCharacteristicRow,
} from "@/entities/product/lib/productCharacteristicRows";
import { CREATE_PRODUCT_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductEditorScreenStyles } from "@/shared/theme/sellerFlowStyles";

type ProductCharacteristicsEditorProps = {
  rows: ProductCharacteristicRow[];
  onChange: (rows: ProductCharacteristicRow[]) => void;
  disabled?: boolean;
};

export const ProductCharacteristicsEditor = ({
  rows,
  onChange,
  disabled = false,
}: ProductCharacteristicsEditorProps) => {
  const theme = useAppTheme();
  const styles = useProductEditorScreenStyles();

  const addRow = () => {
    if (rows.length >= PRODUCT_CHARACTERISTICS_MAX_ITEMS) {
      return;
    }
    onChange([...rows, createProductCharacteristicRow()]);
  };

  const removeRow = (id: number) => {
    onChange(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: number, field: "key" | "value", text: string) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, [field]: text } : row)));
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{CREATE_PRODUCT_UI.LABEL_CHARACTERISTICS}</Text>
      {rows.map((row) => (
        <View
          key={row.id}
          style={[
            styles.charRow,
            {
              borderColor: `${theme.colors.border}cc`,
              backgroundColor: theme.colors.surfaceElevated,
            },
          ]}
        >
          <TextInput
            style={[
              styles.charInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            value={row.key}
            onChangeText={(text) => updateRow(row.id, "key", text)}
            editable={!disabled}
            placeholder={CREATE_PRODUCT_UI.CHARACTERISTIC_KEY_PLACEHOLDER}
            placeholderTextColor={theme.colors.textMuted}
            maxLength={PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS}
          />
          <TextInput
            style={[
              styles.charInput,
              styles.charInputValue,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            value={row.value}
            onChangeText={(text) => updateRow(row.id, "value", text)}
            editable={!disabled}
            placeholder={CREATE_PRODUCT_UI.CHARACTERISTIC_VALUE_PLACEHOLDER}
            placeholderTextColor={theme.colors.textMuted}
            maxLength={PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS}
          />
          <Pressable
            style={[styles.charRemoveBtn, { borderColor: theme.colors.border }]}
            onPress={() => removeRow(row.id)}
            disabled={disabled}
            accessibilityLabel={CREATE_PRODUCT_UI.REMOVE_CHARACTERISTIC}
          >
            <Text style={[styles.charRemoveText, { color: theme.colors.danger }]}>✕</Text>
          </Pressable>
        </View>
      ))}
      {rows.length < PRODUCT_CHARACTERISTICS_MAX_ITEMS ? (
        <Pressable
          style={({ pressed }) => [
            styles.charAddButton,
            {
              borderColor: pressed ? theme.colors.action : theme.colors.actionBorder,
              backgroundColor: pressed ? theme.colors.actionSoft : theme.colors.actionSurface,
            },
          ]}
          onPress={addRow}
          disabled={disabled}
        >
          <Text style={[styles.charAddButtonText, { color: theme.colors.action }]}>
            {CREATE_PRODUCT_UI.ADD_CHARACTERISTIC}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};
