import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLoginMutation } from "@/entities/session/model/useLoginMutation";
import { useGuestProfileLoginMenuBannerImageQuery } from "@/entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery";
import { API_CLIENT_UI, AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useStableAuthHeroHeight } from "@/shared/lib/useStableAuthHeroHeight";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useLoginScreenStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { AuthScreenScroll } from "@/shared/ui/AuthScreenScroll";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { PasswordTextInput } from "@/shared/ui/PasswordTextInput";

export default function LoginScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useLoginScreenStyles();
  const insets = useSafeAreaInsets();
  const heroHeight = useStableAuthHeroHeight();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);

  const bannerImageQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUri = bannerImageQuery.data
    ? resolveUploadedMediaUrl(bannerImageQuery.data)
    : null;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  }, [router]);

  const handleSubmit = async () => {
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
      router.replace("/(tabs)");
    } catch {
      // error shown via mutation state
    }
  };

  const errorMessage = loginMutation.isError
    ? formatApiErrorMessage(loginMutation.error, API_CLIENT_UI.LOGIN_FALLBACK)
    : "";

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
        disabled={loginMutation.isPending}
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

        <View style={styles.body}>
          <Text style={styles.title}>{AUTH_UI.LOGIN_TITLE}</Text>
          <Text style={styles.subtitle}>{AUTH_UI.LOGIN_SUBTITLE}</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>{AUTH_UI.EMAIL_LABEL}</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder={AUTH_UI.EMAIL_PLACEHOLDER}
                placeholderTextColor={theme.colors.textMuted}
                returnKeyType="next"
              />
            </View>

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
              disabled={loginMutation.isPending}
            />
            <Pressable
              style={styles.registerLink}
              onPress={() => router.push("/(auth)/register")}
              disabled={loginMutation.isPending}
            >
              <Text style={styles.registerLinkText}>{AUTH_UI.GO_TO_REGISTER}</Text>
            </Pressable>
          </View>
        </View>
      </AuthScreenScroll>
    </View>
  );
}
