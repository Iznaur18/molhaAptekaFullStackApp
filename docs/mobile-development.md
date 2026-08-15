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
| Bundle ID | `ru.gitorg.app` |
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
PUBLIC_UPLOAD_BASE_URL=https://cdn.gitorg.ru
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
- Bundle ID: `ru.gitorg.app`

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
- [x] Bundle ID / Application ID — `ru.gitorg.app` (в `app.json`, EAS — фаза 5)
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

- [ ] Deep links: `gitorg://product/:id`, Universal Links (iOS) + App Links (Android)
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

---

## Mobile Parity (MP) — полный паритет с web

Зафиксированная спека (все пункты discovery = **А**):

| Решение | Выбор |
|--------|--------|
| Staff/admin на mobile | Да — все 12 staff-разделов |
| Seller на mobile | Да |
| Стили | Design tokens web → RN `AppThemeProvider` |
| Навигация | Profile hub как web (`buildProfileNavGroups`) |
| Intro splash | Да — первый запуск, `GET /app-intro` |
| Фичи 6–15 | Все да (wishlist, subscriptions, notifications, stories, auction, installment, premium, loyalty, raffles, ads, catalog-browser) |
| Shared code | `packages/design-tokens`, `packages/shared-lib` |
| Web dev | Сохраняем `npm run web` |

### MP-0 — инфраструктура (в работе)

- [x] `packages/design-tokens` — цвета, отступы, радиусы, типографика
- [x] `packages/shared-lib` — `formatPriceRub`, `formatApiErrorMessage`, роли, staff access
- [x] `mobile/shared/theme/AppThemeProvider` — `@izibuy/design-tokens`
- [x] `entities/access` — `useUserAccess`
- [x] `features/profile-hub` — меню разделов, `app/hub/[section]` + guards
- [x] `features/app-intro` — splash при первом запуске
- [x] npm workspaces + metro `extraNodeModules`

### MP-1 — Buyer parity

- [x] Wishlist — context, sync `GET|PUT /favorites`, `/hub/wishlist`, toggle на карточке/детали
- [x] Subscriptions — `GET /user/me/following`, отписка, `/hub/subscriptions`
- [x] Notifications — экран `/notifications`, badge на табе Профиль, `PATCH .../read`
- [x] Catalog-browser — `/catalog-browser`, feed tiles + категории → фильтры каталога
- [x] Каталог — sort, followingOnly, auctionOnly, installmentOnly, saleOnly в API
- [x] Полная карточка/деталь — discount, stats grid, badges, tabs (reviews/auction/installment)
- [x] `POST /product/:id/view`, `UserFollowButton` на seller preview
- [x] Stories, curated lists, featured raffles на home (`features/home-feed`)
- [x] Отзывы — форма отправки (`POST /product/:id/reviews`)
- [x] Аукцион — submit/patch/cancel offer на детали товара
- [x] Installment — оформление на вкладке товара + `/hub/installment-payments`

### MP-2 — Seller

- [x] `/hub/my-products` — infinite list, `ProductCard`, кнопка «Разместить товар»
- [x] `/create-product` — форма `POST /product` (категория drill-down, фото, stock)
- [x] `/edit-product/[id]` — `PATCH /product/:id`, удаление
- [x] `/hub/my-sales` — `GET /order/sales`, ship/deliver/cancel на `OrderCard`
- [x] `/hub/advertising` — submit intro-ad + личная категория (видео/фото upload)
- [x] Seller auction — `/hub/auction`, accept/reject incoming offers

### MP-3 — Premium / loyalty / installment / raffles

- [x] `/hub/premium` — статус + покупка за баллы
- [x] `/hub/loyalty-points` — баланс + preview пополнения (coming soon)
- [x] `/hub/data-confirmation` — статус заявки (подача — web v1)
- [x] `/hub/installment-payments` — договоры покупателя, mark-paid
- [x] `/hub/installment-sales` — продажи продавца, confirm/reject оплат
- [x] `/raffle/[id]` — товары розыгрыша
- [x] `/hub/create-raffle` — форма `POST /product/raffles`
- [x] staff raffles moderation / installment disputes (через hub)

