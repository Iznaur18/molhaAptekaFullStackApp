import { EyeOff } from "lucide-react";

import { SELLER_STORE_PAUSE_UI } from "../../../shared/config/appUiCopy.js";
import {
  useMySellerStorePauseQuery,
  useSetMySellerStorePauseMutation,
} from "../model/sellerStorePauseQueries.js";

import "./SellerStorePauseControl.css";

/**
 * Пауза магазина в «Моих товарах».
 *
 * `mode="action"` — пункт «Скрыть все товары» (пока пауза выключена и есть что
 * скрывать). `mode="banner"` — плашка «Магазин на паузе» с кнопкой возврата
 * (пока пауза включена). Живут в разных местах тулбара: действие редкое и
 * прячется в меню, а включённую паузу продавец должен видеть всегда.
 *
 * @param {{ mode: "action" | "banner" }} props
 */
export function SellerStorePauseControl({ mode }) {
  const { data: storePause } = useMySellerStorePauseQuery();
  const mutation = useSetMySellerStorePauseMutation();

  if (!storePause) return null;

  const { paused, visibleProductCount, pausedProductCount } = storePause;

  const toggle = () => {
    const confirmText = paused
      ? SELLER_STORE_PAUSE_UI.RESUME_CONFIRM(pausedProductCount)
      : SELLER_STORE_PAUSE_UI.PAUSE_CONFIRM(visibleProductCount);
    if (!window.confirm(confirmText)) return;
    mutation.mutate(!paused);
  };

  const error = mutation.isError ? (
    <p className="seller-store-pause__error" role="alert">
      {mutation.error?.message ?? SELLER_STORE_PAUSE_UI.ERROR_FALLBACK}
    </p>
  ) : null;

  if (mode === "banner") {
    if (!paused) return null;
    return (
      <div className="seller-store-pause seller-store-pause_active" role="status">
        <div className="seller-store-pause__body">
          <p className="seller-store-pause__title">
            {SELLER_STORE_PAUSE_UI.PAUSED_TITLE}
          </p>
          <p className="seller-store-pause__text">
            {SELLER_STORE_PAUSE_UI.PAUSED_TEXT(pausedProductCount)}
          </p>
          {error}
        </div>
        <button
          type="button"
          className="seller-store-pause__resume"
          disabled={mutation.isPending}
          onClick={toggle}
        >
          {mutation.isPending
            ? SELLER_STORE_PAUSE_UI.RESUME_PENDING
            : SELLER_STORE_PAUSE_UI.RESUME_BUTTON}
        </button>
      </div>
    );
  }

  // Скрывать нечего или пауза уже включена — пункт только шумел бы.
  if (paused || visibleProductCount === 0) return null;

  return (
    <div className="seller-store-pause">
      <button
        type="button"
        className="seller-store-pause__pause"
        disabled={mutation.isPending}
        onClick={toggle}
      >
        <EyeOff size={16} strokeWidth={2.2} aria-hidden="true" />
        {mutation.isPending
          ? SELLER_STORE_PAUSE_UI.PAUSE_PENDING
          : SELLER_STORE_PAUSE_UI.PAUSE_BUTTON}
      </button>
      {error}
    </div>
  );
}
