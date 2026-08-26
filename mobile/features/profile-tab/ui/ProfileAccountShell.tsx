import { useRouter } from "expo-router";
import { type ReactNode, type RefObject } from "react";
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileHubMenu } from "@/features/profile-hub/ui/ProfileHubMenu";
import type { ProfileSectionId } from "@/features/profile-hub/model/profileSections";
import { PROFILE_SECTION_OVERVIEW } from "@/features/profile-hub/model/profileSections";
import {
  ProfileAccountScrollProvider,
  useProfileAccountScroll,
} from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileNavLogoutFooter } from "@/features/profile-tab/ui/ProfileNavLogoutFooter";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useProfileScreenStyles } from "@/shared/theme/profileChromeStyles";

type ProfileAccountShellProps = {
  activeSectionId: ProfileSectionId;
  children: ReactNode;
  /**
   * overview | hub: на desktop (>900) один ScrollView на sidebar+main —
   * паритет web `.my-profile-page__layout` (документный скролл).
   * ≤900 — только children (toggle+sheet внутри страниц).
   */
  mode?: "overview" | "hub";
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ScrollViewProps["refreshControl"];
  scrollRef?: RefObject<ScrollView | null>;
};

type DesktopShellScrollProps = {
  sidebar: ReactNode;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: ScrollViewProps["refreshControl"];
  scrollRef?: RefObject<ScrollView | null>;
  mainContentStyle?: StyleProp<ViewStyle>;
};

const DesktopShellScroll = ({
  sidebar,
  children,
  contentContainerStyle,
  refreshControl,
  scrollRef,
  mainContentStyle,
}: DesktopShellScrollProps) => {
  const styles = useProfileScreenStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { handleOuterScroll } = useProfileAccountScroll();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={[styles.safeArea, centeredContentStyle, styles.shellPad]}>
        <ScrollView
          ref={scrollRef}
          style={styles.safeArea}
          contentContainerStyle={[
            styles.pageScrollContent,
            { paddingBottom: contentPaddingBottom },
            contentContainerStyle,
          ]}
          refreshControl={refreshControl}
          onScroll={handleOuterScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.pageLayout}>
            {sidebar}
            <View style={[styles.mainColumn, mainContentStyle]}>{children}</View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

/**
 * Паритет web MyProfilePage layout: >900 sidebar постоянно слева;
 * ≤900 — только children (toggle+sheet внутри страниц).
 */
export const ProfileAccountShell = ({
  activeSectionId,
  children,
  mode = "hub",
  contentContainerStyle,
  refreshControl,
  scrollRef,
}: ProfileAccountShellProps) => {
  const router = useRouter();
  const styles = useProfileScreenStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { isDrawerLayout } = useProfileAdaptiveLayout();

  const handleOverviewPress = () => {
    if (activeSectionId === PROFILE_SECTION_OVERVIEW && scrollRef?.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
      return;
    }
    router.replace("/(tabs)/me");
  };

  const sidebar = (
    <View style={styles.sidebarWrap}>
      <View style={styles.sidebarInner}>
        <ProfileHubMenu
          activeSectionId={activeSectionId}
          onOverviewPress={handleOverviewPress}
          variant="sidebar"
        />
        <ProfileNavLogoutFooter />
      </View>
    </View>
  );

  if (isDrawerLayout) {
    if (mode === "overview") {
      return (
        <ProfileAccountScrollProvider outerScrollOwns={false}>
          <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <View style={[styles.safeArea, centeredContentStyle, styles.shellPad]}>
              <ScrollView
                ref={scrollRef}
                style={styles.safeArea}
                contentContainerStyle={[
                  styles.pageScrollContent,
                  { paddingBottom: contentPaddingBottom },
                  contentContainerStyle,
                ]}
                refreshControl={refreshControl}
              >
                <View style={styles.mainColumnContent}>{children}</View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </ProfileAccountScrollProvider>
      );
    }

    return (
      <ProfileAccountScrollProvider outerScrollOwns={false}>
        {children}
      </ProfileAccountScrollProvider>
    );
  }

  const mainContentStyle =
    mode === "overview" ? styles.mainColumnContent : contentContainerStyle;

  return (
    <ProfileAccountScrollProvider outerScrollOwns>
      <DesktopShellScroll
        sidebar={sidebar}
        contentContainerStyle={mode === "overview" ? contentContainerStyle : undefined}
        refreshControl={refreshControl}
        scrollRef={scrollRef}
        mainContentStyle={mainContentStyle}
      >
        {children}
      </DesktopShellScroll>
    </ProfileAccountScrollProvider>
  );
};
