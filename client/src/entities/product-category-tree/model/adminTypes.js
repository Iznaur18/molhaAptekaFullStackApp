/**
 * @typedef {Object} ProductCategoryAdminRow
 * @property {string} _id
 * @property {string} slug
 * @property {string} labelRu
 * @property {string | null} parentId
 * @property {number} depth
 * @property {string[]} pathSlugs
 * @property {string[]} pathLabelRu
 * @property {string[]} searchKeywords
 * @property {string[]} [defaultCharacteristicKeys]
 * @property {boolean} isLeaf
 * @property {string | null} [legacyProductCategory]
 * @property {number} sortOrder
 * @property {"goods" | "viewing" | "service" | null} [dealType] свой тип сделки; `null` — как у родителя
 * @property {"goods" | "viewing" | "service"} [effectiveDealType] итог с учётом наследования
 * @property {string | null} [storefrontLabel] подпись плитки, если её меняли на витрине
 */

/**
 * @typedef {Object} ProductCategoryAdminWritePayload
 * @property {string} slug
 * @property {string} labelRu
 * @property {string | null} [parentId]
 * @property {boolean} [isLeaf]
 * @property {string | null} [legacyProductCategory]
 * @property {string[]} [searchKeywords]
 * @property {string[]} [defaultCharacteristicKeys]
 * @property {"goods" | "viewing" | "service" | null} [dealType]
 * @property {number} [sortOrder]
 */

export {};