### MP-4 — Staff/admin

- [x] 11 staff-экранов: product/intro-ad/personal-category moderation, product-reports (+ story reports), raffles, data-confirmation-requests, installment-disputes, admin-orders, search-synonyms-admin, category-tree-admin, app-intro-admin, popular-products-admin
- [x] `useStaffHubBadgeCounts` + badge в `ProfileHubMenu`

### MP-5 — Polish

- [x] Deep links: `gitorg://` + `https://gitorg.ru` (`parseAppDeepLink`, `useAppDeepLinking`, intent filters)
- [x] In-app notifications poll (`useInAppNotificationsPoll`, 30s) + routing по kind
- [x] Тёмная тема: `izColorsDark`, `ThemePreferenceToggle` (system/light/dark), nav/tab bar theming
- [x] Remote push: `expo-notifications` + `PUT/DELETE /auth/me/push-token` + Expo Push API при `createUserInAppNotification`
- [x] Badge-счётчики в hub (staff + user actions)

---

## WF — Web Feature Parity (функциональный слой)

Порядок после MP: **WF-0 → WF-1…WF-7 → WS-0…WS-6** (стили — после закрытия функционала).

Источники истины:

- Web main views: `client/src/shared/lib/homeMainViewPaths.js` (`HOME_MAIN_VIEW_PATH`)
- Web profile hub: `client/src/pages/my-profile/lib/buildProfileNavGroups.js`
- Mobile hub: `mobile/features/profile-hub/model/buildProfileNavGroups.ts`, `profileSections.ts`

### WF-0 — Матрица маршрутов ✅

**Definition of Done (экран = `full`):**

| Критерий | Описание |
|----------|----------|
| `load` | Данные с API, loading/error/retry |
| `empty` | Пустое состояние с копирайтом |
| `guard` | Роль/авторизация → redirect или hint |
| `create` | Создание сущности (если есть на web) |
| `edit` | Редактирование (если есть на web) |
| `delete` | Удаление/отмена (если есть на web) |
| `actions` | Основные CTA web (модерация, ship, vote, …) |

**Статусы:** `full` — DoD закрыт; `partial` — экран есть, не хватает CRUD/блоков; `missing` — маршрута/фичи нет.

#### Main views (`HOME_MAIN_VIEW_PATH`)

