import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * Позиция заказа глазами курьера: обложка, название, количество.
 *
 * По картинке габариты читаются быстрее, чем по названию, — курьеру это
 * решение «влезет ли в машину». Клик открывает карточку товара.
 *
 * @param {{
 *   item: {
 *     productId?: string;
 *     name?: string;
 *     quantity?: number;
 *     imageUrl?: string;
 *     characteristics?: Array<{ key?: string; value?: string }>;
 *   };
 *   onProductClick?: (productId: string) => void;
 * }} props
 */
export function CourierOrderItem({ item, onProductClick }) {
  const imageUrl = item.imageUrl ? resolveImageUrlForDisplay(item.imageUrl) : "";
  const clickable = Boolean(onProductClick && item.productId);

  const body = (
    <>
      {imageUrl ? (
        <img className="courier-overview__item-image" src={imageUrl} alt="" loading="lazy" />
      ) : (
        <span className="courier-overview__item-image" />
      )}
      <span className="courier-overview__item-name">
        {item.name} × {item.quantity}
        {/* Габаритов у товара нет — курьер прикидывает по характеристикам. */}
        {item.characteristics?.length ? (
          <span className="courier-overview__chars">
            {item.characteristics
              .slice(0, 3)
              .map((row) => `${row.key}: ${row.value}`)
              .join(" · ")}
          </span>
        ) : null}
      </span>
    </>
  );

  if (!clickable) {
    return <li className="courier-overview__item">{body}</li>;
  }

  return (
    <li className="courier-overview__item">
      <button
        type="button"
        className="courier-overview__item-button"
        onClick={() => onProductClick(String(item.productId))}
      >
        {body}
      </button>
    </li>
  );
}
