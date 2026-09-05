/**
 * @typedef {object} SellerFulfillmentPoint
 * @property {string} id
 * @property {string} label
 * @property {string} address
 * @property {number | null} lat
 * @property {number | null} lon
 * @property {boolean} isDefault
 */

/**
 * @typedef {object} SellerCommerceDefaults
 * @property {boolean} fulfillmentConfigured настройки заведены; иначе товар обязан спросить адрес сам
 * @property {boolean} pickupEnabled
 * @property {string} deliveryCarrier пусто — доставки нет, только самовывоз
 * @property {SellerFulfillmentPoint[]} pickupLocations
 * @property {string | null} regionCode
 * @property {string[]} paymentMethods
 * @property {number | null} followingProductCount сколько товаров сейчас следуют профилю
 * @property {number} [syncedProductCount] сколько задело последнее сохранение
 */

export {};
