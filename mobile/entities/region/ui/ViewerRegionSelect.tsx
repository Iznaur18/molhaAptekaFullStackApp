import { RuRegionSelect } from "./RuRegionSelect";
import { REGION_UI } from "@/shared/config";

type ViewerRegionSelectProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  /** Пустая строка — без подписи (карусель подборок). */
  label?: string;
};

/** Компактный пикер региона просмотра (главная). */
export function ViewerRegionSelect({
  value,
  onChange,
  disabled = false,
  label = REGION_UI.VIEWER_LABEL,
}: ViewerRegionSelectProps) {
  return (
    <RuRegionSelect
      value={value}
      onChange={onChange}
      disabled={disabled}
      label={label}
      compact
    />
  );
}
