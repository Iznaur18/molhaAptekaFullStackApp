import { buildSellerQrPath } from "@molha/api-contract";
import { Image } from "expo-image";
import QrCode from "lucide-react-native/icons/qr-code";
import { useMemo, useState } from "react";
import {
  Pressable,
  Share,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import { useMySellerQrStatsQuery } from "@/entities/seller-qr/model/useSellerQrAnalytics";
import {
  buildSellerQrMatrix,
  buildSellerQrSvgPath,
  resolveSellerQrViewBoxSize,
} from "@/entities/user/lib/sellerQrMatrix";
import { SELLER_PRODUCTS_PAGE_LAYOUT as L } from "@/features/seller-products-page/lib/sellerProductsPageLayout";
import { SELLER_QR_UI } from "@/shared/config";
import { WEB_APP_BASE_URL } from "@/shared/config/webAppBaseUrl";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useSellerStorefrontSheetStyles } from "@/shared/theme/sellerStorefrontSheetStyles";
import { AppButton } from "@/shared/ui/AppButton";

import { useSellerShareStyles } from "./SellerShareLinkButton";
import { SellerStorefrontSheet } from "./SellerStorefrontSheet";

/** web `.seller-qr-sheet__code`: `min(100%, 15rem)`. */
const QR_CODE_SIZE = 240;

/** Постоянный адрес витрины с меткой `?src=qr` — тот же, что печатает сайт. */
export const buildSellerQrUrl = (sellerId: string): string =>
  `${WEB_APP_BASE_URL.replace(/\/$/, "")}${buildSellerQrPath(sellerId)}`;

type SellerQrButtonProps = {
  sellerId: string;
  sellerName?: string;
  avatarUrl?: string;
  variant?: "banner" | "meta";
  /** Свою витрину: в окне ещё «Переходы по коду». */
  isOwn?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * QR-код витрины рядом с «Поделиться» — паритет web `SellerQrButton` +
 * `SellerQrSheet`. Картинку в приложении не сохранить (нужен нативный модуль),
 * поэтому «Поделиться» отправляет ссылку, а код показывают с экрана.
 */
export const SellerQrButton = ({
  sellerId,
  sellerName = "",
  avatarUrl = "",
  variant = "meta",
  isOwn = true,
  style,
}: SellerQrButtonProps) => {
  const theme = useAppTheme();
  const buttonStyles = useSellerShareStyles();
  const styles = useSellerStorefrontSheetStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [shareError, setShareError] = useState("");
  const statsQuery = useMySellerQrStatsQuery({ enabled: isOpen && isOwn });

  const id = String(sellerId ?? "").trim();
  const url = id ? buildSellerQrUrl(id) : "";
  const matrix = useMemo(() => (url ? buildSellerQrMatrix(url) : []), [url]);
  const svgPath = useMemo(() => buildSellerQrSvgPath(matrix), [matrix]);

  if (!id) {
    return null;
  }

  const displayName = String(sellerName ?? "").trim() || SELLER_QR_UI.BRAND;
  const viewBoxSize = resolveSellerQrViewBoxSize(matrix);
  const showAvatar = Boolean(avatarUrl) && !avatarFailed;

  const handleShare = async () => {
    setShareError("");
    try {
      await Share.share({
        message: SELLER_QR_UI.SHARE_MESSAGE(String(sellerName ?? "").trim(), url),
        title: displayName,
      });
    } catch (error) {
      reportClientIssue("SellerQrButton#share", error);
      setShareError(SELLER_QR_UI.SHARE_ERROR);
    }
  };

  const stats = statsQuery.data;

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
        accessibilityLabel={SELLER_QR_UI.BUTTON_ARIA}
      >
        <QrCode
          size={variant === "meta" ? L.shareMetaIconSize : 20}
          color={variant === "banner" ? "#ffffff" : theme.colors.action}
          strokeWidth={2.1}
        />
      </Pressable>

      <SellerStorefrontSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title={SELLER_QR_UI.TITLE}
        closeLabel={SELLER_QR_UI.CLOSE}
      >
        <View style={styles.card}>
          {showAvatar ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : null}
          <Text style={styles.cardName} numberOfLines={1}>
            {displayName}
          </Text>
          <Svg
            width={QR_CODE_SIZE}
            height={QR_CODE_SIZE}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            accessibilityLabel={SELLER_QR_UI.QR_ALT}
          >
            <Rect width={viewBoxSize} height={viewBoxSize} fill="#ffffff" />
            <Path d={svgPath} fill="#111111" />
          </Svg>
          <Text style={styles.cardCaption}>{SELLER_QR_UI.CARD_CAPTION}</Text>
          <Text style={styles.cardBrand}>{SELLER_QR_UI.BRAND}</Text>
        </View>

        <Text style={styles.hint}>
          {isOwn ? SELLER_QR_UI.HINT : SELLER_QR_UI.HINT_VISITOR}
        </Text>

        <AppButton
          label={SELLER_QR_UI.SHARE}
          variant="primary"
          onPress={() => void handleShare()}
        />
        {shareError ? (
          <Text style={styles.error} accessibilityRole="alert">
            {shareError}
          </Text>
        ) : null}

        {/* Переходы по коду — личная статистика продавца, гостю не показываем. */}
        {isOwn ? (
          <View style={styles.stats} accessibilityLabel={SELLER_QR_UI.STATS_TITLE}>
            <Text style={styles.statsTitle}>{SELLER_QR_UI.STATS_TITLE}</Text>
            {statsQuery.isPending ? (
              <Text style={styles.hint}>{SELLER_QR_UI.STATS_LOADING}</Text>
            ) : statsQuery.isError ? (
              <Text style={styles.error} accessibilityRole="alert">
                {statsQuery.error.message}
              </Text>
            ) : !stats || stats.total === 0 ? (
              <Text style={styles.hint}>{SELLER_QR_UI.STATS_EMPTY}</Text>
            ) : (
              <>
                <Text style={styles.statsValue}>
                  {SELLER_QR_UI.STATS_TOTAL(stats.total)}
                </Text>
                <Text style={styles.hint}>
                  {SELLER_QR_UI.STATS_RECENT(stats.recent, stats.recentDays)}
                </Text>
              </>
            )}
            <Text style={styles.statsNote}>{SELLER_QR_UI.STATS_NOTE}</Text>
          </View>
        ) : null}
      </SellerStorefrontSheet>
    </>
  );
};
