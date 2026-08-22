import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { sanitizeUserNameInputLive } from "@molha/api-contract";

import { confirmPhoneBind, requestPhoneBind } from "@/entities/session/api/phoneAuth";
import { confirmEmailBind, requestEmailBind } from "@/entities/session/api/emailBind";
import { changePassword } from "@/entities/session/api/passwordReset";
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
import { ADDRESS_DELIVERY_UI, ADDRESS_STRUCTURED_UI, AUTH_UI, EDIT_PROFILE_UI } from "@/shared/config";
import { keepDigitsOnly } from "@/shared/lib/rubPriceInput";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useEditProfileFormStyles } from "@/shared/theme/editProfileFormStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { PasswordTextInput } from "@/shared/ui/PasswordTextInput";

const GENDER_OPTIONS = [USER_GENDER_MALE, USER_GENDER_FEMALE, USER_GENDER_NO_SELECTED] as const;
const BIND_CODE_LENGTH = 6;

type EditProfileFormProps = {
  user: Record<string, unknown> & {
    _id: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
  };
  onSaved?: () => void;
  focusAddress?: boolean;
};

export const EditProfileForm = ({ user, onSaved, focusAddress = false }: EditProfileFormProps) => {
  const theme = useAppTheme();
  const styles = useEditProfileFormStyles();
  const initialForm = useMemo(() => mapUserToEditProfileForm(user), [user]);
  const [baselineForm, setBaselineForm] = useState(initialForm);
  const [form, setForm] = useState<EditProfileFormState>(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [phoneBindCode, setPhoneBindCode] = useState("");
  const [phoneBindOtpSent, setPhoneBindOtpSent] = useState(false);
  const [phoneBindLoading, setPhoneBindLoading] = useState(false);
  const [phoneBindNotice, setPhoneBindNotice] = useState("");
  const [phoneLocalVerified, setPhoneLocalVerified] = useState(user.isPhoneVerified === true);
  const [emailBindCode, setEmailBindCode] = useState("");
  const [emailBindOtpSent, setEmailBindOtpSent] = useState(false);
  const [emailBindLoading, setEmailBindLoading] = useState(false);
  const [emailBindNotice, setEmailBindNotice] = useState("");
  const [emailLocalVerified, setEmailLocalVerified] = useState(user.isEmailVerified === true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeNotice, setPasswordChangeNotice] = useState("");
  const patchMutation = usePatchUserProfileMutation();
  const scrollRef = useRef<ScrollView>(null);
  const addressOffsetRef = useRef(0);

  useEffect(() => {
    if (!focusAddress) {
      return undefined;
    }
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, addressOffsetRef.current - 24),
        animated: true,
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [focusAddress]);

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

    const emailTrim = form.email.trim().toLowerCase();
    const phoneTrim = form.userPhoneNumber.trim();
    if (!emailTrim && baselineForm.email.trim()) {
      setErrorMessage(EDIT_PROFILE_UI.EMAIL_CLEAR_FORBIDDEN);
      return;
    }
    if (emailTrim !== baselineForm.email.trim().toLowerCase() && !emailLocalVerified) {
      setErrorMessage(EDIT_PROFILE_UI.EMAIL_CHANGE_PENDING);
      return;
    }
    if (!phoneTrim && baselineForm.userPhoneNumber.trim()) {
      setErrorMessage(EDIT_PROFILE_UI.PHONE_CLEAR_FORBIDDEN);
      return;
    }
    if (phoneTrim !== baselineForm.userPhoneNumber.trim() && !phoneLocalVerified) {
      setErrorMessage(EDIT_PROFILE_UI.PHONE_CHANGE_PENDING);
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
      const nextForm = mapUserToEditProfileForm({
        ...updatedUser,
        email: form.email,
        userPhoneNumber: form.userPhoneNumber,
        isEmailVerified: emailLocalVerified,
        isPhoneVerified: phoneLocalVerified,
      });
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
  const isPhoneVerified = user.isPhoneVerified === true || phoneLocalVerified;
  const showPhoneVerify =
    form.userPhoneNumber.trim() !== "" &&
    (!isPhoneVerified || form.userPhoneNumber !== baselineForm.userPhoneNumber);
  const isEmailVerified = user.isEmailVerified === true || emailLocalVerified;
  const showEmailVerify =
    form.email.trim() !== "" &&
    (!isEmailVerified || form.email.trim().toLowerCase() !== baselineForm.email.trim().toLowerCase());

  const handleRequestPhoneBind = async () => {
    setPhoneBindLoading(true);
    setPhoneBindNotice("");
    setErrorMessage("");

    try {
      await requestPhoneBind({ phoneNumber: form.userPhoneNumber.trim() });
      setPhoneBindOtpSent(true);
      setPhoneBindNotice(EDIT_PROFILE_UI.PHONE_VERIFY_SENT);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : EDIT_PROFILE_UI.PHONE_VERIFY_REQUEST_ERROR,
      );
    } finally {
      setPhoneBindLoading(false);
    }
  };

  const handleConfirmPhoneBind = async () => {
    if (phoneBindCode.length !== BIND_CODE_LENGTH) {
      setErrorMessage(EDIT_PROFILE_UI.PHONE_VERIFY_CODE_REQUIRED);
      return;
    }

    setPhoneBindLoading(true);
    setPhoneBindNotice("");
    setErrorMessage("");

    try {
      await confirmPhoneBind({ code: phoneBindCode });
      setPhoneBindCode("");
      setPhoneBindOtpSent(false);
      setPhoneBindNotice(EDIT_PROFILE_UI.PHONE_VERIFY_SUCCESS);
      setSuccessMessage(EDIT_PROFILE_UI.PHONE_VERIFY_SUCCESS);
      setPhoneLocalVerified(true);
      setBaselineForm((prev) => ({ ...prev, userPhoneNumber: form.userPhoneNumber }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : EDIT_PROFILE_UI.PHONE_VERIFY_ERROR,
      );
    } finally {
      setPhoneBindLoading(false);
    }
  };

  const handleRequestEmailBind = async () => {
    setEmailBindLoading(true);
    setEmailBindNotice("");
    setErrorMessage("");

    try {
      await requestEmailBind({ email: form.email.trim().toLowerCase() });
      setEmailBindOtpSent(true);
      setEmailBindNotice(EDIT_PROFILE_UI.EMAIL_VERIFY_SENT);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : EDIT_PROFILE_UI.EMAIL_VERIFY_REQUEST_ERROR,
      );
    } finally {
      setEmailBindLoading(false);
    }
  };

  const handleConfirmEmailBind = async () => {
    if (emailBindCode.length !== BIND_CODE_LENGTH) {
      setErrorMessage(EDIT_PROFILE_UI.EMAIL_VERIFY_CODE_REQUIRED);
      return;
    }

    setEmailBindLoading(true);
    setEmailBindNotice("");
    setErrorMessage("");

    try {
      const result = await confirmEmailBind({ code: emailBindCode });
      const nextEmail = String(result.email ?? form.email)
        .trim()
        .toLowerCase();
      setEmailBindCode("");
      setEmailBindOtpSent(false);
      setEmailBindNotice(EDIT_PROFILE_UI.EMAIL_VERIFY_SUCCESS);
      setSuccessMessage(EDIT_PROFILE_UI.EMAIL_VERIFY_SUCCESS);
      setEmailLocalVerified(true);
      setForm((prev) => ({ ...prev, email: nextEmail }));
      setBaselineForm((prev) => ({ ...prev, email: nextEmail }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : EDIT_PROFILE_UI.EMAIL_VERIFY_ERROR,
      );
    } finally {
      setEmailBindLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordChangeNotice("");
    setErrorMessage("");
    if (newPassword.length < EDIT_PROFILE_UI.PASSWORD_MIN_LENGTH) {
      setErrorMessage(EDIT_PROFILE_UI.PASSWORD_TOO_SHORT);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setErrorMessage(EDIT_PROFILE_UI.PASSWORD_MISMATCH);
      return;
    }
    setPasswordChangeLoading(true);
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      const message =
        typeof result.message === "string" && result.message
          ? result.message
          : EDIT_PROFILE_UI.PASSWORD_CHANGE_SUCCESS;
      setPasswordChangeNotice(message);
      setSuccessMessage(message);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : EDIT_PROFILE_UI.PASSWORD_CHANGE_ERROR,
      );
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const fieldLabel = (label: string, required?: boolean) => (
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.labelRequired}> *</Text> : null}
    </Text>
  );

  const section = (
    title: string,
    children: ReactNode,
    onLayout?: (event: { nativeEvent: { layout: { y: number } } }) => void,
  ) => (
    <View onLayout={onLayout}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );

  return (
    <ScrollView
      ref={scrollRef}
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
              style={styles.input}
              value={form.email}
              onChangeText={(value) => {
                updateField("email", value.trim().toLowerCase());
                setEmailLocalVerified(false);
                setEmailBindOtpSent(false);
                setEmailBindCode("");
                setEmailBindNotice("");
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isSubmitting && !emailBindLoading}
              placeholderTextColor={theme.colors.textMuted}
            />
            {showEmailVerify ? (
              <View style={{ gap: 8, marginTop: 4 }}>
                {!emailBindOtpSent ? (
                  <Pressable
                    onPress={() => void handleRequestEmailBind()}
                    disabled={isSubmitting || emailBindLoading}
                  >
                    <Text style={styles.hint}>
                      {emailBindLoading
                        ? EDIT_PROFILE_UI.EMAIL_VERIFY_SEND_LOADING
                        : EDIT_PROFILE_UI.EMAIL_VERIFY_SEND}
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      value={emailBindCode}
                      onChangeText={(value) =>
                        setEmailBindCode(keepDigitsOnly(value).slice(0, BIND_CODE_LENGTH))
                      }
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      maxLength={BIND_CODE_LENGTH}
                      placeholder={EDIT_PROFILE_UI.EMAIL_VERIFY_CODE_PLACEHOLDER}
                      placeholderTextColor={theme.colors.textMuted}
                      editable={!emailBindLoading}
                    />
                    <AppButton
                      label={EDIT_PROFILE_UI.EMAIL_VERIFY_CONFIRM}
                      variant="secondary"
                      onPress={() => void handleConfirmEmailBind()}
                      disabled={emailBindLoading}
                    />
                  </>
                )}
                {emailBindNotice ? (
                  <Text style={[styles.feedback, styles.feedbackSuccess]}>{emailBindNotice}</Text>
                ) : null}
              </View>
            ) : isEmailVerified ? (
              <Text style={styles.hint}>{EDIT_PROFILE_UI.EMAIL_VERIFIED}</Text>
            ) : null}
          </View>
          <View style={styles.field}>
            {fieldLabel(EDIT_PROFILE_UI.LABEL_USERNAME)}
            <TextInput
              style={styles.input}
              value={form.userName}
              onChangeText={(value) => updateField("userName", sanitizeUserNameInputLive(value))}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.hint}>{EDIT_PROFILE_UI.USERNAME_HINT}</Text>
          </View>
          <View style={styles.field}>
            {fieldLabel(EDIT_PROFILE_UI.SECTION_PASSWORD)}
            <Text style={styles.label}>{EDIT_PROFILE_UI.LABEL_CURRENT_PASSWORD}</Text>
            <PasswordTextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              textContentType="password"
            />
            <Text style={styles.label}>{EDIT_PROFILE_UI.LABEL_NEW_PASSWORD}</Text>
            <PasswordTextInput
              value={newPassword}
              onChangeText={setNewPassword}
              textContentType="newPassword"
            />
            <Text style={styles.label}>{EDIT_PROFILE_UI.LABEL_NEW_PASSWORD_CONFIRM}</Text>
            <PasswordTextInput
              value={newPasswordConfirm}
              onChangeText={setNewPasswordConfirm}
              textContentType="newPassword"
            />
            {passwordChangeNotice ? (
              <Text style={[styles.feedback, styles.feedbackSuccess]}>
                {passwordChangeNotice}
              </Text>
            ) : null}
            <AppButton
              label={
                passwordChangeLoading
                  ? EDIT_PROFILE_UI.PASSWORD_CHANGE_LOADING
                  : EDIT_PROFILE_UI.PASSWORD_CHANGE_SUBMIT
              }
              variant="secondary"
              onPress={() => void handleChangePassword()}
              disabled={isSubmitting || passwordChangeLoading}
            />
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
              onChangeText={(value) => {
                updateField("userPhoneNumber", maskRuPhoneInput(value));
                setPhoneLocalVerified(false);
                setPhoneBindOtpSent(false);
                setPhoneBindCode("");
                setPhoneBindNotice("");
              }}
              keyboardType="phone-pad"
              editable={!isSubmitting && !phoneBindLoading}
              placeholder={AUTH_UI.PHONE_PLACEHOLDER}
              placeholderTextColor={theme.colors.textMuted}
            />
            {showPhoneVerify ? (
              <View style={{ gap: 8, marginTop: 4 }}>
                {!phoneBindOtpSent ? (
                  <Pressable
                    onPress={() => void handleRequestPhoneBind()}
                    disabled={isSubmitting || phoneBindLoading}
                  >
                    <Text style={styles.hint}>
                      {phoneBindLoading
                        ? EDIT_PROFILE_UI.PHONE_VERIFY_SEND_LOADING
                        : EDIT_PROFILE_UI.PHONE_VERIFY_SEND}
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      value={phoneBindCode}
                      onChangeText={(value) =>
                        setPhoneBindCode(keepDigitsOnly(value).slice(0, BIND_CODE_LENGTH))
                      }
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      maxLength={BIND_CODE_LENGTH}
                      placeholder={EDIT_PROFILE_UI.PHONE_VERIFY_CODE_PLACEHOLDER}
                      placeholderTextColor={theme.colors.textMuted}
                      editable={!phoneBindLoading}
                    />
                    <AppButton
                      label={EDIT_PROFILE_UI.PHONE_VERIFY_BUTTON}
                      variant="secondary"
                      onPress={() => void handleConfirmPhoneBind()}
                      disabled={phoneBindLoading}
                    />
                  </>
                )}
                {phoneBindNotice ? (
                  <Text style={[styles.feedback, styles.feedbackSuccess]}>{phoneBindNotice}</Text>
                ) : null}
              </View>
            ) : null}
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
            autoFocus={focusAddress}
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
        (event) => {
          addressOffsetRef.current = event.nativeEvent.layout.y;
        },
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
