# Мобильная разработка — iziBuy (iOS + Android)

**Главный документ** по нативному приложению. Опираемся на него при планировании и реализации.

**Связанные документы:**

- `server/docs/PRODUCTION-AND-ARCHITECTURE.md` — общая архитектура full-stack
- `server/docs/auth-session.md` — сессия и JWT
- `server/docs/MEDIA-OBJECT-STORAGE.md` — CDN и uploads
- `docs/deploy/DEPLOY.md` — prod-деплой
- `todo.md` — только web-задачи
- `mobile/README.md` — запуск и env

---

## 0. Зафиксированные решения (июнь 2026)

| Параметр | Значение |
| -------- | -------- |
| Навигация | Expo Router (tabs template) |
| Язык | TypeScript |
| Workspaces | `file:../contract`, npm workspaces — позже |
| Bundle ID | `ru.izibuy.app` |
| Display name | iziBuy |
| Dev API | `EXPO_PUBLIC_API_URL` → LAN `http://192.168.x.x:4444` |
| Нативный тест v1 | **Samsung Android** (EAS APK или `expo run:android --device`) |
| Web dev | Metro `w` — быстрый UI, не замена Samsung для media/auth |
| Структура | FSD-lite: `app/` + `entities/` + `features/` + `shared/` |
| UI v1 | React Native primitives |
| Гостевой каталог | да — логин для корзины/заказа |
| Корзина v1 | server-only (дефолт из §7) |

**Текущий статус:** Фазы 0–4 ✅ · Фаза 5 (EAS/APK) **отложена** · **Фаза 6** — Sentry ✅ (код). Web: `npm run web` (`--offline` на Node 24). SDK **54**.

---

## 1. Решение

| Параметр | Значение |
| -------- | -------- |
| Платформы | iOS + Android |
| Стек | Expo SDK 54 + React Native 0.81 |
| Расположение | `mobile/` в этом репозитории |
| API | существующий `server/` (Express + MongoDB) |
| Контракты | `contract/` (`@molha/api-contract`) |
| Web-клиент | `client/` — отдельный UI, не переиспользуется как есть |

**Принцип:** один backend, два клиента (web SPA + native app). Shared — только API-логика и pure-helpers, не JSX/CSS.

---

## 2. Структура репозитория (целевая)

```
molhaAptekaFullStackApp/
├── client/          # React + Vite (web)
├── mobile/          # Expo + React Native
├── server/          # Express API
├── contract/        # Zod-схемы, общие типы
└── packages/        # позже: shared-api, shared-lib, design-tokens
```

**Структура `mobile/` (фактическая):**

```
mobile/
├── app/                 # Expo Router (экраны и навигация)
├── entities/            # доменные сущности + api
├── features/            # пользовательские сценарии
├── shared/
│   ├── config/          # apiBaseUrl, env
│   ├── api/             # apiClient (фаза 2)
│   └── lib/             # resolveMediaUrl, форматирование
└── components/          # legacy из шаблона; постепенно в shared/ui
```

---

## 3. Scope v1 (MVP) — дефолты

| Включено | Не в v1 |
| -------- | ------- |
| Login / Register / Logout | Staff / admin |
| Каталог, категории, карточка товара | Price offers / auction |
| Корзина, оформление заказа | Installment, raffles |
| Профиль, «Мои заказы» | User stories, premium UI |
| Пустые состояния, ошибки, pull-to-refresh | Push, deep links, биометрия |

**Аудитория v1:** покупатель. Продавец и модерация — web.

---

## 4. Auth — критично для mobile

### Как сейчас (web)

- `POST /auth/login`, `/auth/register` → httpOnly cookies (`access_token`, `refresh_token`)
- Клиент: `axios` + `withCredentials: true`
- При 401 → `POST /auth/refresh` → retry
- Fallback для API tools: `Authorization: Bearer <access_token>`

### Что нужно для mobile

Mobile **не должен** полагаться на cookies.

1. **Login/register:** в JSON отдавать `{ accessToken, refreshToken }` (cookies оставить для web)
2. **Refresh:** `POST /auth/refresh` принимать `{ refreshToken }` в body (cookie — fallback)
3. **Хранение:** `expo-secure-store` (не AsyncStorage для токенов)
4. **apiClient:** Bearer в заголовке, interceptor 401 → refresh → retry

