import { View } from "react-native";

import { UserPremiumDisplayName } from "@/entities/user/ui/UserPremiumDisplayName";
import { UserFollowButton } from "@/features/user-follow/ui/UserFollowButton";
import { USER_LIST_ROW_UI } from "@/shared/config";
import { useUserDetailsPageStyles } from "@/shared/theme/profileChromeStyles";

type UserDetailsHeaderProps = {
  user: Record<string, unknown>;
  userId: string;
  isFollowing: boolean;
  isAuthorized: boolean;
  isSelf: boolean;
  onFollowChange: (patch: { isFollowing: boolean }) => void;
};

export const UserDetailsHeader = ({
  user,
  userId,
  isFollowing,
  isAuthorized,
  isSelf,
  onFollowChange,
}: UserDetailsHeaderProps) => {
  const styles = useUserDetailsPageStyles();
  const displayName = String(user.userName ?? "").trim() || USER_LIST_ROW_UI.MISSING_NAME;

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleName}>
          <UserPremiumDisplayName
            name={displayName}
            isPremium={user.isPremiumUser === true}
            isUserDataConfirmed={user.isUserDataConfirmed === true}
            textStyle={styles.titleText}
          />
        </View>
        {!isSelf ? (
          <UserFollowButton
            targetUserId={userId}
            isFollowing={isFollowing}
            isAuthorized={isAuthorized}
            isSelf={isSelf}
            onFollowChange={onFollowChange}
          />
        ) : null}
      </View>
    </View>
  );
};
