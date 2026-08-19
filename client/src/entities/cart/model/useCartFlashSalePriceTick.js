import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  isProductFlashSaleActive,
  resolveProductFlashSaleEndsAtMs,
} from "../../product/lib/isProductFlashSaleActive.js";
import { invalidateCatalogProducts } from "../../product/lib/catalogProductsQueryCache.js";

/**
 * Тик раз в секунду, пока в корзине есть товар с активной горящей скидкой;
 * по истечении — invalidate каталога и all-products для refetch.
 *
 * @param {import('./types.js').CartItemsByProductId} cartItems
 * @param {import('../../product/model/types.js').ProductFromApi[]} products
 */
export function useCartFlashSalePriceTick(cartItems, products) {
  const queryClient = useQueryClient();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const didInvalidateAfterExpiryRef = useRef(false);

  const cartHasTimedFlashSale = useMemo(() => {
    const productById = new Map(products.map((row) => [String(row._id), row]));
    return Object.keys(cartItems).some((productId) => {
      const product = productById.get(productId);
      return (
        product?.productFlashSaleEnabled === true &&
        resolveProductFlashSaleEndsAtMs(product) != null
      );
    });
  }, [cartItems, products]);

  useEffect(() => {
    didInvalidateAfterExpiryRef.current = false;
  }, [cartHasTimedFlashSale, cartItems, products]);

  useEffect(() => {
    if (!cartHasTimedFlashSale) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cartHasTimedFlashSale]);

  useEffect(() => {
    if (!cartHasTimedFlashSale || didInvalidateAfterExpiryRef.current) {
      return;
    }

    const productById = new Map(products.map((row) => [String(row._id), row]));
    const hasExpiredLine = Object.keys(cartItems).some((productId) => {
      const product = productById.get(productId);
      if (product?.productFlashSaleEnabled !== true) {
        return false;
      }
      return !isProductFlashSaleActive(product, nowMs);
    });

    if (!hasExpiredLine) {
      return;
    }

    didInvalidateAfterExpiryRef.current = true;
    void invalidateCatalogProducts(queryClient);
  }, [cartHasTimedFlashSale, cartItems, nowMs, products, queryClient]);

  return nowMs;
}
