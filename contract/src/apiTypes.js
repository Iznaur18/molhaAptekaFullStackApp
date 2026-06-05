/**
 * JSDoc-типы из Zod-схем (`z.infer`). Импорт: `@molha/api-contract/types`.
 * Нужен `checkJs` в jsconfig клиента/контракта.
 *
 * @typedef {import('zod').infer<typeof import('./pagination.js').paginationSchema>} Pagination
 * @typedef {import('zod').infer<typeof import('./productFromApi.js').productFromApiSchema>} ProductFromApiContract
 * @typedef {import('zod').infer<typeof import('./productWrite.js').createProductBodySchema>} CreateProductBodyContract
 * @typedef {import('zod').infer<typeof import('./productWrite.js').patchMyProductBodySchema>} PatchMyProductBodyContract
 * @typedef {import('zod').infer<typeof import('./productWrite.js').productWriteDataSchema>} ProductWriteDataContract
 * @typedef {import('zod').infer<typeof import('./productCatalog.js').catalogProductsQuerySchema>} CatalogProductsQueryContract
 * @typedef {import('zod').infer<typeof import('./productCatalog.js').catalogProductsPageDataSchema>} CatalogProductsPageDataContract
 * @typedef {import('zod').infer<typeof import('./userSellerProducts.js').userSellerProductsQuerySchema>} UserSellerProductsQueryContract
 * @typedef {import('zod').infer<typeof import('./userSellerProducts.js').userSellerProductsPageDataSchema>} UserSellerProductsPageDataContract
 * @typedef {import('zod').infer<typeof import('./cart.js').replaceCartBodySchema>} ReplaceCartBodyContract
 * @typedef {import('zod').infer<typeof import('./cart.js').replaceCartDataSchema>} ReplaceCartDataContract
 * @typedef {import('zod').infer<typeof import('./order.js').createOrderBodySchema>} CreateOrderBodyContract
 * @typedef {import('zod').infer<typeof import('./order.js').createOrderDataSchema>} CreateOrderDataContract
 * @typedef {import('zod').infer<typeof import('./order.js').orderFromApiSchema>} OrderFromApiContract
 * @typedef {import('zod').infer<typeof import('./authMe.js').userPublicProfileSchema>} UserPublicProfileContract
 * @typedef {import('zod').infer<typeof import('./authMe.js').inAppNotificationSchema>} InAppNotificationContract
 * @typedef {import('zod').infer<typeof import('./authMe.js').authMeDataSchema>} AuthMeDataContract
 */

export {};
