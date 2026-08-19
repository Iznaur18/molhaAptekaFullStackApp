import { useId, useState } from "react";

import { REGION_UI } from "../../../shared/config/appUiCopy.js";
import { HeaderCircleIconButton } from "../../../shared/ui/HeaderCircleIconButton/index.js";
import { MapPin } from "../../../shared/ui/icon/index.js";
import { ViewerRegionPickerSheet } from "./ViewerRegionPickerSheet.jsx";

import "./ViewerRegionSelect.css";

/**
 * Кнопка региона просмотра (MapPin) → bottom sheet с поиском.
 *
 * @param {{
 *   value: string;
 *   onChange: (code: string) => void;
 *   disabled?: boolean;
 *   className?: string;
 * }} props
 */
export function ViewerRegionSelect({
  value,
  onChange,
  disabled = false,
  className = "",
}) {
  const sheetId = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className={["viewer-region-select", className].filter(Boolean).join(" ")}>
      <HeaderCircleIconButton
        icon={MapPin}
        ariaLabel={REGION_UI.VIEWER_ARIA}
        ariaExpanded={open}
        ariaControls={open ? sheetId : undefined}
        isActive={open}
        disabled={disabled}
        className="header-circle-button--cta"
        onClick={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
      />
      <ViewerRegionPickerSheet
        id={sheetId}
        isOpen={open}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={(code) => {
          onChange(code);
          setOpen(false);
        }}
      />
    </div>
  );
}
