import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { buildRegisterPayload } from "@/entities/session/lib/buildRegisterPayload";
import { useRegisterMutation } from "@/entities/session/model/useRegisterMutation";
import { useGuestProfileLoginMenuBannerImageQuery } from "@/entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery";
import { isRegisterConsentComplete } from "@/features/legal/lib/isRegisterConsentComplete";
import { RegisterLegalConsentFields } from "@/features/legal/ui/RegisterLegalConsentFields";
import { API_CLIENT_UI, AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useLoginScreenStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

type RegisterField = "email" | "userName" | "password" | "passwordConfirm";

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useLoginScreenStyles();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const registerMutation = useRegisterMutation();
  const [email, setEmail] = useState("");
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

  // Умеренная высота hero, чтобы поля были выше и не перекрывались клавиатурой.
  const heroHeight = Math.round(Math.min(280, Math.max(170, screenHeight * 0.28)));

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  }, [router]);

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
      await registerMutation.mutateAsync(
        buildRegisterPayload({ email, userName, password, passwordConfirm }),
      );
      router.replace("/(tabs)");
    } catch {
      // error shown via mutation state
    }
  };

  const errorMessage = registerMutation.isError
    ? formatApiErrorMessage(registerMutation.error, API_CLIENT_UI.REGISTER_FALLBACK)
    : consentError;

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
        disabled={registerMutation.isPending}
        accessibilityRole="button"
        accessibilityLabel={AUTH_UI.BACK_BUTTON}
      >
        <Text style={styles.backButtonOverlayText}>{AUTH_UI.BACK_BUTTON}</Text>
      </Pressable>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
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
          <Text style={styles.title}>{AUTH_UI.REGISTER_TITLE}</Text>
          <Text style={styles.subtitle}>{AUTH_UI.REGISTER_SUBTITLE}</Text>

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
                textContentType="newPassword"
                placeholder={AUTH_UI.PASSWORD_PLACEHOLDER}
                placeholderTextColor={theme.colors.textMuted}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{AUTH_UI.PASSWORD_CONFIRM_LABEL}</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "passwordConfirm" && styles.inputFocused,
                ]}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                onFocus={() => setFocusedField("passwordConfirm")}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                textContentType="newPassword"
                placeholder={AUTH_UI.PASSWORD_CONFIRM_PLACEHOLDER}
                placeholderTextColor={theme.colors.textMuted}
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
              />
            </View>

            <RegisterLegalConsentFields
              termsAccepted={termsAccepted}
              personalDataConsentAccepted={personalDataConsentAccepted}
              disabled={registerMutation.isPending}
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
              disabled={registerMutation.isPending || !isConsentComplete}
            />
            <Pressable
              style={styles.registerLink}
              onPress={() => router.push("/(auth)/login")}
              disabled={registerMutation.isPending}
            >
              <Text style={styles.registerLinkText}>{AUTH_UI.GO_TO_LOGIN}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
