import { EditProductWizard } from "../../../features/edit-product-wizard/ui/EditProductWizard.jsx";

/**
 * @param {Omit<import('./CreateProductModal.jsx').CreateProductModalProps, 'mode'>} props
 */
export function EditProductModal(props) {
  return <EditProductWizard {...props} />;
}
