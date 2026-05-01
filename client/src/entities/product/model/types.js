/**
 * Категории товаров: ограниченный набор вариантов.
 * @typedef {'electronics'|'clothing'|'food'} ProductCategory
 */

/**
 * Продавец в карточке товара: в шаблоне — полный `UserPublicProfile`;
 * с `GET /product` сейчас приходит подмножество полей (остальные можно догрузить по `GET /user/:id`).
 *
 * @typedef {import('../../user/model/types.js').UserPublicProfile} ProductSellerPopulated
 */

/**
 * Описание одного продукта в списке (`GET /product` с lean+populate).
 * @typedef {object} ProductListItem
 * @property {string} _id
 * @property {string} productName
 * @property {string} [productDescription]
 * @property {number} productPrice
 * @property {ProductSellerPopulated} productSeller
 * @property {ProductCategory} productCategory
 * @property {boolean} productIsAvailable
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
