import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { resolveUserRole } from "@izibuy/shared-lib";

import { useAuthSessionQuery } from "@/entities/session/model/useAuthSessionQuery";
import { getUserProfileRows } from "@/entities/user/lib/getUserProfileRows";
import { PROFILE_ROW_ID } from "@/entities/user/lib/profileRowIds";
import { USER_ROLE_USER } from "@/entities/user/model/constants";
import { ProfileOverviewBanner } from "@/entities/user/ui/ProfileOverviewBanner";
import { SellerShareLinkButton } from "@/entities/user/ui/SellerShareLinkButton";
import { UserProfileInfoPanel } from "@/entities/user/ui/UserProfileInfoPanel";
import { UserRatingVotesSheet } from "@/entities/user-vote-rating/ui/UserRatingVotesSheet";
import { SUBSCRIPTIONS_LIST_FOLLOWERS } from "@/entities/user-follow/model/constants";
import { PROFILE_SECTION_OVERVIEW } from "@/features/profile-hub/model/profileSections";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { HEADER_USERS_BUTTON_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProfileOverviewSectionStyles } from "@/shared/theme/profileChromeStyles";

type ProfileTabOverviewSectionProps = {
  onEditPress: () => void;
  /** Скрыть тоггл, если родитель уже рисует его (legacy). */
  showSectionToggle?: boolean;
  onOverviewPress?: () => void;
};

export const ProfileTabOverviewSection = ({
  onEditPress,
  showSectionToggle = true,
  onOverviewPress,
}: ProfileTabOverviewSectionProps) => {
  const styles = useProfileOverviewSectionStyles();
  const theme = useAppTheme();
  const router = useRouter();
  const { isPhoneLayout } = useProfileAdaptiveLayout();
  const sessionQuery = useAuthSessionQuery();
  const user = sessionQuery.data?.user;
  const [ratingVotesOpen, setRatingVotesOpen] = useState(false);
  const [navSheetVisible, setNavSheetVisible] = useState(false);

  const profileRows = useMemo(
    () => (user ? getUserProfileRows(user as Record<string, unknown>) : []),
    [user],
  );

  const rowActions = useMemo(
    () => ({
      [PROFILE_ROW_ID.FOLLOWING]: () =>
        router.push("/(tabs)/hub/subscriptions" as never),
      [PROFILE_ROW_ID.FOLLOWERS]: () =>
        router.push({
          pathname: "/(tabs)/hub/subscriptions",
          params: { list: SUBSCRIPTIONS_LIST_FOLLOWERS },
        } as never),
      [PROFILE_ROW_ID.TOTAL_SALES_COUNT]: () =>
        router.push("/(tabs)/hub/my-sales" as never),
      [PROFILE_ROW_ID.TOTAL_SALES_AMOUNT]: () =>
        router.push("/(tabs)/hub/my-sales" as never),
      [PROFILE_ROW_ID.TOTAL_PURCHASES_AMOUNT]: () =>
        router.push("/(tabs)/hub/my-orders" as never),
      [PROFILE_ROW_ID.WISHLIST]: () => router.push("/(tabs)/hub/wishlist" as never),
      [PROFILE_ROW_ID.LOYALTY_POINTS]: () =>
        router.push("/(tabs)/hub/loyalty-points" as never),
      [PROFILE_ROW_ID.RATING]: () => setRatingVotesOpen(true),
    }),
    [router],
  );

  const showEditOnBanner =
    Boolean(user) &&
    resolveUserRole((user as { userRole?: string }).userRole) === USER_ROLE_USER;

  if (!user) {
    return null;
  }

  const sellerId = String((user as { _id?: string })._id ?? "").trim();
  const sellerName = String((user as { userName?: string }).userName ?? "").trim();

  const handleOverviewPress = () => {
    setNavSheetVisible(false);
    onOverviewPress?.();
  };

  return (
    <View style={styles.root}>
      {/* Паритет web `.my-profile-page__mobile-nav-toggle` — «Раздел · Обзор». */}
      {showSectionToggle ? (
        <ProfileMobileSectionToggle
          activeLabel={MY_PROFILE_PAGE_UI.TAB_OVERVIEW}
          appearance={isPhoneLayout ? "phone" : "tablet"}
          onPress={() => setNavSheetVisible(true)}
        />
      ) : null}

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
              router.push({
                pathname: "/seller/[userId]",
                params: { userId: sellerId },
              })
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
        <UserProfileInfoPanel rows={profileRows} rowActions={rowActions} />
      </View>

      <UserRatingVotesSheet
        visible={ratingVotesOpen}
        onClose={() => setRatingVotesOpen(false)}
      />

      {showSectionToggle ? (
        <ProfileMobileNavSheet
          visible={navSheetVisible}
          activeSectionId={PROFILE_SECTION_OVERVIEW}
          side={isPhoneLayout ? "right" : "left"}
          onClose={() => setNavSheetVisible(false)}
          onOverviewPress={handleOverviewPress}
        />
      ) : null}
    </View>
  );
};
