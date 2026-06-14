import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
import { useProfileScreenStyles } from "@/shared/theme/profileChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProfileScreen() {
  const router = useRouter();
  const styles = useProfileScreenStyles();
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
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{AUTH_UI.PROFILE_TITLE}</Text>
      <Text style={styles.subtitle}>{statusLabel}</Text>

      {needsEmailVerification ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{EMAIL_VERIFICATION_UI.BANNER}</Text>
          <AppButton
            label={EMAIL_VERIFICATION_UI.OPEN_BUTTON}
            variant="ghost"
            onPress={() => setEmailModalVisible(true)}
            style={styles.bannerButton}
          />
        </View>
      ) : null}

      {logoutMutation.isError ? (
        <Text style={styles.error}>
          {formatApiErrorMessage(logoutMutation.error, API_CLIENT_UI.LOGOUT_FALLBACK)}
        </Text>
      ) : null}

      {isLoggedIn ? (
        <>
          <View style={styles.actions}>
            <AppButton
              label={MY_PROFILE_PAGE_UI.TAB_OVERVIEW}
              variant="contrast"
              style={styles.actionButton}
              onPress={() => router.push("/hub/overview" as never)}
            />
            <AppButton
              label={USERS_PAGE_UI.OPEN_BUTTON}
              variant="contrast"
              style={styles.actionButton}
              onPress={() => router.push("/users" as never)}
            />
            <AppButton
              label={`${NOTIFICATIONS_PAGE_UI.OPEN_BUTTON}${unreadNotifications > 0 ? ` (${unreadNotifications})` : ""}`}
              variant="contrast"
              style={styles.actionButton}
              onPress={() => router.push("/notifications" as never)}
            />
            <AppButton
              label={`${MY_PROFILE_PAGE_UI.TAB_WISHLIST}${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`}
              variant="contrast"
              style={styles.actionButton}
              onPress={() => router.push("/hub/wishlist")}
            />
            <AppButton
              label={EDIT_PROFILE_UI.EDIT_BUTTON}
              variant="contrast"
              style={styles.actionButton}
              onPress={() => router.push({ pathname: "/profile/edit" })}
            />
            <AppButton
              label={MY_ORDERS_PAGE_UI.TITLE}
              variant="contrast"
              style={styles.actionButton}
              onPress={() => router.push({ pathname: "/orders" })}
            />
            <AppButton
              label={AUTH_UI.LOGOUT_BUTTON}
              variant="outline"
              style={styles.actionButton}
              onPress={handleLogout}
              disabled={logoutMutation.isPending}
            />
          </View>
          <ProfileHubMenu />
        </>
      ) : (
        <View style={styles.actions}>
          <AppButton
            label={AUTH_UI.LOGIN_BUTTON}
            variant="contrast"
            style={styles.actionButton}
            onPress={() => router.push("/(auth)/login")}
          />
          <AppButton
            label={AUTH_UI.REGISTER_BUTTON}
            variant="outline"
            style={styles.actionButton}
            onPress={() => router.push("/(auth)/register")}
          />
        </View>
      )}

      <Pressable style={styles.legalLink} onPress={() => router.push("/legal/privacy")}>
        <Text style={styles.legalLinkText}>{LEGAL_UI.PRIVACY_LINK}</Text>
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
