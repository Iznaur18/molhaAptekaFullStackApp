import { CuratedCategoryListCarousel } from "./CuratedCategoryListCarousel.jsx";

/**
 * @param {{
 *   lists: import('../model/types.js').HomeCuratedCategoryListFromApi[];
 *   onOpenCategory: (category: import('../model/types.js').HomeCuratedCategoryFromApi) => void;
 * }} props
 */
export function HomeCuratedCategoryListsSection({ lists, onOpenCategory }) {
  if (lists.length === 0) {
    return null;
  }

  return (
    <>
      {lists.map((list) => (
        <CuratedCategoryListCarousel
          key={list._id}
          title={list.title}
          categories={list.categories}
          onOpenCategory={onOpenCategory}
        />
      ))}
    </>
  );
}
