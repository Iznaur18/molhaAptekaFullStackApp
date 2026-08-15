# Client ↔ mobile: консолидация и политика

**Roadmap закрыт:** 2026-06-17 (фазы A–G, все `[x]`).  
**Назначение файла:** политика scope, границы shared, triage, smoke — не backlog.

**Принцип:** один `server/`, два UI (`client/` web, `mobile/` RN), общий код только в `contract/` и `packages/*`.

---

## 0. Диагноз (кратко)

| Миф | Факт |
|-----|------|
| «Mobile импортирует client» | **Нет** (кроме лого в `mobile/scripts/`). |
| «Reuse сломал web» | Чаще **dev-infra** (Vite, cookies, nodemon) и auth, не mobile-код. |
| «Нужен mobile с нуля» | Не устраняет drift; проблема — **параллельные копии** логики. |
| «Mobile = копия web» | Исторически MP full parity → объём; **с G.1** staff на mobile → web. |

---

## 1. Архитектура (текущая)

```
molhaAptekaFullStackApp/
├── contract/                 ← @molha/api-contract (Zod, uploadLimits)
├── packages/
│   ├── design-tokens/        ← @izibuy/design-tokens
│   ├── shared-lib/           ← pure: цены, даты, URL, роли, profile sections
│   └── shared-api/           ← parseApiContract, refresh, multipart
├── client/                   ← Vite SPA + web-auth adapter
├── mobile/                   ← Expo RN + SecureStore adapter
└── server/                   ← API; upload limits из contract
```

**npm workspaces (root):** `client`, `packages/*`, `mobile`.

**Тонкие обёртки клиентов:** `client/src/shared/api/*`, `mobile/shared/api/*` — wiring + platform-only parse.

**CI:** `npm run test:packages`, `verify:design-tokens`, `verify:profile-sections` (`.github/workflows/lint.yml`).

---

## 2. Shared-слой

### 2.1 Что шарить (единый источник)

| Что | Где |
| --- | --- |
| API shapes, upload bytes/MIME | `contract/` → `@molha/api-contract` |
| Pure-хелперы, роли, staff paths, profile section ids | `packages/shared-lib` |
| parse API, refresh queue, multipart | `packages/shared-api` + adapter в client/mobile |
| Цвета/spacing | `packages/design-tokens` (+ CI parity с CSS client) |

Подробнее: `.cursor/rules/client-mobile-share-boundaries.mdc`, `.github/pull_request_template.md`.

### 2.2 Что **не** шарить

- JSX / CSS / RN `StyleSheet`
- `react-router` vs `expo-router`
- Vite proxy / cookies vs `EXPO_PUBLIC_*` / SecureStore
- Web-хуки (DnD, scroll lock) и mobile-only (push, image-picker, deep links)
- **Импорт `client/src/...` в `mobile/`** — запрещён

**Platform display (осознанно локально):** `resolveUploadedImageUrl` (web), `resolveMediaUrl` (mobile), `isDisplayable*Url` — в `shared-lib` только при drift-баге.

### 2.3 Архив: проблемы на старт аудита (июнь 2026)

До фаз B–C: 3+ копии `formatPriceRub`, 4 независимых upload limits, два полных `parseApiContract`, client без `shared-lib`, мёртвые файлы в `mobile/shared/lib/`. Закрыто — см. §9.

---

## 3. Классификация багов (метки)

Одна метка на issue. Расширено: [`docs/bug-triage-labels.md`](bug-triage-labels.md), шаблон `.github/ISSUE_TEMPLATE/bug-triage.yml`.

| Метка | Когда |
|-------|--------|
| `web-dev-infra` | Vite proxy, nodemon/uploads, localhost cookies |
| `web-feature` | Только web UI/логика |
| `mobile-feature` | RN, permissions, SecureStore |
| `server` | API, middleware, БД |
| `contract` | Zod/OpenAPI ≠ фактический API |
| `shared-drift` | Один API — разное поведение client vs mobile |

**Правило:** upload падает на `127.0.0.1:5173` в dev → `web-dev-infra`.

---

## 4. Целевая схема (достигнута)

См. §1. Не делаем: импорт client → mobile, общий UI-kit React/RN.

---

## 5. Roadmap (архив, все `[x]`)

