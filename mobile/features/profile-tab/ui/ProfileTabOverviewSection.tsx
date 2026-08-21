import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { resolveUserRole } from "@izibuy/shared-lib";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { getUserProfileRows } from "@/entities/user/lib/getUserProfileRows";
import { USER_ROLE_USER } from "@/entities/user/model/constants";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { SellerShareLinkButton } from "@/entities/user/ui/SellerShareLinkButton";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { HEADER_USERS_BUTTON_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProfileOverviewSectionStyles } from "@/shared/theme/profileChromeStyles";

type ProfileTabOverviewSectionProps = {
  onEditPress: () => void;
};

export const ProfileTabOverviewSection = ({ onEditPress }: ProfileTabOverviewSectionProps) => {
  const styles = useProfileOverviewSectionStyles();
  const theme = useAppTheme();
  const router = useRouter();
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

  const sellerId = String((user as { _id?: string })._id ?? "").trim();
  const sellerName = String((user as { userName?: string }).userName ?? "").trim();

  return (
    <View style={styles.root}>
      <ProfileOverviewBanner
        user={user as Record<string, unknown>}
        showEditButton={showEditOnBanner}
        onEditPress={onEditPress}
      />
      {sellerId ? (
        <View style={styles.shareRow}>
          <Pressable
            style={styles.notificationsBtn}
            onPress={() => router.push("/notifications")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={HEADER_USERS_BUTTON_UI.MENU_ITEM_NOTIFICATIONS_ARIA}
          >
            <MaterialIcons name="notifications" size={20} color={theme.colors.action} />
          </Pressable>
          <SellerShareLinkButton
            sellerId={sellerId}
            sellerName={sellerName}
            variant="meta"
            style={styles.shareHalfBtn}
          />
        </View>
      ) : null}

      <UserProfileInfoPanel rows={profileRows} />
    </View>
  );
};
