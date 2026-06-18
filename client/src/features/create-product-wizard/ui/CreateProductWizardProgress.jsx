import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { resolveCreateProductWizardStepCopy } from "../lib/resolveCreateProductWizardStepCopy.js";

/**
 * @param {{
 *   stepIds: readonly string[];
 *   stepIndex: number;
 *   stepId: string;
 * }} props
 */
export function CreateProductWizardProgress({ stepIds, stepIndex, stepId }) {
  const stepCopy = resolveCreateProductWizardStepCopy(
    /** @type {import('../lib/createProductWizardSteps.js').CreateProductWizardStepId} */ (stepId),
  );

  return (
    <div className="create-product-wizard__progress" aria-label={CREATE_PRODUCT_MODAL_UI.WIZARD_PROGRESS_ARIA}>
      <p className="create-product-wizard__step-caption">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_STEP_OF(stepIndex + 1, stepIds.length)}
      </p>
      <ol className="create-product-wizard__steps">
        {stepIds.map((id, index) => {
          const copy = resolveCreateProductWizardStepCopy(
            /** @type {import('../lib/createProductWizardSteps.js').CreateProductWizardStepId} */ (id),
          );
          const isActive = index === stepIndex;
          const isComplete = index < stepIndex;

          return (
            <li
              key={id}
              className={[
                "create-product-wizard__step",
                isActive ? "create-product-wizard__step_active" : "",
                isComplete ? "create-product-wizard__step_complete" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="create-product-wizard__step-index">{index + 1}</span>
              <span className="create-product-wizard__step-label">{copy.shortLabel}</span>
            </li>
          );
        })}
      </ol>
      <div className="create-product-wizard__headline">
        <h3 className="create-product-wizard__title">{stepCopy.title}</h3>
        {stepCopy.subtitle ? (
          <p className="create-product-wizard__subtitle">{stepCopy.subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
