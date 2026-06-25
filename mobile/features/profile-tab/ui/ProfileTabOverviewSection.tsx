import { useMemo, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { resolveUserRole } from "@izibuy/shared-lib";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { getUserProfileRows } from "@/entities/user/lib/getUserProfileRows";
import { USER_ROLE_USER } from "@/entities/user/model/constants";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { RaffleSellerOverview } from "@/features/profile-overview/ui/RaffleSellerOverview";
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

  const translateX = useSharedValue(320);
  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 180 });
  }, [translateX]);

  if (!user) {
    return null;
  }

  return (
    <Animated.View style={[styles.root, slideStyle]}>
      <ProfileOverviewBanner
        user={user as Record<string, unknown>}
        showEditButton={showEditOnBanner}
        onEditPress={onEditPress}
      />

      <Animated.View entering={FadeInDown.delay(200).springify().damping(18).stiffness(200)} style={styles.raffleSection}>
        <RaffleSellerOverview />
      </Animated.View>

      <UserProfileInfoPanel rows={profileRows} />
    </Animated.View>
  );
};