| Web view | Web path | Mobile route | Статус | Пробелы (→ WF) |
|----------|----------|--------------|--------|----------------|
| `catalog` | `/` | `/(tabs)` | **full** | — |
| `catalog-browser` | `/catalog` | `/catalog-browser` | **full** | API feed tiles, personal categories, admin edit (WF-1.1 ✅) |
| `my-profile` | `/me` | `/(tabs)/profile` + `/hub/overview` | **full** | overview: banner, stats, raffle (WF-2.1 ✅) |
| `my-products` | `/my-products` | `/hub/my-products` | **full** | + `/create-product`, `/edit-product/[id]` |
| `users` | `/user-list` | `/users` + `/user/[id]` | **full** | search, profile, vote, follow (WF-3.1 ✅) |
| `subscriptions` | `/subscriptions` | `/hub/subscriptions` | **full** | — |
| `wishlist` | `/wishlist` | `/hub/wishlist` | **full** | — |
| `notifications` | `/notifications` | `/notifications` | **full** | auto-read, kind routing, cold-start push (WF-1.5 ✅) |
| `cart` | `/basket` | `/(tabs)/cart` | **full** | purchasable hints, post-checkout → orders (WF-1.3 ✅) |
| `my-sales` | `/my-sales` | `/hub/my-sales` | **full** | ship/deliver/cancel |
| `my-orders` | `/my-orders` | `/orders` | **full** | status filter, product tap, badge refresh (WF-1.4 ✅) |
| `auction` | `/auction` | `/hub/auction` | **full** | accept/reject offers |
| `data-confirmation` | `/data-confirmation` | `/hub/data-confirmation` | **full** | native passport form + selfie upload (WF-3.2 ✅) |
| `premium` | `/premium` | `/hub/premium` | **full** | покупка за баллы |
| `loyalty-points` | `/loyalty-points` | `/hub/loyalty-points` | **full** | preview + coming soon, parity web (WF-3.3 ✅) |
| `advertising` | `/profile/advertising` | `/hub/advertising` | **full** | intro-ad + personal category |
| `admin-orders` | `/admin-orders` | `/hub/admin-orders` | **full** | — |
| `search-synonyms-admin` | `/search-synonyms-admin` | `/hub/search-synonyms-admin` | **full** | create/edit + delete (WF-6.1 ✅) |
| `category-tree-admin` | `/category-tree-admin` | `/hub/category-tree-admin` | **full** | CRUD дерева (WF-6.2 ✅) |
| `app-intro-admin` | `/app-intro-admin` | `/hub/app-intro-admin` | **full** | timing + preview/replay (WF-6.3 ✅) |
| `popular-products-admin` | `/profile/popular-products-admin` | `/hub/popular-products-admin` | **full** | edit lists + items (WF-6.4 ✅) |
| `product-moderation` | `/moderation-products` | `/hub/product-moderation` | **full** | approve/reject |
| `intro-ad-moderation` | `/moderation-intro-ad` | `/hub/intro-ad-moderation` | **full** | — |
| `seller-personal-category-moderation` | `/moderation-seller-categories` | `/hub/seller-personal-category-moderation` | **full** | — |
| `product-reports` | `/product-reports` | `/hub/product-reports` | **full** | products + story reports queue (WF-6.5 ✅) |
| `product-promotions` | `/product-promotions` | `/hub/product-promotions` | **full** | Staff queue approve/reject (WF-4.1 ✅) |
| `staff-raffles` | `/staff-raffles` | `/hub/raffles` | **full** | — |
| `data-confirmation-requests` | `/data-confirmation-requests` | `/hub/data-confirmation-requests` | **full** | approve/reject |
| `installment-payments` | `/installment-payments` | `/hub/installment-payments` | **full** | mark-paid |
| `installment-sales` | `/installment-sales` | `/hub/installment-sales` | **full** | confirm/reject |
| `installment-disputes` | `/installment-disputes` | `/hub/installment-disputes` | **full** | — |

#### Stack / modal маршруты (вне `HOME_MAIN_VIEW_PATH`)

| Web | Mobile route | Статус | Пробелы (→ WF) |
|-----|--------------|--------|----------------|
| `/product/:id` (`ProductDetailsModal`) | `/product/[id]` | **full** | promotion request + seller actions (WF-1.2 ✅) |
| `/seller/:userId` | `/seller/[userId]` | **full** | infinite catalog + follow (WF-3.4 ✅) |
| `UserDetailsModal` (из user-list) | `/user/[id]` | **full** | stack screen + vote (WF-3.1 ✅) |
| `/staff-raffles` → create | `/hub/create-raffle` | **full** | — |
| `/raffle/:id` | `/raffle/[id]` | **full** | — |
| Stories viewer | `HomeFeedHeader` + `UserStoryViewerModal` | **full** | create, delete own, video (WF-5.1 ✅) |
| Story report (user) | `ReportUserStoryModal` в viewer | **full** | submit report (WF-5.2 ✅) |
| Deep link `gitorg://` / `https://gitorg.ru` | `parseAppDeepLink` | **full** | product, raffle, seller, user, users (WF-7.1 ✅) |
| `/(auth)/login` | `/(auth)/login` | **full** | — |
| `/(auth)/register` | `/(auth)/register` | **full** | parity с web register |
| `/profile/edit` | `/profile/edit` | **full** | — |
| Legal privacy | `/legal/privacy` | **full** | — |
| App intro splash | `AppIntroSplash` | **full** | `GET /app-intro` |

