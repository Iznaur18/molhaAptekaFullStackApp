import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useLogoutMutation } from "@/entities/session/model/useLogoutMutation";
import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { EmailVerificationModal } from "@/features/email-verify/ui/EmailVerificationModal";
import { ProfileHubMenu } from "@/features/profile-hub/ui/ProfileHubMenu";
import { ThemePreferenceToggle } from "@/features/theme-settings/ui/ThemePreferenceToggle";
import { useUnreadNotificationsCount } from "@/entities/notification/model/useInAppNotifications";
import { useWishlist } from "@/entities/wishlist/model/WishlistProvider";
import {
  API_CLIENT_UI,
  AUTH_UI,
  EDIT_PROFILE_UI,
  EMAIL_VERIFICATION_UI,
  LEGAL_UI,
  MY_ORDERS_PAGE_UI,
  NOTIFICATIONS_PAGE_UI,
  MY_PROFILE_PAGE_UI,
  USERS_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const sessionQuery = useAuthSessionQuery();
  const logoutMutation = useLogoutMutation();
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const unreadNotifications = useUnreadNotificationsCount();
  const { totalCount: wishlistCount } = useWishlist();

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
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.bg }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{AUTH_UI.PROFILE_TITLE}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{statusLabel}</Text>

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
        <>
          <View style={styles.quickActions}>
            <Pressable
              style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
              onPress={() => router.push("/hub/overview" as never)}
            >
              <Text style={styles.buttonText}>{MY_PROFILE_PAGE_UI.TAB_OVERVIEW}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
              onPress={() => router.push("/users" as never)}
            >
              <Text style={styles.buttonText}>{USERS_PAGE_UI.OPEN_BUTTON}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
              onPress={() => router.push("/notifications" as never)}
            >
              <Text style={styles.buttonText}>
                {NOTIFICATIONS_PAGE_UI.OPEN_BUTTON}
                {unreadNotifications > 0 ? ` (${unreadNotifications})` : ""}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
              onPress={() => router.push("/hub/wishlist")}
            >
              <Text style={styles.buttonText}>
                {MY_PROFILE_PAGE_UI.TAB_WISHLIST}
                {wishlistCount > 0 ? ` (${wishlistCount})` : ""}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
              onPress={() => router.push({ pathname: "/profile/edit" })}
            >
              <Text style={styles.buttonText}>{EDIT_PROFILE_UI.EDIT_BUTTON}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
              onPress={() => router.push({ pathname: "/orders" })}
            >
              <Text style={styles.buttonText}>{MY_ORDERS_PAGE_UI.TITLE}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonSecondary, { borderColor: theme.colors.nearBlack }]}
              onPress={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <Text style={[styles.buttonText, styles.buttonSecondaryText, { color: theme.colors.nearBlack }]}>
                {AUTH_UI.LOGOUT_BUTTON}
              </Text>
            </Pressable>
          </View>
          <ProfileHubMenu />
        </>
      ) : (
        <View style={styles.authActions}>
          <Pressable
            style={[styles.button, { backgroundColor: theme.colors.nearBlack }]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.buttonText}>{AUTH_UI.LOGIN_BUTTON}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonSecondary, { borderColor: theme.colors.nearBlack }]}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={[styles.buttonText, styles.buttonSecondaryText, { color: theme.colors.nearBlack }]}>
              {AUTH_UI.REGISTER_BUTTON}
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable style={styles.legalLink} onPress={() => router.push("/legal/privacy")}>
        <Text style={[styles.legalLinkText, { color: theme.colors.link }]}>
          {LEGAL_UI.PRIVACY_LINK}
        </Text>
      </Pressable>

      <ThemePreferenceToggle />

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
    justifyContent: "flex-start",
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
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
  quickActions: {
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
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 200,
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondaryText: {},
  error: {
    marginTop: 12,
    color: "#c62828",
    textAlign: "center",
  },
  legalLink: {
    marginTop: 32,
    paddingVertical: 8,
  },
  legalLinkText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
