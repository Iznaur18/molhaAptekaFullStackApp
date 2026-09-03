# Контракт HTTP JSON 1С ↔ Izibuy

Единый контракт для **любой** конфигурации 1С. Сайт не знает «УТ 11 / ERP» — только эти пути и поля.

**Auth:** заголовок `Authorization: Bearer <apiKey>`  
**Base URL:** без завершающего `/` (пример: `https://1c.example.ru/hs/izibuy`)

---

## `GET /v1/health`

Проверка связи.

**200**
```json
{ "ok": true }
```

---

## `GET /v1/nomenclature`

Список номенклатуры с ценой и остатком.

**200**
```json
{
  "items": [
    {
      "guid": "а1б2в3…",
      "article": "ASP-500",
      "name": "Аспирин 500 мг",
      "price": 120.5,
      "stock": 25,
      "isActive": true,
      "description": "опционально",
      "imageUrls": ["https://..."]
    }
  ]
}
```

| Поле | Обязательно | Примечание |
| --- | --- | --- |
| `guid` | да | Стабильный ID в 1С (строка ≤ 64) |
| `name` | да | |
| `price` | да | ≥ 0 |
| `stock` | да | целое 0…9999 |
| `article` | нет | |
| `isActive` | нет | default true |
| `description` | нет | |
| `imageUrls` | нет | массив URL |

Товары, которые раньше были на сайте из 1С, но **пропали** из ответа — снимаются с витрины (`isAvailable=false`, stock=0).

Позиция, у которой одновременно пустой `imageUrls` **и** `stock` = 0, на сайт
не заводится, а заведённая раньше — удаляется вместе со связями (кроме товаров
с незакрытыми заказами: они только снимаются с витрины). Правило общее с каналом
CommerceML, см. [onec-commerceml-exchange.md](./onec-commerceml-exchange.md).
Пустой `imageUrls` при этом означает «данных о картинках нет»: уже залитые
картинки карточки не теряются и считаются наравне с присланными.

---

## `POST /v1/customer-orders`

Создать документ заказа покупателя (в УТ — «Заказ покупателя»).

**Body**
```json
{
  "externalId": "<orderMongoId>:<sellerId>",
  "orderId": "<orderMongoId>",
  "createdAt": "2026-08-03T21:00:00.000Z",
  "fulfillmentMethod": "pickup",
  "deliveryAddress": "…",
  "deliveryAddressFlat": "",
  "items": [
    {
      "guid": "а1б2в3…",
      "article": "ASP-500",
      "name": "Аспирин 500 мг",
      "quantity": 2,
      "price": 120.5
    }
  ],
  "totalAmount": 241
}
```

**Идемпотентность:** повтор с тем же `externalId` не должен создавать второй документ — вернуть уже созданный `externalId` 1С.

**201/200**
```json
{ "externalId": "номер-или-guid-документа-в-1С" }
```

---

## Ошибки

Любой 4xx/5xx с JSON по возможности:

```json
{ "message": "понятный текст для лога на сайте" }
```
