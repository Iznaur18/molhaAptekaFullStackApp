/**
 * @typedef {import('./productConstants.js').PRODUCT_CATEGORIES[number]} ProductCategory
 */

/**
 * Продавец после `populate('productSeller', ...)` в `getProducts.js`.
 * В карточке гостя показываем только `userName`; остальные поля могут прийти с API.
 *
 * @typedef {object} ProductSellerPopulated
 * @property {string} _id
 * @property {string} [userName]
 */

/**
 * Товар из `GET /product` (lean + populate).
 *
 * @typedef {object} ProductFromApi
 * @property {string} _id
 * @property {string} productName
 * @property {string} [productDescription]
 * @property {string[]} [productImageUrls]
 * @property {string} [productImageUrl]
 * @property {number} productPrice
 * @property {ProductSellerPopulated|string} productSeller
 * @property {ProductCategory} productCategory
 * @property {boolean} productIsAvailable
 * @property {boolean} [hasOpenSales] — `GET /product/my`: незавершённые продажи (нет confirmed/cancelled по всем позициям)
 * @property {number} [uniqueViewerCount]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