#### Hub-only разделы

| Section ID | Mobile route | Статус | Пробелы |
|------------|--------------|--------|---------|
| `overview` | `/hub/overview` | **full** | parity `MyProfilePage` overview (WF-2.1 ✅) |
| `edit-profile` | `/profile/edit` | **full** | external route |

#### Сводка WF-0

| Статус | Кол-во |
|--------|--------|
| **full** | 47 |
| **partial** | 0 |
| **missing** | 0 |

### WF-1 — Buyer core (следующий)

| ID | Scope | Строки матрицы |
|----|-------|----------------|
| WF-1.1 | Catalog-browser: API tiles, personal categories, admin edit | `catalog-browser` | ✅ |
| WF-1.2 | Product detail: promotion request, parity tabs/CTA | `/product/:id` | ✅ |
| WF-1.3 | Cart → order (регрессии, edge cases) | `cart`, `my-orders` | ✅ |
| WF-1.4 | My orders actions polish | `my-orders` | ✅ |
| WF-1.5 | Notifications routing + read states | `notifications` | ✅ |

### WF-2 — Profile shell

| ID | Scope |
|----|-------|
| WF-2.1 | `/hub/overview` — баннер, stats, edit CTA, parity `MyProfilePage` | `overview`, `my-profile` | ✅ |

### WF-3 — Social / users

| ID | Scope | Mobile | Статус |
|----|-------|--------|--------|
| WF-3.1 | `/user-list` + `UserDetailsModal` + vote | `/users`, `/user/[id]` | ✅ |
| WF-3.2 | Data confirmation submit (native form) | `/hub/data-confirmation` | ✅ |
| WF-3.3 | Loyalty points purchase flow | `/hub/loyalty-points` | ✅ |
| WF-3.4 | `/seller/:userId` seller catalog | `/seller/[userId]` | ✅ |

### WF-4 — Seller promotions

| ID | Scope | Статус |
|----|-------|--------|
| WF-4.1 | `/hub/product-promotions` staff queue | ✅ |
| WF-4.2 | Product promotion request на детали (связка с WF-1.2) | ✅ |

### WF-5 — Stories

| ID | Scope | Статус |
|----|-------|--------|
| WF-5.1 | Create user story | ✅ |
| WF-5.2 | Report story (user) | ✅ |

### WF-6 — Admin CRUD gaps

| ID | Scope | Статус |
|----|-------|--------|
| WF-6.1 | Search synonyms create/edit | ✅ |
| WF-6.2 | Category tree CRUD | ✅ |
| WF-6.3 | App intro admin timing + preview | ✅ |
| WF-6.4 | Popular products curated lists edit | ✅ |
| WF-6.5 | Story reports в `product-reports` | ✅ |

### WF-7 — Deep links & polish

| ID | Scope | Mobile | Статус |
|----|-------|--------|--------|
| WF-7.1 | Deep links: seller, user profile | `parseAppDeepLink` | ✅ |
| WF-7.2 | Регрессионный чеклист по матрице | `docs/mobile-development.md` § WF-7.2 | ✅ |

### WF-7.2 — Регрессионный чеклист ✅

**Предусловия:** `server` на `:4444`, `mobile/.env` → LAN IP, dev client (не Expo Go). Аккаунты: гость, buyer, seller (premium для stories), staff (admin/moderator).

**DoD на экран:** `load` (spinner/error/retry) · `empty` · `guard` (роль/логин) · `actions` (основные CTA web).

#### Автоматика (ПК, перед Samsung)

```powershell
cd mobile
npm run typecheck
npm run regression:wf72
```

`regression:wf72` — маршруты `app/*`, hub cases в `HubSectionContent`, deep links (mirror `parseAppDeepLink`).

Samsung cold-open deep links:

```powershell
.\scripts\wf72-adb-deep-links.ps1 -ProductId <id> -RaffleId <id> -UserId <id> -SellerId <id>
```

#### Ручной прогон (Samsung / web dev client)

