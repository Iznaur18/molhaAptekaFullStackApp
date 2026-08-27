import { useEffect, useRef, useState } from "react";
import { Pressable, Share } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { WEB_APP_BASE_URL } from "@/shared/config/webAppBaseUrl";
import { PRODUCT_DETAIL_HERO_CHROME } from "@/shared/lib/productDetailHeroChromeLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailHeroChromeStyles } from "@/shared/theme/catalogProductStyles";

type ProductShareLinkButtonProps = {
  product: Record<string, unknown>;
};

const COPIED_ICON_MS = 1600;

/**
 * Иконка «Ссылка» в chrome галереи.
 * Паритет с affiliate share: clipboard → системный Share sheet.
 */
export const ProductShareLinkButton = ({
  product,
}: ProductShareLinkButtonProps) => {
  const theme = useAppTheme();
  const styles = useProductDetailHeroChromeStyles();
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const productId = String(product?._id ?? "").trim();
  if (!productId) {
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
    const url = `${origin}/product/${encodeURIComponent(productId)}`;
    try {
      await Clipboard.setStringAsync(url);
      flashCopied();
    } catch (error) {
      console.error("Product share clipboard failed", error);
    }
    try {
      await Share.share({ message: url });
    } catch (error) {
      if (!(error instanceof Error && /cancel/i.test(error.message))) {
        console.error("Product share sheet failed", error);
      }
    }
  };

  return (
    <Pressable
      style={styles.actionButton}
      onPress={() => {
        void handlePress();
      }}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={
        copied
          ? PRODUCT_DETAILS_MODAL_UI.SHARE_PRODUCT_COPIED_TITLE
          : PRODUCT_DETAILS_MODAL_UI.SHARE_LINK_ARIA
      }
    >
      <Feather
        name={copied ? "check" : "link"}
        size={PRODUCT_DETAIL_HERO_CHROME.iconSize}
        color={copied ? theme.colors.success : theme.colors.text}
      />
    </Pressable>
  );
};
