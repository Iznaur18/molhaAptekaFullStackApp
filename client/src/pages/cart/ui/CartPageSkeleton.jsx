import { CART_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "../../../shared/ui/Skeleton/skeleton.css";
import "./CartPageSkeleton.css";

const SKELETON_LINE_COUNT = 3;

/**
 * Плейсхолдер корзины на первую загрузку.
 *
 * Раньше здесь был абзац «Загрузка…»: пустой экран, потом сразу полный
 * список — заметный скачок именно на корзине, где пользователь ждёт увидеть
 * свои товары. Скелетон повторяет строки и итоговую панель.
 *
 * @param {{ lineCount?: number }} [props]
 */
export function CartPageSkeleton({ lineCount = SKELETON_LINE_COUNT }) {
  return (
    <div
      className="cart-page cart-page--sections"
      role="status"
      aria-label={CART_PAGE_UI.LOADING}
    >
      <div className="cart-page__content" aria-hidden="true">
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index} className="cart-skeleton__line">
            <div className="cart-skeleton__card">
              <span className="iz-skeleton cart-skeleton__image" />
              <span className="cart-skeleton__info">
                <span className="iz-skeleton iz-skeleton_line cart-skeleton__title" />
                <span className="iz-skeleton iz-skeleton_line cart-skeleton__subtitle" />
                <span className="iz-skeleton iz-skeleton_line cart-skeleton__price" />
              </span>
            </div>
          </div>
        ))}

        <div className="cart-skeleton__summary">
          <span className="iz-skeleton iz-skeleton_line cart-skeleton__total" />
          <span className="iz-skeleton cart-skeleton__button" />
        </div>
      </div>
    </div>
  );
}
