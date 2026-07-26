import { getRuRegionByCode, listRuRegions } from "@molha/api-contract";

/**
 * @param {{
 *   value: string;
 *   onChange: (code: string) => void;
 *   disabled?: boolean;
 *   id?: string;
 *   className?: string;
 *   required?: boolean;
 * }} props
 */
export function RuRegionSelect({
  value,
  onChange,
  disabled = false,
  id,
  className = "",
  required = false,
}) {
  const options = listRuRegions();
  const selected = String(value ?? "").trim();
  const label = getRuRegionByCode(selected)?.name;

  return (
    <select
      id={id}
      className={className}
      value={selected}
      disabled={disabled}
      required={required}
      aria-label={label || "Регион"}
      onChange={(event) => onChange(event.target.value)}
    >
      {!selected ? <option value="">Выберите регион</option> : null}
      {options.map((region) => (
        <option key={region.code} value={region.code}>
          {region.name}
        </option>
      ))}
    </select>
  );
}
