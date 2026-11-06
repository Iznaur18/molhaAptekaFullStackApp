import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Linking,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  getMissingSellerSocialFields,
  type SellerSocialLink,
} from "@/entities/user/lib/getSellerSocialLinks";
import { SELLER_SOCIAL_LINKS_UI } from "@/shared/config";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useSellerStorefrontSheetStyles } from "@/shared/theme/sellerStorefrontSheetStyles";

import { SELLER_PRODUCTS_PAGE_LAYOUT as L } from "@/features/seller-products-page/lib/sellerProductsPageLayout";
import { useSellerShareStyles } from "./SellerShareLinkButton";
import { SellerStorefrontSheet } from "./SellerStorefrontSheet";
import { SocialBrandBadge, SocialBrandIcon } from "./SocialBrandIcon";

type SellerSocialLinksButtonProps = {
  links: SellerSocialLink[];
  isSelf?: boolean;
  /** Владелец: нажатие на «Ещё не добавлено» — в редактирование профиля. */
  onAddLink?: (fieldId: string) => void;
  variant?: "banner" | "meta";
  style?: StyleProp<ViewStyle>;
};

/**
 * Значок Instagram на витрине: открывает окно со всеми ссылками продавца —
 * паритет web `SellerSocialLinksButton` + `SellerSocialLinksSheet`. У чужой
 * витрины без ссылок не показывается; владельцу окно показывает, чего не хватает.
 */
export const SellerSocialLinksButton = ({
  links,
  isSelf = false,
  onAddLink,
  variant = "meta",
  style,
}: SellerSocialLinksButtonProps) => {
  const theme = useAppTheme();
  const buttonStyles = useSellerShareStyles();
  const styles = useSellerStorefrontSheetStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [openError, setOpenError] = useState("");

  if (links.length === 0 && !isSelf) {
    return null;
  }

  const missingFields =
    isSelf && typeof onAddLink === "function"
      ? getMissingSellerSocialFields(links)
      : [];

  const openLink = async (href: string) => {
    setOpenError("");
    try {
      await Linking.openURL(href);
    } catch (error) {
      reportClientIssue("SellerSocialLinksButton", error);
      setOpenError(SELLER_SOCIAL_LINKS_UI.OPEN_ERROR);
    }
  };

  return (
    <>
      <Pressable
        style={[
          buttonStyles.root,
          variant === "banner" ? buttonStyles.banner : buttonStyles.meta,
          style,
        ]}
        onPress={() => setIsOpen(true)}
        hitSlop={variant === "banner" ? 10 : 0}
        accessibilityRole="button"
        accessibilityLabel={SELLER_SOCIAL_LINKS_UI.BUTTON_ARIA}
      >
        <SocialBrandIcon
          id="socialInstagramUrl"
          size={variant === "meta" ? L.shareMetaIconSize : 20}
          color={variant === "banner" ? "#ffffff" : theme.colors.action}
        />
      </Pressable>

      <SellerStorefrontSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title={SELLER_SOCIAL_LINKS_UI.TITLE}
        closeLabel={SELLER_SOCIAL_LINKS_UI.CLOSE}
      >
        {links.length > 0 ? (
          <View style={styles.list}>
            {links.map((link) => (
              <Pressable
                key={link.id}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => void openLink(link.href)}
                accessibilityRole="link"
                accessibilityLabel={SELLER_SOCIAL_LINKS_UI.OPEN_ARIA(link.label)}
              >
                <SocialBrandBadge id={link.id} fallbackColor={theme.colors.primary} />
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{link.label}</Text>
                  <Text style={styles.rowValue} numberOfLines={1}>
                    {link.display}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            ))}
          </View>
        ) : null}

        {openError ? (
          <Text style={styles.error} accessibilityRole="alert">
            {openError}
          </Text>
        ) : null}

        {missingFields.length > 0 && onAddLink ? (
          <View
            style={styles.list}
            accessibilityLabel={SELLER_SOCIAL_LINKS_UI.ADD_TITLE}
          >
            <Text style={styles.addTitle}>{SELLER_SOCIAL_LINKS_UI.ADD_TITLE}</Text>
            <Text style={styles.hint}>{SELLER_SOCIAL_LINKS_UI.ADD_HINT}</Text>
            {missingFields.map((field) => (
              <Pressable
                key={field.id}
                style={({ pressed }) => [
                  styles.row,
                  styles.rowAdd,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => {
                  setIsOpen(false);
                  onAddLink(field.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={SELLER_SOCIAL_LINKS_UI.ADD_ARIA(field.labelRu)}
              >
                <SocialBrandBadge id={field.id} fallbackColor={theme.colors.primary} />
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{field.labelRu}</Text>
                  <Text style={styles.rowValue} numberOfLines={1}>
                    {SELLER_SOCIAL_LINKS_UI.ADD_ROW_HINT}
                  </Text>
                </View>
                <Feather name="plus" size={18} color={theme.colors.textMuted} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </SellerStorefrontSheet>
    </>
  );
};
