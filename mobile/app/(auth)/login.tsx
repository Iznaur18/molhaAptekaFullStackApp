import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLoginMutation } from "@/entities/session/model/useLoginMutation";
import { useGuestProfileLoginMenuBannerImageQuery } from "@/entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery";
import { API_CLIENT_UI, AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useLoginScreenStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

export default function LoginScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useLoginScreenStyles();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  const bannerImageQuery = useGuestProfileLoginMenuBannerImageQuery();
  const bannerImageUri = bannerImageQuery.data
    ? resolveUploadedMediaUrl(bannerImageQuery.data)
    : null;

  // Умеренная высота hero, чтобы поля были выше и не перекрывались клавиатурой.
  const heroHeight = Math.round(Math.min(280, Math.max(170, screenHeight * 0.28)));

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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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

      <View style={[styles.flex, styles.page]}>
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
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{AUTH_UI.PASSWORD_LABEL}</Text>
              <TextInput
                style={[styles.input, focusedField === "password" && styles.inputFocused]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                textContentType="password"
                placeholder={AUTH_UI.PASSWORD_PLACEHOLDER}
                placeholderTextColor={theme.colors.textMuted}
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
      </View>
    </KeyboardAvoidingView>
  );
}
