# Аудит client ↔ mobile и план консолидации

**Дата:** 2026-06-17  
**Цель:** убрать дублирование и drift без переписывания mobile с нуля.  
**Принцип:** один backend, два UI-клиента, shared только на уровне контрактов и pure-функций.

> Статусы шагов: `[ ]` не начато · `[~]` в работе · `[x]` готово

---

## 0. Диагноз (кратко)

| Миф | Факт |
|-----|------|
| «Mobile импортирует client» | **Нет.** Прямых импортов из `client/` в `mobile/` нет (кроме лого в `mobile/scripts/`). |
| «Reuse сломал web» | Большинство web-багов — **dev-infra** (Vite proxy, cookies, nodemon) и **эволюция auth**, не mobile-код. |
| «Нужен mobile с нуля» | Дорого, **не устраняет** drift. Проблема — **параллельные копии** одной логики в 2–4 местах. |
| «Mobile = копия web» | По спеке MP — да (full parity). Это **главный источник** объёма и багов на mobile. |

**Масштаб дублирования (июнь 2026):**

| | `client/` | `mobile/` |
|--|-----------|-----------|
| entities (папки) | 24 | 28 |
| файлы в entities | ~483 `.js` | ~292 `.ts` + ~28 `.tsx` |
| общие entity-имена | 23 домена совпадают | +5 mobile-only (`access`, `notification`, `push-token`, `session`, `upload`) |

---

## 1. Карта shared-слоя (как есть)

```
molhaAptekaFullStackApp/
├── contract/              ← @molha/api-contract     ✅ оба клиента
├── packages/
│   ├── design-tokens/     ← @izibuy/design-tokens   ✅ mobile; ❌ client (CSS vars отдельно)
│   └── shared-lib/        ← @izibuy/shared-lib      ✅ mobile; ❌ client (локальные копии)
├── client/                ← web SPA (Vite)
├── mobile/                ← Expo RN
└── server/                ← общий API
```

**npm workspaces (root `package.json`):** `packages/*`, `mobile` — **`client` не в workspace**.

---

## 2. Инвентарь дублирования

### 2.1. Pure-функции (кандидаты в `packages/shared-lib`)

| Функция / константа | `client` | `mobile` | `packages/shared-lib` | `contract` | Риск drift |
|---------------------|----------|----------|-------------------------|------------|------------|
| `formatPriceRub` | `client/src/shared/lib/formatPriceRub.js` | реэкспорт из `@izibuy/shared-lib` + **мёртвый** `mobile/shared/lib/formatPriceRub.ts` | ✅ | — | средний (разный fallback `—` vs `EM_DASH`) |
| `formatApiErrorMessage` | нет (inline в catch) | `@izibuy/shared-lib` | ✅ | — | высокий для UX ошибок |
| `formatIsoDateTime` | `client/.../formatIsoDateTime.js` | `mobile/.../formatIsoDateTime.ts` | ❌ | — | средний (разный формат даты) |
| `normalizeUploadUrlForStorage` | `client/.../resolveUploadedImageUrl.js` | `mobile/.../normalizeUploadUrlForStorage.ts` | ❌ | частично `storedMediaUrl` | высокий |
| `isDisplayable*Url` | `resolveUploadedImageUrl.js` | `resolveMediaUrl.ts` | ❌ | `isStoredMediaUrl` | средний |
| `staffMainViews` / staff access | `client/.../staffMainViews.js` | `@izibuy/shared-lib` | ✅ | — | **высокий** (client не на пакете) |
| user roles | разбросано по client | `@izibuy/shared-lib` | ✅ | — | средний |

### 2.2. Upload-константы (4 копии)

| Место | Файл |
|-------|------|
| server | `server/constants/uploadConstants.js` |
| client | `client/src/shared/config/uploadConstants.js` |
| mobile | `mobile/entities/upload/model/constants.ts` |
| contract | ❌ нет |

Лимиты совпадают (5 МБ, jpeg/png/webp), но **нет единого источника** — при смене на сервере клиенты расходятся молча.

### 2.3. API-слой (параллельная реализация)

| Компонент | `client` | `mobile` |
|-----------|----------|----------|
| HTTP client | `client/src/shared/api/apiClient.js` | `mobile/shared/api/apiClient.ts` |
| Auth storage | httpOnly cookie + `sessionStorage` (dev Bearer) | `expo-secure-store` + Bearer |
| parse contract | `client/src/shared/api/parseApiContract.js` (~94 строк) | `mobile/shared/api/parseApiContract.ts` (~214 строк) |
| upload | `client/src/shared/api/uploadImage.js` | `mobile/entities/upload/api/uploadImage.ts` |
| upload video | `client/src/shared/api/uploadVideo.js` | `mobile/entities/upload/api/uploadVideo.ts` |

