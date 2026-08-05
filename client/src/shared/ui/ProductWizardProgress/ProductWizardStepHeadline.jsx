import { FormRequiredMark } from "../FormFieldLabel/FormRequiredMark.jsx";

import "./ProductWizardStepHeadline.css";

/**
 * @param {{
 *   title: string;
 *   subtitle?: string;
 *   required?: boolean;
 * }} props
 */
export function ProductWizardStepHeadline({ title, subtitle, required = false }) {
  return (
    <div className="product-wizard-step-headline">
      <h3 className="product-wizard-step-headline__title">
        {title}
        {required ? <FormRequiredMark /> : null}
      </h3>
      {subtitle ? (
        <p className="product-wizard-step-headline__subtitle">{subtitle}</p>
      ) : null}
    </div>
  );
}
