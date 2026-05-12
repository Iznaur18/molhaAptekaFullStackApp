/**
 * Состояние корзины: словарь productId → количество.
 *
 * @typedef {Object<string, number>} CartItemsByProductId
 */

/**
 * @typedef {object} CartContextValue
 * @property {CartItemsByProductId} items
 * @property {(productId: string, quantity?: number) => void} addItem
 * @property {(productId: string, quantity: number) => void} setItemQuantity
 * @property {(productId: string) => void} removeItem
 * @property {() => void} clearCart
 * @property {(payload: CartItemsByProductId) => void} hydrateCart
 * @property {() => Promise<void>} flushRemoteCart
 * @property {number} totalCount
 */

export {};
