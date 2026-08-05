import { toggleProductDescriptionH1 } from "@izibuy/shared-lib";
import { useRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { CREATE_PRODUCT_UI } from "@/shared/config";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";

type ProductDescriptionFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  textInputProps?: Omit<
    TextInputProps,
    | "value"
    | "onChangeText"
    | "editable"
    | "maxLength"
    | "placeholder"
    | "style"
    | "multiline"
    | "selection"
    | "onSelectionChange"
  >;
};

export function ProductDescriptionField({
  value,
  onChangeText,
  disabled = false,
  maxLength,
  placeholder,
  style,
  inputStyle,
  textInputProps,
}: ProductDescriptionFieldProps) {
  const theme = useAppTheme();
  const selectionRef = useRef({ start: 0, end: 0 });
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  const applyH1 = () => {
    if (disabled) {
      return;
    }
    const { start, end } = selectionRef.current;
    const result = toggleProductDescriptionH1(value, start, end);
    onChangeText(result.value);
    setSelection({
      start: result.selectionStart,
      end: result.selectionEnd,
    });
    requestAnimationFrame(() => {
      setSelection(undefined);
    });
  };

  return (
    <View style={style}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CREATE_PRODUCT_UI.DESCRIPTION_H1_HINT}
          disabled={disabled}
          onPress={applyH1}
          style={({ pressed }) => [
            {
              minHeight: 32,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
              alignItems: "center",
              justifyContent: "center",
              opacity: disabled ? 0.55 : 1,
            },
          ]}
        >
          <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: "700" }}>
            {CREATE_PRODUCT_UI.DESCRIPTION_H1}
          </Text>
        </Pressable>
      </View>
      <TextInput
        {...textInputFocusScrollProps}
        {...textInputProps}
        style={[
          {
            minHeight: 120,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
            textAlignVertical: "top",
          },
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        onSelectionChange={(event) => {
          selectionRef.current = event.nativeEvent.selection;
        }}
        selection={selection}
        multiline
        editable={!disabled}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
      />
    </View>
  );
}