- [ ] `/(tabs)` — лента, curated lists, raffles strip, stories strip (+ create при premium)
- [ ] `/(tabs)/cart` — purchasable hints, checkout, redirect в orders
- [ ] `/(tabs)/profile` — hub menu, badges, staff sections по роли
- [ ] `/catalog-browser` — roots/children, personal categories, admin edit tile

#### Auth / профиль

- [ ] `/(auth)/login`, `/(auth)/register`
- [ ] `/profile/edit` — аватар (gallery), поля профиля
- [ ] `/hub/overview` — banner, stats, raffle CTA, edit profile
- [ ] `/hub/my-products` → `/create-product`, `/edit-product/[id]`
- [ ] `/hub/my-sales` — ship / deliver / cancel
- [ ] `/orders` — фильтр статуса, tap на товар, badge refresh
- [ ] `/hub/auction` — accept/reject offers
- [ ] `/hub/subscriptions`, `/hub/wishlist`
- [ ] `/hub/data-confirmation` — native passport + selfie upload
- [ ] `/hub/premium`, `/hub/loyalty-points`, `/hub/advertising`
- [ ] `/hub/installment-payments`, `/hub/installment-sales`

#### Social / stack

- [ ] `/product/[id]` — tabs, promotion modal (баллы), report, wishlist
- [ ] `/seller/[userId]` — infinite scroll, follow
- [ ] `/users`, `/user/[id]` — search, vote, follow, self → overview redirect
- [ ] Stories — viewer, report, delete own; create (+) при `canPublish`
- [ ] `/raffle/[id]`, `/hub/create-raffle`

#### Staff (moderator/admin)

- [ ] `/hub/product-moderation`, `/hub/intro-ad-moderation`, `/hub/seller-personal-category-moderation`
- [ ] `/hub/product-reports` — фильтр Все/Товары/Сторисы, resolve
- [ ] `/hub/raffles`, `/hub/product-promotions`, `/hub/data-confirmation-requests`
- [ ] `/hub/installment-disputes`
- [ ] `/hub/admin-orders`
- [ ] `/hub/search-synonyms-admin` — create/edit/delete
- [ ] `/hub/category-tree-admin` — create/edit/delete (+ reassign)
- [ ] `/hub/app-intro-admin` — timing, preview, save, replay
- [ ] `/hub/popular-products-admin` — lists CRUD, reorder, productIds
- [ ] `/hub/product-promotions` — pending queue, approve/reject, badge count

#### Уведомления / intro / legal

- [ ] `/notifications` — auto-read, routing по kind, cold-start из push
- [ ] `AppIntroSplash` — первый запуск, skip, replay из admin
- [ ] `/legal/privacy`

#### Deep links (`parseAppDeepLink`)

Проверить cold open (adb / ссылка в Notes):

| URL | Ожидание |
|-----|----------|
| `gitorg://product/<id>` | `/product/<id>` |
| `gitorg://raffle/<id>` | `/raffle/<id>` |
| `gitorg://seller/<userId>` | `/seller/<userId>` |
| `gitorg://user/<userId>` | `/user/<userId>` |
| `gitorg://users` / `gitorg://user-list` | `/users` |
| `https://gitorg.ru/product/<id>` | `/product/<id>` |
| `gitorg://hub/wishlist` | `/hub/wishlist` |
| `gitorg://orders` | `/orders` |

#### Samsung smoke (натив)

См. `mobile/docs/SAMSUNG-ANDROID-DEV.md` § Smoke — обязательно: SecureStore auth, image-picker (аватар, data-confirmation, story create), expo-video (product preview, stories, intro).

#### Известные пробелы (не блокируют WF)

_Нет открытых WF-пробелов._

## WS — Стили (design parity)

Порядок после WF: **WS-0 → WS-1…WS-6**. Источник токенов: `packages/design-tokens` (`@izibuy/design-tokens`), runtime: `mobile/shared/theme/AppThemeProvider.tsx`.

