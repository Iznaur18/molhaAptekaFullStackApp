import { Text, TextInput, View } from "react-native";

import { CREATE_PRODUCT_UI } from "@/shared/config";
import { textInputFocusScrollProps } from "@/shared/lib/scrollTextInputIntoViewOnFocus";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

type CreateProductWizardInstagramLinkCardProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export const CreateProductWizardInstagramLinkCard = ({
  value,
  onChange,
  disabled = false,
}: CreateProductWizardInstagramLinkCardProps) => {
  const theme = useAppTheme();
  const styles = useStyles();

  return (
    <View
      style={styles.root}
      accessibilityLabel={CREATE_PRODUCT_UI.WIZARD_MEDIA_INSTAGRAM_TITLE}
    >
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {CREATE_PRODUCT_UI.WIZARD_MEDIA_INSTAGRAM_TITLE}{" "}
        <Text style={{ color: theme.colors.textMuted, fontWeight: "400" }}>
          {CREATE_PRODUCT_UI.WIZARD_MEDIA_INSTAGRAM_OPTIONAL_TAG}
        </Text>
      </Text>
      <TextInput
        {...textInputFocusScrollProps}
        style={[
          styles.input,
          {
            color: theme.colors.text,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceMuted,
          },
        ]}
        value={String(value ?? "")}
        onChangeText={onChange}
        placeholder={CREATE_PRODUCT_UI.WIZARD_MEDIA_INSTAGRAM_PLACEHOLDER}
        placeholderTextColor={theme.colors.textMuted}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        accessibilityLabel={CREATE_PRODUCT_UI.WIZARD_MEDIA_INSTAGRAM_LABEL}
      />
    </View>
  );
};

const useStyles = createThemedStyles(() => ({
  root: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 40,
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10.4,
    fontSize: 15.2,
  },
}));
