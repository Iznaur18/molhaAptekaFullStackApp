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

import { useLoginMutation } from "@/entities/session/model/useLoginMutation";
import { AUTH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export default function LoginScreen() {
  const router = useRouter();
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
    ? formatApiErrorMessage(loginMutation.error, AUTH_UI.LOGIN_BUTTON)
    : "";

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{AUTH_UI.LOGIN_TITLE}</Text>

        <Text style={styles.label}>{AUTH_UI.EMAIL_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <Text style={styles.label}>{AUTH_UI.PASSWORD_LABEL}</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable
          style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{AUTH_UI.LOGIN_BUTTON}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.link}>{AUTH_UI.GO_TO_REGISTER}</Text>
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
