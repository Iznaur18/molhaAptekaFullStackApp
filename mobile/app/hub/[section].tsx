import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";

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
} from "@/features/profile-hub/model/profileSections";
import { buildProfileNavGroups } from "@/features/profile-hub/model/buildProfileNavGroups";
import { AUTH_UI, HUB_SECTION_UI } from "@/shared/config";
import { ScreenLoadingState } from "@/shared/ui/ScreenStates";

export default function HubSectionScreen() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const sectionId = String(section ?? "");
  const userAccess = useUserAccess();
  const hubAccess = useProfileHubAccess();

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
        router.replace("/(tabs)/profile");
      });
    }
  }, [router, sectionId]);

  if (!userAccess.isAuthorized && userAccess.isGuest) {
    return (
      <HubSectionPlaceholder
        title={AUTH_UI.GUEST_STATUS}
        hint={HUB_SECTION_UI.REQUIRES_AUTH}
        onBack={() => router.replace("/(tabs)/profile")}
      />
    );
  }

  if (!isProfileSectionId(sectionId)) {
    return (
      <HubSectionPlaceholder
        title={HUB_SECTION_UI.FORBIDDEN_TITLE}
        hint={HUB_SECTION_UI.FORBIDDEN_HINT}
        onBack={() => router.replace("/(tabs)/profile")}
      />
    );
  }

  if (PROFILE_SECTION_EXTERNAL_ROUTES[sectionId]) {
    return <ScreenLoadingState message={AUTH_UI.SESSION_CHECK} />;
  }

  if (isProfileStaffWebOnlySection(sectionId)) {
    return <ScreenLoadingState message={HUB_SECTION_UI.OPENING_WEB} />;
  }

  if (!canAccessProfileSection(sectionId, userAccess, hubAccess)) {
    return (
      <HubSectionPlaceholder
        title={HUB_SECTION_UI.FORBIDDEN_TITLE}
        hint={HUB_SECTION_UI.FORBIDDEN_HINT}
        onBack={() => router.replace("/(tabs)/profile")}
      />
    );
  }

  return (
    <HubSectionContent
      sectionId={sectionId}
      sectionTitle={sectionTitle}
      onBack={() => router.replace("/(tabs)/profile")}
    />
  );
}
