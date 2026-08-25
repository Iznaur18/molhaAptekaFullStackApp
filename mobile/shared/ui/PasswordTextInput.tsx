import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AUTH_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import {
  PASSWORD_TOGGLE_ICON_SIZE,
  useLoginScreenStyles,
} from "@/shared/theme/formChromeStyles";

type PasswordTextInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  accessibilityLabel?: string;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
};

const resolvePasswordAutoComplete = (
  textContentType: TextInputProps["textContentType"],
  autoComplete: TextInputProps["autoComplete"],
): TextInputProps["autoComplete"] => {
  if (autoComplete) {
    return autoComplete;
  }
  if (textContentType === "newPassword") {
    return "new-password";
  }
  return "password";
};

export const PasswordTextInput = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  placeholder = AUTH_UI.PASSWORD_PLACEHOLDER,
  textContentType = "password",
  autoComplete,
  returnKeyType,
  onSubmitEditing,
  accessibilityLabel = AUTH_UI.PASSWORD_LABEL,
  editable = true,
  style,
}: PasswordTextInputProps) => {
  const styles = useLoginScreenStyles();
  const theme = useAppTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const toggleAria = isVisible ? AUTH_UI.HIDE_PASSWORD_ARIA : AUTH_UI.SHOW_PASSWORD_ARIA;
  const resolvedAutoComplete = resolvePasswordAutoComplete(textContentType, autoComplete);

  return (
    <View
      style={[styles.passwordWrap, isFocused && styles.passwordWrapFocused, style]}
      // Не даём web-оверлею кнопки перехватывать hit-test у input.
      pointerEvents="box-none"
    >
      <TextInput
        style={styles.passwordInput}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        secureTextEntry={!isVisible}
        textContentType={textContentType}
        autoComplete={resolvedAutoComplete}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        showSoftInputOnFocus
        caretHidden={false}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={accessibilityLabel}
      />
      <Pressable
        style={styles.passwordToggle}
        onPress={() => setIsVisible((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={toggleAria}
        hitSlop={8}
        disabled={!editable}
        tabIndex={-1}
        focusable={false}
      >
        <MaterialIcons
          name={isVisible ? "visibility-off" : "visibility"}
          size={PASSWORD_TOGGLE_ICON_SIZE}
          color={theme.colors.textMuted}
          pointerEvents="none"
        />
      </Pressable>
    </View>
  );
};
