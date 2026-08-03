import { useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";

import { maskBirthDateInput } from "@/entities/user/lib/birthDateInputMask";
import { buildPatchUserProfileBody } from "@/entities/user/lib/buildPatchUserProfileBody";
import {
  mapUserToEditProfileForm,
  type EditProfileFormState,
} from "@/entities/user/lib/mapUserToEditProfileForm";
import { maskRuPhoneInput } from "@/entities/user/lib/ruPhone";
import { validateEditProfileForm } from "@/entities/user/lib/validateEditProfileForm";
import { usePatchUserProfileMutation } from "@/entities/user/model/usePatchUserProfileMutation";
import {
  USER_GENDER_FEMALE,
  USER_GENDER_LABEL_RU,
  USER_GENDER_MALE,
  USER_GENDER_NO_SELECTED,
  NOTES_ABOUT_USER_MAX_CHARS,
} from "@/entities/user/model/constants";
import { AddressSuggestInput } from "@/entities/address/ui/AddressSuggestInput";
import { RuRegionSelect } from "@/entities/region/ui/RuRegionSelect";
import { ProfileAvatarUpload } from "@/features/image-upload/ui/ProfileAvatarUpload";
import { ProfileBackgroundUpload } from "@/features/image-upload/ui/ProfileBackgroundUpload";
import { DeleteAccountSection } from "@/features/profile-edit/ui/DeleteAccountSection";
import { EditProfileSocialLinksFields } from "@/features/profile-edit/ui/EditProfileSocialLinksFields";
import { ADDRESS_DELIVERY_UI, ADDRESS_STRUCTURED_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useEditProfileFormStyles } from "@/shared/theme/editProfileFormStyles";
import { AppButton } from "@/shared/ui/AppButton";

const GENDER_OPTIONS = [USER_GENDER_MALE, USER_GENDER_FEMALE, USER_GENDER_NO_SELECTED] as const;

type EditProfileFormProps = {
  user: Record<string, unknown> & { _id: string; email?: string };
  onSaved?: () => void;
};

export const EditProfileForm = ({ user, onSaved }: EditProfileFormProps) => {
  const theme = useAppTheme();
  const styles = useEditProfileFormStyles();
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

    setErrorMessage("");
    try {
      const body = buildPatchUserProfileBody(form, baselineForm);
      if (Object.keys(body).length === 0) {
        setErrorMessage(EDIT_PROFILE_UI.NOTHING_TO_SAVE);
        return;
      }

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

  const fieldLabel = (label: string, required?: boolean) => (
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.labelRequired}> *</Text> : null}
    </Text>
  );

  const section = (title: string, children: ReactNode) => (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {/* Зона: оформление профиля (аватар + фон) */}
      {section(
        EDIT_PROFILE_UI.SECTION_APPEARANCE,
        <View style={styles.mediaCard}>
          <ProfileAvatarUpload
            avatarUrl={form.userAvatarUrl}
            disabled={isSubmitting}
            onAvatarUrlChange={(url) => updateField("userAvatarUrl", url)}
            onError={setErrorMessage}
          />
          <ProfileBackgroundUpload
            mode={form.backgroundMode}
            presetId={form.backgroundPresetId}
            imageUrl={form.backgroundImageUrl}
            focus={form.userBackgroundFocus}
            disabled={isSubmitting}
            onModeChange={(m) => updateField("backgroundMode", m)}
            onPresetChange={(id) => updateField("backgroundPresetId", id)}
            onImageUrlChange={(url) => updateField("backgroundImageUrl", url)}
            onFocusChange={(nextFocus) => updateField("userBackgroundFocus", nextFocus)}
            onError={setErrorMessage}
          />
        </View>,
      )}

      {/* Зона: аккаунт (email + никнейм) */}
      {section(
        EDIT_PROFILE_UI.SECTION_ACCOUNT,
        <>
          <View style={styles.field}>
            {fieldLabel(EDIT_PROFILE_UI.LABEL_EMAIL)}
            <TextInput
              style={[styles.input, styles.inputReadOnly]}
              value={typeof user.email === "string" ? user.email : ""}
              editable={false}
            />
          </View>
          <View style={styles.field}>
            {fieldLabel(EDIT_PROFILE_UI.LABEL_USERNAME)}
            <TextInput
              style={styles.input}
              value={form.userName}
              onChangeText={(value) => updateField("userName", value)}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.hint}>{EDIT_PROFILE_UI.USERNAME_HINT}</Text>
          </View>
        </>,
      )}

      {/* Зона: личные данные (телефон, дата рождения, пол) */}
      {section(
        EDIT_PROFILE_UI.SECTION_PERSONAL,
        <>
          <View style={styles.field}>
            {fieldLabel(EDIT_PROFILE_UI.LABEL_PHONE)}
            <TextInput
              style={styles.input}
              value={form.userPhoneNumber}
              onChangeText={(value) => updateField("userPhoneNumber", maskRuPhoneInput(value))}
              keyboardType="phone-pad"
              editable={!isSubmitting}
              placeholder="8 (912) 345-67-89"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>
          <View style={styles.field}>
            {fieldLabel(EDIT_PROFILE_UI.LABEL_BIRTH_DATE)}
            <TextInput
              style={styles.input}
              value={form.userBirthDate}
              onChangeText={(value) => updateField("userBirthDate", maskBirthDateInput(value))}
              placeholder={EDIT_PROFILE_UI.PLACEHOLDER_BIRTH_DATE}
              placeholderTextColor={theme.colors.textMuted}
              editable={!isSubmitting}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
          <View style={styles.field}>
            {fieldLabel(EDIT_PROFILE_UI.LABEL_GENDER)}
            <View style={styles.segment}>
              {GENDER_OPTIONS.map((option, index) => {
                const selected = form.userGender === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => !isSubmitting && updateField("userGender", option)}
                    style={[
                      styles.segmentBtn,
                      index > 0 && styles.segmentDivider,
                      selected && styles.segmentBtnActive,
                    ]}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
                      {USER_GENDER_LABEL_RU[option]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <RuRegionSelect
            value={form.userRegionCode}
            disabled={isSubmitting}
            required
            label={EDIT_PROFILE_UI.LABEL_REGION}
            onChange={(userRegionCode) => updateField("userRegionCode", userRegionCode)}
          />
          <Text style={styles.hint}>{EDIT_PROFILE_UI.HINT_REGION}</Text>
        </>,
      )}

      {/* Зона: адрес доставки */}
      {section(
        ADDRESS_STRUCTURED_UI.SECTION_LABEL,
        <>
          <AddressSuggestInput
            value={form.deliveryAddress}
            onChange={(deliveryAddress) => {
              setForm((prev) => ({
                ...prev,
                deliveryAddress,
                ...(deliveryAddress.regionCode
                  ? { userRegionCode: deliveryAddress.regionCode }
                  : {}),
              }));
              setErrorMessage("");
              setSuccessMessage("");
            }}
            disabled={isSubmitting}
            label={ADDRESS_DELIVERY_UI.LABEL_LINE}
            placeholder={ADDRESS_DELIVERY_UI.PLACEHOLDER_LINE}
          />
          <View style={styles.field}>
            {fieldLabel(ADDRESS_DELIVERY_UI.LABEL_FLAT)}
            <TextInput
              style={styles.input}
              value={form.deliveryAddress.flat}
              onChangeText={(value) =>
                setForm((prev) => ({
                  ...prev,
                  deliveryAddress: { ...prev.deliveryAddress, flat: value },
                }))
              }
              placeholder={ADDRESS_STRUCTURED_UI.PLACEHOLDER_FLAT}
              placeholderTextColor={theme.colors.textMuted}
              editable={!isSubmitting}
            />
          </View>
        </>,
      )}

      {/* Зона: уведомления */}
      {section(
        EDIT_PROFILE_UI.SECTION_NOTIFICATIONS,
        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchLabel}>{EDIT_PROFILE_UI.LABEL_NOTIFICATIONS}</Text>
          </View>
          <Switch
            value={form.notificationsEnabled}
            onValueChange={(value) => updateField("notificationsEnabled", value)}
            disabled={isSubmitting}
          />
        </View>,
      )}

      {/* Зона: о себе */}
      {section(
        EDIT_PROFILE_UI.SECTION_ABOUT,
        <View style={styles.field}>
          {fieldLabel(EDIT_PROFILE_UI.LABEL_NOTES)}
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
            style={[styles.charMeter, notesChars > NOTES_ABOUT_USER_MAX_CHARS && styles.charMeterOver]}
          >
            {EDIT_PROFILE_UI.CHARS_USED(notesChars, NOTES_ABOUT_USER_MAX_CHARS)}
          </Text>
        </View>,
      )}

      {section(
        EDIT_PROFILE_UI.SECTION_SOCIAL,
        <EditProfileSocialLinksFields
          form={form}
          onChange={(fieldId, value) => updateField(fieldId, value)}
          disabled={isSubmitting}
        />,
      )}

      {errorMessage ? (
        <Text style={[styles.feedback, styles.feedbackError]}>{errorMessage}</Text>
      ) : null}
      {successMessage ? (
        <Text style={[styles.feedback, styles.feedbackSuccess]}>{successMessage}</Text>
      ) : null}

      <AppButton
        label={EDIT_PROFILE_UI.SUBMIT}
        variant="primary"
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={styles.submit}
      />

      <DeleteAccountSection userId={user._id} />
    </ScrollView>
  );
};
