import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  confirmPasswordReset,
  requestPasswordReset,
} from "@/entities/session/api/passwordReset";
import { useGuestProfileLoginMenuBannerImageQuery } from "@/entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery";
import { maskRuPhoneInput } from "@/entities/user/lib/ruPhone";
import { AUTH_UI } from "@/shared/config";
import { AUTH_PAGE_LAYOUT as A } from "@/shared/lib/authPageLayout";
import { formatApiErrorMessage } from "@/shared/lib";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useStableAuthHeroHeight } from "@/shared/lib/useStableAuthHeroHeight";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useLoginScreenStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { AuthScreenScroll } from "@/shared/ui/AuthScreenScroll";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { PasswordTextInput } from "@/shared/ui/PasswordTextInput";
import { ScreenBackButton } from "@/shared/ui/ScreenBackButton";

type AuthChannel = "email" | "phone";
type ResetStep = "request" | "confirm" | "done";
type FocusField = "email" | "phone" | "code" | null;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const animateChannelSwitch = () => {
  LayoutAnimation.configureNext(
    LayoutAnimation.create(
      180,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity,
    ),
  );
};

const keepDigitsOnly = (value: string) => value.replace(/\D/g, "");

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useLoginScreenStyles();
  const insets = useSafeAreaInsets();
  const heroHeight = useStableAuthHeroHeight();

  const [channel, setChannel] = useState<AuthChannel>("email");
  const [step, setStep] = useState<ResetStep>("request");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [localError, setLocalError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusField>(null);

  const bannerImageQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUri = bannerImageQuery.data
    ? resolveUploadedMediaUrl(bannerImageQuery.data)
    : null;

  const handleBack = useCallback(() => {
    if (step === "confirm") {
      setStep("request");
      setLocalError("");
      setCode("");
      setNewPassword("");
      setNewPasswordConfirm("");
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(auth)/login");
  }, [router, step]);

  const handleChannelChange = useCallback(
    (next: AuthChannel) => {
      if (next === channel) {
        return;
      }
      animateChannelSwitch();
      setChannel(next);
      setLocalError("");
    },
    [channel],
  );

  const contactPayload = () =>
    channel === "email"
      ? ({ email: email.trim() } as const)
      : ({ phoneNumber: phoneNumber.trim() } as const);

  const handleRequest = async () => {
    setLocalError("");
    setNotice("");
    if (channel === "phone" && !phoneNumber.trim()) {
      setLocalError(AUTH_UI.LOGIN_ERROR_PHONE_REQUIRED);
      return;
    }
    if (channel === "email" && !email.trim()) {
      setLocalError(AUTH_UI.FORGOT_ERROR_EMAIL_REQUIRED);
      return;
    }
    setIsLoading(true);
    try {
      const data = await requestPasswordReset(contactPayload());
      setNotice(data?.message || AUTH_UI.FORGOT_CODE_SENT);
      setStep("confirm");
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : formatApiErrorMessage(error, AUTH_UI.FORGOT_SEND_ERROR),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLocalError("");
    if (code.trim().length !== AUTH_UI.FORGOT_CODE_LENGTH) {
      setLocalError(AUTH_UI.FORGOT_ERROR_CODE_REQUIRED);
      return;
    }
    if (newPassword.length < 6) {
      setLocalError(AUTH_UI.FORGOT_ERROR_PASSWORD_TOO_SHORT);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setLocalError(AUTH_UI.FORGOT_ERROR_PASSWORD_MISMATCH);
      return;
    }
    setIsLoading(true);
    try {
      await confirmPasswordReset({
        ...contactPayload(),
        code: code.trim(),
        newPassword,
        newPasswordConfirm,
      });
      setStep("done");
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : formatApiErrorMessage(error, AUTH_UI.FORGOT_CONFIRM_ERROR),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setLocalError("");
    setIsLoading(true);
    try {
      const data = await requestPasswordReset(contactPayload());
      setNotice(data?.message || AUTH_UI.FORGOT_CODE_SENT);
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : formatApiErrorMessage(error, AUTH_UI.FORGOT_SEND_ERROR),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const subtitle =
    step === "done"
      ? AUTH_UI.FORGOT_DONE_SUBTITLE
      : step === "confirm"
        ? AUTH_UI.FORGOT_CONFIRM_SUBTITLE
        : AUTH_UI.FORGOT_SUBTITLE;

  return (
    <View style={styles.flex}>
      <AuthScreenScroll
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: A.bodyPaddingBottom + insets.bottom },
        ]}
      >
        <View style={styles.column}>
          <ScreenBackButton
            accessibilityLabel={AUTH_UI.BACK_BUTTON}
            disabled={isLoading}
            onPress={handleBack}
          />
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

          <View style={styles.body}>
            <Text style={styles.title}>{AUTH_UI.FORGOT_TITLE}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.form}>
              {step === "done" ? (
                <>
                  <Text style={styles.subtitle}>{AUTH_UI.FORGOT_DONE_MESSAGE}</Text>
                  <AppButton
                    label={AUTH_UI.GO_TO_LOGIN}
                    variant="primary"
                    style={styles.submitButton}
                    onPress={() => router.replace("/(auth)/login")}
                  />
                </>
              ) : step === "confirm" ? (
                <>
                  {notice ? <Text style={styles.subtitle}>{notice}</Text> : null}
                  <View style={styles.field}>
                    <Text style={styles.label}>
                      {channel === "email"
                        ? AUTH_UI.FORGOT_CODE_LABEL_EMAIL
                        : AUTH_UI.FORGOT_CODE_LABEL_SMS}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === "code" && styles.inputFocused,
                      ]}
                      value={code}
                      onChangeText={(value) =>
                        setCode(
                          keepDigitsOnly(value).slice(0, AUTH_UI.FORGOT_CODE_LENGTH),
                        )
                      }
                      onFocus={() => setFocusedField("code")}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      maxLength={AUTH_UI.FORGOT_CODE_LENGTH}
                      placeholder={AUTH_UI.FORGOT_CODE_PLACEHOLDER}
                      placeholderTextColor={theme.colors.textMuted}
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>{AUTH_UI.FORGOT_NEW_PASSWORD_LABEL}</Text>
                    <PasswordTextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>
                      {AUTH_UI.FORGOT_NEW_PASSWORD_CONFIRM_LABEL}
                    </Text>
                    <PasswordTextInput
                      value={newPasswordConfirm}
                      onChangeText={setNewPasswordConfirm}
                      editable={!isLoading}
                    />
                  </View>
                  {localError ? <Text style={styles.error}>{localError}</Text> : null}
                  <AppButton
                    label={
                      isLoading
                        ? AUTH_UI.FORGOT_CONFIRM_LOADING
                        : AUTH_UI.FORGOT_CONFIRM_BUTTON
                    }
                    variant="primary"
                    style={styles.submitButton}
                    onPress={() => void handleConfirm()}
                    disabled={isLoading}
                  />
                  <Pressable
                    style={[
                      styles.registerLink,
                      isLoading && styles.registerLinkDisabled,
                    ]}
                    onPress={() => void handleResend()}
                    disabled={isLoading}
                  >
                    <Text style={styles.registerLinkText}>
                      {isLoading
                        ? AUTH_UI.FORGOT_RESEND_LOADING
                        : AUTH_UI.FORGOT_RESEND_BUTTON}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View
                    style={styles.channelRow}
                    accessibilityRole="tablist"
                    accessibilityLabel={AUTH_UI.FORGOT_CHANNEL_ARIA}
                  >
                    <Pressable
                      style={({ pressed }) => [
                        styles.channelBtn,
                        channel === "email" && styles.channelBtnActive,
                        isLoading && styles.channelBtnDisabled,
                        pressed && !isLoading && styles.channelBtnPressed,
                      ]}
                      onPress={() => handleChannelChange("email")}
                      disabled={isLoading}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: channel === "email" }}
                    >
                      <Text
                        style={[
                          styles.channelBtnLabel,
                          channel === "email" && styles.channelBtnLabelActive,
                        ]}
                      >
                        {AUTH_UI.CHANNEL_EMAIL}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.channelBtn,
                        channel === "phone" && styles.channelBtnActive,
                        isLoading && styles.channelBtnDisabled,
                        pressed && !isLoading && styles.channelBtnPressed,
                      ]}
                      onPress={() => handleChannelChange("phone")}
                      disabled={isLoading}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: channel === "phone" }}
                    >
                      <Text
                        style={[
                          styles.channelBtnLabel,
                          channel === "phone" && styles.channelBtnLabelActive,
                        ]}
                      >
                        {AUTH_UI.CHANNEL_PHONE}
                      </Text>
                    </Pressable>
                  </View>

                  {channel === "email" ? (
                    <View style={styles.field}>
                      <Text style={styles.label}>{AUTH_UI.EMAIL_LABEL}</Text>
                      <TextInput
                        style={[
                          styles.input,
                          focusedField === "email" && styles.inputFocused,
                        ]}
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
                        editable={!isLoading}
                      />
                    </View>
                  ) : (
                    <View style={styles.field}>
                      <Text style={styles.label}>{AUTH_UI.PHONE_LABEL}</Text>
                      <TextInput
                        style={[
                          styles.input,
                          focusedField === "phone" && styles.inputFocused,
                        ]}
                        value={phoneNumber}
                        onChangeText={(value) =>
                          setPhoneNumber(maskRuPhoneInput(value))
                        }
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="phone-pad"
                        textContentType="telephoneNumber"
                        placeholder={AUTH_UI.PHONE_PLACEHOLDER}
                        placeholderTextColor={theme.colors.textMuted}
                        editable={!isLoading}
                      />
                    </View>
                  )}

                  {localError ? <Text style={styles.error}>{localError}</Text> : null}

                  <AppButton
                    label={
                      isLoading
                        ? AUTH_UI.FORGOT_SEND_LOADING
                        : AUTH_UI.FORGOT_SEND_BUTTON
                    }
                    variant="primary"
                    style={styles.submitButton}
                    onPress={() => void handleRequest()}
                    disabled={isLoading}
                  />
                  <Pressable
                    style={[
                      styles.registerLink,
                      isLoading && styles.registerLinkDisabled,
                    ]}
                    onPress={() => router.push("/(auth)/login")}
                    disabled={isLoading}
                  >
                    <Text style={styles.registerLinkText}>{AUTH_UI.GO_TO_LOGIN}</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </AuthScreenScroll>
    </View>
  );
}
