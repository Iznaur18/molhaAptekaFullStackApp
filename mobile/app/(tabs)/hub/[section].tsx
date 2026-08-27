import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, type ReactNode } from "react";
import { View } from "react-native";

import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { HubSectionContent } from "@/features/profile-hub/ui/HubSectionContent";
import { HubSectionPlaceholder } from "@/features/profile-hub/ui/HubSectionPlaceholder";
import { openProfileStaffWebSection } from "@/features/profile-hub/lib/openProfileStaffWebSection";
import {
  canAccessProfileSection,
  useProfileHubAccess,
} from "@/features/profile-hub/model/useProfileHubAccess";
import {
  isProfileSectionId,
  isProfileStaffWebOnlySection,
  PROFILE_SECTION_EXTERNAL_ROUTES,
  type ProfileSectionId,
} from "@/features/profile-hub/model/profileSections";
import { buildProfileNavGroups } from "@/features/profile-hub/model/buildProfileNavGroups";
import { ProfileAccountShell } from "@/features/profile-tab/ui/ProfileAccountShell";
import { AUTH_UI, HUB_SECTION_UI } from "@/shared/config";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function HubSectionScreen() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const sectionId = String(section ?? "");
  const userAccess = useUserAccess();
  const hubAccess = useProfileHubAccess();
  const { isDrawerLayout } = useProfileAdaptiveLayout();

  const sectionTitle = useMemo(() => {
    if (!isProfileSectionId(sectionId)) {
      return sectionId;
    }

    const groups = buildProfileNavGroups(hubAccess);
    for (const group of groups) {
      const match = group.items.find((item) => item.sectionId === sectionId);
      if (match) {
        return match.label;
      }
    }

    return sectionId;
  }, [hubAccess, sectionId]);

  useEffect(() => {
    if (sectionId === "product-manage-toggle-display-admin") {
      router.replace("/hub/site-header-banner-admin" as never);
      return;
    }

    if (sectionId === "seller-personal-category-moderation") {
      router.replace("/hub/intro-ad-moderation" as never);
      return;
    }

    if (sectionId === "raffles") {
      router.replace("/hub/intro-ad-moderation" as never);
      return;
    }

    if (sectionId === "product-promotions") {
      router.replace("/hub/product-moderation" as never);
      return;
    }

    if (!isProfileSectionId(sectionId)) {
      return;
    }

    const externalRoute = PROFILE_SECTION_EXTERNAL_ROUTES[sectionId];
    if (externalRoute) {
      router.replace(externalRoute as never);
      return;
    }

    if (isProfileStaffWebOnlySection(sectionId)) {
      void openProfileStaffWebSection(sectionId).finally(() => {
        router.replace("/(tabs)/me");
      });
      return;
    }
  }, [router, sectionId]);

  const goMe = () => router.replace("/(tabs)/me");

  const wrap = (node: ReactNode) => {
    if (!isProfileSectionId(sectionId)) {
      return node;
    }
    return (
      <ProfileAccountShell activeSectionId={sectionId as ProfileSectionId} mode="hub">
        {node}
      </ProfileAccountShell>
    );
  };

  if (!userAccess.isAuthorized && userAccess.isGuest) {
    return wrap(
      <View style={{ flex: 1 }}>
        <HubSectionPlaceholder
          title={AUTH_UI.GUEST_STATUS}
          hint={HUB_SECTION_UI.REQUIRES_AUTH}
          onBack={goMe}
        />
      </View>,
    );
  }

  if (!isProfileSectionId(sectionId)) {
    return (
      <View style={{ flex: 1 }}>
        <HubSectionPlaceholder
          title={HUB_SECTION_UI.FORBIDDEN_TITLE}
          hint={HUB_SECTION_UI.FORBIDDEN_HINT}
          onBack={goMe}
        />
      </View>
    );
  }

  if (PROFILE_SECTION_EXTERNAL_ROUTES[sectionId]) {
    return wrap(
      <View style={{ flex: 1 }}>
        <ScreenLoadingState message={AUTH_UI.SESSION_CHECK} />
      </View>,
    );
  }

  if (isProfileStaffWebOnlySection(sectionId)) {
    return wrap(
      <View style={{ flex: 1 }}>
        <ScreenLoadingState message={HUB_SECTION_UI.OPENING_WEB} />
      </View>,
    );
  }

  if (!canAccessProfileSection(sectionId, userAccess, hubAccess)) {
    return wrap(
      <View style={{ flex: 1 }}>
        <HubSectionPlaceholder
          title={HUB_SECTION_UI.FORBIDDEN_TITLE}
          hint={HUB_SECTION_UI.FORBIDDEN_HINT}
          onBack={goMe}
        />
      </View>,
    );
  }

  return wrap(
    <View style={isDrawerLayout ? { flex: 1, minHeight: 0 } : { width: "100%" }}>
      <HubSectionContent
        sectionId={sectionId}
        sectionTitle={sectionTitle}
        onBack={goMe}
      />
    </View>,
  );
}
