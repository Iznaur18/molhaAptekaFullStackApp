# Интеграция 1С v1 (зафиксировано)

**Статус:** код каркаса реализован (сайт + mock). Живая УТ 11 — по [инструкции](./onec-ut11-setup-guide.md), [чеклисту программиста 1С](./onec-ut11-programmer-checklist.md) и [контракту](./onec-http-contract.md).

## Что происходит

1. Продавец в кабинете (**Профиль → 1С**) указывает URL HTTP-сервиса своей 1С и API-ключ.
2. Раз в **5 минут** (и по кнопке «Обменять сейчас») сайт:
   - забирает **номенклатуру / цены / остатки** → обновляет товары продавца;
   - отправляет новые заказы клиентов в 1С как **customerOrder** («Заказ покупателя» в УТ).
3. Источник истины по товару и остатку — **1С**. У включённой 1С ручное создание товаров на сайте запрещено.
4. Статусы из 1С обратно на сайт — **не в v1**.

## Архитектура

| Слой | Решение |
| --- | --- |
| Контракт | Универсальный HTTP JSON (`/v1/...`), не привязан к версии УТ |
| Акторы | Per-seller (у каждого продавца своя 1С) |
| Пилот | Типовая УТ 11 + mock `npm run onec:mock` |
| Секреты | `apiKeySealed` AES-GCM (`ONEC_CREDENTIALS_KEK` или derive из `JWT_SECRET`) |
| Очередь | BullMQ job `processOneCSyncCronTasks` / fallback `setInterval` |
| UI | Web кабинет продавца `/profile/onec-integration` |

## API сайта

| Метод | Путь | Назначение |
| --- | --- | --- |
| GET | `/onec/settings` | Настройки (ключ замаскирован) |
| PUT | `/onec/settings` | Сохранить URL / ключ / enabled |
| DELETE | `/onec/settings` | Отключить |
| POST | `/onec/test` | Проверка `/v1/health` |
| POST | `/onec/sync` | Ручной полный обмен |
| GET | `/onec/logs` | Журнал обмена |

## Модели

- `User.oneCIntegration`
- `Product.product1cGuid`, `productArticle`, `productFromOneC`
- `OneCExchangeLog`, `OneCOrderPush`

## Не в v1

- Обратный sync статусов заказа
- Готовые расширения под все конфигурации 1С (только контракт + гайд УТ 11)
- Mobile UI кабинета 1С

## Локальный тест

```bash
cd server && npm run onec:mock
# URL: http://127.0.0.1:3091  ключ: mock-onec-key
```

В кабинете сохранить настройки → «Проверить соединение» → «Обменять сейчас».