**Паттерн refresh/retry** дублирован; mobile уже корректнее для FormData (`delete Content-Type`).

### 2.4. Навигация / доступ (логика, не UI)

| | `client` | `mobile` |
|--|----------|----------|
| Profile hub menu | `client/src/pages/my-profile/lib/buildProfileNavGroups.js` | `mobile/features/profile-hub/model/buildProfileNavGroups.ts` |
| Main view paths | `client/src/shared/lib/homeMainViewPaths.js` | `mobile/features/profile-hub/model/profileSections.ts` |
| Staff sections | `staffMainViews.js` | `STAFF_SECTION_IDS` в shared-lib |

Две независимые реализации одного меню → расхождение badge, guards, новых разделов.

### 2.5. Design tokens

| | `client` | `mobile` |
|--|----------|----------|
| Источник | CSS variables + `client/scripts/verify-design-tokens.mjs` | `@izibuy/design-tokens` + `AppThemeProvider` |
| Связь | скрипт миграции, **не runtime dependency** | runtime |

Цвета могут разъехаться без CI-проверки паритета.

### 2.6. Что **правильно** не шарить

- JSX / CSS / RN `StyleSheet`
- `react-router` vs `expo-router`
- Vite proxy vs `EXPO_PUBLIC_API_URL`
- Web-хуки (`useScrollLock`, `useDialogFocusTrap`, DnD)
- Mobile-only (`expo-image-picker`, push, deep links)

---

## 3. Классификация багов (метки для issues)

При triage каждый баг получает **одну** метку:

| Метка | Примеры |
|-------|---------|
| `web-dev-infra` | Vite proxy, nodemon restart на `uploads/`, localhost↔127.0.0.1 cookies |
| `web-feature` | UI/логика только web |
| `mobile-feature` | RN-экран, permissions, SecureStore |
| `server` | API, multer, auth middleware |
| `contract` | Zod-схема не совпадает с API |
| `shared-drift` | client и mobile ведут себя по-разному при одном API |

**Правило:** баг upload в dev на `127.0.0.1:5173` = `web-dev-infra`, не «mobile сломал».

---

## 4. Целевая архитектура (куда идём)

```
contract/           — Zod-схемы, upload-лимиты, storedMediaUrl
packages/
  shared-lib/       — pure: цены, даты, URL, роли, staff access, normalizeUploadUrl
  shared-api/       — parseApiContract, refresh-queue (без platform storage)
  design-tokens/    — единый источник цветов/spacing/radius
client/             — UI + web auth adapter + Vite
mobile/             — UI + native auth adapter + Expo
server/             — импортирует upload-константы из contract (опционально фаза 3)
```

**Не делаем:** импорт `client` → `mobile` или общий UI-пакет.

---

## 5. План выполнения (по порядку)

### Фаза A — Стабилизация и правила (1–2 дня)

| # | Шаг | DoD | Статус |
|---|-----|-----|--------|
| A.1 | Зафиксировать политику scope: **mobile buyer-first**; staff/seller-admin на mobile — maintenance, новые фичи сначала web | Решение в этом файле (§6); не добавлять новые staff-экраны без явного запроса | `[x]` |
| A.2 | Ввести метки багов (§3) в workflow (issues / todo) | В `todo.md` или шаблоне issue есть таблица меток | `[x]` |
| A.3 | Web dev fixes checklist | `server/nodemon.json` ignore `uploads/**`; upload через `apiClient` + FormData | `[x]` |
| A.4 | Документ: «что шарить / что нет» — ссылка на §2.6 для команды | PR checklist или rule в `.cursor/rules` | `[x]` |

### Фаза B — Консолидация pure-функций (3–5 дней)

| # | Шаг | DoD | Статус |
|---|-----|-----|--------|
| B.1 | Добавить в `contract` модуль `uploadLimits` (MAX_BYTES, MIME types) — **источник истины для всех** | server + client + mobile импортируют из contract; тест в `contract/tests` | `[x]` |
| B.2 | Перенести `normalizeUploadUrlForStorage` → `packages/shared-lib` | unit-тесты; client + mobile удаляют локальные копии | `[x]` |
| B.3 | Перенести `formatIsoDateTime` → `packages/shared-lib` (единый `ru-RU` формат) | client + mobile на пакете | `[x]` |
| B.4 | Подключить `client` к `@izibuy/shared-lib` | `formatPriceRub`, `staffMainViews`, roles — из пакета; удалить дубли в `client/src/shared/lib/` | `[x]` |
| B.5 | Удалить мёртвый код mobile | удалить `mobile/shared/lib/formatPriceRub.ts`, `formatApiErrorMessage.ts` если только реэкспорт | `[x]` |
| B.6 | Добавить `client` в root `workspaces` | `npm install` из корня; client видит `packages/*` | `[x]` |
| B.7 | Тесты `packages/shared-lib` (vitest/node) | `formatPriceRub`, `normalizeUploadUrl`, `formatIsoDateTime` | `[x]` |

