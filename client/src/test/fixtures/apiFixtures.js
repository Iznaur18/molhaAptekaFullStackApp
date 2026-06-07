export const TEST_MONGO_ID = "507f1f77bcf86cd799439011";
export const TEST_MONGO_ID_2 = "507f1f77bcf86cd799439012";

/** @returns {import('@molha/api-contract/types').CreateOrderDataContract['order']} */
export function buildTestOrder(overrides = {}) {
  return {
    _id: TEST_MONGO_ID,
    items: [{ productId: TEST_MONGO_ID_2, quantity: 1 }],
    totalAmount: 199,
    deliveryAddress: "г Москва, ул Тестовая, д 1",
    paymentMethod: "cardPrepaid",
    status: "pending",
    ...overrides,
  };
}

/** @returns {import('../../entities/address/model/types.js').AddressSuggestionDto[]} */
export function buildAddressSuggestions() {
  return [
    {
      value: "г Москва, ул Ленина, д 1",
      unrestrictedValue: "г Москва, ул Ленина, д 1",
      data: {
        house_fias_id: "fias-house-1",
        geo_lat: "55.75",
        geo_lon: "37.62",
      },
    },
  ];
}

/** @returns {import('@molha/api-contract/types').CatalogProductsPageDataContract} */
export function buildCatalogProductsPage(overrides = {}) {
  return {
    products: [{ _id: TEST_MONGO_ID, productName: "Тестовый товар" }],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
    ...overrides,
  };
}
