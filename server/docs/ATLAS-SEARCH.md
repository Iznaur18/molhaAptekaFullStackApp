# Atlas Search — каталог `GET /product?search=`

Дата: 2026-06. Заменяет regex COLLSCAN на `$search` при `ATLAS_SEARCH_ENABLED=true`.

## Что меняется

| Режим | Когда | Pipeline |
|-------|-------|----------|
| `atlas` | `ATLAS_SEARCH_ENABLED=true` + индекс в Atlas | `$search` → `$match` baseQuery → sort |
| `regex` | dev / fallback | `$match` + `$or` regex (как раньше) |

Синонимы категорий (`resolveProductSearchIntent`) сохраняются: slug/id попадают в `compound.should` `$search`.

`/health` → `catalogSearch: atlas|regex` (конфиг, не runtime fallback).

## 1. Создать Search Index в Atlas

1. Atlas → Cluster → **Search** → Create Search Index.
2. JSON Editor → вставить `server/atlas-search/product-catalog.index.json`.
3. Заменить `REPLACE_WITH_YOUR_DB_NAME` на имя БД из `MONGO_URI`.
4. Имя индекса: **`product_catalog`** (константа `PRODUCT_ATLAS_SEARCH_INDEX_NAME`).
5. Дождаться статуса **Active**.

CLI (опционально):

```bash
atlas clusters search indexes create \
  --clusterName YOUR_CLUSTER \
  --file server/atlas-search/product-catalog.index.json
```

## 2. Env на VPS

```env
ATLAS_SEARCH_ENABLED=true
```

Без флага — regex (локальный `mongod`, CI, e2e).

При ошибке `$search` (индекс не готов, не Atlas) API **автоматически** откатывается на regex и пишет warn в лог.

## 3. Smoke

```bash
curl -sS "https://ДОМЕН/health" | jq '.catalogSearch'   # "atlas"
curl -sS "https://ДОМЕН/product?search=авто&limit=5" | jq '.data.products | length'
```

Atlas → Performance Advisor: `GET /product` с `search` не должен показывать COLLSCAN по `productSearchBlob`.

## 4. Scope v1

- Только публичный **`GET /product`**.
- `GET /product/my`, raffle — regex (без изменений).
- Analyzer: `lucene.standard` (без RU stemmer).
- Поля: `productName` (boost ×3), `productSearchBlob`, `productCategory`, `productCategoryId`.

## Файлы

- `server/utils/buildProductAtlasSearchStage.js`
- `server/utils/productCatalogAtlasSearch.js`
- `server/utils/findCatalogProductsPage.js`
- `server/constants/productAtlasSearchConstants.js`
