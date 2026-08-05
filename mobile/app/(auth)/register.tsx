import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { registerUserByPhone } from "@/entities/session/api/phoneAuth";
import { resendRegistrationCode } from "@/entities/session/api/resendRegistrationCode";
import {
  buildRegisterPayload,
  buildRegisterPhonePayload,
} from "@/entities/session/lib/buildRegisterPayload";
import { useConfirmRegistrationMutation } from "@/entities/session/model/useConfirmRegistrationMutation";
import { useRegisterMutation } from "@/entities/session/model/useRegisterMutation";
import { useGuestProfileLoginMenuBannerImageQuery } from "@/entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery";
import { maskRuPhoneInput } from "@/entities/user/lib/ruPhone";
import { isRegisterConsentComplete } from "@/features/legal/lib/isRegisterConsentComplete";
import { RegisterLegalConsentFields } from "@/features/legal/ui/RegisterLegalConsentFields";
import { API_CLIENT_UI, AUTH_UI, EMAIL_VERIFICATION_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { clearPersistedReferralCode } from "@/shared/lib/referralCodeStorage";
import { keepDigitsOnly } from "@/shared/lib/rubPriceInput";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useStableAuthHeroHeight } from "@/shared/lib/useStableAuthHeroHeight";
import { releaseColdStartSplash } from "@/shared/model/coldStartSplashGate";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useLoginScreenStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { AuthScreenScroll } from "@/shared/ui/AuthScreenScroll";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { ModalSectionTabs } from "@/shared/ui/ModalSectionTabs";
import { PasswordTextInput } from "@/shared/ui/PasswordTextInput";

type AuthChannel = "email" | "phone";
type RegisterField = "email" | "phone" | "userName" | "code";

const REGISTER_CHANNEL_TABS = [
  { id: "email", label: AUTH_UI.CHANNEL_EMAIL },
  { id: "phone", label: AUTH_UI.CHANNEL_PHONE },
] as const;

const REGISTER_CODE_LENGTH = 6;

