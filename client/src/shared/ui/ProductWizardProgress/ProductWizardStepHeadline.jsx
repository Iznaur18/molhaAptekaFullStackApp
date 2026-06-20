import "./ProductWizardStepHeadline.css";

/**
 * @param {{
 *   title: string;
 *   subtitle?: string;
 * }} props
 */
export function ProductWizardStepHeadline({ title, subtitle }) {
  return (
    <div className="product-wizard-step-headline">
      <h3 className="product-wizard-step-headline__title">{title}</h3>
      {subtitle ? (
        <p className="product-wizard-step-headline__subtitle">{subtitle}</p>
      ) : null}
    </div>
  );
}
