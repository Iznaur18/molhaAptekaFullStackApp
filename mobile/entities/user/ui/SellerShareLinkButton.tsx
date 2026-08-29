import { useEffect, useRef, useState } from "react";
import { Pressable, Share } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { SELLER_PRODUCTS_PAGE_LAYOUT as L } from "@/features/seller-products-page/lib/sellerProductsPageLayout";
import { SELLER_PRODUCTS_PAGE_UI } from "@/shared/config";
import { WEB_APP_BASE_URL } from "@/shared/config/webAppBaseUrl";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

type SellerShareLinkButtonProps = {
  sellerId: string;
  sellerName?: string;
  variant?: "banner" | "meta";
  style?: import("react-native").StyleProp<import("react-native").ViewStyle>;
};

const COPIED_ICON_MS = 1600;

const useSellerShareStyles = createThemedStyles((theme) => ({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    padding: 6,
    borderRadius: 20,
  },
  meta: {
    flexShrink: 0,
    width: L.shareMetaSize,
    height: L.shareMetaSize,
    padding: 0,
    borderRadius: L.followBorderRadius,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: "transparent",
  },
  metaCopied: {
    borderColor: theme.colors.success,
  },
}));

/**
 * Шаринг витрины `/seller/:id` — clipboard → системный Share.
 */
export const SellerShareLinkButton = ({
  sellerId,
  sellerName = "",
  variant = "banner",
  style,
}: SellerShareLinkButtonProps) => {
  const theme = useAppTheme();
  const styles = useSellerShareStyles();
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const id = String(sellerId ?? "").trim();
  if (!id) {
    return null;
  }

  const flashCopied = () => {
    setCopied(true);
    if (resetTimerRef.current != null) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setCopied(false);
      resetTimerRef.current = null;
    }, COPIED_ICON_MS);
  };

  const handlePress = async () => {
    const origin = WEB_APP_BASE_URL.replace(/\/$/, "");
    const url = `${origin}/seller/${encodeURIComponent(id)}`;
    try {
      await Clipboard.setStringAsync(url);
      flashCopied();
    } catch (error) {
      console.error("Seller share clipboard failed", error);
    }
    try {
      await Share.share({
        message: url,
        title: String(sellerName ?? "").trim() || undefined,
      });
    } catch (error) {
      if (!(error instanceof Error && /cancel/i.test(error.message))) {
        console.error("Seller share sheet failed", error);
      }
    }
  };

  const iconColor =
    variant === "banner"
      ? "#ffffff"
      : copied
        ? theme.colors.success
        : theme.colors.action;

  return (
    <Pressable
      style={[
        styles.root,
        variant === "banner" ? styles.banner : styles.meta,
        variant === "meta" && copied ? styles.metaCopied : null,
        style,
      ]}
      onPress={() => {
        void handlePress();
      }}
      hitSlop={variant === "banner" ? 10 : 0}
      accessibilityRole="button"
      accessibilityLabel={
        copied
          ? SELLER_PRODUCTS_PAGE_UI.SHARE_LINK_COPIED_ARIA
          : SELLER_PRODUCTS_PAGE_UI.SHARE_LINK_ARIA
      }
    >
      <Feather
        name={copied ? "check" : variant === "meta" ? "share-2" : "link"}
        size={variant === "meta" ? L.shareMetaIconSize : 20}
        color={iconColor}
      />
    </Pressable>
  );
};
