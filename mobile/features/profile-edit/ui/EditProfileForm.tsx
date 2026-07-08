import { semanticColors } from "@/shared/theme/semanticColors";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { buildPatchUserProfileBody } from "@/entities/user/lib/buildPatchUserProfileBody";
import {
  mapUserToEditProfileForm,
  type EditProfileFormState,
  type StructuredAddress,
} from "@/entities/user/lib/mapUserToEditProfileForm";
import { limitRuPhoneInput } from "@/entities/user/lib/ruPhone";
import { validateEditProfileForm } from "@/entities/user/lib/validateEditProfileForm";
import { usePatchUserProfileMutation } from "@/entities/user/model/usePatchUserProfileMutation";
import {
  USER_GENDER_FEMALE,
  USER_GENDER_LABEL_RU,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
  ADDRESS_CITY_MAX_LENGTH,
  ADDRESS_DISTRICT_MAX_LENGTH,
  ADDRESS_STREET_MAX_LENGTH,
  ADDRESS_HOUSE_MAX_LENGTH,
  ADDRESS_FLAT_MAX_LENGTH,
  NOTES_ABOUT_USER_MAX_CHARS,
} from "@/entities/user/model/constants";
import { ProfileAvatarUpload } from "@/features/image-upload/ui/ProfileAvatarUpload";
import { ProfileBackgroundUpload } from "@/features/image-upload/ui/ProfileBackgroundUpload";
import { ADDRESS_STRUCTURED_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useFormFieldStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";

const GENDER_OPTIONS = [USER_GENDER_MALE, USER_GENDER_FEMALE, USER_GENDER_NO_SELECTED] as const;

const ADDRESS_FIELDS: Array<{
  key: keyof StructuredAddress;
  label: string;
  placeholder: string;
  maxLength: number;
  required: boolean;
}> = [
  { key: "city", label: ADDRESS_STRUCTURED_UI.LABEL_CITY, placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_CITY, maxLength: ADDRESS_CITY_MAX_LENGTH, required: true },
  { key: "district", label: ADDRESS_STRUCTURED_UI.LABEL_DISTRICT, placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_DISTRICT, maxLength: ADDRESS_DISTRICT_MAX_LENGTH, required: false },
  { key: "street", label: ADDRESS_STRUCTURED_UI.LABEL_STREET, placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_STREET, maxLength: ADDRESS_STREET_MAX_LENGTH, required: true },
  { key: "house", label: ADDRESS_STRUCTURED_UI.LABEL_HOUSE, placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_HOUSE, maxLength: ADDRESS_HOUSE_MAX_LENGTH, required: true },
  { key: "flat", label: ADDRESS_STRUCTURED_UI.LABEL_FLAT, placeholder: ADDRESS_STRUCTURED_UI.PLACEHOLDER_FLAT, maxLength: ADDRESS_FLAT_MAX_LENGTH, required: false },
];

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

  const updateAddress = (key: keyof StructuredAddress, value: string) => {
    setForm((prev) => ({
      ...prev,
      structuredAddress: { ...prev.structuredAddress, [key]: value },
    }));
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
  const notesChars = form.notesAboutUser.length;

  return (
    <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
      <ProfileAvatarUpload
        avatarUrl={form.userAvatarUrl}
        disabled={isSubmitting}
        onAvatarUrlChange={(url) => updateField("userAvatarUrl", url)}
        onError={setErrorMessage}
      />

      <View style={{ marginTop: 20 }}>
        <ProfileBackgroundUpload
          mode={form.backgroundMode}
          presetId={form.backgroundPresetId}
          imageUrl={form.backgroundImageUrl}
          disabled={isSubmitting}
          onModeChange={(m) => updateField("backgroundMode", m)}
          onPresetChange={(id) => updateField("backgroundPresetId", id)}
          onImageUrlChange={(url) => updateField("backgroundImageUrl", url)}
          onError={setErrorMessage}
        />
      </View>

      {/* Email */}
      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{EDIT_PROFILE_UI.LABEL_EMAIL}</Text>
      <TextInput
        style={[styles.input, styles.inputReadOnly]}
        value={typeof user.email === "string" ? user.email : ""}
        editable={false}
      />

      {/* Никнейм */}
      <Text style={[styles.labelStrong, { marginTop: 4 }]}>{EDIT_PROFILE_UI.LABEL_USERNAME}</Text>
      <Text style={styles.hint}>{EDIT_PROFILE_UI.USERNAME_HINT}</Text>
      <TextInput
        style={[styles.input, { marginTop: 4 }]}
        value={form.userName}
        onChangeText={(value) => updateField("userName", value)}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
        placeholderTextColor={theme.colors.textMuted}
      />

      {/* Телефон */}
      <Text style={[styles.labelStrong, { marginTop: 4 }]}>{EDIT_PROFILE_UI.LABEL_PHONE}</Text>
      <TextInput
        style={styles.input}
        value={form.userPhoneNumber}
        onChangeText={(value) => updateField("userPhoneNumber", limitRuPhoneInput(value))}
        keyboardType="phone-pad"
        editable={!isSubmitting}
        placeholderTextColor={theme.colors.textMuted}
      />

      {/* Дата рождения */}
      <Text style={[styles.labelStrong, { marginTop: 4 }]}>{EDIT_PROFILE_UI.LABEL_BIRTH_DATE}</Text>
      <TextInput
        style={styles.input}
        value={form.userBirthDate}
        onChangeText={(value) => updateField("userBirthDate", value)}
        placeholder={EDIT_PROFILE_UI.PLACEHOLDER_BIRTH_DATE}
        placeholderTextColor={theme.colors.textMuted}
        editable={!isSubmitting}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />

      {/* Пол */}
      <Text style={[styles.labelStrong, { marginTop: 4 }]}>{EDIT_PROFILE_UI.LABEL_GENDER}</Text>
      <View style={localStyles.genderRow}>
        {GENDER_OPTIONS.map((option, index) => {
          const selected = form.userGender === option;
          return (
            <Pressable
              key={option}
              onPress={() => !isSubmitting && updateField("userGender", option)}
              style={[
                localStyles.genderBtn,
                index === 0 && localStyles.genderBtnFirst,
                index === GENDER_OPTIONS.length - 1 && localStyles.genderBtnLast,
                selected && { backgroundColor: theme.colors.action, borderColor: theme.colors.action },
              ]}
            >
              <Text
                style={[
                  localStyles.genderBtnText,
                  { color: selected ? semanticColors.onContrast : theme.colors.text },
                ]}
              >
                {USER_GENDER_LABEL_RU[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Адрес */}
      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{ADDRESS_STRUCTURED_UI.SECTION_LABEL}</Text>
      {ADDRESS_FIELDS.map((field) => (
        <View key={field.key}>
          <Text style={[styles.label, { marginTop: 8 }]}>
            {field.label}
            {field.required ? <Text style={{ color: theme.colors.danger }}> *</Text> : null}
          </Text>
          <TextInput
            style={styles.input}
            value={form.structuredAddress[field.key]}
            onChangeText={(value) => updateAddress(field.key, value)}
            placeholder={field.placeholder}
            placeholderTextColor={theme.colors.textMuted}
            maxLength={field.maxLength}
            editable={!isSubmitting}
          />
        </View>
      ))}

      {/* Уведомления */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{EDIT_PROFILE_UI.LABEL_NOTIFICATIONS}</Text>
        <Switch
          value={form.notificationsEnabled}
          onValueChange={(value) => updateField("notificationsEnabled", value)}
          disabled={isSubmitting}
        />
      </View>

      {/* Заметки */}
      <Text style={[styles.labelStrong, { marginTop: 16 }]}>{EDIT_PROFILE_UI.LABEL_NOTES}</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={form.notesAboutUser}
        onChangeText={(value) => updateField("notesAboutUser", value)}
        multiline
        maxLength={NOTES_ABOUT_USER_MAX_CHARS}
        editable={!isSubmitting}
        placeholderTextColor={theme.colors.textMuted}
      />
      <Text
        style={[
          localStyles.charMeter,
          { color: notesChars > NOTES_ABOUT_USER_MAX_CHARS ? theme.colors.danger : theme.colors.textMuted },
        ]}
      >
        {EDIT_PROFILE_UI.CHARS_USED(notesChars, NOTES_ABOUT_USER_MAX_CHARS)}
      </Text>

      {errorMessage ? <Text style={[styles.error, { marginTop: 12 }]}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={[styles.success, { marginTop: 12 }]}>{successMessage}</Text> : null}

      <AppButton
        label={EDIT_PROFILE_UI.SUBMIT}
        variant="primary"
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={styles.submitSpacer}
      />
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  genderRow: {
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 4,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderWidth: 1,
    borderColor: semanticColors.borderStrong,
    backgroundColor: semanticColors.onContrast,
    borderRadius: 0,
  },
  genderBtnFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  genderBtnLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  genderBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  charMeter: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    textAlign: "right",
  },
});
