import { urlsFromImageRows } from "../../lib/productImageRowHelpers.js";
import { serializeProductReturnTermRows } from "../../lib/productReturnTermRows.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { getProductFieldEditLabel } from "../../lib/productFieldRegistry.js";

/**
 * @param {{
 *   form: Record<string, unknown>;
 *   discountPreviewPercent: number | null;
 *   onEditStep: (stepIndex: number) => void;
 *   className?: string;
 * }} props
 */
export function CreateProductReviewSection({
  form,
  discountPreviewPercent,
  onEditStep,
  className = "",
}) {
  const imageCount = urlsFromImageRows(form.productImageRows).length;
  const categoryLabel =
    String(form.categoryBreadcrumbRu ?? "").trim() ||
    String(form.productCategory ?? "").trim() ||
    CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_EMPTY;

  const returnSummary =
    form.productReturnEnabled === true
      ? serializeProductReturnTermRows(
          Array.isArray(form.returnTermRows) ? form.returnTermRows : [],
        )
          .map((term) => `${term.key}: ${term.value}`)
          .join("; ") || CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_EMPTY
      : form.productReturnEnabled === false
        ? CREATE_PRODUCT_MODAL_UI.RETURN_NO
        : CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_EMPTY;

  const rows = [
    {
      label: getProductFieldEditLabel("productName"),
      value: String(form.productName ?? "").trim(),
      stepIndex: 0,
    },
    {
      label: getProductFieldEditLabel("productDescription"),
      value: String(form.productDescription ?? "").trim(),
      stepIndex: 0,
      multiline: true,
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.LABEL_ORIGINALITY,
      value:
        form.productIsOriginal === true
          ? CREATE_PRODUCT_MODAL_UI.ORIGINALITY_YES
          : form.productIsOriginal === false
            ? CREATE_PRODUCT_MODAL_UI.ORIGINALITY_NO
            : CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_EMPTY,
      stepIndex: 1,
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.SECTION_MEDIA,
      value: CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_MEDIA(imageCount, form.productPreviewVideoUrl),
      stepIndex: 2,
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.LABEL_CATEGORY,
      value: categoryLabel,
      stepIndex: 3,
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.LABEL_SALE_CITY,
      value: String(form.productSaleCity ?? "").trim() || CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_ALL_CITIES,
      stepIndex: 3,
    },
    {
      label: getProductFieldEditLabel("productPrice"),
      value: `${String(form.productPrice ?? "").trim()} ₽${
        discountPreviewPercent != null
          ? ` (−${discountPreviewPercent}%)`
          : ""
      }`,
      stepIndex: 4,
    },
    {
      label: getProductFieldEditLabel("productStockQuantity"),
      value: form.productIsAvailable
        ? `${String(form.productStockQuantity ?? "").trim()} шт.`
        : CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_HIDDEN,
      stepIndex: 4,
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.LABEL_RETURN_ENABLED,
      value: returnSummary,
      stepIndex: 5,
      multiline: true,
    },
  ];

  return (
    <div className={["create-product-review", className].filter(Boolean).join(" ")}>
      <p className="create-product-review__lead">{CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_LEAD}</p>
      <dl className="create-product-review__list">
        {rows.map((row) => (
          <div key={row.label} className="create-product-review__row">
            <dt className="create-product-review__term">{row.label}</dt>
            <dd
              className={
                row.multiline
                  ? "create-product-review__value create-product-review__value_multiline"
                  : "create-product-review__value"
              }
            >
              {row.value}
            </dd>
            <button
              type="button"
              className="create-product-review__edit"
              onClick={() => onEditStep(row.stepIndex)}
            >
              {CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_EDIT}
            </button>
          </div>
        ))}
      </dl>
    </div>
  );
}
