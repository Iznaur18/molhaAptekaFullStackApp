import Svg, { Path } from "react-native-svg";

/**
 * Цвет задан явно, а не токеном: значок опознают по форме и зелёному щиту,
 * и в тёмной теме он должен остаться тем же (web `SafeDealSellerBadge`).
 */
const SAFE_DEAL_BADGE_GREEN = "#15803d";

/** Щит с галочкой рядом с именем продавца — там же, где премиум и «данные подтверждены». */
export const SafeDealSellerBadge = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={SAFE_DEAL_BADGE_GREEN}
      d="M12 1.5 3.5 5v6.2c0 5.3 3.6 9.7 8.5 11.3 4.9-1.6 8.5-6 8.5-11.3V5L12 1.5Z"
    />
    <Path
      fill="none"
      stroke="#fff"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 12.2 10.9 15 16 9.4"
    />
  </Svg>
);
