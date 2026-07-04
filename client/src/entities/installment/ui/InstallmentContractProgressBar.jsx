import { useEffect, useState } from "react";

import { INSTALLMENT_UI } from "../../../shared/config/appUiCopy.js";

import "./InstallmentContractProgressBar.css";

/**
 * @returns {boolean}
 */
function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * @param {{
 *   percent: number;
 *   ariaLabel?: string;
 * }} props
 */
export function InstallmentContractProgressBar({ percent, ariaLabel }) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setAnimatedPercent(clampedPercent);
      return undefined;
    }

    const frameId = requestAnimationFrame(() => {
      setAnimatedPercent(clampedPercent);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [clampedPercent]);

  const showShimmer = clampedPercent > 0 && clampedPercent < 100 && !prefersReducedMotion();

  return (
    <div
      className="installment-contract-card__progress"
      role="progressbar"
      aria-valuenow={clampedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${INSTALLMENT_UI.CONTRACT_PAID}: ${clampedPercent}%`}
    >
      <div
        className={[
          "installment-contract-card__progress-fill",
          showShimmer ? "installment-contract-card__progress-fill_shimmer" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width: `${animatedPercent}%` }}
      />
    </div>
  );
}
