import { COMMON_UI } from "../../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "../../lib/formatProductFieldForDisplay.js";
import {
  getProductDetailsModalRowClassName,
  getProductDetailsModalValueClassName,
  getProductFieldLabel,
} from "../../lib/productFieldRegistry.js";
import { ProductDetailIdCopyButton } from "../ProductDetailIdCopyButton.jsx";

const PRODUCT_ID_FIELD_KEY = "_id";

/**
 * @param {import("../../model/types.js").ProductFromApi} product
 * @param {readonly string[]} keys
 * @param {{ onClose: () => void; onSellerNameClick?: (userId: string) => void }} handlers
 */
export function renderProductDetailsFieldRows(product, keys, handlers) {
  const { onClose, onSellerNameClick } = handlers;

  return keys.map((key) => {
    const raw = product[key];
    const display = formatProductFieldForDisplay(key, product);
    const canOpenSellerProfile =
      key === "productSeller" &&
      typeof onSellerNameClick === "function" &&
      raw != null &&
      typeof raw === "object" &&
      raw._id != null &&
      display !== COMMON_UI.EM_DASH;
    const showIdCopy =
      key === PRODUCT_ID_FIELD_KEY &&
      display !== COMMON_UI.EM_DASH &&
      display.length > 0;

    const ddClass = getProductDetailsModalValueClassName(key);

    let valueNode;
    if (canOpenSellerProfile) {
      valueNode = (
        <button
          type="button"
          className="product-details-modal__seller-link"
          onClick={() => {
            onClose();
            onSellerNameClick(String(raw._id));
          }}
        >
          {display}
        </button>
      );
    } else if (showIdCopy) {
      valueNode = (
        <div className="product-details-modal__meta-value-row">
          <span className="product-details-modal__meta-value-text">{display}</span>
          <ProductDetailIdCopyButton productId={display} />
        </div>
      );
    } else {
      valueNode = display;
    }

    return (
      <div key={key} className={getProductDetailsModalRowClassName(key)}>
        <dt className="product-details-modal__key">{getProductFieldLabel(key)}</dt>
        <dd className={ddClass}>{valueNode}</dd>
      </div>
    );
  });
}
