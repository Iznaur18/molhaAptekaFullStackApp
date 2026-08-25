import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { LayoutAnimation, Platform, Pressable, Text, TextInput, UIManager, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLoginMutation } from "@/entities/session/model/useLoginMutation";
import { usePhoneLoginMutation } from "@/entities/session/model/usePhoneLoginMutation";
import { useGuestProfileLoginMenuBannerImageQuery } from "@/entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery";
import { maskRuPhoneInput } from "@/entities/user/lib/ruPhone";
import { API_CLIENT_UI, AUTH_UI } from "@/shared/config";
import { AUTH_PAGE_LAYOUT as A } from "@/shared/lib/authPageLayout";
import { formatApiErrorMessage } from "@/shared/lib";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useStableAuthHeroHeight } from "@/shared/lib/useStableAuthHeroHeight";
import { releaseColdStartSplash } from "@/shared/model/coldStartSplashGate";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useLoginScreenStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { AuthScreenScroll } from "@/shared/ui/AuthScreenScroll";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { PasswordTextInput } from "@/shared/ui/PasswordTextInput";

type AuthChannel = "email" | "phone";
type LoginField = "email" | "phone";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const animateChannelSwitch = () => {
  LayoutAnimation.configureNext(
    LayoutAnimation.create(180, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity),
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useLoginScreenStyles();
  const insets = useSafeAreaInsets();
  const heroHeight = useStableAuthHeroHeight();
  const loginMutation = useLoginMutation();
  const phoneLoginMutation = usePhoneLoginMutation();

  const [channel, setChannel] = useState<AuthChannel>("email");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [focusedField, setFocusedField] = useState<LoginField | null>(null);

  const bannerImageQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUri = bannerImageQuery.data
    ? resolveUploadedMediaUrl(bannerImageQuery.data)
    : null;

  const isLoading = loginMutation.isPending || phoneLoginMutation.isPending;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  }, [router]);

  const finishLogin = useCallback(() => {
    releaseColdStartSplash();
    // Паритет web LoginPage → `/me`
    router.replace("/(tabs)/profile");
  }, [router]);

  const handleChannelChange = useCallback((next: AuthChannel) => {
    if (next === channel) {
      return;
    }
    animateChannelSwitch();
    setChannel(next);
    setLocalError("");
  }, [channel]);

  const handleSubmit = async () => {
    setLocalError("");

    if (channel === "phone" && !phoneNumber.trim()) {
      setLocalError(AUTH_UI.LOGIN_ERROR_PHONE_REQUIRED);
      return;
    }

    try {
      if (channel === "email") {
        await loginMutation.mutateAsync({ email: email.trim(), password });
      } else {
        await phoneLoginMutation.mutateAsync({
          method: "password",
          phoneNumber: phoneNumber.trim(),
          password,
        });
      }
      finishLogin();
    } catch {
      // error shown via mutation state
    }
  };

  const mutationError =
    channel === "email" ? loginMutation.error : phoneLoginMutation.error;

  const errorMessage =
    localError ||
    (mutationError
      ? formatApiErrorMessage(mutationError, API_CLIENT_UI.LOGIN_FALLBACK)
      : "");

  const submitLabel = isLoading
    ? AUTH_UI.LOGIN_SUBMIT_LOADING
    : AUTH_UI.LOGIN_BUTTON;

  return (
    <View style={styles.flex}>
      <Pressable
        style={[
          styles.backButtonOverlay,
          {
            top: insets.top + A.backTopInset,
            left: Math.max(insets.left, A.backLeftInset),
          },
          isLoading && styles.backButtonOverlayDisabled,
        ]}
        onPress={handleBack}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={AUTH_UI.BACK_BUTTON}
      >
        <Feather name="chevron-left" size={22} color={theme.colors.link} />
      </Pressable>

      <AuthScreenScroll
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: A.bodyPaddingBottom + insets.bottom },
        ]}
      >
        <View style={styles.column}>
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
            <Text style={styles.title}>{AUTH_UI.LOGIN_TITLE}</Text>
            <Text style={styles.subtitle}>{AUTH_UI.LOGIN_SUBTITLE}</Text>

            <View style={styles.form}>
              <View
                style={styles.channelRow}
                accessibilityRole="tablist"
                accessibilityLabel={AUTH_UI.CHANNEL_TOGGLE_ARIA}
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
                    editable={!isLoading}
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
                    editable={!isLoading}
                  />
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>{AUTH_UI.PASSWORD_LABEL}</Text>
                <PasswordTextInput
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                  editable={!isLoading}
                />
              </View>

              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

              <AppButton
                label={submitLabel}
                variant="primary"
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              />
              <Pressable
                style={[styles.registerLink, isLoading && styles.registerLinkDisabled]}
                onPress={() => router.push("/(auth)/forgot-password")}
                disabled={isLoading}
              >
                <Text style={styles.registerLinkText}>{AUTH_UI.FORGOT_PASSWORD_LINK}</Text>
              </Pressable>
              <Pressable
                style={[styles.registerLink, isLoading && styles.registerLinkDisabled]}
                onPress={() => router.push("/(auth)/register")}
                disabled={isLoading}
              >
                <Text style={styles.registerLinkText}>{AUTH_UI.GO_TO_REGISTER}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </AuthScreenScroll>
    </View>
  );
};
