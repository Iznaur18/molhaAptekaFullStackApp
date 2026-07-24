import { useCallback, useMemo } from "react";

import {
  imageRowsFromUrls,
  urlsFromImageRows,
} from "../../../entities/product/lib/productImageRowHelpers.js";
import { PRODUCT_IMAGE_URLS_MAX } from "../../../entities/product/model/productConstants.js";
import { CreateProductWizardMediaGrid } from "./CreateProductWizardMediaGrid.jsx";
import { CreateProductWizardMediaVideoCard } from "./CreateProductWizardMediaVideoCard.jsx";

import "./CreateProductWizardMediaStep.css";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   setForm: import('react').Dispatch<import('react').SetStateAction<Record<string, unknown>>>;
 *   isSubmitting: boolean;
 * }} props
 */
export function CreateProductWizardMediaStep({ form, setForm, isSubmitting }) {
  const rows = /** @type {import('../../../entities/product/lib/productImageRowHelpers.js').ProductImageRow[]} */ (
    form.productImageRows
  );

  const urls = useMemo(() => urlsFromImageRows(rows), [rows]);

  const handleUrlsChange = useCallback(
    (nextUrls) => {
      setForm((prev) => ({
        ...prev,
        productImageRows: imageRowsFromUrls(nextUrls),
      }));
    },
    [setForm],
  );

  return (
    <div className="create-product-wizard-media-step">
      <CreateProductWizardMediaGrid
        urls={urls}
        onChange={handleUrlsChange}
        maxCount={PRODUCT_IMAGE_URLS_MAX}
        disabled={isSubmitting}
      />
      <CreateProductWizardMediaVideoCard
        value={String(form.productPreviewVideoUrl ?? "")}
        onChange={(productPreviewVideoUrl) =>
          setForm((prev) => ({ ...prev, productPreviewVideoUrl }))
        }
        disabled={isSubmitting}
      />
    </div>
  );
}
