import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { PRODUCT_MANAGE_TOGGLE_ADMIN_CARDS } from "@/entities/product-manage-toggle-display/lib/productManageToggleAdminCards";
import { ManageToggleAdminCard } from "@/features/product-manage-toggle-display-admin-page/ui/ManageToggleAdminCard";
import { useProductManageToggleDisplayAdminPage } from "@/features/product-manage-toggle-display-admin-page/model/useProductManageToggleDisplayAdminPage";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import {
  MY_PROFILE_PAGE_UI,
  PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI,
} from "@/shared/config";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const ProductManageToggleDisplayAdminPage = () => {
  const router = useRouter();
  const theme = useAppTheme();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const { displaysByKey, phase, queryError, refetchDisplays } =
    useProductManageToggleDisplayAdminPage();

  useFocusEffect(
    useCallback(() => {
      void refetchDisplays();
    }, [refetchDisplays]),
  );

  if (phase === "loading") {
    return (
      <View style={[{ flex: 1, justifyContent: "center", padding: 16 }, centeredContentStyle]}>
        <Text style={{ color: theme.colors.textMuted }}>
          {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI.LOADING}
        </Text>
      </View>
    );
  }

  if (phase === "error") {
    return (
      <ScreenErrorState
        message={
          queryError instanceof Error
            ? queryError.message
            : PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI.LOAD_ERROR
        }
        onRetry={() => void refetchDisplays()}
      />
    );
  }

  return (
    <>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN}
        onPress={() => setNavSheetVisible(true)}
      />
      <ScrollView
        contentContainerStyle={[
          centeredContentStyle,
          { paddingBottom: contentPaddingBottom, gap: 14, paddingTop: 12 },
        ]}
      >
        <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>
          {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI.HINT}
        </Text>
        {PRODUCT_MANAGE_TOGGLE_ADMIN_CARDS.map((card) => (
          <ManageToggleAdminCard
            key={card.toggleKey}
            toggleKey={card.toggleKey}
            variant={card.variant}
            title={card.title}
            description={card.description}
            imageUrl={displaysByKey.get(card.toggleKey) ?? null}
          />
        ))}
      </ScrollView>
      <ProfileMobileNavSheet
        visible={navSheetVisible}
        activeSectionId="product-manage-toggle-display-admin"
        onClose={() => setNavSheetVisible(false)}
        onOverviewPress={() => router.replace("/(tabs)/profile")}
      />
    </>
  );
};
