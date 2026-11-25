import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { UserBlockProfileRow } from "@/entities/user-block/ui/UserBlockProfileRow";
import { UserProfileProductsList } from "@/entities/user/ui/UserProfileProductsList";
import { UserProfilePurchasesList } from "@/entities/user/ui/UserProfilePurchasesList";
import { USER_DETAILS_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useUserDetailsPageStyles } from "@/shared/theme/profileChromeStyles";

type UserDetailsProfileBodyProps = {
  user: Record<string, unknown>;
  userId: string;
  profileRows: ProfileRow[];
  showOtherUserPurchases: boolean;
  showOtherUserProducts: boolean;
  isAuthorized: boolean;
  onViewAllSellerProducts: () => void;
  onRequestLogin: () => void;
  onBlockedChange: (patch: { isBlockedByMe: boolean }) => void;
};

export const UserDetailsProfileBody = ({
  user,
  userId,
  profileRows,
  showOtherUserPurchases,
  showOtherUserProducts,
  isAuthorized,
  onViewAllSellerProducts,
  onRequestLogin,
  onBlockedChange,
}: UserDetailsProfileBodyProps) => {
  const theme = useAppTheme();
  const styles = useUserDetailsPageStyles();

  return (
    <View style={styles.profileBody}>
      <ProfileOverviewBanner user={user} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={USER_DETAILS_PAGE_UI.SELLER_STOREFRONT}
        onPress={onViewAllSellerProducts}
        style={({ pressed }) => [
          styles.storefrontBtn,
          pressed && styles.storefrontBtnPressed,
        ]}
      >
        <Feather name="shopping-bag" size={18} color={theme.colors.onContrast} />
        <Text style={styles.storefrontBtnText} numberOfLines={1}>
          {USER_DETAILS_PAGE_UI.SELLER_STOREFRONT}
        </Text>
        <Feather name="chevron-right" size={16} color={theme.colors.onContrast} />
      </Pressable>

      {showOtherUserPurchases ? (
        <UserProfilePurchasesList targetUserId={userId} />
      ) : null}

      {showOtherUserProducts ? (
        <UserProfileProductsList targetUserId={userId} />
      ) : null}

      <UserProfileInfoPanel
        rows={profileRows}
        hidePhoneUntilReveal
        userId={userId}
        accountSectionFooter={
          <UserBlockProfileRow
            targetUserId={userId}
            isBlockedByMe={user.isBlockedByMe === true}
            isAuthorized={isAuthorized}
            isSelf={false}
            onRequestLogin={onRequestLogin}
            onBlockedChange={onBlockedChange}
          />
        }
      />
    </View>
  );
};
