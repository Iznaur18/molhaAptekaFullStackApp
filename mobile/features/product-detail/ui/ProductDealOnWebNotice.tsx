import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { isCartDealType, normalizeCategoryDealType } from "@molha/api-contract";

import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { WEB_APP_BASE_URL } from "@/shared/config/webAppBaseUrl";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const COPIED_MESSAGE_MS = 4000;

const useProductDealOnWebNoticeStyles = createThemedStyles((theme) => ({
  root: {
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  text: {
    fontSize: 14,
    lineHeight: 19,
    color: theme.colors.text,
  },
  button: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.action,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  status: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  statusError: {
    color: theme.colors.danger,
  },
}));

type ProductDealOnWebNoticeProps = {
  product: Record<string, unknown>;
  isOwnProduct: boolean;
};

/**
 * Осмотр (авто, недвижимость) и услуга: в корзину их не кладут, а заявок в
 * приложении пока нет. Вместо «В корзину» — плашка и ссылка на объявление
 * на сайте. Ссылкой не открываем: приложение само перехватывает
 * gitorg.ru/product и вернуло бы покупателя в ту же карточку.
 */
export const ProductDealOnWebNotice = ({
  product,
  isOwnProduct,
}: ProductDealOnWebNoticeProps) => {
  const styles = useProductDealOnWebNoticeStyles();
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current != null) {
        clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  const dealType = normalizeCategoryDealType(product.productDealType);
  const productId = String(product._id ?? "").trim();
  const notice = PRODUCT_DETAILS_MODAL_UI.DEAL_ON_WEB_NOTICE[dealType];
  if (isOwnProduct || isCartDealType(dealType) || !productId || !notice) {
    return null;
  }

  const handleCopy = async () => {
    const origin = WEB_APP_BASE_URL.replace(/\/$/, "");
    const url = `${origin}/product/${encodeURIComponent(productId)}`;
    try {
      await Clipboard.setStringAsync(url);
      setStatus("copied");
    } catch (error) {
      console.error("Deal notice clipboard failed", error);
      setStatus("error");
    }
    if (resetTimerRef.current != null) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setStatus("idle");
      resetTimerRef.current = null;
    }, COPIED_MESSAGE_MS);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.text}>{notice}</Text>
      <Pressable
        style={styles.button}
        onPress={() => {
          void handleCopy();
        }}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {PRODUCT_DETAILS_MODAL_UI.DEAL_ON_WEB_COPY}
        </Text>
      </Pressable>
      {status === "copied" ? (
        <Text style={styles.status} accessibilityLiveRegion="polite">
          {PRODUCT_DETAILS_MODAL_UI.DEAL_ON_WEB_COPIED}
        </Text>
      ) : null}
      {status === "error" ? (
        <Text style={[styles.status, styles.statusError]} accessibilityRole="alert">
          {PRODUCT_DETAILS_MODAL_UI.DEAL_ON_WEB_COPY_FAILED}
        </Text>
      ) : null}
    </View>
  );
};