### Фаза C — API-слой (5–7 дней)

| # | Шаг | DoD | Статус |
|---|-----|-----|--------|
| C.1 | Создать `packages/shared-api` | `parseApiContractData`, `toContractClientError`, общие parse-* для auth/cart/product | `[x]` |
| C.2 | Вынести refresh-queue | одна реализация `refreshSessionPromise` + skip paths | `[x]` |
| C.3 | Platform adapters | `web-auth-storage.ts` (cookies + dev sessionStorage), `mobile-auth-storage.ts` (SecureStore) | `[x]` |
| C.4 | Тонкие обёртки | `client/src/shared/api/apiClient.js` и `mobile/shared/api/apiClient.ts` только wiring | `[x]` |
| C.5 | Унифицировать upload helpers | общий `postMultipart` с `delete Content-Type`; web + mobile | `[x]` |
| C.6 | `formatApiErrorMessage` в client | все `catch` в entities используют shared-lib | `[x]` |

### Фаза D — Навигация и доступ (3–4 дня)

| # | Шаг | DoD | Статус |
|---|-----|-----|--------|
| D.1 | Вынести **данные** profile hub (список section id, роли, порядок) в `shared-lib` | один `PROFILE_SECTIONS` / `buildProfileNavGroups` input type | `[x]` |
| D.2 | Web `buildProfileNavGroups.js` — тонкая обёртка над shared | mobile `buildProfileNavGroups.ts` — тоже | `[x]` |
| D.3 | CI-проверка: одни и те же section ids в web main views и mobile hub | скрипт сравнения или unit-тест | `[x]` |

### Фаза E — Design tokens (2–3 дня)

| # | Шаг | DoD | Статус |
|---|-----|-----|--------|
| E.1 | `verify-design-tokens` сравнивает CSS vars client с `packages/design-tokens` | падает CI при расхождении | `[x]` |
| E.2 | (опционально) client импортирует tokens в JS для runtime theme | один source для dark mode web | `[x]` |

### Фаза F — Тесты и регрессия (параллельно с B–E)

| # | Шаг | DoD | Статус |
|---|-----|-----|--------|
| F.1 | Web e2e: upload image (auth user) | Playwright: login → upload → URL `/uploads/` | `[x]` |
| F.2 | Mobile regression: upload | расширить `mobile/scripts/wf72-regression.mjs` или Maestro smoke | `[x]` |
| F.3 | CI job: `contract` + `packages/shared-lib` tests | GitHub Actions / локальный npm script | `[x]` |
| F.4 | Smoke matrix (ручная, до автоматизации) | таблица §7 — прогон раз в релиз | `[x]` |

### Фаза G — Scope mobile (стратегия, не одномоментно)

| # | Шаг | DoD | Статус |
|---|-----|-----|--------|
| G.1 | Заморозить **новый** staff parity на mobile | новые staff-фичи → web; mobile deep link `izibuy://` / `https://izibuy.ru/...` | `[x]` |
| G.2 | Inventory staff mobile screens → «maintenance» | список в `mobile/README.md` | `[x]` |
| G.3 | Buyer-critical path 100% stable | каталог → карточка → корзина → заказ → профиль | `[x]` |

---

## 6. Решение по scope mobile (зафиксировать)

**Рекомендация v1 (рабочая):**

| На mobile (приоритет) | Только web (или deep link) |
|-----------------------|----------------------------|
| Каталог, поиск, карточка | category-tree-admin, search-synonyms-admin |
| Корзина, заказы | app-intro-admin, popular-products-admin |
| Wishlist, подписки, уведомления | product-moderation, intro-ad-moderation, … |
| Профиль, premium, loyalty (read/buy) | installment-disputes moderation |
| Seller: my-products, create/edit (если нужен) | сложные staff CRUD с DnD |
| Upload фото (товар, аватар, розыгрыш) | — |

**Не переписывать mobile с нуля.** Режем **новый** scope и **дубли**, существующие MP-экраны остаются в maintenance.

---

## 7. Smoke matrix (минимум перед релизом)

**Полная матрица + release log:** [`docs/release-smoke-matrix.md`](release-smoke-matrix.md) (F.4).

| # | Сценарий | Web | Mobile |
|---|----------|-----|--------|
| 1 | Login / logout | | |
| 2 | GET /auth/me после refresh | | |
| 3 | Каталог + фильтры | | |
| 4 | Добавить в корзину → оформить | | |
| 5 | Upload image (auth) | | |
| 6 | Upload video (seller ad) | | |
| 7 | Создать розыгрыш + фото приза | | |
| 8 | Wishlist sync | | |
| 9 | Push token register (mobile) | n/a | |
| 10 | Staff section (web на mobile, G.1) | | |

