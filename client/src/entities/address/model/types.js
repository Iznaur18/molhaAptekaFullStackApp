/**
 * @typedef {object} RuDeliveryAddressValue
 * @property {string} line
 * @property {string} flat
 * @property {string} [fiasId]
 * @property {{ lat: number; lon: number } | null} [geo]
 * @property {boolean} selectedFromSuggest
 */

/**
 * @typedef {object} AddressSuggestionDto
 * @property {string} value
 * @property {string} unrestrictedValue
 * @property {Record<string, unknown>} data
 */
