# Интеграция 1С (зафиксировано)

**Статус:** оба канала реализованы. Живая УТ 11 подключается по
[инструкции CommerceML](./onec-commerceml-exchange.md) — это основной путь.

## Два канала

| | `commerceml` (основной) | `pull` |
| --- | --- | --- |
| Кто инициирует | **1С сама** шлёт на сайт | **Сайт** ходит в 1С раз в 5 минут |
| Что нужно от продавца | Галочки в узле «Обмен с сайтом» | HTTP-сервис в конфигурации + публикация наружу |
| Доработка 1С | **Нет** | Да, работа программиста 1С |
| Формат | CommerceML 2.x (XML в ZIP) | JSON по нашему контракту |
| Эндпоинт | `GET\|POST /onec/exchange` | сайт → `<baseUrl>/v1/...` |
| Документ | [onec-commerceml-exchange.md](./onec-commerceml-exchange.md) | [onec-http-contract.md](./onec-http-contract.md) |

Канал выбирается продавцом в кабинете (**Профиль → 1С**) и хранится в
`User.oneCIntegration.channel`. Модели товара, журнал обмена и очередь выгрузки
заказов у каналов общие.

## Общие правила

1. Источник истины по товару, цене и остатку — **1С**. При включённой интеграции
   ручное создание товаров на сайте запрещено
   (`assertSellerManualProductCreateAllowed`).
2. Новые карточки приходят со статусом **`pending`** (на модерацию). Цены и
   остатки у уже одобренных обновляются сразу, без повторной проверки.
3. Заказы уходят в 1С как «Заказ покупателя», идемпотентно по паре
   `orderId + sellerId` (`OneCOrderPush`).
4. Обратный sync статусов заказа — **не в v1**.

## Архитектура

| Слой | Решение |
| --- | --- |
| Приём CommerceML | `onecExchangeRouter` смонтирован **до** `express.json` и CSRF-гейта |
| Разбор XML | Потоковый (`sax`), пачками по 200 позиций — каталог не держится в памяти |
| Очередь | BullMQ `processOneCCommerceMlImport`; без Redis — inline + докатка из cron |
| Секреты | `pull`: `apiKeySealed` AES-GCM. `commerceml`: bcrypt-хэш пароля обмена |
| Сессии обмена | `OneCExchangeSession` в Mongo с TTL (Redis опционален, обмен — нет) |
| Картинки | S3 через общий upload-пайплайн, дедупликация по MD5 исходника |
| UI | Web-кабинет `/profile/onec-integration` |

## API сайта

| Метод | Путь | Назначение | Канал |
| --- | --- | --- | --- |
| GET/POST | `/onec/exchange` | Приём CommerceML от 1С | commerceml |
| POST | `/onec/exchange-credentials` | Выдать логин/пароль обмена | commerceml |
| GET | `/onec/category-mappings` | Дерево групп 1С и сопоставление | commerceml |
| PUT | `/onec/category-mappings` | Сохранить сопоставление + перевесить товары | commerceml |
| GET | `/onec/import-jobs` | Журнал приёмки файлов | commerceml |
| GET | `/onec/settings` | Настройки (секреты замаскированы) | оба |
| PUT | `/onec/settings` | Канал, доступы, фильтры цен и складов | оба |
| DELETE | `/onec/settings` | Отключить | оба |
| POST | `/onec/test` | Проверка `/v1/health` | pull |
| POST | `/onec/sync` | Ручной полный обмен | pull |
| GET | `/onec/logs` | Журнал обмена | оба |

## Модели

- `User.oneCIntegration` — канал, доступы обоих каналов, фильтры цен и складов
- `Product.product1cGuid` (до 128 символов — `Ид#ИдХарактеристики`),
  `product1cGroupId`, `product1cSeenAt`, `product1cImageHashes`,
  `productArticle`, `productFromOneC`
- `OneCExchangeSession`, `OneCImportJob`, `OneCCategoryMapping`
- `OneCExchangeLog`, `OneCOrderPush`

## Ограничения

- Вариаций товара в модели нет: торговое предложение с характеристикой
  становится **отдельной карточкой** с `Ид = ИдТовара#ИдХарактеристики`.
- Пока группа 1С не сопоставлена с категорией сайта, её товары не выходят на
  витрину — по `productCategoryId` их не найдёт ни один фильтр каталога.
- Mobile UI кабинета 1С — не сделан.

## Локальный тест

CommerceML, без 1С:

```bash
npm --prefix server run onec:commerceml-smoke -- --login <логин> --password <пароль>
```

Канал `pull`, mock-сервис 1С:

```bash
npm --prefix server run onec:mock
# URL: http://127.0.0.1:3091  ключ: mock-onec-key
```
