import {
  USER_SOCIAL_LINK_FIELDS,
  USER_SOCIAL_LINK_URL_MAX_LENGTH,
} from "@molha/api-contract";
import { Pressable, Text, TextInput, View } from "react-native";

import type { EditProfileFormState } from "@/entities/user/lib/mapUserToEditProfileForm";
import { EDIT_PROFILE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useEditProfileFormStyles } from "@/shared/theme/editProfileFormStyles";

type EditProfileSocialLinksFieldsProps = {
  form: EditProfileFormState;
  onChange: (fieldId: keyof EditProfileFormState, value: string) => void;
  disabled?: boolean;
};

export const EditProfileSocialLinksFields = ({
  form,
  onChange,
  disabled = false,
}: EditProfileSocialLinksFieldsProps) => {
  const theme = useAppTheme();
  const styles = useEditProfileFormStyles();

  return (
    <View style={{ gap: theme.spacing[3] }}>
      {USER_SOCIAL_LINK_FIELDS.map((field) => {
        const fieldId = field.id as keyof EditProfileFormState;
        const value = String(form[fieldId] ?? "");
        return (
          <View key={field.id} style={styles.field}>
            <Text style={styles.label}>{field.labelRu}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing[2] }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={value}
                onChangeText={(next) => onChange(fieldId, next)}
                placeholder={EDIT_PROFILE_UI.PLACEHOLDER_HTTPS}
                placeholderTextColor={theme.colors.textMuted}
                maxLength={USER_SOCIAL_LINK_URL_MAX_LENGTH}
                editable={!disabled}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {value.trim() !== "" ? (
                <Pressable
                  onPress={() => onChange(fieldId, "")}
                  disabled={disabled}
                  accessibilityLabel={EDIT_PROFILE_UI.CLEAR_SOCIAL_LINK(field.labelRu)}
                  hitSlop={8}
                >
                  <Text style={{ color: theme.colors.link, fontWeight: "600" }}>
                    {EDIT_PROFILE_UI.CLEAR_FIELD}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};
