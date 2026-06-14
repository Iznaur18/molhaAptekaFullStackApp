import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from "react-native";

import { buildRegisterPayload } from "@/entities/session/lib/buildRegisterPayload";
import { useRegisterMutation } from "@/entities/session/model/useRegisterMutation";
import { API_CLIENT_UI, AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useAuthFormStyles, useFormFieldStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const authStyles = useAuthFormStyles();
  const fieldStyles = useFormFieldStyles();
  const registerMutation = useRegisterMutation();
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleUserNameChange = (value: string) => {
    setUserName(value.toLowerCase().replace(/[^a-z0-9]/g, ""));
  };

  const handleSubmit = async () => {
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
    : "";

  return (
    <KeyboardAvoidingView
      style={authStyles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={authStyles.container} keyboardShouldPersistTaps="handled">
        <Text style={authStyles.title}>{AUTH_UI.REGISTER_TITLE}</Text>

        <Text style={fieldStyles.label}>{AUTH_UI.EMAIL_LABEL}</Text>
        <TextInput
          style={fieldStyles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={fieldStyles.label}>{AUTH_UI.USER_NAME_LABEL}</Text>
        <TextInput
          style={fieldStyles.input}
          value={userName}
          onChangeText={handleUserNameChange}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={fieldStyles.label}>{AUTH_UI.PASSWORD_LABEL}</Text>
        <TextInput
          style={fieldStyles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={fieldStyles.label}>{AUTH_UI.PASSWORD_CONFIRM_LABEL}</Text>
        <TextInput
          style={fieldStyles.input}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
          placeholderTextColor={theme.colors.textMuted}
        />

        {errorMessage ? <Text style={fieldStyles.error}>{errorMessage}</Text> : null}

        <AppButton
          label={AUTH_UI.REGISTER_BUTTON}
          variant="contrast"
          onPress={handleSubmit}
          disabled={registerMutation.isPending}
        />

        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Text style={authStyles.link}>{AUTH_UI.GO_TO_LOGIN}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
