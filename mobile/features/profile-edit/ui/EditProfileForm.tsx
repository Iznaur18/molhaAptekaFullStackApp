import { useMemo, useState } from "react";
import { ScrollView, Switch, Text, TextInput, View } from "react-native";

import { buildPatchUserProfileBody } from "@/entities/user/lib/buildPatchUserProfileBody";
import {
  mapUserToEditProfileForm,
  type EditProfileFormState,
} from "@/entities/user/lib/mapUserToEditProfileForm";
import { limitRuPhoneInput } from "@/entities/user/lib/ruPhone";
import { validateEditProfileForm } from "@/entities/user/lib/validateEditProfileForm";
import { usePatchUserProfileMutation } from "@/entities/user/model/usePatchUserProfileMutation";
import { ProfileAvatarUpload } from "@/features/image-upload/ui/ProfileAvatarUpload";
import { EDIT_PROFILE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useFormFieldStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";

type EditProfileFormProps = {
  user: Record<string, unknown> & { _id: string; email?: string };
  onSaved?: () => void;
};

export const EditProfileForm = ({ user, onSaved }: EditProfileFormProps) => {
  const theme = useAppTheme();
  const styles = useFormFieldStyles();
  const initialForm = useMemo(() => mapUserToEditProfileForm(user), [user]);
  const [baselineForm, setBaselineForm] = useState(initialForm);
  const [form, setForm] = useState<EditProfileFormState>(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const patchMutation = usePatchUserProfileMutation();

  const updateField = <K extends keyof EditProfileFormState>(
    key: K,
    value: EditProfileFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    const validationError = validateEditProfileForm(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const body = buildPatchUserProfileBody(form, baselineForm);
    if (Object.keys(body).length === 0) {
      setErrorMessage(EDIT_PROFILE_UI.NOTHING_TO_SAVE);
      return;
    }

    setErrorMessage("");
    try {
      const updatedUser = await patchMutation.mutateAsync({ userId: user._id, body });
      const nextForm = mapUserToEditProfileForm(updatedUser);
      setBaselineForm(nextForm);
      setForm(nextForm);
      setSuccessMessage(EDIT_PROFILE_UI.SAVED);
      onSaved?.();
    } catch (error) {
      setSuccessMessage("");
      setErrorMessage(error instanceof Error ? error.message : EDIT_PROFILE_UI.SAVE_ERROR);
    }
  };

  const isSubmitting = patchMutation.isPending;

  return (
    <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
      <ProfileAvatarUpload
        avatarUrl={form.userAvatarUrl}
        disabled={isSubmitting}
        onAvatarUrlChange={(url) => updateField("userAvatarUrl", url)}
        onError={setErrorMessage}
      />

      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{EDIT_PROFILE_UI.LABEL_EMAIL}</Text>
      <TextInput
        style={[styles.input, styles.inputReadOnly]}
        value={user.email ?? ""}
        editable={false}
      />

      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{EDIT_PROFILE_UI.LABEL_USERNAME}</Text>
      <Text style={styles.hint}>{EDIT_PROFILE_UI.USERNAME_HINT}</Text>
      <TextInput
        style={styles.input}
        value={form.userName}
        onChangeText={(value) => updateField("userName", value)}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
        placeholderTextColor={theme.colors.textMuted}
      />

      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{EDIT_PROFILE_UI.LABEL_PHONE}</Text>
      <TextInput
        style={styles.input}
        value={form.userPhoneNumber}
        onChangeText={(value) => updateField("userPhoneNumber", limitRuPhoneInput(value))}
        keyboardType="phone-pad"
        editable={!isSubmitting}
        placeholderTextColor={theme.colors.textMuted}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{EDIT_PROFILE_UI.LABEL_NOTIFICATIONS}</Text>
        <Switch
          value={form.notificationsEnabled}
          onValueChange={(value) => updateField("notificationsEnabled", value)}
          disabled={isSubmitting}
        />
      </View>

      {errorMessage ? <Text style={[styles.error, { marginTop: 16 }]}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={[styles.success, { marginTop: 16 }]}>{successMessage}</Text> : null}

      <AppButton
        label={EDIT_PROFILE_UI.SUBMIT}
        variant="contrast"
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={styles.submitSpacer}
      />
    </ScrollView>
  );
};