### Email-верификация

- Ссылка из письма редиректит на **web** `FRONTEND_URL` (`GET /auth/verify-email?token=...`)
- In-app: `POST /auth/verify-email` с `{ code }` — использовать в приложении
- v2: Universal Links, чтобы ссылка открывала app

---

## 5. Медиа и uploads

### Проблема

Web: `resolveUploadedImageUrl` подставляет `window.location.origin` для путей `/uploads/...`.

На mobile `window` нет → нужен **абсолютный** base URL.

### Prod (блокер)

Обязательно до релиза в сторы:

```env
PUBLIC_UPLOAD_BASE_URL=https://cdn.izibuy.ru
# либо UPLOAD_STORAGE=s3 + CDN — см. server/docs/MEDIA-OBJECT-STORAGE.md
```

Относительные `/uploads/...` в БД без CDN **сломают** картинки в приложении.

### Загрузка с устройства

- Web: `FormData` + браузерный `File`
- RN: `FormData` + `{ uri, name, type }` (не `File`)
- Лимиты server: image 5 МБ, video 5 МБ
- iPhone HEIC → конвертация/сжатие перед upload
- Библиотеки: `expo-image-picker`, `expo-image` (кэш)

---

## 6. Checkout и адрес (DaData)

Оформление заказа требует адрес доставки РФ.

- API: `POST /address/suggest` (серверный прокси DaData)
- Web UI: `AddressDeliveryFields` — **не портируется**, нужен свой autocomplete на RN
- Feature flag `requireAddressFromDadataSuggest` может запретить ручной ввод без подсказки

Без экрана адреса checkout в MVP не собрать.

---

## 7. Корзина

Web: локальное состояние + debounced sync с сервером (`CartServerSync`, ~450ms).

**Решение для mobile v1:** **server-only** (вариант A).

| Вариант | Плюсы | Минусы |
| ------- | ----- | ------ |
| A) Server-only | проще, нет рассинхрона | нужен интернет |
| B) Local + sync как web | офлайн-добавление | сложнее, дублирование логики |

---

## 8. API-слой mobile

```
mobile/
├── shared/api/       # apiClient, interceptors, parseApiContract
├── shared/lib/       # resolveMediaUrl, formatPriceRub, errors
├── entities/*/api/   # fetchCatalog, createOrder, ...
├── features/         # login-form, add-to-cart, ...
└── app/              # Expo Router
```

**Переиспользовать из web:**

- паттерны react-query (keys, mutations)
- `@molha/api-contract` для валидации ответов
- pure-функции из `entities/*/lib`

**Не переиспользовать:**

- `.jsx` UI, `.css`, `react-router-dom`, `lucide-react`, `@dnd-kit`
- всё с `window`, `document`, `localStorage` (кроме идей)

**Расширить contract:** схемы auth-ответа с токенами, списки заказов (сейчас покрытие частичное).

---

## 9. Dev-окружение

| Web dev | Mobile dev |
| ------- | ---------- |
| `127.0.0.1:5173` + Vite proxy | прямой URL API |
| CORS не нужен (same origin) | CORS не нужен (native) |
| cookies через proxy | Bearer tokens |

**Телефон на LAN:**

- API: `http://192.168.x.x:4444` (не `127.0.0.1`)
- Android: cleartext HTTP в dev (`usesCleartextTraffic` или dev build)
- iOS: ATS exception для dev IP (только dev)

**Windows:** локальный iOS Simulator недоступен. iOS = Expo Go на iPhone + EAS Build (облако) + TestFlight.

Env: `EXPO_PUBLIC_API_URL` — см. `mobile/.env.example`.

---

## 10. Порядок выполнения (фазы)

```
0 (репо) ✅ → 1 (server auth) ✅ → 2 (apiClient) ✅ → 3 (экраны)
                              ↓
                         4 (медиа)
                              ↓
                    prod HTTPS → 5 (сторы)
                              ↓
                         6 (Sentry)
```

v2 — по приоритету продукта после релиза MVP.