---

## 8. Антипаттерны (не делать)

1. **Импорт `client/src/...` в mobile** — ломает Metro, тянет DOM/CSS.
2. **Общий UI-kit React/RN** — преждевременно, дорого.
3. **Full rewrite mobile** — 3–6 месяцев, те же баги на auth/upload.
4. **Копипаста entity из web в mobile** без contract parse — добавлять только через `@molha/api-contract`.
5. **Менять upload лимиты только на server** — без contract (фаза B.1).

---

## 9. Метрики готовности

*Актуализировано 2026-06-17 — после закрытия фаз A–G. «Было» — снимок на старт аудита (§2).*

| Метрика | Было | Сейчас | Цель | Статус |
| ------- | ---- | ------ | ---- | ------ |
| Реализаций `formatPriceRub` | 3 независимых | **1** (`packages/shared-lib`); client/mobile — re-export | 1 | ✅ |
| Источник upload limits (байты/MIME) | 4 копии чисел | **1** (`contract/src/uploadLimits.js`); server/client/mobile — импорт `@molha/api-contract` | 1 (`contract`) | ✅ |
| Ядро `parseApiContract` | 2 полные копии (~94 + ~214 строк) | **1** (`packages/shared-api`); client/mobile — thin wrappers + platform-only parse | shared-api + wrappers | ✅ |
| client: pure-хелперы из §2.1 на `shared-lib` | 0% | **перенесены:** `formatPriceRub`, `formatIsoDateTime`, `formatApiErrorMessage`, `normalizeUploadUrlForStorage`, roles, `profileSections`, staff access | 100% переносимых | ✅ |
| client: `staffMainViews` / staff access | локальный дубль | **`@izibuy/shared-lib`** + тонкий `staffMainViews.js` (web-имена полей) | из пакета | ✅ |
| client в root `workspaces` | нет | **да** (`package.json`) | да | ✅ |
| Мёртвые копии в `mobile/shared/lib/` | `formatPriceRub.ts` и др. | **удалены**; barrel → `@izibuy/shared-lib` | 0 дублей | ✅ |
| e2e upload (web) | нет | **`client/e2e/upload-image.spec.js`** | да (F.1) | ✅ |
| CI `contract` + `shared-lib` | нет | **`npm run test:packages`** в `.github/workflows/lint.yml` | да (F.3) | ✅ |
| mobile buyer path smoke | нет | **`npm run smoke:buyer-path`** + wf72 static (G.3) | да | ✅ |
| design tokens parity CI | нет | **`npm run verify:design-tokens`** в lint.yml | да (E.1) | ✅ |
| profile sections parity | 2 реализации | **`npm run verify:profile-sections`** (D.3) | один источник ids | ✅ |

**Осознанно не в shared (§2.6):** `resolveUploadedImageUrl` / `resolveMediaUrl` (Vite proxy vs `EXPO_PUBLIC_*`), `isDisplayableProductImageUrl` / `isDisplayableMediaUrl` — platform display, дублируют логику; кандидат в `shared-lib` только при следующем drift-баге.

**Операционно (не метрика кода):** ручной smoke — [`docs/release-smoke-matrix.md`](release-smoke-matrix.md) перед релизом.

---

## 10. Порядок старта (TL;DR)

```
A.1 → A.3 ✅ → A.2 → A.4
  ↓
B.1 → B.2 → B.3 → B.4 → B.6 → B.7 → B.5
  ↓
C.1 → C.2 → C.5 → C.3 → C.4 → C.6
  ↓
D.1 → D.2 → D.3
  ↓
E.1 → F.1 → F.2 → F.3
  ↓
G.1 → G.3 (ongoing)
```

**Следующая задача для Agent mode:** `B.2` (перенос `normalizeUploadUrlForStorage` в `packages/shared-lib`) — закроет второй крупный источник drift.

---

## 11. Связанные документы

- `docs/mobile-development.md` — исходная спека mobile, MP/WF parity
- `docs/release-smoke-matrix.md` — smoke перед релизом (F.4)
- `docs/bug-triage-labels.md` — метки багов (A.2)
- `client/docs/LAN-dev-access.md` — web dev cookies/proxy
- `server/docs/auth-session.md` — сессия JWT
- `contract/docs/TYPES.md` — типы API

---

*Обновлять этот файл при закрытии шагов: менять `[ ]` → `[x]` и дату в шапке.*

**Статус roadmap (июнь 2026):** фазы A (кроме завершённых), B–G и F закрыты по чеклисту выше. Операционно: прогон `docs/release-smoke-matrix.md` перед каждым релизом.