| ID | Scope | Статус |
|----|-------|--------|
| WS-0 | Theme helpers + shared UI primitives | ✅ |
| WS-1 | Tabs / profile hub chrome | ✅ |
| WS-2 | Catalog / product / home feed | ✅ |
| WS-3 | Forms (auth, edit, data-confirmation) | ✅ |
| WS-4 | Staff queues & moderation screens | ✅ |
| WS-5 | Modals & bottom sheets | ✅ |
| WS-6 | Dark mode audit + spacing/radius sweep | ✅ |

### WS-0 — Theme helpers + shared primitives ✅

**Цель:** убрать hardcoded `#666` / `#eee` / `#fff` из shared-слоя; единый паттерн themed styles.

| Артефакт | Путь |
|----------|------|
| `createThemedStyles` | `mobile/shared/theme/createThemedStyles.ts` |
| Staff queue styles | `mobile/shared/theme/staffQueueStyles.ts` |
| Staff admin styles | `mobile/shared/theme/staffAdminStyles.ts` |
| `AppButton` | `mobile/shared/ui/AppButton.tsx` |
| `ScreenLoadingState` / `ScreenErrorState` | `mobile/shared/ui/ScreenStates.tsx` |
| `StaffModerationActions` | `mobile/shared/ui/StaffModerationActions.tsx` |

**Паттерн:**

```ts
const useStyles = createThemedStyles((theme) => ({
  row: { borderBottomColor: theme.colors.border },
}));
```

**DoD WS-0:** shared primitives themed · `HubSectionPlaceholder` без `#111` · raffles/promotions staff на `useStaffQueueStyles` · docs WS матрица.

### WS-1 — Tabs / profile hub ✅

| Артефакт | Путь |
|----------|------|
| Profile tab screen | `mobile/app/(tabs)/profile.tsx` |
| Hub menu | `mobile/features/profile-hub/ui/ProfileHubMenu.tsx` |
| Chrome styles | `mobile/shared/theme/profileChromeStyles.ts` |
| Overview banner / info | `mobile/entities/user/ui/ProfileOverviewBanner.tsx`, `UserProfileInfoPanel.tsx` |
| Raffle seller panel | `mobile/features/profile-overview/ui/RaffleSellerOverview.tsx` |
| Tab bar badges | `mobile/app/(tabs)/_layout.tsx` |
| Profile stack header | `mobile/app/profile/_layout.tsx` |

Токены: `warningSurface/Border/Text`, `premium` в `packages/design-tokens/src/colors.ts`.  
`AppButton`: variants `contrast`, `outline`.

**DoD:** profile tab + hub menu + overview chrome без literal colors · dark mode на tab badges · themed stack header.

### WS-2 — Catalog / product / home ✅

| Артефакт | Путь |
|----------|------|
| Shared styles | `mobile/shared/theme/catalogProductStyles.ts` |
| Product entities | `mobile/entities/product/ui/*` |
| Catalog filter | `mobile/features/catalog-filter/ui/*` |
| Home feed sections | `mobile/features/home-feed/ui/{HomeFeaturedRafflesSection,HomeCuratedListsSection,UserStoriesStrip}.tsx` |
| Product detail | `mobile/app/product/[id].tsx`, `mobile/features/product-detail/ui/*` |
| Feed + cart | `mobile/app/(tabs)/index.tsx`, `mobile/app/(tabs)/cart.tsx` |

Токены: `actionSurface`, `star`, `starMuted`, `raffleSurface`, `raffleBorder`.

**DoD:** карточки/лента/детали без literal colors · dark-ready chips · admin edit modals → WS-5.

### WS-3 — Forms ✅

| Артефакт | Путь |
|----------|------|
| Shared form styles | `mobile/shared/theme/formChromeStyles.ts` |
| Auth | `mobile/app/(auth)/{login,register}.tsx`, `_layout.tsx` |
| Edit profile | `mobile/features/profile-edit/ui/EditProfileForm.tsx`, `app/profile/edit.tsx` |
| Checkout | `mobile/features/checkout/ui/CheckoutForm.tsx` |
| Address suggest | `mobile/entities/address/ui/AddressSuggestInput.tsx` |
| Data confirmation | `mobile/features/data-confirmation-page/ui/*` |
| Email verify modal | `mobile/features/email-verify/ui/EmailVerificationModal.tsx` |