---

## 11. Публикация в сторы

### Аккаунты

- Apple Developer — $99/год
- Google Play Console — $25 разово
- Bundle ID: `ru.izibuy.app`

### EAS

- `eas.json`: development, preview, production
- `eas build` → `.ipa` / `.aab`
- `eas submit` → App Store Connect / Play Console

### Обязательно

- Privacy Policy URL
- Иконка 1024×1024, скриншоты
- App Store review notes: UGC (товары, отзывы), модерация, кнопка «Пожаловаться»
- Google: Data safety form, удаление аккаунта (GDPR)

### Оплата в приложении

Сейчас `cardPrepaid` / `cashOnDelivery` — **enum в заказе**, не платёжный шлюз (Stripe нет). Для физических товаров IAP не нужен. Описать flow для App Review.

Premium покупается за **loyalty points**, не за реальные деньги — IAP не требуется до появления цифровых покупок за ₽.

---

## 12. Риски и сюрпризы

### Высокий риск (до prod-билда)

| Риск | Митигация |
| ---- | --------- |
| Auth только cookies | Фаза 1 server + Bearer client |
| Картинки `/uploads/` без CDN | `PUBLIC_UPLOAD_BASE_URL` / S3 |
| Checkout без DaData UI | Отдельный экран autocomplete |
| RN upload ≠ web File | FormData `{ uri, type, name }` |
| iOS на Windows | EAS cloud + TestFlight |
| Email link → web | In-app код; deep links в v2 |

### Средний риск

| Риск | Митигация |
| ---- | --------- |
| Scope web >> MVP | Жёсткий v1, чеклисты ниже |
| contract неполный | Расширять по мере mobile API |
| UGC без report | Кнопка жалобы на товар в MVP |
| Гостевой каталог | ✅ гость для каталога |
| Сложные фичи (installment, stories) | Только v2 |

### Низкий риск

- Expo SDK upgrades (ежегодно)
- FlatList performance для большого каталога
- CSS tokens → RN styles с нуля
- Canvas/crop профиля — другие RN-библиотеки
- OTA не обновляет native permissions
- Юр. документы РФ (оферта, ПДн)

---

## 13. App Store compliance (UGC)

Маркетплейс = user-generated content (товары, отзывы, позже stories).

До сабмита в App Store:

- [ ] Пожаловаться на товар / отзыв
- [ ] Описание модерации в review notes
- [ ] Блокировка пользователя — через support или web

---

## 14. Чеклист перед первым TestFlight

- [ ] `mobile/` запускается на Android + iOS (Expo Go)
- [ ] Auth: login → Bearer → `/auth/me` → logout
- [ ] Refresh при истечении access
- [ ] Каталог грузится с prod/staging API
- [ ] Картинки открываются (абсолютные URL)
- [ ] Корзина → заказ → виден в «Мои заказы»
- [ ] Адрес через DaData suggest
- [ ] Sentry ловит crash
- [ ] Privacy Policy URL готов
- [ ] `eas build --profile preview` успешен

---

## 15. Полезные команды

```bash
# из mobile/
npm install
npx expo start

# dev на устройстве (замени IP на свой LAN)
# Windows PowerShell:
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:4444"; npx expo start

# сборка (фаза 5)
npx eas build --platform all --profile preview
npx eas submit --platform ios
```

---

# Чеклист задач

> Стек: `mobile/` (Expo + React Native), API `server/`, контракты `contract/`.
> Дефолты v1: покупатель, каталог + карточка + корзина + заказ + профиль + auth.
> Staff/admin — только web. Push, deep links, биометрия — v2+.

## Фаза 0 — Инфра и репозиторий ✅

- [x] Создать `mobile/` через `create-expo-app` (TypeScript, Expo Router)
- [x] Подключить `@molha/api-contract` (`file:../contract`)
- [x] Настроить env: `EXPO_PUBLIC_API_URL` (`.env.example`)
- [x] Структура FSD-lite: `app/`, `entities/`, `features/`, `shared/`
- [x] ESLint + Prettier для `mobile/` (`eslint-config-expo`)
- [ ] (Позже) npm workspaces: `client`, `mobile`, `contract`, `packages/shared-api`
- [x] Документ `mobile/README.md`: запуск, env, сборка, отладка на устройстве
- [x] Перенос roadmap в `docs/mobile-development.md`

