# Аудит индексов Mongo: каталог, модерация, заказы

Дата: 2026-06. Проверка: `explain('executionStats')` + unit-тесты `tests/mongoIndexesExplain.test.js`.

## Тяжёлые запросы

| Эндпоинт | Запрос | Индекс (v1) |
|----------|--------|-------------|
| `GET /product` | `productModerationStatus=approved`, stock/availability, sort promotion+`createdAt` | `catalog_approved_list` |
| `GET /product?categoryId=` | + `productCategoryId` $in | `catalog_approved_category` |
| `GET /product` search | `$search` Atlas (если `ATLAS_SEARCH_ENABLED`) или regex fallback | Atlas Search index `product_catalog`; regex — COLLSCAN без индекса |
| `GET /product/my` | `productSeller` + optional moderation | `seller_moderation_created` |
| `GET /product/moderation/pending` | `pending`, sort `createdAt` asc | `moderation_status_created_asc` |
| `GET /order` | `userBuyerId`, sort `createdAt` desc | `userBuyerId_1_createdAt_-1` (было) |
| `GET /order/sales` | `items.productId` $in, sort `createdAt` | `items_productId_created` **новый** |
| `GET /order/all` | optional `status`, sort `createdAt` | `status_1_createdAt_-1` (было) |
| aggregate catalog | ~~`$lookup` orders → soldQuantity~~ | ✅ денорм `Product.soldQuantity`, индекс `catalog_approved_sold_quantity` |

## Было / стало

| Коллекция | До аудита | После |
|-----------|-----------|--------|
| `products` | `productSearchBlob`, `categoryPathIds`, field `productCategoryId` | +4 compound (см. `ProductModel.js`) |
| `orders` | `userBuyerId+createdAt`, `status+createdAt` | + `items_productId_created` |

## Explain в prod / staging

```bash
cd server
npm run explain:queries   # нужен MONGO_URI с данными
```

Ожидание: `IXSCAN: yes`, `COLLSCAN: no` для строк выше.

Миграция (идемпотентно):

```bash
npm run migrate:apply   # 20260611-catalog-moderation-order-indexes
```

## Ограничения (приняты v1)

1. **Поиск** — prod: Atlas Search (`server/docs/ATLAS-SEARCH.md`); dev/CI: regex fallback.
2. **Сортировка purchases** — sort по `soldQuantity` на Product (`catalog_approved_sold_quantity`). **views** — `uniqueViewerCount` на документе.
3. **`productIsAvailable: { $ne: false }`** — не идеальный предикат для индекса; compound всё равно сужает по `productModerationStatus`.
4. **In-memory sort** возможен, если sort не покрыт индексом полностью — мониторить `explain.executionStats.totalDocsExamined`.

## Мониторинг

- Atlas → Performance Advisor / Slow Queries
- Логировать `docsExamined / nReturned > 100` на `GET /product` и `GET /order/sales`

## Файлы

- `server/models/ProductModel.js`, `OrderModel.js`
- `server/utils/mongoExplain.js`
- `server/scripts/explainHeavyQueries.js`
- `server/scripts/migrations/20260611-catalog-moderation-order-indexes.js`
