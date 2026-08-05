import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLoginMutation } from "@/entities/session/model/useLoginMutation";
import { usePhoneLoginMutation } from "@/entities/session/model/usePhoneLoginMutation";
import { useGuestProfileLoginMenuBannerImageQuery } from "@/entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery";
import { maskRuPhoneInput } from "@/entities/user/lib/ruPhone";
import { API_CLIENT_UI, AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
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
type LoginField = "email" | "phone";

const LOGIN_CHANNEL_TABS = [
  { id: "email", label: AUTH_UI.CHANNEL_EMAIL },
  { id: "phone", label: AUTH_UI.CHANNEL_PHONE },
] as const;

export default function LoginScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useLoginScreenStyles();
  const insets = useSafeAreaInsets();
  const { centeredContentStyle } = useScreenLayout();
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
    router.replace("/(tabs)");
  }, [router]);

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
        disabled={isLoading}
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

        <View style={[styles.body, centeredContentStyle]}>
          <Text style={styles.title}>{AUTH_UI.LOGIN_TITLE}</Text>
          <Text style={styles.subtitle}>{AUTH_UI.LOGIN_SUBTITLE}</Text>

          <View style={styles.form}>
            <ModalSectionTabs
              tabs={LOGIN_CHANNEL_TABS}
              activeTabId={channel}
              onTabChange={(tabId) => {
                setChannel(tabId as AuthChannel);
                setLocalError("");
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
              />
            </View>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <AppButton
              label={AUTH_UI.LOGIN_BUTTON}
              variant="primary"
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isLoading}
            />
            <Pressable
              style={styles.registerLink}
              onPress={() => router.push("/(auth)/register")}
              disabled={isLoading}
            >
              <Text style={styles.registerLinkText}>{AUTH_UI.GO_TO_REGISTER}</Text>
            </Pressable>
          </View>
        </View>
      </AuthScreenScroll>
    </View>
  );
}