## Фаза 1 — Server: auth для мобилки ✅

- [x] Login/register: в JSON `data` + `accessToken`, `refreshToken` (cookies для web)
- [x] `POST /auth/refresh`: `{ refreshToken }` в body (cookie — fallback)
- [x] `POST /auth/logout`: body `refreshToken` опционально (blacklist — v2)
- [x] `GET /auth/me` с `Authorization: Bearer` (уже было в `checkAuthMW`)
- [x] `server/docs/auth-session.md` + `contract/authSession.js`
- [x] CORS для native не нужен (документировано)

## Фаза 2 — Mobile: shared API слой ✅

- [x] `apiClient` на axios: Bearer из SecureStore, без `withCredentials`
- [x] Interceptor 401 → refresh → retry (`shared/api/apiClient.ts`)
- [x] SecureStore: access + refresh (`expo-secure-store`)
- [x] Парсинг через `parseApiSuccess` / `authSessionDataSchema`, `authMeDataSchema`
- [x] `resolveUploadedMediaUrl` — `EXPO_PUBLIC_UPLOAD_BASE_URL` или API origin
- [x] `formatApiErrorMessage` — сеть, таймаут, message с API
- [x] React Query: `createAppQueryClient`, `authMeQueryKeys`, `catalogQueryKeys`
- [x] `entities/session` — `fetchAuthMe`, `loginUser`, `logoutUser`, `useAuthSessionQuery`

## Фаза 3 — Mobile: экраны v1 (MVP)

- [x] Splash + иконка приложения (1024×1024)
- [x] Auth: Login, Register, Logout (`app/(auth)/`, профиль)
- [x] Email verify: in-app код (`POST /auth/verify-email`, resend); deep link — v2
- [x] Каталог: сетка 2 колонки, infinite scroll, pull-to-refresh, поиск, фильтр категорий
- [x] Категории v1: chips из `GET /product/category-displays` + `?productCategory=`
- [x] Категории v2: подкатегории `GET /product/categories/:id/children` + `?categoryId=`
- [x] Карточка товара v1: фото, цена, наличие, описание, продавец
- [x] Корзина: server-only (`GET/PUT /cart`, таб «Корзина», badge, stepper)
- [x] Checkout: DaData autocomplete (`POST /address/suggest`) + `POST /order` в корзине
- [x] Профиль: «Мои заказы» (`GET /order`, `/orders`), баннер email verify
- [x] Мои заказы: подтверждение получения / отмена позиции (`PATCH /order/.../confirm`, `.../cancelled`)
- [x] Профиль: редактирование (`PATCH /user/:id` — никнейм, телефон, уведомления)
- [x] UGC: кнопка «Пожаловаться» на карточке товара (`POST /product/:id/report`)
- [x] Пустые состояния, лоадеры, ошибки + retry на основных экранах
- [x] Pull-to-refresh на каталоге

## Фаза 4 — Медиа и загрузки

- [x] `expo-image` с кэшем для карточек товара
- [x] Загрузка фото: `POST /upload` через FormData RN (`{ uri, name, type }`, HEIC→JPEG)
- [x] Видео-превью товара (`productPreviewVideoUrl`, `expo-video`, галерея фото+видео)
- [x] Permissions: галерея (`expo-image-picker`) — аватар в профиле

## Фаза 5 — Сборка и публикация

