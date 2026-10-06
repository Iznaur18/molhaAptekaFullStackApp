import { useState } from "react";

import { CATEGORY_TILE_IMAGES_UI } from "../../../shared/config/appUiCopy.js";
import {
  useCategoryTileImagesMode,
  useSetCategoryTileImagesMutation,
} from "../model/useCategoryTileImages.js";

import "./CategoryTileImagesToggle.css";

/**
 * Переключатель админа: показывать ли картинки на всех плитках категорий.
 * Сами картинки при выключении остаются — их можно вернуть тем же тумблером.
 */
export function CategoryTileImagesToggle() {
  const mode = useCategoryTileImagesMode();
  const mutation = useSetCategoryTileImagesMutation();
  const [error, setError] = useState("");
  const isOn = mode === "on";

  const handleToggle = async () => {
    setError("");
    try {
      await mutation.mutateAsync({ tileImagesEnabled: !isOn });
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : CATEGORY_TILE_IMAGES_UI.SAVE_FALLBACK,
      );
    }
  };

  return (
    <div className="category-tile-images-toggle">
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        className={[
          "category-tile-images-toggle__switch",
          isOn ? "category-tile-images-toggle__switch_on" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={mode === "pending" || mutation.isPending}
        onClick={handleToggle}
      >
        <span className="category-tile-images-toggle__label">
          {CATEGORY_TILE_IMAGES_UI.LABEL}
        </span>
        <span className="category-tile-images-toggle__track" aria-hidden="true">
          <span className="category-tile-images-toggle__thumb" />
        </span>
      </button>
      {error ? (
        <p className="category-tile-images-toggle__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
