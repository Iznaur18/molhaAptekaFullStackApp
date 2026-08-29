import { View } from "react-native";

import type { ProfileRow } from "@/entities/user/lib/getUserProfileRows";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { UserBlockProfileRow } from "@/entities/user-block/ui/UserBlockProfileRow";
import { UserProfileProductsList } from "@/entities/user/ui/UserProfileProductsList";
import { UserProfilePurchasesList } from "@/entities/user/ui/UserProfilePurchasesList";
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