- [ ] Apple Developer Account ($99/год)
- [ ] Google Play Console ($25)
- [x] Bundle ID / Application ID — `ru.izibuy.app` (в `app.json`, EAS — фаза 5)
- [x] `eas.json`: профили development, preview, production
- [x] `expo-dev-client` + npm-скрипты EAS (`build:dev:android`, …)
- [ ] EAS Build: первый прогон (`eas login` → `build:configure` → `npm run build:dev:android`)
- [ ] EAS Build: iOS `.ipa`, Android `.aab` в сторы
- [ ] Internal testing: TestFlight + Google Internal testing
- [x] Privacy Policy URL (обязательно для сторов) — `client/public/privacy.html`, экран `mobile/app/legal/privacy.tsx`; prod URL в `EXPO_PUBLIC_PRIVACY_POLICY_URL`
- [x] Скриншоты, описание, keywords RU/EN — `store-assets/`, `docs/STORE-SCREENSHOTS.md`, `npm run capture:store-screenshots`
- [ ] App Store review notes: модерация UGC, кнопка «Пожаловаться»
- [ ] `eas submit` → App Store Connect + Google Play
- [ ] Prod API на HTTPS с публичным доменом (`PUBLIC_UPLOAD_BASE_URL`)
- [ ] Dev: LAN API URL + Android cleartext / iOS ATS exceptions

## Фаза 6 — Наблюдаемость

- [x] Sentry React Native (`@sentry/react-native`) — отдельный DSN или тег `platform:mobile`
- [x] Логирование версии app + build number в Sentry breadcrumbs
- [ ] (Опционально) Firebase Analytics / Amplitude — воронка: install → register → order

---

## v2 и дальше (не в MVP, но заложить в архитектуру)

### Auth и безопасность

- [ ] Face ID / Touch ID — разблокировка сохранённой сессии
- [ ] Certificate pinning для prod API (защита от MITM)
- [ ] Force-update: endpoint `GET /app/min-version` → блокирующий экран «Обновите приложение»
- [ ] Отзыв refresh-токенов на server (blacklist / rotation)

### Навигация и рост

- [ ] Deep links: `izibuy://product/:id`, Universal Links (iOS) + App Links (Android)
- [ ] Файлы на сервере/CDN: `apple-app-site-association`, `.well-known/assetlinks.json`
- [ ] Push-уведомления: FCM + APNs, server-side очередь (новый заказ, статус заказа)
- [ ] `expo-notifications` + permissions

### Продукт (фичи web → mobile)

- [ ] «Мои желания» / favorites
- [ ] Отзывы на товары
- [ ] User stories (лента)
- [ ] Рассрочка (installment)
- [ ] Розыгрыши
- [ ] Чат / уведомления продавцу
- [ ] Продавец: «Мои товары», создание товара (отдельный scope)

### UX и качество

- [ ] Тёмная тема (синхрон с web design tokens)
- [ ] i18n (RU сейчас, EN позже) — `i18next` или expo-localization
- [ ] Accessibility: VoiceOver / TalkBack, размер шрифта
- [ ] Tablet-раскладки (iPad)
- [ ] Офлайн: кэш последнего каталога (AsyncStorage + React Query persist)
- [ ] Haptic feedback на ключевых действиях

### Shared code (рефакторинг монорепо)

- [ ] `packages/shared-api` — apiClient, interceptors, query keys
- [ ] `packages/shared-lib` — pure helpers (цены, валидация, форматирование)
- [ ] `packages/design-tokens` — цвета, отступы (web CSS vars → RN StyleSheet)
- [ ] CI: GitHub Actions → lint + test `contract` + `mobile` + EAS build on tag

### Тестирование mobile

- [ ] Unit: vitest/jest для `shared-lib`
- [ ] E2E: Maestro или Detox — smoke: login → catalog → add to cart
- [ ] Снимки экранов (опционально)

### Compliance и сторы

- [ ] GDPR / удаление аккаунта из приложения (требование Google)
- [ ] In-App Purchases — только если появятся цифровые товары внутри app (иначе — внешняя оплата/web)
- [ ] Детский контент / возрастной рейтинг в сторах
- [ ] Экспорт compliance (encryption) — стандартная декларация Apple
- [ ] Оплата: описание flow для App Review (без IAP, наличные/договорённость)

### Server — подготовка к mobile-трафику

- [ ] Rate limit: отдельные лимиты или user-agent `iziBuy-Mobile/x.y.z`
- [ ] Версионирование API (`/v1/...`) при breaking changes
- [ ] Feature flags (env или БД) — включать фичи по версии app
- [ ] WebSocket / SSE — если понадобится realtime (чат, аукцион)

---

*Последнее обновление: июнь 2026. Фаза 0 завершена.*
