import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLoginMutation } from "@/entities/session/model/useLoginMutation";
import { API_CLIENT_UI, AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAuthFormStyles, useFormFieldStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";

export default function LoginScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const authStyles = useAuthFormStyles();
  const fieldStyles = useFormFieldStyles();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      style={authStyles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
        <Text style={authStyles.title}>{AUTH_UI.LOGIN_TITLE}</Text>

        <Text style={fieldStyles.label}>{AUTH_UI.EMAIL_LABEL}</Text>
        <TextInput
          style={fieldStyles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={fieldStyles.label}>{AUTH_UI.PASSWORD_LABEL}</Text>
        <TextInput
          style={fieldStyles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          placeholderTextColor={theme.colors.textMuted}
        />

        {errorMessage ? <Text style={fieldStyles.error}>{errorMessage}</Text> : null}

        <View style={authStyles.authActions}>
          <AppButton
            label={AUTH_UI.LOGIN_BUTTON}
            variant="primary"
            style={authStyles.authButton}
            onPress={handleSubmit}
            disabled={loginMutation.isPending}
          />
          <AppButton
            label={AUTH_UI.GO_TO_REGISTER}
            variant="secondary"
            style={[authStyles.authButton, authStyles.authSecondaryButton]}
            onPress={() => router.push("/(auth)/register")}
            disabled={loginMutation.isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
