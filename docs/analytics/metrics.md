# Metric Catalog (v1.0)

Источник истины для admin KPI. Версия `definitionsVersion` в API: **`1.0`**.

Часовой пояс периода: **UTC**. Счётчики UI (`soldQuantity`, `uniqueViewerCount`) — производные; для отчётов используйте агрегаты ниже.

## Периоды

| Ключ | Диапазон |
|------|----------|
| `today` | с 00:00:00.000 UTC текущих суток |
| `7d` | последние 7×24 часа от `asOf` |
| `30d` | последние 30×24 часа от `asOf` |
| `all` | без нижней границы |

## KPI

| ID | Имя | Формула | Коллекция |
|----|-----|---------|-----------|
| `newUsers` | Новые пользователи | `count(User)` где `createdAt ∈ period` | User |
| `publicationsCreated` | Публикации (созданы) | `count(Product)` где `createdAt ∈ period` | Product |
| `ordersCreated` | Заказы созданы | `count(Order)` где `createdAt ∈ period` | Order |
| `soldUnits` | Проданные шт. | `sum(items.quantity)` где `items.status ∈ {confirmed, delivered}` и дата продажи ∈ period | Order |
| `gmvRub` | GMV (₽) | `sum(items.quantity × items.unitPriceAtOrder)` при тех же фильтрах, что `soldUnits` | Order |
| `productViewsUnique` | Уникальные просмотры | `count(ProductView)` где `createdAt ∈ period` | ProductView |

**Дата продажи позиции:** `coalesce(items.deliveredAt, items.confirmedAt, Order.createdAt)`.

**Статусы продажи** — `PRODUCT_SOLD_QUANTITY_COUNT_STATUSES` (`confirmed`, `delivered`). `pending` / `shipped` / `cancelled` не входят в GMV и soldUnits.

## Integrity (сверка)

| Проверка | Primary | Denorm | OK если |
|----------|---------|--------|---------|
| `soldQuantity` | aggregate orders | `Product.soldQuantity` | equal per product |
| `uniqueViewerCount` | `count(ProductView)` by product | `Product.uniqueViewerCount` | equal per product |

Расхождения пишутся в лог (`analytics.reconciliation`) и в последний snapshot для `/admin-analytics`.

## Экспорт

CSV строится из тех же агрегатов, что overview. В ответе: `csv`, `sha256` (SHA-256 hex от UTF-8 тела CSV), `asOf`, `definitionsVersion`.
