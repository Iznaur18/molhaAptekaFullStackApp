import { useEffect, useState } from "react";

import "./ProductManageToggleRow.css";

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   checked?: boolean;
 *   onCheckedChange?: (
 *     checked: boolean,
 *   ) => void | Promise<void | { needsSetup?: boolean; revert?: boolean }>;
 *   onPress?: () => void;
 *   disabled?: boolean;
 *   pending?: boolean;
 *   pendingLabel?: string;
 *   variant?: "default" | "auction" | "installment" | "raffle" | "danger";
 *   ariaLabel?: string;
 *   titleStatus?: string;
 *   imageUrl?: string | null;
 * }} props
 */
export function ProductManageToggleRow({
  title,
  description,
  checked = false,
  onCheckedChange,
  onPress,
  disabled = false,
  pending = false,
  pendingLabel = "",
  variant = "default",
  ariaLabel,
}) {
  const isLocked = disabled || pending;
  const isDanger = variant === "danger";
  const showChevron =
    variant === "installment" &&
    typeof onPress === "function" &&
    typeof onCheckedChange !== "function";
  const showSwitch = !isDanger && !showChevron;
  const label = ariaLabel ?? title;
  const statusLabel = pending && pendingLabel ? pendingLabel : label;
  const [displayChecked, setDisplayChecked] = useState(checked);

  useEffect(() => {
    setDisplayChecked(checked);
  }, [checked]);

  useEffect(() => {
    if (!pending) {
      setDisplayChecked(checked);
    }
  }, [pending, checked]);

  const handleActivate = () => {
    if (isLocked) {
      return;
    }
    if (onPress) {
      onPress();
      return;
    }
    const next = !displayChecked;
    setDisplayChecked(next);
    void Promise.resolve(onCheckedChange?.(next)).then((result) => {
      if (result?.needsSetup || result?.revert) {
        setDisplayChecked(!next);
      }
    });
  };

  const handleSwitchChange = (event) => {
    if (isLocked) {
      return;
    }
    const next = event.target.checked;
    setDisplayChecked(next);
    if (typeof onCheckedChange !== "function") {
      if (onPress) {
        onPress();
        setDisplayChecked(checked);
      }
      return;
    }
    void Promise.resolve(onCheckedChange(next)).then((result) => {
      if (result?.needsSetup || result?.revert) {
        setDisplayChecked(!next);
      }
    });
  };

  if (showSwitch) {
    return (
      <div
        className={[
          "product-manage-toggle-row",
          isLocked ? "product-manage-toggle-row_locked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="switch"
        aria-checked={displayChecked}
        aria-disabled={isLocked || undefined}
        aria-busy={pending || undefined}
        aria-label={statusLabel}
      >
        <button
          type="button"
          className="product-manage-toggle-row__text-button"
          disabled={isLocked}
          aria-label={statusLabel}
          onClick={handleActivate}
        >
          <span className="product-manage-toggle-row__title">{title}</span>
          <span className="product-manage-toggle-row__description">{description}</span>
        </button>
        <label className="product-manage-toggle-row__switch">
          <input
            type="checkbox"
            className="product-manage-toggle-row__switch-input"
            checked={displayChecked}
            disabled={isLocked}
            aria-label={statusLabel}
            onChange={handleSwitchChange}
          />
          <span className="product-manage-toggle-row__switch-track" aria-hidden="true">
            <span className="product-manage-toggle-row__switch-thumb" />
          </span>
        </label>
      </div>
    );
  }

  const className = [
    "product-manage-toggle-row",
    "product-manage-toggle-row_pressable",
    isDanger ? "product-manage-toggle-row_danger" : "",
    isLocked ? "product-manage-toggle-row_locked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      disabled={isLocked}
      aria-busy={pending || undefined}
      aria-label={statusLabel}
      onClick={handleActivate}
    >
      <span className="product-manage-toggle-row__text">
        <span className="product-manage-toggle-row__title">{title}</span>
        <span className="product-manage-toggle-row__description">{description}</span>
      </span>
      {showChevron ? (
        <span className="product-manage-toggle-row__chevron" aria-hidden="true">
          ›
        </span>
      ) : null}
    </button>
  );
}
