import type { ProductManageToggleRowVariant } from "@izibuy/shared-lib";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { PRODUCT_MANAGE_TOGGLE_ADMIN_CARDS } from "@/entities/product-manage-toggle-display/lib/productManageToggleAdminCards";
import { ManageToggleAdminCard } from "@/features/product-manage-toggle-display-admin-page/ui/ManageToggleAdminCard";
import { useProductManageToggleDisplayAdminPage } from "@/features/product-manage-toggle-display-admin-page/model/useProductManageToggleDisplayAdminPage";
import { PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

type SiteHeaderBannerManageToggleAdminSectionProps = {
  embedded?: boolean;
};

export const SiteHeaderBannerManageToggleAdminSection = ({
  embedded = false,
}: SiteHeaderBannerManageToggleAdminSectionProps) => {
  const theme = useAppTheme();
  const { displaysByKey, phase, queryError, refetchDisplays } =
    useProductManageToggleDisplayAdminPage();

  const cards = useMemo(
    () =>
      PRODUCT_MANAGE_TOGGLE_ADMIN_CARDS.map((card) => ({
        toggleKey: card.toggleKey,
        variant: card.variant as ProductManageToggleRowVariant,
        title: card.title,
        description: card.description,
      })),
    [],
  );

  if (phase === "loading") {
    return (
      <View style={{ gap: 8 }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>
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
    <View style={{ gap: 12 }}>
      {embedded ? null : (
        <>
          <Text style={{ fontSize: 15, fontWeight: "700", color: theme.colors.text }}>
            {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI.TITLE}
          </Text>
          <Text style={{ fontSize: 13, lineHeight: 20, color: theme.colors.textMuted }}>
            {PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN_PAGE_UI.HINT}
          </Text>
        </>
      )}

      <View style={{ gap: 12 }}>
        {cards.map((card) => (
          <ManageToggleAdminCard
            key={card.toggleKey}
            toggleKey={card.toggleKey}
            variant={card.variant}
            title={card.title}
            description={card.description}
            imageUrl={displaysByKey.get(card.toggleKey) ?? null}
          />
        ))}
      </View>
    </View>
  );
};
