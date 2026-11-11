import { FORTUNE_WHEEL_SECTION_UI } from "../../../shared/config/appUiCopy.js";
import { resolveSectorAngles } from "../lib/resolveSectorAngles.js";

const VIEW_SIZE = 200;
const CENTER = VIEW_SIZE / 2;
const WHEEL_RADIUS = 96;
const TEXT_RADIUS = 62;

/** Угол в градусах (0 — вверх, по часовой) → точка на окружности. */
function polarToPoint(radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

/** Путь сектора-«куска пирога» от startDeg до endDeg (по часовой от вверха). */
function sectorPath(startDeg, endDeg) {
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

/**
 * Колесо фортуны: SVG-круг из секций продавца, стрелка сверху и кнопка
 * спина в центре. Вращение управляется снаружи через `rotation` (deg) —
 * CSS transition делает плавную остановку на выпавшей секции.
 *
 * @param {{
 *   sectors: Array<{ discountPercent: number; durationHours: number; chancePercent?: number; enabled: boolean }>;
 *   rotation: number;
 *   spinning: boolean;
 *   landedIndex: number | null;
 *   hubLabel: string;
 *   hubDisabled: boolean;
 *   onHubClick: () => void;
 *   onSpinEnd: () => void;
 * }} props
 */
export function FortuneWheel({
  sectors,
  rotation,
  spinning,
  landedIndex,
  hubLabel,
  hubDisabled,
  onHubClick,
  onSpinEnd,
}) {
  const list = Array.isArray(sectors) ? sectors : [];
  const angles = resolveSectorAngles(list);

  return (
    <div className="fortune-wheel__stage">
      <div className="fortune-wheel__pointer" aria-hidden="true" />
      <svg
        className="fortune-wheel__svg"
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        role="img"
        aria-label={FORTUNE_WHEEL_SECTION_UI.TITLE}
      >
        <g
          className="fortune-wheel__rotor"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${CENTER}px ${CENTER}px`,
          }}
          onTransitionEnd={onSpinEnd}
        >
          {list.map((sector, index) => {
            const { startDeg, endDeg, midDeg } = angles[index];
            const labelPoint = polarToPoint(TEXT_RADIUS, midDeg);
            const isPrize = sector.enabled !== false;
            const isLanded = landedIndex === index;
            return (
              <g key={index}>
                <path
                  d={sectorPath(startDeg, endDeg)}
                  className={[
                    "fortune-wheel__sector",
                    isPrize
                      ? index % 2 === 0
                        ? "fortune-wheel__sector_even"
                        : "fortune-wheel__sector_odd"
                      : "fortune-wheel__sector_empty",
                    isLanded ? "fortune-wheel__sector_landed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
                {/* Секцию с нулевым шансом не подписываем: её не видно. */}
                {endDeg - startDeg > 0 ? (
                  <text
                    x={labelPoint.x.toFixed(2)}
                    y={labelPoint.y.toFixed(2)}
                    className={[
                      "fortune-wheel__sector-label",
                      isPrize && index % 2 !== 0
                        ? "fortune-wheel__sector-label_light"
                        : "",
                      isPrize ? "" : "fortune-wheel__sector-label_empty",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    transform={`rotate(${midDeg} ${labelPoint.x.toFixed(2)} ${labelPoint.y.toFixed(2)})`}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {isPrize
                      ? sector.prizeProductId
                        ? FORTUNE_WHEEL_SECTION_UI.SECTOR_PRODUCT_FACE
                        : `${sector.discountPercent}%`
                      : FORTUNE_WHEEL_SECTION_UI.SECTOR_EMPTY_FACE}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
      <button
        type="button"
        className="fortune-wheel__hub"
        disabled={hubDisabled || spinning}
        aria-label={FORTUNE_WHEEL_SECTION_UI.SPIN_ARIA}
        onClick={onHubClick}
      >
        {hubLabel}
      </button>
    </div>
  );
}
