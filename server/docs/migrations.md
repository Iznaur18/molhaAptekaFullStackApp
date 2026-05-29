# Миграции данных

Этот документ описывает, как в проекте запускаются миграции MongoDB.

## Базовые команды

- Dry-run всех миграций:
  - `npm run migrate:dry`
- Применить все неприменённые миграции:
  - `npm run migrate:apply`
- Локально запустить раннер (эквивалент dry-run):
  - `npm run migrate`
- Запустить только миграцию статусов позиций заказа:
  - `npm run migrate:order-items-status`
- Применить только миграцию статусов позиций заказа:
  - `npm run migrate:order-items-status -- --apply`

## Как это работает

- Раннер: `server/scripts/runMigrations.js`
- Реестр миграций: `server/scripts/migrations/index.js`
- Миграции выполняются по порядку массива `MIGRATIONS`.
- Информация о применённых миграциях хранится в коллекции `app_migrations`.
- Каждая миграция применяется ровно один раз (idempotency через `_id` миграции).

## Как добавить новую миграцию

1. Создай файл `server/scripts/migrations/<yyyyMMdd>-<name>.js`.
2. Экспортируй функцию `up({ db, isApply })`.
3. Верни summary-объект с метриками (например: `touchedOrders`, `touchedPaths`).
4. Добавь миграцию в `MIGRATIONS` в `server/scripts/migrations/index.js`.
5. Прогони:
   - `npm run migrate:dry`
   - `npm run migrate:apply`

## Текущие миграции

- `20260508-order-items-status`
  - Проставляет `items[].status` и аудит-поля (`deliveredAt`, `confirmedAt`, `deliveredBy`, `confirmedBy`) для старых заказов.
- `20260530-raffle-sales-confirmed-only`
  - Пересчитывает `salesProgress` активных розыгрышей (учитываются только позиции со статусом `confirmed`).
