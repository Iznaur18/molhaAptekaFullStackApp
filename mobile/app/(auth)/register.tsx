import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

import { buildRegisterPayload } from "@/entities/session/lib/buildRegisterPayload";
import { useRegisterMutation } from "@/entities/session/model/useRegisterMutation";
import { API_CLIENT_UI, AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export default function RegisterScreen() {
  const router = useRouter();
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
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{AUTH_UI.REGISTER_TITLE}</Text>

        <Text style={styles.label}>{AUTH_UI.EMAIL_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>{AUTH_UI.USER_NAME_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={handleUserNameChange}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>{AUTH_UI.PASSWORD_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>{AUTH_UI.PASSWORD_CONFIRM_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable
          style={[styles.button, registerMutation.isPending && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{AUTH_UI.REGISTER_BUTTON}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.link}>{AUTH_UI.GO_TO_LOGIN}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  error: {
    color: "#c62828",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#1565c0",
    fontSize: 15,
  },
});
