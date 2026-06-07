import { COMMON_UI } from "../../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "../../lib/formatProductFieldForDisplay.js";
import { resolveProductImageUrls } from "../../lib/resolveProductImageUrls.js";
import {
  getProductDetailsModalRowClassName,
  getProductDetailsModalValueClassName,
  getProductFieldLabel,
} from "../../lib/productFieldRegistry.js";

/**
 * @param {import("../../model/types.js").ProductFromApi} product
 * @param {readonly string[]} keys
 * @param {{ onClose: () => void; onSellerNameClick?: (userId: string) => void }} handlers
 */
export function renderProductDetailsFieldRows(product, keys, handlers) {
  const { onClose, onSellerNameClick } = handlers;
  const imageUrls = resolveProductImageUrls(product);

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
    } else if (key === "productImageUrls" && imageUrls.length > 0) {
      valueNode = (
        <ul className="product-details-modal__image-url-list">
          {imageUrls.map((url, index) => (
            <li key={`${index}-${url}`}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="product-details-modal__image-url-link"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
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
