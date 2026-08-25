import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { resolveProductDiscountPercent } from "@/entities/product/lib/computeProductDiscountPercent";
import {
  formatFlashSaleCountdown,
  isProductFlashSaleActive,
  resolveFlashSaleCountdownParts,
  resolveProductFlashSaleBorderProgress,
  resolveProductFlashSaleEndsAtMs,
  type FlashSaleCountdownParts,
} from "@/entities/product/lib/isProductFlashSaleActive";
import { PRODUCT_FLASH_SALE_UI } from "@/shared/config";
import { useProductFlashSaleCountdownStyles } from "@/shared/theme/productFlashSaleStyles";

/** Последние 5 минут — плашка переключается на «срочную» красную палитру. */
const URGENT_SECONDS_LEFT = 300;

const ICON_BORDER_SIZE = 42;
const ICON_BORDER_STROKE = 2.5;
const ICON_BORDER_RADIUS = 10.8;
const ICON_BORDER_INSET = ICON_BORDER_STROKE / 2;
const ICON_BORDER_LENGTH = ICON_BORDER_SIZE - ICON_BORDER_STROKE;

/**
 * Периметр скруглённого квадрата: четыре прямых участка + окружность из
 * четвертей углов. В вебе то же самое делает `pathLength={1}`, но
 * react-native-svg этот атрибут не поддерживает, поэтому считаем длину сами.
 */
const ICON_BORDER_PERIMETER =
  4 * (ICON_BORDER_LENGTH - 2 * ICON_BORDER_RADIUS) + 2 * Math.PI * ICON_BORDER_RADIUS;

type FlashSaleIconBorderProps = {
  progress: number;
  color: string;
};

/**
 * Рамка-прогресс вокруг иконки. Как в вебе: `pathLength={1}` + dasharray 1,
 * поэтому dashoffset — это ровно доля пройденного времени.
 */
