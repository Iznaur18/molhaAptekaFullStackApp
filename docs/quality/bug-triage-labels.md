# Метки triage багов (A.2)

При заведении бага — **одна** метка из таблицы. Источник: [`client-mobile-consolidation-audit.md`((client-mobile-consolidation-audit.md) §3.

| Метка | Когда ставить | Примеры |
| ----- | ------------- | ------- |
| `web-dev-infra` | Локальная dev-среда web, не prod | Vite proxy, nodemon restart на `uploads/`, cookies `localhost` ↔ `127.0.0.1`, CORS в dev |
| `web-feature` | UI/логика только web SPA | Модалка, роут `react-router`, CSS, staff-экран в `client/` |
| `mobile-feature` | RN/Expo, permissions, native | SecureStore, image-picker, push, deep link, tab bar |
| `server` | API, middleware, БД, multer | 4xx/5xx на endpoint, валидация, auth middleware, индексы |
| `contract` | Zod/OpenAPI не совпадает с фактическим API | Поле в ответе есть на сервере, но схема в `@molha/api-contract` — нет |
| `shared-drift` | Один и тот же API — разное поведение client vs mobile | Разный parse, разные лимиты upload, разный текст ошибки при одном статусе |

## Правила

1. Upload падает на `127.0.0.1:5173` в dev → **`web-dev-infra`**, не «mobile сломал web».
2. Баг только на Samsung, web ок → **`mobile-feature`** (или `shared-drift`, если API-слой).
3. Оба клиента, сервер отдаёт неверные данные → **`server`** или **`contract`**.
4. Оба клиента, сервер ок, разный UX → **`shared-drift`** → кандидат в `packages/shared-lib` / `shared-api`.

## GitHub

- Шаблон issue: [`.github/ISSUE_TEMPLATE/bug-triage.yml`((../.github/ISSUE_TEMPLATE/bug-triage.yml)
- Рекомендуется создать labels в репозитории с теми же именами (Settings → Labels).
