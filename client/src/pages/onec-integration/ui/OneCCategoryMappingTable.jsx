import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { fetchProductCategorySearch } from "../../../entities/product-category-tree/api/fetchProductCategorySearch.js";
import {
  fetchOneCCategoryMappings,
  putOneCCategoryMappings,
} from "../../../entities/onec/api/onecApi.js";
import { ONEC_INTEGRATION_PAGE_UI as UI } from "../model/onecIntegrationCopy.js";

const MAPPINGS_KEY = ["onec", "category-mappings"];

/**
 * Поиск по листьям дерева, а не выпадающий список: у маркетплейса сотни
 * конечных подкатегорий, и `<select>` со всеми ними непригоден.
 *
 * @param {{
 *   row: Record<string, any>;
 *   draft: string | null;
 *   onPick: (categoryId: string | null, label: string) => void;
 *   disabled: boolean;
 * }} props
 */
function CategoryPicker({ row, draft, onPick, disabled }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const searchQuery = useQuery({
    queryKey: ["product-category-search", query],
    enabled: open && query.trim().length >= 2,
    queryFn: () => fetchProductCategorySearch({ query }),
  });

  const currentLabel = draft === null ? UI.MAPPING_NOT_SET : draft;

  return (
    <div className="onec-map__picker">
      <button
        type="button"
        className="onec-map__current"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
      >
        {currentLabel}
      </button>

      {open ? (
        <div className="onec-map__dropdown">
          <input
            type="search"
            className="onec-map__search"
            value={query}
            placeholder={UI.MAPPING_SEARCH_PLACEHOLDER}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
          <button
            type="button"
            className="onec-map__option onec-map__option_clear"
            onClick={() => {
              onPick(null, UI.MAPPING_NOT_SET);
              setOpen(false);
            }}
          >
            {UI.MAPPING_CLEAR}
          </button>
          {searchQuery.isLoading ? (
            <p className="onec-page__state">{UI.LOADING}</p>
          ) : (
            (searchQuery.data ?? []).map((category) => {
              const label = [...(category.pathLabelRu ?? []), category.labelRu]
                .filter(Boolean)
                .join(" › ");
              return (
                <button
                  key={category.id}
                  type="button"
                  className="onec-map__option"
                  onClick={() => {
                    onPick(String(category.id), label);
                    setOpen(false);
                  }}
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
      ) : null}

      <span className="onec-map__group-path">{(row.pathNames ?? []).join(" › ")}</span>
    </div>
  );
}

/**
 * @param {{ onError: (message: string) => void; onSuccess: (message: string) => void }} props
 */
export function OneCCategoryMappingTable({ onError, onSuccess }) {
  const queryClient = useQueryClient();
  /** @type {[Record<string, { categoryId: string | null; label: string }>, Function]} */
  const [drafts, setDrafts] = useState({});

  const mappingsQuery = useQuery({
    queryKey: MAPPINGS_KEY,
    queryFn: fetchOneCCategoryMappings,
  });

  const mappings = mappingsQuery.data;
  // `?? []` прямо в теле создаёт новый массив на каждый рендер и сбрасывает
  // мемоизацию ниже — фиксируем ссылку.
  const rows = useMemo(() => mappings ?? [], [mappings]);

  const unmappedCount = useMemo(
    () =>
      rows.filter((row) => {
        const draft = drafts[row.externalId];
        return draft ? draft.categoryId === null : !row.categoryId;
      }).length,
    [rows, drafts],
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      putOneCCategoryMappings(
        Object.entries(drafts).map(([externalId, value]) => ({
          externalId,
          categoryId: value.categoryId,
        })),
      ),
    onSuccess: async (result) => {
      setDrafts({});
      onSuccess(result.message ?? "Сохранено");
      await queryClient.invalidateQueries({ queryKey: MAPPINGS_KEY });
    },
    onError: (error) => onError(error.message),
  });

  if (mappingsQuery.isLoading) {
    return <p className="onec-page__state">{UI.LOADING}</p>;
  }

  if (rows.length === 0) {
    return <p className="onec-page__state">{UI.MAPPING_EMPTY}</p>;
  }

  return (
    <div className="onec-map">
      <p className="onec-page__hint">{UI.MAPPING_HINT}</p>
      <p className="onec-page__status">{UI.MAPPING_UNMAPPED_COUNT(unmappedCount)}</p>

      <ul className="onec-map__list">
        {rows.map((row) => {
          const draft = drafts[row.externalId];
          return (
            <li key={row.externalId} className="onec-map__row">
              <div className="onec-map__group">
                <span className="onec-map__group-name">
                  {row.name || row.externalId}
                </span>
                <small>{UI.MAPPING_PRODUCTS(row.productCount)}</small>
              </div>
              <CategoryPicker
                row={row}
                draft={draft ? draft.label : row.categoryLabel || null}
                disabled={saveMutation.isPending}
                onPick={(categoryId, pickedLabel) =>
                  setDrafts((current) => ({
                    ...current,
                    [row.externalId]: { categoryId, label: pickedLabel },
                  }))
                }
              />
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="onec-page__btn"
        disabled={Object.keys(drafts).length === 0 || saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
      >
        {saveMutation.isPending ? UI.MAPPING_SAVE_PENDING : UI.MAPPING_SAVE}
      </button>

      {/* Кнопка выключена, пока ничего не выбрано. Без этой строки нажатие
          выглядит как «сохранил, но не сработало» — открыть список мало,
          нужно кликнуть по варианту. */}
      {Object.keys(drafts).length === 0 ? (
        <p className="onec-page__hint">{UI.MAPPING_NOTHING_PICKED}</p>
      ) : (
        <p className="onec-page__ok">
          {UI.MAPPING_PENDING_COUNT(Object.keys(drafts).length)}
        </p>
      )}
    </div>
  );
}
