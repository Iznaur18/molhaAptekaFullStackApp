import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { EmailVerificationModal } from "@/features/email-verify/ui/EmailVerificationModal";
import { PROFILE_SECTION_OVERVIEW } from "@/features/profile-hub/model/profileSections";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { ProfileTabOverviewSection } from "@/features/profile-tab/ui/ProfileTabOverviewSection";
import { ThemePreferenceToggle } from "@/features/theme-settings/ui/ThemePreferenceToggle";
import {
  AUTH_UI,
  EMAIL_VERIFICATION_UI,
  LEGAL_UI,
  MY_PROFILE_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useProfileScreenStyles } from "@/shared/theme/profileChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProfileScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const styles = useProfileScreenStyles();
  const { centeredContentStyle, contentPaddingTop } = useScreenLayout();
  const sessionQuery = useAuthSessionQuery();
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [navSheetVisible, setNavSheetVisible] = useState(false);

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

  const handleOverviewPress = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  if (!isLoggedIn) {
    return (
      <ScrollView contentContainerStyle={[styles.guestContent, { paddingTop: contentPaddingTop + 24 }]}>
        <Text style={styles.title}>{AUTH_UI.PROFILE_TITLE}</Text>
        <Text style={styles.subtitle}>{AUTH_UI.GUEST_STATUS}</Text>
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
        <Pressable style={styles.legalLink} onPress={() => router.push("/legal/privacy")}>
          <Text style={styles.legalLinkText}>{LEGAL_UI.PRIVACY_LINK}</Text>
        </Pressable>
        <ThemePreferenceToggle />
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, centeredContentStyle, { paddingTop: contentPaddingTop + 12 }]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={sessionQuery.isRefetching}
            onRefresh={sessionQuery.refetch}
          />
        }
      >
        <ProfileMobileSectionToggle
          activeLabel={MY_PROFILE_PAGE_UI.TAB_OVERVIEW}
          onPress={() => setNavSheetVisible(true)}
        />

        {needsEmailVerification ? (
          <View style={styles.emailBanner}>
            <Text style={styles.emailBannerText}>{EMAIL_VERIFICATION_UI.BANNER}</Text>
            <AppButton
              label={EMAIL_VERIFICATION_UI.OPEN_BUTTON}
              variant="ghost"
              onPress={() => setEmailModalVisible(true)}
              style={styles.emailBannerButton}
            />
          </View>
        ) : null}

        <ProfileTabOverviewSection
          onEditPress={() => router.push({ pathname: "/profile/edit" })}
        />

        <Pressable style={styles.legalLink} onPress={() => router.push("/legal/privacy")}>
          <Text style={styles.legalLinkText}>{LEGAL_UI.PRIVACY_LINK}</Text>
        </Pressable>

        <ThemePreferenceToggle />
      </ScrollView>

      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId={PROFILE_SECTION_OVERVIEW}
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={handleOverviewPress}
      />

      <EmailVerificationModal
        visible={emailModalVisible}
        email={user?.email ?? ""}
        onClose={() => setEmailModalVisible(false)}
        onVerified={() => setEmailModalVisible(false)}
      />
    </>
  );
}
