import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useLogoutMutation } from "@/entities/session/model/useLogoutMutation";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { EmailVerificationModal } from "@/features/email-verify/ui/EmailVerificationModal";
import {
  API_CLIENT_UI,
  AUTH_UI,
  EDIT_PROFILE_UI,
  EMAIL_VERIFICATION_UI,
  MY_ORDERS_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProfileScreen() {
  const router = useRouter();
  const sessionQuery = useAuthSessionQuery();
  const logoutMutation = useLogoutMutation();
  const [emailModalVisible, setEmailModalVisible] = useState(false);

  const user = sessionQuery.data?.user;
  const isLoggedIn = Boolean(user);
  const needsEmailVerification = isLoggedIn && user?.isEmailVerified === false;

  if (sessionQuery.isPending) {
    return <ScreenLoadingState message={AUTH_UI.SESSION_CHECK} />;
  }

  if (sessionQuery.isError) {
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(sessionQuery.error, AUTH_UI.SESSION_ERROR)}
        onRetry={() => sessionQuery.refetch()}
      />
    );
  }

  const statusLabel = user
    ? (user.email ?? user.userName ?? "Аккаунт")
    : AUTH_UI.GUEST_STATUS;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // error via mutation
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{AUTH_UI.PROFILE_TITLE}</Text>
      <Text style={styles.subtitle}>{statusLabel}</Text>

      {needsEmailVerification ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{EMAIL_VERIFICATION_UI.BANNER}</Text>
          <Pressable style={styles.bannerButton} onPress={() => setEmailModalVisible(true)}>
            <Text style={styles.bannerButtonText}>{EMAIL_VERIFICATION_UI.OPEN_BUTTON}</Text>
          </Pressable>
        </View>
      ) : null}

      {logoutMutation.isError ? (
        <Text style={styles.error}>
          {formatApiErrorMessage(logoutMutation.error, API_CLIENT_UI.LOGOUT_FALLBACK)}
        </Text>
      ) : null}

      {isLoggedIn ? (
        <View style={styles.actions}>
          <Pressable
            style={styles.button}
            onPress={() => router.push({ pathname: "/profile/edit" })}
          >
            <Text style={styles.buttonText}>{EDIT_PROFILE_UI.EDIT_BUTTON}</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => router.push({ pathname: "/orders" })}
          >
            <Text style={styles.buttonText}>{MY_ORDERS_PAGE_UI.TITLE}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <Text style={[styles.buttonText, styles.buttonSecondaryText]}>
              {AUTH_UI.LOGOUT_BUTTON}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.authActions}>
          <Pressable style={styles.button} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.buttonText}>{AUTH_UI.LOGIN_BUTTON}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={[styles.buttonText, styles.buttonSecondaryText]}>
              {AUTH_UI.REGISTER_BUTTON}
            </Text>
          </Pressable>
        </View>
      )}

      <EmailVerificationModal
        visible={emailModalVisible}
        email={user?.email ?? ""}
        onClose={() => setEmailModalVisible(false)}
        onVerified={() => setEmailModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  banner: {
    marginTop: 20,
    width: "100%",
    maxWidth: 360,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff8e1",
    borderWidth: 1,
    borderColor: "#ffe082",
  },
  bannerText: {
    fontSize: 14,
    color: "#5d4037",
    textAlign: "center",
  },
  bannerButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  bannerButtonText: {
    color: "#1565c0",
    fontSize: 15,
    fontWeight: "600",
  },
  actions: {
    marginTop: 24,
    width: "100%",
    maxWidth: 320,
    gap: 12,
  },
  authActions: {
    marginTop: 24,
    width: "100%",
    maxWidth: 320,
    gap: 12,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 200,
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#111",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondaryText: {
    color: "#111",
  },
  error: {
    marginTop: 12,
    color: "#c62828",
    textAlign: "center",
  },
});
