import { CART_STORAGE_KEY } from "../../order/model/constants.js";

const isPlainObject = (value) =>
  value != null && typeof value === "object" && !Array.isArray(value);

const sanitizeStoredItems = (raw) => {
  if (!isPlainObject(raw)) return {};
  return Object.entries(raw).reduce((acc, [productId, quantity]) => {
    const normalizedQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
    if (normalizedQuantity > 0) acc[productId] = normalizedQuantity;
    return acc;
  }, /** @type {import('./types.js').CartItemsByProductId} */ ({}));
};

/** @returns {import('./types.js').CartItemsByProductId} */
export const readCartFromStorage = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};
    return sanitizeStoredItems(JSON.parse(raw));
  } catch {
    return {};
  }
};

/** @param {import('./types.js').CartItemsByProductId} items */
export const writeCartToStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage недоступен — корзина живёт только в памяти
  }
};
