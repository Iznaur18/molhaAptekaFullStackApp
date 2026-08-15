# MERN-аудит (Express + Mongo + Vite SPA)

**Дата:** 2026-06-17  
**Scope:** `client/`, `server/`, root workspaces. `mobile/` и `contract/` — только контекст.  
**Статус:** отчёт; фиксы — отдельными PR (см. §7).

> Репо **не классический MERN**: monorepo с FSD-web, Expo mobile, `@molha/api-contract`, `packages/shared-*`.

---

## Критические проблемы (P0–P1)

| # | Проблема | Где | Риск |
|---|----------|-----|------|
| 1 | ~~Нет `process.on("unhandledRejection")` / `uncaughtException`~~ | `server/instrument.js` → `registerProcessFatalHandlers.js` | ✅ закрыто P1 |
| 2 | ~~`asyncHandler` не на роутах~~ | `server/utils/createAsyncRouter.js` — все `server/routes/*` | ✅ закрыто P1 |
| 3 | ~~Cron в `index.js` без leader-lock~~ | `server/jobs/startCronIntervals.js`, `worker.js`, `CRON_LEADER` | ✅ закрыто P2 (H-2) |
| 4 | Prod без `FRONTEND_URL` | `server/createApp.js` | warn; misconfig CORS |

**Не блокеры, но важно:** `server/utils/` ~140 файлов — часть hot path уже в `server/services/` (#13–24); остальное мигрировать инкрементально (#25).

**Уже ок:** секретов в `client/src` нет; helmet, rate limit, JWT httpOnly + refresh, `assertProductionEnv`, Zod на части роутов, P0 hardening в ветке.

---

## 1. Архитектура и структура

### 1.1 Client — FSD с отклонениями

| Слой | Путь | Заметка |
|------|------|---------|
| app | `client/src/app/` | routes, shell, composition |
| pages | `client/src/pages/` | ~33 страницы |
| widgets | `client/src/widgets/` | header, catalog-filters, … |
| features | `client/src/features/` | cart-add, wishlist, … |
| entities | `client/src/entities/` | 24 домена |
| shared | `client/src/shared/` | api, config, lib, ui |

**Пакеты:** `@molha/api-contract`, `@izibuy/shared-api`, `@izibuy/shared-lib`, `@izibuy/design-tokens`.

**Отклонения FSD:**

- ~~`src/App.jsx`, `src/main.jsx` вне слоя `app/`~~ ✅ `client/src/app/App.jsx`, `app/main.jsx`
- ~~cross-page: `advertising` ↔ `app-intro-admin`, `intro-ad-moderation` → `advertising`~~ ✅ `entities/intro-ad/lib/`
- ~~`app/` импортирует `pages/home/model/*`~~ ✅ shell-хуки в `widgets/app-shell/`
- ~~legacy `pages/home/`~~ ✅ удалён (дубликат `widgets/app-shell/` + `widgets/catalog-product-grid/`)

Пример:

```7:9:client/src/app/model/useAppShellDomain.js
import { useHomeCatalogLoader } from "../../widgets/app-shell/model/useHomeCatalogLoader.js";
import { useHomeCatalogProductDetails } from "../../widgets/app-shell/model/useHomeCatalogProductDetails.js";
// … shell-хуки из widgets/app-shell
```

**Рекомендация:** FSD оставить; ~~shell-хуки перенести в `widgets/app-shell/`~~ ✅ сделано P2.

### 1.2 Server — Layered + domain `services/`

| Слой | Путь | Оценка |
|------|------|--------|
| routes | `server/routes/` | ✅ тонкие + `createAsyncRouter` |
| controllers | `server/controllers/` | ✅ thin HTTP (hot paths) |
| services | `server/services/` | ✅ installment, raffle, product, order, user, intro-ad, seller-personal-category |
| models | `server/models/` | ✅ Mongoose |
| middlewares | `server/middlewares/` | auth, rate limit, zod, upload |
| validations | `server/validations/` | Zod / express-validator |
| хелперы | `server/utils/` (~140 файлов) | ⚠️ остаток — миграция по hot path (#25) |

Паттерн: `controller` → `services/<domain>/` → `utils/` (чистые хелперы). Пример: `makeOrderController` → `services/order/createOrder.js`.

**Mongo:** `.lean()` + `.select()` на read — повсеместно; индексы — `server/docs/MONGO-INDEXES-AUDIT.md`.

**Масштабирование:** Layered + **domain `services/`** (не full Clean Architecture).

### 1.3 Monorepo (контекст)

```
contract/          — Zod, uploadLimits
packages/          — shared-lib, shared-api, design-tokens
client/            — Vite SPA (в workspaces)
mobile/            — Expo RN
server/            — Express API
```

Политика client ↔ mobile: `docs/quality/client-mobile-consolidation-audit.md`.

---

## 2. Было / Стало — структура папок

### Server

**Было:**

```
server/
├── controllers/Order/makeOrderController.js   # длинная оркестрация
├── utils/orderLoyaltyPoints.js
├── utils/productStock.js
├── utils/mongoTransaction.js
└── utils/…                                  # ~140 файлов в одном слое
```

**Стало (P1 #13–24, 2026-06):**

```
server/services/
├── installment/   ├── raffle/        ├── order/
├── product/       ├── user/           ├── intro-ad/
└── seller-personal-category/
```

Контроллеры hot path — thin layer + `AppError`. Дальше: #25 — остальные домены из `utils/`.

### Client

**Было:**

```
app/model/useAppShellDomain.js  → imports pages/home/model/*
pages/home/model/*              # shell + home вместе
```

**Стало:**

```
app/App.jsx, app/main.jsx       # entry в слое app
widgets/app-shell/              # shell composition
entities/intro-ad/lib/          # shared intro-ad form helpers
app/routes/                     # тонкие wrappers
pages/*                         # только UI страниц, без cross-imports
```

---

## 3. Сборка и конфигурация

### 3.1 Client (`client/vite.config.js`)

| Параметр | Значение |
|----------|----------|
| dev server | `:5173`, proxy → `:4444` |
| proxy | `/auth`, `/cart`, `/product`, `/order`, `/upload`, `/uploads`, … |
| build | `dist/`, `sourcemap: hidden`, `manualChunks` (vendor split) |
| env | `import.meta.env.VITE_*` |

**Замечания:**

- ~~`VITE_FF_*` (`featureFlags.js`) — не в `client/.env.example`~~ ✅ #45
- ~~Нет локального `npm run lint` в `client/package.json`~~ ✅ #47
- `npm run build:analyze` → `dist/stats.html` (#42 ✅)

### 3.2 Env и секреты

| Переменная | Client | Server |
|------------|--------|--------|
| `JWT_SECRET`, `MONGO_URI` | — | только server ✅ |
| `VITE_API_URL`, `VITE_SENTRY_DSN` | public by design ✅ | — |
| Dev Bearer | `sessionStorage` (`devAuthTokenStorage.js`) | — |

Prod: `assertProductionEnv()` — `server/index.js`.

### 3.3 CORS и статика

- CORS: `server/utils/resolveApiCorsMiddleware.js` — prod: `FRONTEND_URL`; dev: `origin: true`
- Helmet: `server/utils/buildApiHelmetOptions.js`
- Uploads: `GET /uploads` — `express.static` в `createApp.js`; prod — S3/CDN (`server/docs/MEDIA-OBJECT-STORAGE.md`)
- SPA deploy: nginx `client/dist` — `docs/deploy/nginx-izibuy.conf.example`

### 3.4 Auth client

- `client/src/shared/api/apiClient.js` + `web-auth-storage.js`
- Prod: httpOnly cookies, `withCredentials: true`
- Dev: Vite proxy + optional Bearer в `sessionStorage` (LAN)
- Refresh queue: `packages/shared-api`

---

## 4. Бэкенд: ошибки, auth, Mongo

### 4.1 Global error handling

| Компонент | Файл |
|-----------|------|
| error middleware | `server/middlewares/errorHandlerMW.js` |
| not found | `notFoundHandler` |
| wiring | `server/createApp.js` — последние middleware |
| Sentry 5xx | `server/utils/captureServerHttpError.js` |

Обрабатывает: `AppError`, Mongoose validation/cast, Mongo 11000, JWT, Multer, rate limit 429.

**Роуты:** `createAsyncRouter` + `asyncHandler` → `errorHandlerMW`. Контроллеры без дублирующих try/catch (#28 ✅ 2026-06). Бизнес-ошибки — `throw AppError` из services/utils; оставшиеся catch только с доменной веткой (11000, duplicate view, premium).

**Паттерн:** `server/controllers/lib/controllerAsync.js` — не ловить в контроллерах; codemod `server/scripts/stripControllerTryCatch.mjs`.

### 4.2 Auth / authorization

| Middleware | Файл |
|------------|------|
| `checkAuthMW` | `middlewares/checkAuthMW.js` |
| `checkOptionalAuthMW` | публичный каталог |
| `checkAdminMW` | admin routes |
| `checkProductModeratorMW` | staff |

Per-route, не глобально. Док: `server/docs/auth-session.md`.

### 4.3 MongoDB

- Read: `.lean()` — стандарт
- Transactions: заказы/баллы — `utils/mongoTransaction.js`
- Индексы: `server/docs/MONGO-INDEXES-AUDIT.md`, `npm run explain:queries`

---

## 5. Оптимизация сборки и зависимостей

| Действие | Эффект | Приоритет |
|----------|--------|-----------|
| `unhandledRejection` + `asyncHandler` на роуты | стабильность API | P1 |
| ~~`services/*` hot paths (#13–24)~~ | читаемость | ✅ P2 |
| ~~`widgets/app-shell`, `app/App.jsx`, intro-ad lib~~ | FSD | ✅ P2 |
| Lazy import staff routes | меньше initial JS | P3 (частично #41) |
| ~~`rollup-plugin-visualizer` (dev)~~ | анализ чанков | ✅ #42 |
| ~~Cron → `worker.js` + BullMQ~~ | scale 2+ API | ✅ H-2, H-4 |

**Не делать без метрик:** k8s, microservices, общий React/RN UI-kit.

---

## 6. Сводная оценка

| Область | Оценка |
|---------|--------|
| Client FSD | 8/10 — entry в `app/`, cross-page lib в entities, `pages/home/` удалён |
| Server layers | 8/10 — hot path в `services/`, utils — долг #25 |
| Build / env | 8/10 |
| Security baseline | 8/10 (post-P0) |
| Prod readiness | 6/10 — деплой, email, S3 (код scale готов) |

---

## 7. Следующие шаги

1. ~~**P1:** `unhandledRejection` / `uncaughtException` в `server/index.js`~~ ✅ `registerProcessFatalHandlers` → `instrument.js`
2. ~~**P1:** `asyncHandler` на роутерах~~ ✅ `createAsyncRouter` во всех `server/routes/*`
3. ~~**P2:** `server/services/order/createOrder.js` — вынести из `makeOrderController`~~ ✅
4. ~~**P2:** `widgets/app-shell` — рефактор app→pages~~ ✅
5. ~~**P2:** H-2 cron leader / `worker.js` (`todo.md`)~~ ✅
6. ~~**P2:** `server/services/` — installment, raffle, product, order, user, intro-ad, seller-personal-category (#13–24)~~ ✅ 2026-06
7. ~~**P2:** FSD — `app/App.jsx` + `app/main.jsx`, `entities/intro-ad/lib/`, убраны cross-page imports (#31–34)~~ ✅ 2026-06
8. ~~**P2:** удалить legacy `pages/home/`~~ ✅ 2026-06
9. ~~**P2:** контроллеры → `next(err)` вместо дублирующих try/catch (#28)~~ ✅ 2026-06
10. ~~**P0:** refresh token rotation, 500 leak fix, shared-lib upload URL tests~~ ✅ 2026-06
11. ~~**P3:** BullMQ, catalog cache, bundle split, CI tests~~ ✅ 2026-06
12. **P1:** первый prod-деплой + transactional email (см. `todo.md` §верх)

---

## 8. Связанные документы

| Документ | Тема |
|----------|------|
| `server/docs/PRODUCTION-AND-ARCHITECTURE.md` | архитектура + деплой |
| `server/docs/auth-session.md` | JWT, cookies |
| `server/docs/MONGO-INDEXES-AUDIT.md` | индексы |
| `server/docs/RATE-LIMIT-AUDIT.md` | rate limit |
| `server/docs/HORIZONTAL-SCALING.md` | scale |
| `docs/quality/client-mobile-consolidation-audit.md` | client ↔ mobile |
| `docs/deploy/DEPLOY.md` | первый prod |

---

*Обновлять при закрытии пунктов §7: переносить в git commit / отмечать дату.*
