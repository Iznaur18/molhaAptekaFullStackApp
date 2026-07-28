import { createContext, useContext } from "react";

/**
 * Page product-details dock host.
 * - `undefined` — not on product-details page
 * - `null` — page dock slot not mounted yet
 * - `HTMLElement` — portal target (flex sibling footer)
 *
 * @type {import('react').Context<HTMLElement | null | undefined>}
 */
export const ProductDetailsPageDockHostContext = createContext(undefined);

export function useProductDetailsPageDockHost() {
  return useContext(ProductDetailsPageDockHostContext);
}
