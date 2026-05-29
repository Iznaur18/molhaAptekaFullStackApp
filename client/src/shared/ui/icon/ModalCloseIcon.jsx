import { X } from "lucide-react";

import { AppIcon } from "./AppIcon.jsx";

/**
 * @param {{ className?: string; size?: keyof import("./iconSizes.js").ICON_SIZE_PX | number }} props
 */
export function ModalCloseIcon({ className, size = "xl" }) {
  return <AppIcon icon={X} size={size} className={className} />;
}
