import { Animated, Pressable, Text, View } from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

import { FORTUNE_WHEEL_SECTION_UI as UI } from "@/shared/config";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useSellerGamesStyles } from "@/shared/theme/sellerGamesStyles";

import type { FortuneWheelSector } from "../api/fortuneWheelApi";
import { mixHexWithWhite } from "../lib/mixHexColors";
import { resolveSectorAngles } from "../lib/resolveSectorAngles";

const VIEW_SIZE = 200;
const CENTER = VIEW_SIZE / 2;
const WHEEL_RADIUS = 96;
const TEXT_RADIUS = 62;

/** Угол в градусах (0 — вверх, по часовой) → точка на окружности. */
function polarToPoint(radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

/** Путь сектора-«куска пирога» от startDeg до endDeg (по часовой от вверха). */
function sectorPath(startDeg: number, endDeg: number) {
  const start = polarToPoint(WHEEL_RADIUS, startDeg);
  const end = polarToPoint(WHEEL_RADIUS, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

type FortuneWheelViewProps = {
  sectors: FortuneWheelSector[];
  /** Угол ротора — Animated.Value в градусах (может превышать 360). */
  rotation: Animated.Value;
  spinning: boolean;
  landedIndex: number | null;
  hubLabel: string;
  hubDisabled: boolean;
  onHubPress: () => void;
};

/**
 * Колесо фортуны — паритет web `FortuneWheel.jsx`: SVG-круг из секций,
 * стрелка сверху, кнопка спина в центре. Вращение приходит снаружи.
 */
export const FortuneWheelView = ({
  sectors,
  rotation,
  spinning,
  landedIndex,
  hubLabel,
  hubDisabled,
  onHubPress,
}: FortuneWheelViewProps) => {
  const theme = useAppTheme();
  const styles = useSellerGamesStyles();
  const list = Array.isArray(sectors) ? sectors : [];
  const angles = resolveSectorAngles(list);
  const oddFill = mixHexWithWhite(theme.colors.action, 0.42);

  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.wheelStage}>
      <View style={styles.wheelPointer} />
      <Animated.View style={[styles.wheelRotor, { transform: [{ rotate }] }]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}>
          <G>
            {list.map((sector, index) => {
              const { startDeg, endDeg, midDeg } = angles[index];
              const labelPoint = polarToPoint(TEXT_RADIUS, midDeg);
              const isPrize = sector.enabled !== false;
              const isEven = index % 2 === 0;
              const isLanded = landedIndex === index;
              const fill = isPrize
                ? isEven
                  ? theme.colors.action
                  : oddFill
                : theme.colors.surfaceMuted;
              const labelFill = isPrize
                ? isEven
                  ? theme.colors.onContrast
                  : theme.colors.ink
                : theme.colors.textMuted;
              const label = isPrize
                ? sector.prizeProductId
                  ? UI.SECTOR_PRODUCT_FACE
                  : `${sector.discountPercent}%`
                : UI.SECTOR_EMPTY_FACE;
              return (
                <G key={index}>
                  <Path
                    d={sectorPath(startDeg, endDeg)}
                    fill={fill}
                    stroke={isLanded ? theme.colors.ink : theme.colors.surface}
                    strokeWidth={isLanded ? 2.5 : 1.5}
                  />
                  {endDeg - startDeg > 0 ? (
                    <SvgText
                      x={labelPoint.x.toFixed(2)}
                      y={labelPoint.y.toFixed(2)}
                      fill={labelFill}
                      fontSize={isPrize ? 10 : 8}
                      fontWeight={isPrize ? "800" : "600"}
                      textAnchor="middle"
                      alignmentBaseline="central"
                      transform={`rotate(${midDeg} ${labelPoint.x.toFixed(2)} ${labelPoint.y.toFixed(2)})`}
                    >
                      {label}
                    </SvgText>
                  ) : null}
                </G>
              );
            })}
          </G>
        </Svg>
      </Animated.View>
      <Pressable
        style={[styles.wheelHub, (hubDisabled || spinning) && styles.wheelHubDisabled]}
        disabled={hubDisabled || spinning}
        onPress={onHubPress}
        accessibilityRole="button"
        accessibilityLabel={UI.SPIN_ARIA}
      >
        <Text style={styles.wheelHubLabel}>{hubLabel}</Text>
      </Pressable>
    </View>
  );
};