**DoD:** `TextInput`/labels/errors/success/radio из `theme.colors` · `AppButton` для submit · dark-ready auth stack header.

### WS-4 — Staff queues ✅

| Артефакт | Путь |
|----------|------|
| Queue styles | `mobile/shared/theme/staffQueueStyles.ts` (`useStaffQueueStyles`, `useStaffFilterChipStyles`) |
| Admin CRUD styles | `mobile/shared/theme/staffAdminStyles.ts` |
| Moderation queues | `product-moderation`, `intro-ad-moderation`, `seller-personal-category-moderation`, `data-confirmation-requests` |
| Disputes / reports | `installment-disputes-page`, `product-reports-page` (+ `UserStoryReportGroupRow`) |
| Admin orders | `admin-orders-page` |
| Admin CRUD | `category-tree-admin`, `search-synonyms-admin`, `app-intro-admin`, `popular-products-admin` (+ `CuratedProductListAdminCard`) |

`AppButton`: variant `success` для dispute close.  
Disputes/reports reject → `AppButton` danger/primary/success.

**DoD:** staff/moderation/admin экраны без literal `#...` · filter/picker chips из `theme.colors` · shared queue row chrome.

### WS-5 — Modals ✅

| Артефакт | Путь |
|----------|------|
| Modal chrome styles | `mobile/shared/theme/modalChromeStyles.ts` |
| Report bottom sheets | `ReportProductModal`, `ReportUserStoryModal` |
| Story modals | `CreateUserStoryModal`, `UserStoryViewerModal` |
| Promotion | `ProductPromotionModal` |
| Admin edit sheets | `EditFeedTileDisplayModal`, `EditCategoryDisplayModal` |
| Already themed (WS-3) | `DataConfirmationRequestModal`, `EmailVerificationModal` |

Хуки: `useBottomSheetReportModalStyles`, `useCreateStoryModalStyles`, `useStoryViewerModalStyles`, `useAdminEditModalStyles`, `useProductPromotionModalStyles`.

**DoD:** modals без literal `#...` · `MODAL_BACKDROP_SCRIM` · `ActivityIndicator` → `theme.colors.onContrast`.

### WS-6 — Dark mode audit ✅

| Артефакт | Путь |
|----------|------|
| Themed pull-to-refresh | `mobile/shared/ui/ThemedRefreshControl.tsx` |
| Commerce / orders / cart | `mobile/shared/theme/commerceScreenStyles.ts` |
| Upload fields / add-to-cart | `mobile/shared/theme/uploadFieldStyles.ts` |
| Seller / advertising / auction | `mobile/shared/theme/sellerFlowStyles.ts` |
| Account / social / legal | `mobile/shared/theme/accountFeatureStyles.ts` |

`RefreshControl` → `ThemedRefreshControl` (tint `theme.colors.action`) во всех списках.  
Оставшиеся literal `#...` только в data-пресетах (`userBackgroundPresets`) и `app/+html.tsx` (web static).

**DoD:** UI-слой mobile без hardcoded palette · dark-ready lists refresh · WS матрица закрыта.

## Post-mobile — следующий фокус

WF + WS закрыты. Дальше по `docs/mobile-development.md`:

| Приоритет | Задача |
|-----------|--------|
| P0 | Samsung manual smoke § WF-7.2 (чеклисты `- [ ]`) |
| P0 | `eas build --profile preview` (MP § Store readiness) |
| P1 | Push ветки `security/p0-hardening` + review |
| P2 | MP backlog: push notifications, deep links universal links, GDPR delete account |

*WF ✅ · WS-0…WS-6 ✅ — стилевой слой mobile завершён.*


*Последнее обновление: июнь 2026.*
