import { getRuRegionByCode } from "@molha/api-contract";

import { urlsFromImageRows } from "../../lib/productImageRowHelpers.js";
import { serializeProductReturnTermRows } from "../../lib/productReturnTermRows.js";
import {
  PRODUCT_LISTING_ORIGIN_OPTIONS,
  isProductListingOrigin,
} from "../../lib/productListingOrigin.js";
import { CREATE_PRODUCT_MODAL_UI } from "../../../../shared/config/appUiCopy.js";
import { getProductFieldEditLabel } from "../../lib/productFieldRegistry.js";
/**
 * @param {{
 *   form: Record<string, unknown>;
 *   discountPreviewPercent: number | null;
 *   stepIds: readonly string[]; шаги мастера: у осмотра и услуги их меньше
 *   onEditStep: (stepIndex: number) => void;
 *   className?: string;
 * }} props
 */
export function CreateProductReviewSection({
  form,
  discountPreviewPercent,
  stepIds,
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
      stepId: "basic",
    },
    {
      label: getProductFieldEditLabel("productDescription"),
      value: String(form.productDescription ?? "").trim(),
      stepId: "basic",
      multiline: true,
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.LABEL_LISTING_ORIGIN,
      value: isProductListingOrigin(form.productListingOrigin)
        ? (PRODUCT_LISTING_ORIGIN_OPTIONS.find(
            (option) => option.value === form.productListingOrigin,
          )?.label ?? CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_EMPTY)
        : CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_EMPTY,
      stepId: "originality",
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.SECTION_MEDIA,
      value: CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_MEDIA(
        imageCount,
        form.productPreviewVideoUrl,
      ),
      stepId: "media",
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.LABEL_CATEGORY,
      value: categoryLabel,
      stepId: "category",
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.LABEL_SALE_REGION,
      value:
        getRuRegionByCode(String(form.productRegionCode ?? "").trim())?.name ||
        CREATE_PRODUCT_MODAL_UI.HINT_SALE_REGION_FROM_ADDRESS,
      stepId: "category",
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.LABEL_PICKUP_ADDRESS,
      value: (() => {
        const locations = Array.isArray(form.productPickupLocations)
          ? form.productPickupLocations
          : [];
        if (locations.length > 0) {
          return locations
            .map((item) => String(item?.address ?? "").trim())
            .filter(Boolean)
            .join("; ");
        }
        return (
          String(form.productPickupAddress ?? "").trim() ||
          CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_EMPTY
        );
      })(),
      stepId: "pickup",
    },
    {
      label: getProductFieldEditLabel("productPrice"),
      value: `${String(form.productPrice ?? "").trim()} ₽${
        discountPreviewPercent != null ? ` (−${discountPreviewPercent}%)` : ""
      }`,
      stepId: "commerce",
    },
    {
      label: getProductFieldEditLabel("productStockQuantity"),
      value: form.productIsAvailable
        ? `${String(form.productStockQuantity ?? "").trim()} шт.`
        : CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_HIDDEN,
      stepId: "commerce",
    },
    {
      label: CREATE_PRODUCT_MODAL_UI.LABEL_RETURN_ENABLED,
      value: returnSummary,
      stepId: "returns",
      multiline: true,
    },
  ].filter((row) => stepIds.includes(row.stepId));

  return (
    <div className={["create-product-review", className].filter(Boolean).join(" ")}>
      <p className="create-product-review__lead">
        {CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_LEAD}
      </p>
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
              onClick={() => onEditStep(stepIds.indexOf(row.stepId))}
            >
              {CREATE_PRODUCT_MODAL_UI.WIZARD_REVIEW_EDIT}
            </button>
          </div>
        ))}
      </dl>
    </div>
  );
}
