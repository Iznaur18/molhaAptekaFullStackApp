import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useGuestProfileLoginMenuBannerImageQuery } from "@/entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery";
import { EmailVerificationModal } from "@/features/email-verify/ui/EmailVerificationModal";
import { ProfileHubMenu } from "@/features/profile-hub/ui/ProfileHubMenu";
import { PROFILE_SECTION_OVERVIEW } from "@/features/profile-hub/model/profileSections";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { ProfileNavLogoutFooter } from "@/features/profile-tab/ui/ProfileNavLogoutFooter";
import { ProfileTabOverviewSection } from "@/features/profile-tab/ui/ProfileTabOverviewSection";
import { ThemePreferenceToggle } from "@/features/theme-settings/ui/ThemePreferenceToggle";
import {
  AUTH_UI,
  EMAIL_VERIFICATION_UI,
  LEGAL_UI,
  MY_PROFILE_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useStableAuthHeroHeight } from "@/shared/lib/useStableAuthHeroHeight";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useProfileScreenStyles } from "@/shared/theme/profileChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProfileScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const styles = useProfileScreenStyles();
  const { contentPaddingBottom, centeredContentStyle } = useScreenLayout();
  const { isDrawerLayout, isPhoneLayout } = useProfileAdaptiveLayout();
  const guestHeroHeight = useStableAuthHeroHeight();
  const sessionQuery = useAuthSessionQuery();
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const user = sessionQuery.data?.user;
  const isLoggedIn = Boolean(user);
  const needsEmailVerification =
    isLoggedIn &&
    Boolean(String(user?.email ?? "").trim()) &&
    user?.isEmailVerified !== true;
  const isSessionLoading = sessionQuery.isPending && sessionQuery.data === undefined;

  const guestProfileLoginMenuBannerImageQuery = useGuestProfileLoginMenuBannerImageQuery({
    enabled: !isLoggedIn && !isSessionLoading,
  });

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
    }, []),
  );

  useEffect(() => {
    if (!isDrawerLayout) {
      setNavSheetVisible(false);
    }
  }, [isDrawerLayout]);

  const handleOverviewPress = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleManualRefresh = useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      await sessionQuery.refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [sessionQuery]);

  if (isSessionLoading) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScreenLoadingState message={AUTH_UI.SESSION_CHECK} />
      </SafeAreaView>
    );
  }

  if (sessionQuery.isError && sessionQuery.data === undefined) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScreenErrorState
          message={formatApiErrorMessage(sessionQuery.error, AUTH_UI.SESSION_ERROR)}
          onRetry={() => sessionQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    const guestProfileLoginMenuBannerImageUrl =
      guestProfileLoginMenuBannerImageQuery.data ?? null;
    const guestProfileLoginMenuBannerImageUri = guestProfileLoginMenuBannerImageUrl
      ? resolveUploadedMediaUrl(guestProfileLoginMenuBannerImageUrl)
      : null;

    return (
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.guestSafeArea}>
        <ScrollView
          style={styles.guestSafeArea}
          contentContainerStyle={[
            styles.guestScrollContent,
            { paddingBottom: contentPaddingBottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.guestColumn}>
            <View style={[styles.guestHero, { height: guestHeroHeight }]}>
              {guestProfileLoginMenuBannerImageUri ? (
                <CachedProductImage
                  uri={guestProfileLoginMenuBannerImageUri}
                  style={styles.guestHeroImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.guestHeroSkeleton} />
              )}
            </View>

            <View style={styles.guestBody}>
              <Text style={styles.title}>{AUTH_UI.PROFILE_TITLE}</Text>
              <Text style={styles.subtitle}>{AUTH_UI.GUEST_STATUS}</Text>
              <View style={styles.actions}>
                <AppButton
                  label={AUTH_UI.GUEST_PROFILE_ACTION_BUTTON}
                  variant="primary"
                  style={styles.actionButton}
                  onPress={() => router.push("/(auth)/login")}
                />
              </View>
              <Pressable
                style={styles.legalLink}
                onPress={() => router.push("/legal/privacy")}
              >
                <Text style={styles.legalLinkText}>{LEGAL_UI.PRIVACY_LINK}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const overviewBlocks = (
    <>
      {isDrawerLayout ? (
        <ProfileMobileSectionToggle
          activeLabel={MY_PROFILE_PAGE_UI.TAB_OVERVIEW}
          appearance={isPhoneLayout ? "phone" : "tablet"}
          onPress={() => setNavSheetVisible(true)}
        />
      ) : null}

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

      {isPhoneLayout ? (
        <View style={styles.overviewFooter}>
          <ThemePreferenceToggle />
        </View>
      ) : null}
    </>
  );

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={[styles.safeArea, centeredContentStyle, styles.shellPad]}>
          {/* Один скролл как web document scroll на /me (не два независимых). */}
          <ScrollView
            ref={scrollRef}
            style={styles.safeArea}
            contentContainerStyle={[
              styles.pageScrollContent,
              { paddingBottom: contentPaddingBottom },
            ]}
            refreshControl={
              <ThemedRefreshControl
                refreshing={isManualRefreshing}
                onRefresh={handleManualRefresh}
              />
            }
          >
            {isDrawerLayout ? (
              <View style={styles.scrollContent}>{overviewBlocks}</View>
            ) : (
              <View style={styles.pageLayout}>
                <View style={styles.sidebarWrap}>
                  <View style={styles.sidebarInner}>
                    <ProfileHubMenu
                      activeSectionId={PROFILE_SECTION_OVERVIEW}
                      onOverviewPress={handleOverviewPress}
                      variant="sidebar"
                    />
                    <ProfileNavLogoutFooter />
                  </View>
                </View>
                <View style={[styles.mainColumn, styles.scrollContent]}>
                  {overviewBlocks}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>

      {isDrawerLayout ? (
        <ProfileMobileNavSheet
          visible={navSheetVisible}
          activeSectionId={PROFILE_SECTION_OVERVIEW}
          side={isPhoneLayout ? "right" : "left"}
          onClose={() => setNavSheetVisible(false)}
          onOverviewPress={handleOverviewPress}
        />
      ) : null}

      <EmailVerificationModal
        visible={emailModalVisible}
        email={user?.email ?? ""}
        onClose={() => setEmailModalVisible(false)}
        onVerified={() => setEmailModalVisible(false)}
      />
    </>
  );
}
