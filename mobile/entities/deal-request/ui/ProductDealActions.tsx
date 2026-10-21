import {
  isCartDealType,
  isSellerPhoneOpenBeforeRequest,
  normalizeCategoryDealType,
} from "@molha/api-contract";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";
import { PRODUCT_DEAL_ACTIONS_UI } from "@/shared/config";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDealActionsStyles } from "@/shared/theme/dealRequestStyles";
import { AppButton } from "@/shared/ui/AppButton";
import { Phone } from "@/shared/ui/productDetailsLucideIcons";

import { fetchDealRequestSellerPhone } from "../api/dealRequestApi";
import { DealRequestSheet } from "./DealRequestSheet";

type PhoneState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; phone: string | null }
  | { status: "error"; message: string };

type ProductDealActionsProps = {
  product: { _id?: unknown; productDealType?: unknown };
  isOwnProduct: boolean;
  /**
   * Где стоит блок: под ценой (`inline`, широкая раскладка) или в нижней
   * панели на месте «В корзину» (`dock`). В панели подписи короче, телефон —
   * одной трубкой. `card` — карточка ленты главного экрана: одна компактная
   * кнопка без телефона, на месте «В корзину»; `banner` — то же в баннере
   * ленты, по ширине надписи.
   */
  variant?: "inline" | "dock" | "card" | "banner";
};

/**
 * Объявление без корзины (осмотр, услуга) — паритет web `ProductDealActions`:
 * заявка в окне снизу, у осмотра ещё и телефон продавца.
 */
export const ProductDealActions = ({
  product,
  isOwnProduct,
  variant = "inline",
}: ProductDealActionsProps) => {
  const styles = useProductDealActionsStyles();
  const theme = useAppTheme();
  const router = useRouter();
  const isAuthorized = useIsAuthorized();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [phoneState, setPhoneState] = useState<PhoneState>({ status: "idle" });

  const dealType = normalizeCategoryDealType(product.productDealType);
  const productId = String(product._id ?? "").trim();

  if (isCartDealType(dealType) || isOwnProduct || !productId) {
    return null;
  }

  const isDock = variant === "dock";
  const isBanner = variant === "banner";
  const isCard = variant === "card" || isBanner;
  const canShowPhone = !isCard && isSellerPhoneOpenBeforeRequest(dealType);

  const requireLogin = () => {
    if (isAuthorized) {
      return false;
    }
    router.push("/(auth)/login");
    return true;
  };

  const handleShowPhone = async () => {
    if (requireLogin()) {
      return;
    }
    setPhoneState({ status: "loading" });
    try {
      const phone = await fetchDealRequestSellerPhone(productId);
      setPhoneState({ status: "ready", phone });
    } catch (error) {
      setPhoneState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : PRODUCT_DEAL_ACTIONS_UI.PHONE_FALLBACK_ERROR,
      });
    }
  };

  const callSeller = (phone: string) => {
    void Linking.openURL(`tel:${phone}`).catch((error: unknown) => {
      reportClientIssue("ProductDealActions", error);
    });
  };

  const handleOpenSheet = () => {
    if (requireLogin()) {
      return;
    }
    setIsSheetOpen(true);
  };

  const readyPhone = phoneState.status === "ready" ? phoneState.phone : null;
  const phoneIcon = <Phone size={20} color={theme.colors.text} strokeWidth={2.25} />;

  const sheet = (
    <DealRequestSheet
      visible={isSheetOpen}
      onClose={() => setIsSheetOpen(false)}
      productId={productId}
      dealType={dealType}
    />
  );

  if (isCard) {
    return (
      <View style={isBanner ? styles.rootBanner : styles.root}>
        <Pressable
          style={({ pressed }) => [
            styles.cardButton,
            isBanner && styles.cardButtonBanner,
            pressed && styles.cardButtonPressed,
          ]}
          onPress={handleOpenSheet}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_DEAL_ACTIONS_UI.REQUEST_BUTTON[dealType]}
        >
          <Text style={styles.cardButtonText} numberOfLines={1}>
            {PRODUCT_DEAL_ACTIONS_UI.REQUEST_BUTTON_SHORT[dealType]}
          </Text>
        </Pressable>
        {sheet}
      </View>
    );
  }

  return (
    <View style={[styles.root, !isDock && styles.rootInline]}>
      <View style={styles.row}>
        <View style={styles.requestButton}>
          <AppButton
            label={
              isDock
                ? PRODUCT_DEAL_ACTIONS_UI.REQUEST_BUTTON_SHORT[dealType]
                : PRODUCT_DEAL_ACTIONS_UI.REQUEST_BUTTON[dealType]
            }
            accessibilityLabel={PRODUCT_DEAL_ACTIONS_UI.REQUEST_BUTTON[dealType]}
            variant="primary"
            onPress={handleOpenSheet}
          />
        </View>
        {canShowPhone && phoneState.status !== "ready" ? (
          <Pressable
            style={[
              styles.phoneButton,
              phoneState.status === "loading" && styles.phoneButtonDisabled,
            ]}
            disabled={phoneState.status === "loading"}
            onPress={() => void handleShowPhone()}
            accessibilityRole="button"
            accessibilityLabel={PRODUCT_DEAL_ACTIONS_UI.SHOW_PHONE}
          >
            {phoneIcon}
            {isDock ? null : (
              <Text style={styles.phoneText}>
                {phoneState.status === "loading"
                  ? PRODUCT_DEAL_ACTIONS_UI.PHONE_LOADING
                  : PRODUCT_DEAL_ACTIONS_UI.SHOW_PHONE}
              </Text>
            )}
          </Pressable>
        ) : null}
        {readyPhone ? (
          <Pressable
            style={styles.phoneButton}
            onPress={() => callSeller(readyPhone)}
            accessibilityRole="link"
            accessibilityLabel={PRODUCT_DEAL_ACTIONS_UI.PHONE_CALL_ARIA(readyPhone)}
          >
            {phoneIcon}
            {isDock ? null : <Text style={styles.phoneText}>{readyPhone}</Text>}
          </Pressable>
        ) : null}
      </View>

      {phoneState.status === "ready" && !phoneState.phone ? (
        <Text style={styles.hint}>{PRODUCT_DEAL_ACTIONS_UI.PHONE_MISSING}</Text>
      ) : null}
      {phoneState.status === "error" ? (
        <Text style={styles.error} accessibilityRole="alert">
          {phoneState.message}
        </Text>
      ) : null}

      {sheet}
    </View>
  );
};
