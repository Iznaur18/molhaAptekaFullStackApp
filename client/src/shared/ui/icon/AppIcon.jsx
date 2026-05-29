import { ICON_SIZE_PX } from "./iconSizes.js";

/**
 * @param {{
 *   icon: import("lucide-react").LucideIcon;
 *   size?: keyof typeof ICON_SIZE_PX | number;
 *   className?: string;
 *   strokeWidth?: number;
 *   "aria-hidden"?: boolean;
 * }} props
 */
export function AppIcon({
  icon: Icon,
  size = "md",
  className,
  strokeWidth = 2,
  "aria-hidden": ariaHidden = true,
  ...rest
}) {
  const px = typeof size === "number" ? size : ICON_SIZE_PX[size];

  return (
    <Icon
      size={px}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
      {...rest}
    />
  );
}
