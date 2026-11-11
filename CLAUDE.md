# CLAUDE.md — рабочие правила Gitorg

Продуктовые принципы и приоритеты — в `AGENTS.md` (грузится вместе с этим файлом).
Здесь — **как устроен код** и как его менять, не сбивая архитектуру.
Проверено по коду 24.09.2026. Если правило расходится с кодом — сначала перепроверь код.

## Карта

Modular monolith. Один Express API + одна MongoDB (replica set `rs0`, нужен для транзакций).

| Путь                     | Что                                                   | Язык           |
| ------------------------ | ----------------------------------------------------- | -------------- |
| `server/`                | Express API, Mongoose, jobs, интеграции               | JS (ESM)       |
| `contract/`              | `@molha/api-contract`: Zod-схемы, бизнес-константы    | JS (ESM)       |
| `packages/shared-lib`    | `@izibuy/shared-lib`: pure-хелперы для всех           | TS             |
| `packages/shared-api`    | `@izibuy/shared-api`: parse/refresh/multipart         | TS             |
| `packages/design-tokens` | `@izibuy/design-tokens`: токены web↔mobile            | TS             |
| `client/`                | Web SPA: React 19, Vite, React Router, TanStack Query | JSX, `checkJs` |
| `mobile/`                | Expo SDK 54 / Expo Router, RN                         | TS             |

Доки: `docs/ARCHITECTURE.md`, `docs/PROJECT_MAP.md`, `docs/DATA_MODEL.md`, `docs/API.md`, ADR в `docs/decisions/`.

## Backend: вертикальный срез (эталон — seller-shelf)

```
routes/xRouter.js          createAsyncRouter(); checkAuthMW → validation[] → controller
validations/x/xValidation.js   массивы [validateParamsZod(schema), validateBodyZod(schema)]
                               схемы ИМПОРТИРУЮТСЯ из @molha/api-contract, не пишутся тут
controllers/X/xControllers.js  тонкие: достают req.userId/params/body → сервис → successRes(res, data)
services/x/*.js                вся бизнес-логика; объект-аргумент { userId, ... }
models/XModel.js               схема + индексы; экспорт через models/index.js
```

- Ответ успеха: `successRes(res, data)` → `{ success: true, data }`. Ошибка: `throw new AppError(status, "Текст по-русски")`
  → `errorHandlerMW` → `{ message, requestId }`. Не писать `res.status().json()` руками.
- Роутер подключается в `server/routes/index.js`; новый URL-префикс → **проверить nginx location** (иначе 405/HTML на проде).
- Деньги/критичное — `runInTransaction` из `server/utils/mongoTransaction.js`; платежи — через
  `MoneyIdempotencyRecord` (ключ + цель + сумма). Никакой логики оплаты на фронте.
- Аналитика — только через `server/services/analytics-events/` (`emit*Event`), константы в
  `constants/analyticsEventConstants.js`. Не заводить параллельную систему событий.
- Фоновая работа — BullMQ (`queues/`, `worker.js`) с фолбэком; тяжёлое не делать в запросе.
- `server/utils/` — исторический склад; новое кладём в `services/<домен>/`, массово не переносим.
- Миграции БД: файл `server/scripts/migrations/YYYYMMDD-kebab.js` с `export const up`, регистрация
  в `migrations/index.js`; идемпотентно; `npm run migrate` (dry) / `migrate:apply`. Руками в прод-базу — нет.

## Contract (`contract/`) — источник правды для API

- Любой новый/изменённый endpoint: схема body/params/query и ответа — в `contract/src/*.js`, экспорт из `index.js`.
- **zod молча срезает необъявленные поля** (и в ответе клиенту, и в body на сервере). Добавил поле в модель —
  добавь в схему, иначе «правка не работает».
- Константы, общие для сервера и клиентов (статусы, лимиты, формулы цен/тарифов), — только тут, не копиями.
  Статусы заказа исторически в 4 копиях — при правке менять все.

## Web client (`client/src`) — FSD-подобно

`app → pages → widgets → features → entities → shared` (импорт только «вниз»).

Слайс сущности: `entities/<x>/{api,model,lib,ui}`:

- `api/xApi.js`: `apiClient` из `shared/api` + `parseApiContractData(data, schemaИзКонтракта)`, ошибки
  оборачиваются в `new Error(message ?? fallback)` с русским fallback.
- `model/xQueryKeys.js` + `useXQuery.js`/`useXMutation.js` (TanStack Query, фабрика ключей, явный `staleTime`).
- `ui/Component.jsx` + соседний `Component.css`. Цвета/отступы — CSS-переменные `--iz-*` из design tokens.
- Тексты UI — `shared/config/appUiCopy.js` (barrel над `copy/*`, не схлопывать).
- Флаги — `shared/config/featureFlags.js` (`VITE_FF_*`). Большую фичу — за флагом.
- Тесты: vitest рядом с файлом (`*.test.js`), helpers в `src/test/`.
- Страницы грузятся лениво; не раздувать entry-чанк (вес бандла под контролем, см. memory).

## Mobile (`mobile/`)

- Зеркальные слайсы `entities/<x>/{api,model}` на TS, `@/shared/api`, `formatApiErrorMessage` из shared-lib.
- **Новые staff/admin-экраны — только web**; в mobile staff открывает web (`PROFILE_SECTION_WEB_PATH`).
- Перед кодом — версионные доки Expo v54. `expo install` не использовать (ломает lock).
- Импорт `client/src/...` в mobile и обратно — запрещён.

## Что шарить между web и mobile

Шарить: Zod/лимиты/API-формы (`contract`), pure-логика (`shared-lib`), parse/refresh (`shared-api`), токены.
Не шарить: JSX/CSS/StyleSheet, навигацию, хранение токенов, platform-only API.
Третья копия функции в client+mobile = вынести в пакет. Изменение API проверять в обоих клиентах.

## Процесс

- Новая фича / изменение поведения → сначала **discovery**: что уже есть + вопросы блоками (А/Б) + дефолты v1,
  код только после «дефолты ок» / ответов (см. `.cursor/rules/feature-discovery-questions.mdc`).
- Мелкие ветки `feat/…`/`fix/…` → PR в `main`. Коммиты: `type(scope): описание по-русски`, тело — зачем
  и что изменилось для пользователя, простым языком. Не коммитить/пушить без просьбы.
- Не выдумывать данные/цифры (AGENTS §42). Нет данных — «Данных недостаточно».
- Без silent catch: `catch {}` запрещён, ошибка видна пользователю или залогирована.
- «Готово?» / «перепроверь» → отчёт GATE (env matrix, money/auth, silent catch, deps, tests run) — `post-ship-adversarial-gate.mdc`.

## Проверки перед «готово»

```
npm run test:server                     # node --test, ориентир 999/1000
npm run test:packages                   # contract + shared-lib + design-tokens
npm run test:client                     # vitest
npm run lint && npm run format:check    # prettier: printWidth 88, двойные кавычки
npm run typecheck --workspace=mobile    # если трогал mobile/contract/shared-lib; сравнивай с числом ошибок ДО правки
```

## Грабли

- В репо смешаны CRLF/LF: многострочные замены скриптами молча не применяются — правь через Edit.
  Многие «M» в `git status` — только переносы строк, а не правки.
- Код с `\` не писать через heredoc/`node -e` — теряются слеши.
- Ставить зависимости из корня (`npm install` в корне, `--workspace`), не `npm ci` внутри воркспейса.
- Деплой и прод — только по runbook'ам в memory, из чистой копии, с подтверждением пользователя.
