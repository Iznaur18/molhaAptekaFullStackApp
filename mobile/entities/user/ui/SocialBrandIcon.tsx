import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

/**
 * Значки соцсетей одной линией — те же контуры 24×24, что у web
 * `SocialBrandIcon.jsx` (в lucide фирменных значков нет).
 */
const SOCIAL_BRAND_ICON_PATHS: Record<string, ReactNode> = {
  socialInstagramUrl: (
    <>
      <Rect x="3" y="3" width="18" height="18" rx="5" />
      <Circle cx="12" cy="12" r="4" />
      <Path d="M17.5 6.5h.01" />
    </>
  ),
  socialWhatsappUrl: (
    <>
      <Path d="M3 21l1.7-4.6A8.5 8.5 0 1 1 8 19.6L3 21z" />
      <Path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-0.9 0.9c-1-0.5-1.9-1.4-2.4-2.4l0.9-0.9-1-2L9 8.5z" />
    </>
  ),
  socialTelegramUrl: (
    <>
      <Path d="M21 4L3 11l6 2.2L11 20l3.2-4.4L19 19l2-15z" />
      <Path d="M9 13.2L21 4" />
    </>
  ),
  socialYoutubeUrl: (
    <>
      <Rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <Path d="M10 9.2v5.6l5-2.8-5-2.8z" />
    </>
  ),
  socialVkUrl: (
    <>
      <Rect x="3" y="3" width="18" height="18" rx="5" />
      <Path d="M7 9c0.4 3.4 2.3 6 5.4 6V9" />
      <Path d="M17 9c-0.6 1.8-2.2 3-4.6 3 2.4 0 4 1.2 4.9 3" />
    </>
  ),
  socialWebsiteUrl: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M3 12h18" />
      <Path d="M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9s1.3-6.5 3.9-9z" />
    </>
  ),
};

type SocialBrandIconProps = {
  id: string;
  size?: number;
  strokeWidth?: number;
  color: string;
};

export const SocialBrandIcon = ({
  id,
  size = 20,
  strokeWidth = 2.1,
  color,
}: SocialBrandIconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {SOCIAL_BRAND_ICON_PATHS[id] ?? SOCIAL_BRAND_ICON_PATHS.socialWebsiteUrl}
  </Svg>
);

/** Фирменные цвета сервисов: по ним ссылку узнают раньше, чем прочтут (web CSS). */
const SOCIAL_BADGE_COLORS: Record<string, string> = {
  socialWhatsappUrl: "#25d366",
  socialTelegramUrl: "#29a9eb",
  socialYoutubeUrl: "#ff0033",
  socialVkUrl: "#0077ff",
};

const BADGE_SIZE = 40;

const badgeStyles = StyleSheet.create({
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  glyph: {
    position: "relative",
    zIndex: 1,
  },
});

/** Квадратный значок 40×40 в фирменном цвете — строка окна «Соцсети и сайт». */
export const SocialBrandBadge = ({
  id,
  fallbackColor,
}: {
  id: string;
  /** Сайт и неизвестные — цвет темы (web `--iz-color-primary`). */
  fallbackColor: string;
}) => {
  const isInstagram = id === "socialInstagramUrl";
  return (
    <View
      style={[
        badgeStyles.badge,
        !isInstagram && { backgroundColor: SOCIAL_BADGE_COLORS[id] ?? fallbackColor },
      ]}
    >
      {isInstagram ? (
        // web: linear-gradient(45deg, #f9a03f, #e1306c, #833ab4).
        <Svg style={StyleSheet.absoluteFill} width={BADGE_SIZE} height={BADGE_SIZE}>
          <Defs>
            <LinearGradient id="instagram-badge" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor="#f9a03f" />
              <Stop offset="0.5" stopColor="#e1306c" />
              <Stop offset="1" stopColor="#833ab4" />
            </LinearGradient>
          </Defs>
          <Rect width={BADGE_SIZE} height={BADGE_SIZE} fill="url(#instagram-badge)" />
        </Svg>
      ) : null}
      {/* Над градиентом: абсолютный слой иначе перекрывает значок (RN Web). */}
      <View style={badgeStyles.glyph}>
        <SocialBrandIcon id={id} size={22} strokeWidth={2} color="#ffffff" />
      </View>
    </View>
  );
};
