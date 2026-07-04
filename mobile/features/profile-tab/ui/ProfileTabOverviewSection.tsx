import { useMemo } from "react";
import { View } from "react-native";

import { resolveUserRole } from "@izibuy/shared-lib";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { getUserProfileRows } from "@/entities/user/lib/getUserProfileRows";
import { USER_ROLE_USER } from "@/entities/user/model/constants";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { useProfileOverviewSectionStyles } from "@/shared/theme/profileChromeStyles";

type ProfileTabOverviewSectionProps = {
  onEditPress: () => void;
};

export const ProfileTabOverviewSection = ({ onEditPress }: ProfileTabOverviewSectionProps) => {
  const styles = useProfileOverviewSectionStyles();
  const sessionQuery = useAuthSessionQuery();
  const user = sessionQuery.data?.user;

  const profileRows = useMemo(
    () => (user ? getUserProfileRows(user as Record<string, unknown>) : []),
    [user],
  );

  const showEditOnBanner =
    Boolean(user) &&
    resolveUserRole((user as { userRole?: string }).userRole) === USER_ROLE_USER;

  if (!user) {
    return null;
  }

  return (
    <View style={styles.root}>
      <ProfileOverviewBanner
        user={user as Record<string, unknown>}
        showEditButton={showEditOnBanner}
        onEditPress={onEditPress}
      />

      <UserProfileInfoPanel rows={profileRows} />
    </View>
  );
};