| Фаза | Суть |
|------|------|
| **A** | Scope buyer-first, метки, dev-fixes, PR/rule границ |
| **B** | `uploadLimits` в contract, `shared-lib`, client в workspaces |
| **C** | `shared-api`, auth adapters, upload multipart |
| **D** | Profile sections в `shared-lib`, `verify:profile-sections` |
| **E** | Design tokens CI + runtime web |
| **F** | e2e upload, wf72, `test:packages`, [`release-smoke-matrix.md`](release-smoke-matrix.md) |
| **G** | Staff → web (G.1), inventory (G.2), buyer path (G.3) |

Детальный DoD по шагам A.1–G.3 — в git history (коммит `81b6c04` и ранее).

---

## 6. Scope mobile (рабочая политика)

| На mobile (приоритет) | Только web |
|-----------------------|------------|
| Каталог, поиск, карточка | category-tree-admin, search-synonyms-admin |
| Корзина, заказы | app-intro-admin, popular-products-admin |
| Wishlist, подписки, push | product-moderation, intro-ad-moderation, … |
| Профиль, premium, loyalty | installment-disputes moderation |
| Seller: my-products, create/edit | сложные staff CRUD с DnD |
| Upload фото (товар, аватар) | новый staff (G.1 → browser) |

**Не переписывать mobile с нуля.** Legacy staff-экраны — maintenance: `mobile/README.md` § Staff inventory.

См. также: `mobile/docs/STAFF-WEB-ONLY.md`, `mobile/docs/BUYER-CRITICAL-PATH.md`.

---

## 7. Smoke перед релизом

Краткая матрица §7 + release log: [`docs/release-smoke-matrix.md`](release-smoke-matrix.md).

| # | Сценарий |
|---|----------|
| 1–4 | Auth, `/auth/me`, каталог, корзина → заказ |
| 5–6 | Upload image / video |
| 7–8 | Розыгрыш, wishlist |
| 9 | Push token (mobile) |
| 10 | Staff → web на mobile (G.1) |

---

## 8. Антипаттерны

1. Импорт `client/src/...` в mobile.
2. Общий UI-kit React/RN без необходимости.
3. Full rewrite mobile.
4. Копипаста entity без `@molha/api-contract` parse.
5. Менять upload лимиты только на server без contract.

---

## 9. Метрики (снимок после консолидации)

| Метрика | Сейчас | Цель |
| ------- | ------ | ---- |
| `formatPriceRub` | 1× `shared-lib`, re-export client/mobile | 1 |
| Upload limits | 1× `contract/uploadLimits.js` | 1 |
| `parseApiContract` | `shared-api` + thin wrappers | shared-api + wrappers |
| Pure-хелперы §2.1 в client | `@izibuy/shared-lib` | да |
| `staffMainViews` / roles | `shared-lib` + тонкий web wrapper | из пакета |
| client в workspaces | да | да |
| Мёртвый `mobile/shared/lib/*` | удалён | 0 дублей |
| e2e upload web | `client/e2e/upload-image.spec.js` | да |
| CI packages + tokens + profile | lint.yml | да |
| Mobile buyer smoke | `smoke:buyer-path`, wf72 | да |

**Операционно:** прогон `release-smoke-matrix.md` перед каждым релизом.

---

## 10. Связанные документы

| Документ | Назначение |
| -------- | ---------- |
| [`bug-triage-labels.md`](bug-triage-labels.md) | Метки §3 |
| [`release-smoke-matrix.md`](release-smoke-matrix.md) | Smoke §7 |
| [`mobile-development.md`](../clients/mobile-development.md) | Спека mobile, WF parity |
| [`mobile/README.md`](../../mobile/README.md) | Staff inventory, buyer path |
| [`client/docs/LAN-dev-access.md`](../../client/docs/LAN-dev-access.md) | Web dev auth/proxy |
| [`server/docs/auth-session.md`](../../server/docs/auth-session.md) | JWT сессия |
| `.cursor/rules/client-mobile-share-boundaries.mdc` | Границы §2 |
| `.cursor/rules/mobile-staff-freeze.mdc` | G.1 staff freeze |

---

*При новых шагах консолидации — дополнять §5/§9; политику §2/§6/§8 не ломать без явного решения.*
