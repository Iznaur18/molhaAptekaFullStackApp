import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  isProductFlashSaleActive,
  resolveProductFlashSaleEndsAtMs,
} from "@/entities/product/lib/isProductFlashSaleActive";
import { catalogQueryKeys } from "@/shared/api";

type CartItemsByProductId = Record<string, unknown>;

/**
 * Тикает раз в секунду, пока в корзине есть товар с активной горящей скидкой.
 * Как только скидка истекла — один раз инвалидируем каталог, чтобы цена
 * вернулась к базовой и строка пересчиталась.
 *
 * Порт `client/src/entities/cart/model/useCartFlashSalePriceTick.js`.
 *
 * @returns текущее время в мс — вызывающая сторона пересчитывает цены по нему.
 */
export const useCartFlashSalePriceTick = (
  cartItems: CartItemsByProductId,
  products: { _id?: unknown }[],
): number => {
  const queryClient = useQueryClient();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const didInvalidateAfterExpiryRef = useRef(false);

  const cartHasTimedFlashSale = useMemo(() => {
    const productById = new Map(products.map((row) => [String(row._id), row]));
    return Object.keys(cartItems).some((productId) => {
      const product = productById.get(productId) as Record<string, unknown> | undefined;
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
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [cartHasTimedFlashSale]);

  useEffect(() => {
    if (!cartHasTimedFlashSale || didInvalidateAfterExpiryRef.current) {
      return;
    }

    const productById = new Map(products.map((row) => [String(row._id), row]));
    const hasExpiredLine = Object.keys(cartItems).some((productId) => {
      const product = productById.get(productId) as Record<string, unknown> | undefined;
      if (product?.productFlashSaleEnabled !== true) {
        return false;
      }
      return !isProductFlashSaleActive(product, nowMs);
    });

    if (!hasExpiredLine) {
      return;
    }

    didInvalidateAfterExpiryRef.current = true;
    void queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
  }, [cartHasTimedFlashSale, cartItems, nowMs, products, queryClient]);

  return nowMs;
};
