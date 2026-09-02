import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { resolveUserRole } from "@izibuy/shared-lib";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { getUserProfileRows } from "@/entities/user/lib/getUserProfileRows";
import { USER_ROLE_USER } from "@/entities/user/model/constants";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { SellerShareLinkButton } from "@/entities/user/ui/SellerShareLinkButton";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { HEADER_USERS_BUTTON_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
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
        <View style={styles.quickActions}>
          <SellerShareLinkButton
            sellerId={sellerId}
            sellerName={sellerName}
            variant="meta"
            style={styles.shareHalfBtn}
          />
          <Pressable
            style={({ pressed }) => [
              styles.storefrontBtn,
              pressed ? styles.storefrontBtnPressed : null,
            ]}
            onPress={() =>
              router.push({ pathname: "/seller/[userId]", params: { userId: sellerId } })
            }
            accessibilityRole="button"
            accessibilityLabel={MY_PROFILE_PAGE_UI.MY_STOREFRONT}
          >
            <MaterialIcons name="storefront" size={18} color={theme.colors.action} />
            <Text style={styles.storefrontBtnText} numberOfLines={1}>
              {MY_PROFILE_PAGE_UI.MY_STOREFRONT}
            </Text>
          </Pressable>
          <Pressable
            style={styles.notificationsBtn}
            onPress={() => router.push("/notifications")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={HEADER_USERS_BUTTON_UI.MENU_ITEM_NOTIFICATIONS_ARIA}
          >
            <MaterialIcons name="notifications" size={20} color={theme.colors.action} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.infoPanel}>
        <UserProfileInfoPanel rows={profileRows} />
      </View>
    </View>
  );
};