type PendingRegistration = {
  registrationId: string;
  channel: AuthChannel;
  email?: string;
  phoneNumber?: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useLoginScreenStyles();
  const insets = useSafeAreaInsets();
  const { centeredContentStyle } = useScreenLayout();
  const heroHeight = useStableAuthHeroHeight();
  const registerMutation = useRegisterMutation();
  const confirmMutation = useConfirmRegistrationMutation();

  const [channel, setChannel] = useState<AuthChannel>("email");
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(
    null,
  );
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeNotice, setCodeNotice] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isPhoneRegisterLoading, setIsPhoneRegisterLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [personalDataConsentAccepted, setPersonalDataConsentAccepted] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [focusedField, setFocusedField] = useState<RegisterField | null>(null);

  const bannerImageQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUri = bannerImageQuery.data
    ? resolveUploadedMediaUrl(bannerImageQuery.data)
    : null;

  const isConsentComplete = isRegisterConsentComplete({
    termsAccepted,
    personalDataConsentAccepted,
  });

  const handleBack = useCallback(() => {
    if (pendingRegistration) {
      setPendingRegistration(null);
      setCode("");
      setCodeError("");
      setCodeNotice("");
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  }, [pendingRegistration, router]);

  const handleUserNameChange = (value: string) => {
    setUserName(value.toLowerCase().replace(/[^a-z0-9]/g, ""));
  };

  const handleSubmit = async () => {
    if (!isConsentComplete) {
      setConsentError(AUTH_UI.REGISTER_CONSENT_REQUIRED);
      return;
    }

    setConsentError("");

    try {
      if (channel === "phone") {
        setIsPhoneRegisterLoading(true);
        const pending = await registerUserByPhone(
          await buildRegisterPhonePayload({
            phoneNumber,
            userName,
            password,
            passwordConfirm,
          }),
        );
        setPendingRegistration({
          registrationId: pending.registrationId,
          phoneNumber: pending.phoneNumber,
          channel: "phone",
        });
      } else {
        const pending = await registerMutation.mutateAsync(
          await buildRegisterPayload({ email, userName, password, passwordConfirm }),
        );
        setPendingRegistration({
          registrationId: pending.registrationId,
          email: pending.email,
          channel: "email",
        });
      }
      setCode("");
      setCodeError("");
      setCodeNotice("");
    } catch (error) {
      if (channel === "phone") {
        setCodeError(formatApiErrorMessage(error, API_CLIENT_UI.REGISTER_FALLBACK));
      }
    } finally {
      setIsPhoneRegisterLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!pendingRegistration) return;

    const isPhone = pendingRegistration.channel === "phone";
    if (code.length !== REGISTER_CODE_LENGTH) {
      setCodeError(
        isPhone ? AUTH_UI.REGISTER_CODE_REQUIRED_SMS : AUTH_UI.REGISTER_CODE_REQUIRED,
      );
      return;
    }

    setCodeError("");
    setCodeNotice("");

    try {
      await confirmMutation.mutateAsync({
        registrationId: pendingRegistration.registrationId,
        code,
      });
      await clearPersistedReferralCode();
      releaseColdStartSplash();
      router.replace("/(tabs)");
    } catch (error) {
      setCodeError(formatApiErrorMessage(error, EMAIL_VERIFICATION_UI.CONFIRM_ERROR));
    }
  };

  const handleResendCode = async () => {
    if (!pendingRegistration) return;

    setIsResending(true);
    setCodeError("");
    setCodeNotice("");

    try {
      const message = await resendRegistrationCode(pendingRegistration.registrationId);
      setCode("");
      const fallback =
        pendingRegistration.channel === "phone"
          ? AUTH_UI.REGISTER_CODE_RESENT_SMS
          : EMAIL_VERIFICATION_UI.RESENT;
      setCodeNotice(message || fallback);
    } catch (error) {
      setCodeError(formatApiErrorMessage(error, EMAIL_VERIFICATION_UI.RESEND_ERROR));
    } finally {
      setIsResending(false);
    }
  };

  const isCodeStep = pendingRegistration != null;
  const isFormBusy = registerMutation.isPending || isPhoneRegisterLoading;
  const isCodeBusy = confirmMutation.isPending || isResending;

  const errorMessage = isCodeStep
    ? codeError
    : registerMutation.isError
      ? formatApiErrorMessage(registerMutation.error, API_CLIENT_UI.REGISTER_FALLBACK)
      : codeError || consentError;

  const isPhonePending = pendingRegistration?.channel === "phone";

  return (
    <View style={styles.flex}>
      <Pressable
        style={[
          styles.backButtonOverlay,
          {
            top: insets.top + 8,
            left: Math.max(insets.left, 16),
          },
        ]}
        onPress={handleBack}
        disabled={isFormBusy || isCodeBusy}
        accessibilityRole="button"
        accessibilityLabel={AUTH_UI.BACK_BUTTON}
      >
        <Text style={styles.backButtonOverlayText}>{AUTH_UI.BACK_BUTTON}</Text>
      </Pressable>

      <AuthScreenScroll style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.hero, { height: heroHeight }]}>
          {bannerImageUri ? (
            <CachedProductImage
              uri={bannerImageUri}
              style={styles.heroImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.heroSkeleton} />
          )}
        </View>

        {isCodeStep ? (
          <View style={[styles.body, centeredContentStyle]}>
            <Text style={styles.title}>
              {isPhonePending ? AUTH_UI.REGISTER_CODE_TITLE_PHONE : AUTH_UI.REGISTER_CODE_TITLE}
            </Text>
            <Text style={styles.subtitle}>
              {isPhonePending
                ? AUTH_UI.REGISTER_CODE_SUBTITLE_PHONE(
                    pendingRegistration.phoneNumber || phoneNumber,
                  )
                : AUTH_UI.REGISTER_CODE_SUBTITLE(pendingRegistration.email || email)}
            </Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>
                  {isPhonePending
                    ? AUTH_UI.REGISTER_CODE_LABEL_SMS
                    : AUTH_UI.REGISTER_CODE_LABEL}
                </Text>
                <TextInput
                  style={[styles.input, focusedField === "code" && styles.inputFocused]}
                  value={code}
                  onChangeText={(value) => {
                    setCode(keepDigitsOnly(value).slice(0, REGISTER_CODE_LENGTH));
                    setCodeError("");
                  }}
                  onFocus={() => setFocusedField("code")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={REGISTER_CODE_LENGTH}
                  placeholder={AUTH_UI.REGISTER_CODE_PLACEHOLDER}
                  placeholderTextColor={theme.colors.textMuted}
                  returnKeyType="go"
                  onSubmitEditing={handleConfirmCode}
                  editable={!isCodeBusy}
                />
              </View>

              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
              {codeNotice ? <Text style={styles.subtitle}>{codeNotice}</Text> : null}

              <AppButton
                label={
                  isPhonePending
                    ? AUTH_UI.REGISTER_CODE_CONFIRM_BUTTON_SMS
                    : AUTH_UI.REGISTER_CODE_CONFIRM_BUTTON
                }
                variant="primary"
                style={styles.submitButton}
                onPress={handleConfirmCode}
                disabled={isCodeBusy}
              />
              <Pressable
                style={styles.registerLink}
                onPress={handleResendCode}
                disabled={isCodeBusy}
              >
                <Text style={styles.registerLinkText}>
                  {isResending
                    ? EMAIL_VERIFICATION_UI.RESEND_LOADING
                    : AUTH_UI.REGISTER_CODE_RESEND_BUTTON}
                </Text>
              </Pressable>
              <Pressable
                style={styles.registerLink}
                onPress={handleBack}
                disabled={isCodeBusy}
              >
                <Text style={styles.registerLinkText}>
                  {AUTH_UI.REGISTER_CODE_BACK_BUTTON}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.body, centeredContentStyle]}>
            <Text style={styles.title}>{AUTH_UI.REGISTER_TITLE}</Text>
            <Text style={styles.subtitle}>{AUTH_UI.REGISTER_SUBTITLE}</Text>

            <View style={styles.form}>
              <ModalSectionTabs
                tabs={REGISTER_CHANNEL_TABS}
                activeTabId={channel}
                onTabChange={(tabId) => {
                  setChannel(tabId as AuthChannel);
                  setCodeError("");
                }}
                ariaLabel={AUTH_UI.CHANNEL_TOGGLE_ARIA}
                variant="segment"
              />

              {channel === "email" ? (
                <View style={styles.field}>
                  <Text style={styles.label}>{AUTH_UI.EMAIL_LABEL}</Text>
                  <TextInput
                    style={[styles.input, focusedField === "email" && styles.inputFocused]}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    placeholder={AUTH_UI.EMAIL_PLACEHOLDER}
                    placeholderTextColor={theme.colors.textMuted}
                    returnKeyType="next"
                    editable={!isFormBusy}
                  />
                </View>
              ) : (
                <View style={styles.field}>
                  <Text style={styles.label}>{AUTH_UI.PHONE_LABEL}</Text>
                  <TextInput
                    style={[styles.input, focusedField === "phone" && styles.inputFocused]}
                    value={phoneNumber}
                    onChangeText={(value) => setPhoneNumber(maskRuPhoneInput(value))}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    placeholder={AUTH_UI.PHONE_PLACEHOLDER}
                    placeholderTextColor={theme.colors.textMuted}
                    returnKeyType="next"
                    editable={!isFormBusy}
                  />
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>{AUTH_UI.USER_NAME_LABEL}</Text>
                <TextInput
                  style={[styles.input, focusedField === "userName" && styles.inputFocused]}
                  value={userName}
                  onChangeText={handleUserNameChange}
                  onFocus={() => setFocusedField("userName")}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={AUTH_UI.USER_NAME_PLACEHOLDER}
                  placeholderTextColor={theme.colors.textMuted}
                  returnKeyType="next"
                  editable={!isFormBusy}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{AUTH_UI.PASSWORD_LABEL}</Text>
                <PasswordTextInput
                  value={password}
                  onChangeText={setPassword}
                  textContentType="newPassword"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{AUTH_UI.PASSWORD_CONFIRM_LABEL}</Text>
                <PasswordTextInput
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  textContentType="newPassword"
                  placeholder={AUTH_UI.PASSWORD_CONFIRM_PLACEHOLDER}
                  accessibilityLabel={AUTH_UI.PASSWORD_CONFIRM_LABEL}
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              <RegisterLegalConsentFields
                termsAccepted={termsAccepted}
                personalDataConsentAccepted={personalDataConsentAccepted}
                disabled={isFormBusy}
                onTermsAcceptedChange={(value) => {
                  setTermsAccepted(value);
                  if (value && personalDataConsentAccepted) {
                    setConsentError("");
                  }
                }}
                onPersonalDataConsentAcceptedChange={(value) => {
                  setPersonalDataConsentAccepted(value);
                  if (value && termsAccepted) {
                    setConsentError("");
                  }
                }}
              />

              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

              <AppButton
                label={AUTH_UI.REGISTER_BUTTON}
                variant="primary"
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isFormBusy || !isConsentComplete}
              />
              <Pressable
                style={styles.registerLink}
                onPress={() => router.push("/(auth)/login")}
                disabled={isFormBusy}
              >
                <Text style={styles.registerLinkText}>{AUTH_UI.GO_TO_LOGIN}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </AuthScreenScroll>
    </View>
  );
}
