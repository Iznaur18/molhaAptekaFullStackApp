import { View } from "react-native";

import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { UserProfileProductsList } from "@/entities/user/ui/UserProfileProductsList";
import { UserProfilePurchasesList } from "@/entities/user/ui/UserProfilePurchasesList";
import { useUserDetailsPageStyles } from "@/shared/theme/profileChromeStyles";

type UserDetailsProfileBodyProps = {
  user: Record<string, unknown>;
  userId: string;
  profileRows: ProfileRow[];
  showOtherUserPurchases: boolean;
  showOtherUserProducts: boolean;
  onViewAllSellerProducts: () => void;
};

export const UserDetailsProfileBody = ({
  user,
  userId,
  profileRows,
  showOtherUserPurchases,
  showOtherUserProducts,
  onViewAllSellerProducts,
}: UserDetailsProfileBodyProps) => {
  const styles = useUserDetailsPageStyles();

  return (
    <View style={styles.profileBody}>
      <ProfileOverviewBanner user={user} />

      {showOtherUserPurchases ? <UserProfilePurchasesList targetUserId={userId} /> : null}

      {showOtherUserProducts ? (
        <UserProfileProductsList
          targetUserId={userId}
          onViewAllProducts={onViewAllSellerProducts}
        />
      ) : null}

      <UserProfileInfoPanel rows={profileRows} hidePhoneUntilReveal />
    </View>
  );
};
