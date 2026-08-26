import { Pressable, Text, TextInput, View } from "react-native";

import {
  createProductReturnTermRow,
  PRODUCT_RETURN_TERM_KEY_MAX,
  PRODUCT_RETURN_TERM_VALUE_MAX,
  PRODUCT_RETURN_TERMS_MAX_ITEMS,
  type ProductReturnTermRow,
} from "@/entities/product/lib/productReturnTermRows";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductEditorScreenStyles } from "@/shared/theme/sellerFlowStyles";

type ProductReturnTermsEditorProps = {
  rows: ProductReturnTermRow[];
  onChange: (rows: ProductReturnTermRow[]) => void;
  disabled?: boolean;
};

export const ProductReturnTermsEditor = ({
  rows,
  onChange,
  disabled = false,
}: ProductReturnTermsEditorProps) => {
  const theme = useAppTheme();
  const styles = useProductEditorScreenStyles();

  const addRow = () => {
    if (rows.length >= PRODUCT_RETURN_TERMS_MAX_ITEMS) {
      return;
    }
    onChange([...rows, createProductReturnTermRow()]);
  };

  const removeRow = (id: number) => {
    onChange(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: number, field: "key" | "value", text: string) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, [field]: text } : row)));
  };

  return (
    <View style={styles.returnTermBlock}>
      <Text style={styles.hint}>Пример: возврат в течение — 15 дней</Text>
      {rows.map((row) => (
        <View
          key={row.id}
          style={[
            styles.charRow,
            {
              borderColor: `${theme.colors.border}cc`,
              backgroundColor: theme.colors.surfaceMuted,
            },
          ]}
        >
          <TextInput
            style={[
              styles.charInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: `${theme.colors.border}d9`,
              },
            ]}
            value={row.key}
            onChangeText={(text) => updateRow(row.id, "key", text)}
            editable={!disabled}
            placeholder="Свойство"
            placeholderTextColor={theme.colors.textMuted}
            maxLength={PRODUCT_RETURN_TERM_KEY_MAX}
          />
          <TextInput
            style={[
              styles.charInput,
              styles.charInputValue,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: `${theme.colors.border}d9`,
              },
            ]}
            value={row.value}
            onChangeText={(text) => updateRow(row.id, "value", text)}
            editable={!disabled}
            placeholder="Значение"
            placeholderTextColor={theme.colors.textMuted}
            maxLength={PRODUCT_RETURN_TERM_VALUE_MAX}
          />
          <Pressable
            style={[
              styles.charRemoveBtn,
              {
                borderColor: `${theme.colors.border}d9`,
                backgroundColor: theme.colors.surface,
              },
            ]}
            onPress={() => removeRow(row.id)}
            disabled={disabled}
            accessibilityLabel="Удалить условие возврата"
          >
            <Text style={[styles.charRemoveText, { color: theme.colors.danger }]}>✕</Text>
          </Pressable>
        </View>
      ))}
      {rows.length < PRODUCT_RETURN_TERMS_MAX_ITEMS ? (
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
            + Добавить условие
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};
