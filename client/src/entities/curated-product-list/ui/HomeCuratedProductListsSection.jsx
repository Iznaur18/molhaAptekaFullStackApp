import { CuratedProductListCarousel } from "./CuratedProductListCarousel.jsx";

/**
 * @param {{
 *   lists: import('../model/types.js').HomeCuratedProductListFromApi[];
 *   onOpenProduct: (product: import('../../product/model/types.js').ProductFromApi) => void;
 * }} props
 */
export function HomeCuratedProductListsSection({ lists, onOpenProduct }) {
  if (lists.length === 0) {
    return null;
  }

  return (
    <>
      {lists.map((list) => (
        <CuratedProductListCarousel
          key={list._id}
          title={list.title}
          products={list.products}
          onOpenProduct={onOpenProduct}
        />
      ))}
    </>
  );
}
