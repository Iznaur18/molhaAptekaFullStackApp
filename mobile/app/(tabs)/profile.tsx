import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { useGuestProfileLoginMenuBannerImageQuery } from "@/entities/site-header-banner/model/useGuestProfileLoginMenuBannerImageQuery";
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
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useProfileScreenStyles } from "@/shared/theme/profileChromeStyles";
import { useAuthFormStyles } from "@/shared/theme/formChromeStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function ProfileScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const styles = useProfileScreenStyles();
  const authStyles = useAuthFormStyles();
  const {
    centeredContentStyle,
    contentPaddingBottom,
    contentPaddingHorizontal,
    width: screenWidth,
  } = useScreenLayout();
  const safeAreaInsets = useSafeAreaInsets();
  const sessionQuery = useAuthSessionQuery();
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [guestHeroWidth, setGuestHeroWidth] = useState(() =>
    Math.max(
      0,
      Math.round(
        screenWidth - (safeAreaInsets.left ?? 0) - (safeAreaInsets.right ?? 0),
      ),
    ),
  );

  useEffect(() => {
    setGuestHeroWidth(
      Math.max(
        0,
        Math.round(
          screenWidth - (safeAreaInsets.left ?? 0) - (safeAreaInsets.right ?? 0),
        ),
      ),
    );
  }, [screenWidth, safeAreaInsets.left, safeAreaInsets.right]);

  const user = sessionQuery.data?.user;
  const isLoggedIn = Boolean(user);
  const needsEmailVerification = isLoggedIn && user?.isEmailVerified === false;
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

  const handleOverviewPress = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

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

    const guestHeroHeight =
      guestHeroWidth > 0 ? Math.round(guestHeroWidth + safeAreaInsets.top) : undefined;

    return (
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.guestSafeArea}>
        <ScrollView
          scrollEnabled
          contentContainerStyle={[
            styles.guestContent,
            { width: "100%" },
          ]}
        >
          <View
            style={styles.guestInner}
            onLayout={(event) => {
              const nextWidth = Math.round(event.nativeEvent.layout.width);
              if (nextWidth > 0) {
                setGuestHeroWidth(nextWidth);
              }
            }}
          >
            <View style={[styles.guestHero, guestHeroHeight ? { height: guestHeroHeight } : null]}>
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
                  label={AUTH_UI.LOGIN_BUTTON}
                  variant="primary"
                  style={styles.actionButton}
                  onPress={() => router.push("/(auth)/login")}
                />
                <AppButton
                  label={AUTH_UI.REGISTER_BUTTON}
                  variant="secondary"
                  style={[styles.actionButton, authStyles.authSecondaryButton]}
                  onPress={() => router.push("/(auth)/register")}
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

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView
          ref={scrollRef}
          scrollEnabled
          style={centeredContentStyle}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: contentPaddingHorizontal,
              paddingBottom: contentPaddingBottom,
            },
          ]}
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
      </SafeAreaView>

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