const FlashSaleIconBorder = ({ progress, color }: FlashSaleIconBorderProps) => {
  const safeProgress = Math.max(0, Math.min(1, progress));

  return (
    <Svg
      width={ICON_BORDER_SIZE}
      height={ICON_BORDER_SIZE}
      viewBox={`0 0 ${ICON_BORDER_SIZE} ${ICON_BORDER_SIZE}`}
      style={{ position: "absolute", top: 0, left: 0 }}
      pointerEvents="none"
    >
      <Rect
        x={ICON_BORDER_INSET}
        y={ICON_BORDER_INSET}
        width={ICON_BORDER_LENGTH}
        height={ICON_BORDER_LENGTH}
        rx={ICON_BORDER_RADIUS}
        ry={ICON_BORDER_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={ICON_BORDER_STROKE}
        strokeLinecap="round"
        strokeDasharray={`${ICON_BORDER_PERIMETER} ${ICON_BORDER_PERIMETER}`}
        strokeDashoffset={ICON_BORDER_PERIMETER * (1 - safeProgress)}
        // −90°, чтобы отсчёт шёл от верхней грани, как в вебе.
        transform={`rotate(-90 ${ICON_BORDER_SIZE / 2} ${ICON_BORDER_SIZE / 2})`}
      />
    </Svg>
  );
};

type CountdownTimerProps = {
  parts: FlashSaleCountdownParts;
  isUrgent: boolean;
};

const CountdownTimer = ({ parts, isUrgent }: CountdownTimerProps) => {
  const styles = useProductFlashSaleCountdownStyles();
  const unitStyle = [styles.unit, isUrgent && styles.unitUrgent];
  const sepStyle = [styles.sep, isUrgent && styles.sepUrgent];

  return (
    <View style={styles.timer} accessibilityElementsHidden>
      {parts.showDays ? (
        <>
          <Text style={unitStyle}>{parts.days}</Text>
          <Text style={sepStyle}>:</Text>
        </>
      ) : null}
      <Text style={unitStyle}>{parts.hours}</Text>
      <Text style={sepStyle}>:</Text>
      <Text style={unitStyle}>{parts.minutes}</Text>
      <Text style={sepStyle}>:</Text>
      <Text style={unitStyle}>{parts.seconds}</Text>
    </View>
  );
};

type ProductFlashSaleCountdownProps = {
  product: Record<string, unknown> | null | undefined;
  onExpired?: () => void;
};

export const ProductFlashSaleCountdown = ({
  product,
  onExpired,
}: ProductFlashSaleCountdownProps) => {
  const styles = useProductFlashSaleCountdownStyles();
  const endsAtMs = resolveProductFlashSaleEndsAtMs(product);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const didNotifyExpiredRef = useRef(false);
  const productId = product?._id != null ? String(product._id) : "";

  useEffect(() => {
    if (endsAtMs == null) {
      return undefined;
    }
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [endsAtMs]);

  useEffect(() => {
    didNotifyExpiredRef.current = false;
  }, [productId, endsAtMs]);

  useEffect(() => {
    if (endsAtMs == null || didNotifyExpiredRef.current || endsAtMs > nowMs) {
      return;
    }
    didNotifyExpiredRef.current = true;
    onExpired?.();
  }, [endsAtMs, nowMs, onExpired]);

  if (!isProductFlashSaleActive(product, nowMs) || endsAtMs == null) {
    return null;
  }

  const secondsLeft = Math.max(0, Math.floor((endsAtMs - nowMs) / 1000));
  const discountPercent = resolveProductDiscountPercent(product ?? {});
  const countdownParts = resolveFlashSaleCountdownParts(secondsLeft);
  const isUrgent = secondsLeft > 0 && secondsLeft <= URGENT_SECONDS_LEFT;
  const isExpired = secondsLeft <= 0;
  const borderProgress = resolveProductFlashSaleBorderProgress(product, nowMs);
  const countdownText = isExpired
    ? PRODUCT_FLASH_SALE_UI.DETAILS_COUNTDOWN_EXPIRED
    : formatFlashSaleCountdown(secondsLeft);
  const statusLabel = `${PRODUCT_FLASH_SALE_UI.DETAILS_TITLE}. ${PRODUCT_FLASH_SALE_UI.DETAILS_COUNTDOWN_LABEL}: ${countdownText}`;
  const accentColor = isUrgent ? styles.tokens.urgentAccent : styles.tokens.accent;

  return (
    <View
      style={[styles.root, isUrgent && styles.rootUrgent]}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={statusLabel}
    >
      <View style={styles.lead}>
        <View style={[styles.icon, isUrgent && styles.iconUrgent]}>
          {borderProgress != null ? (
            <FlashSaleIconBorder progress={borderProgress} color={accentColor} />
          ) : (
            <View
              style={[styles.iconStaticBorder, { borderColor: styles.tokens.borderTrack }]}
              pointerEvents="none"
            />
          )}
          <MaterialIcons name="local-fire-department" size={27} color={accentColor} />
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isUrgent && styles.titleUrgent]}>
              {PRODUCT_FLASH_SALE_UI.DETAILS_TITLE}
            </Text>
            {discountPercent != null && discountPercent >= 1 ? (
              <Text style={[styles.discount, isUrgent && styles.discountUrgent]}>
                −{discountPercent}%
              </Text>
            ) : null}
          </View>
          <Text style={[styles.caption, isUrgent && styles.captionUrgent]}>
            {PRODUCT_FLASH_SALE_UI.DETAILS_COUNTDOWN_LABEL}
          </Text>
        </View>
      </View>

      {isExpired ? (
        <Text style={styles.expired}>
          {PRODUCT_FLASH_SALE_UI.DETAILS_COUNTDOWN_EXPIRED}
        </Text>
      ) : (
        <CountdownTimer parts={countdownParts} isUrgent={isUrgent} />
      )}
    </View>
  );
};
