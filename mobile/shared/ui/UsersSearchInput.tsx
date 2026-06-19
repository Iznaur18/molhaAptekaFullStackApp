import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { USER_SEARCH_INPUT_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useUsersSearchInputStyles } from "@/shared/theme/usersSearchInputStyles";

type UsersSearchInputProps = {
  value: string;
  onChange: (next: string) => void;
  isPending?: boolean;
};

export const UsersSearchInput = ({
  value,
  onChange,
  isPending = false,
}: UsersSearchInputProps) => {
  const styles = useUsersSearchInputStyles();
  const theme = useAppTheme();
  const showClearButton = value.length > 0;

  return (
    <View style={styles.root} accessibilityRole="search">
      <TextInput
        style={styles.field}
        value={value}
        onChangeText={onChange}
        placeholder={USER_SEARCH_INPUT_UI.PLACEHOLDER}
        placeholderTextColor={theme.colors.textMuted}
        accessibilityLabel={USER_SEARCH_INPUT_UI.ARIA_LABEL}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
      />
      {showClearButton ? (
        <Pressable
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel={USER_SEARCH_INPUT_UI.CLEAR_ARIA}
          onPress={() => onChange("")}
        >
          <Text style={styles.clearText}>×</Text>
        </Pressable>
      ) : null}
      {isPending ? (
        <ActivityIndicator
          style={styles.spinner}
          size="small"
          color={theme.colors.action}
          accessibilityLabel={USER_SEARCH_INPUT_UI.PENDING_ARIA}
        />
      ) : null}
    </View>
  );
};
