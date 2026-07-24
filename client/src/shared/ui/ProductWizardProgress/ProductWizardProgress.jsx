import { CREATE_PRODUCT_MODAL_UI } from "../../config/appUiCopy.js";

import "./ProductWizardProgress.css";

/**
 * @param {{
 *   stepIds: readonly string[];
 *   stepIndex: number;
 *   resolveStepCopy: (stepId: string) => {
 *     title: string;
 *     subtitle?: string;
 *     shortLabel: string;
 *   };
 *   progressAria?: string;
 * }} props
 */
export function ProductWizardProgress({
  stepIds,
  stepIndex,
  resolveStepCopy,
  progressAria = CREATE_PRODUCT_MODAL_UI.WIZARD_PROGRESS_ARIA,
}) {
  return (
    <div className="product-wizard-progress" aria-label={progressAria}>
      <p className="product-wizard-progress__step-caption">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_OF(stepIndex + 1, stepIds.length)}
      </p>
      <ol
        className="product-wizard-progress__steps"
        style={{ gridTemplateColumns: `repeat(${stepIds.length}, minmax(0, 1fr))` }}
      >
        {stepIds.map((id, index) => {
          const copy = resolveStepCopy(id);
          const isActive = index === stepIndex;
          const isComplete = index < stepIndex;

          return (
            <li
              key={id}
              className={[
                "product-wizard-progress__step",
                isActive ? "product-wizard-progress__step_active" : "",
                isComplete ? "product-wizard-progress__step_complete" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="product-wizard-progress__step-index" aria-hidden={isComplete}>
                {isComplete ? "✓" : index + 1}
              </span>
              <span className="product-wizard-progress__step-label">{copy.shortLabel}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
