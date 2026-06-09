# Мобильная разработка — iziBuy (iOS + Android)

**Главный документ** по нативному приложению. Опираемся на него при планировании и реализации.

**Связанные документы:**

- `server/docs/PRODUCTION-AND-ARCHITECTURE.md` — общая архитектура full-stack
- `server/docs/auth-session.md` — сессия и JWT
- `server/docs/MEDIA-OBJECT-STORAGE.md` — CDN и uploads
- `docs/deploy/DEPLOY.md` — prod-деплой
- `todo.md` — только web-задачи

---

## 1. Решение

| Параметр | Значение |
| -------- | -------- |
| Платформы | iOS + Android |
| Стек | Expo + React Native |
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
├── mobile/          # Expo + React Native (новый)
├── server/          # Express API
├── contract/        # Zod-схемы, общие типы
└── packages/        # позже: shared-api, shared-lib, design-tokens
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

**Решение для mobile (выбрать одно):**

| Вариант | Плюсы | Минусы |
| ------- | ----- | ------ |
| A) Server-only | проще, нет рассинхрона | нужен интернет |
| B) Local + sync как web | офлайн-добавление | сложнее, дублирование логики |

Рекомендация v1: **вариант A** или упрощённый B без offline.

---

## 8. API-слой mobile

```
mobile/src/
├── shared/api/       # apiClient, interceptors, parseApiContract
├── shared/lib/       # resolveMediaUrl, formatPriceRub, errors
├── entities/*/api/   # fetchCatalog, createOrder, ...
├── features/         # login-form, add-to-cart, ...
└── app/              # screens, navigation (Expo Router)
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

Env: `EXPO_PUBLIC_API_URL`

---

## 10. Порядок выполнения (фазы)

```
0 (репо) → 1 (server auth) → 2 (apiClient) → 3 (экраны)
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
- Bundle ID: напр. `ru.izibuy.app`

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
| Гостевой каталог | Решить: guest vs forced login |
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

## 15. Полезные команды (когда `mobile/` создан)

```bash
# из mobile/
npm install
npx expo start

# dev на устройстве
EXPO_PUBLIC_API_URL=http://192.168.x.x:4444 npx expo start

# сборка
npx eas build --platform all --profile preview
npx eas submit --platform ios
```

---

# Чеклист задач

> Стек: `mobile/` (Expo + React Native), API `server/`, контракты `contract/`.
> Дефолты v1: покупатель, каталог + карточка + корзина + заказ + профиль + auth.
> Staff/admin — только web. Push, deep links, биометрия — v2+.

## Фаза 0 — Инфра и репозиторий

- [ ] Создать `mobile/` через `create-expo-app` (TypeScript, Expo Router или React Navigation)
- [ ] Подключить `@molha/api-contract` (`file:../contract`)
- [ ] Настроить env: `EXPO_PUBLIC_API_URL` (dev / staging / prod)
- [ ] Структура FSD-lite: `app/`, `entities/`, `features/`, `shared/`
- [ ] ESLint + Prettier для `mobile/` (согласовать с корневым `package.json`)
- [ ] (Позже) npm workspaces: `client`, `mobile`, `contract`, `packages/shared-api`
- [ ] Документ `mobile/README.md`: запуск, env, сборка, отладка на устройстве

## Фаза 1 — Server: auth для мобилки

- [ ] Login/register: в JSON отдавать `{ accessToken, refreshToken }` (cookies оставить для web)
- [ ] `POST /auth/refresh`: принимать `{ refreshToken }` в body (cookie — fallback для web)
- [ ] `POST /auth/logout`: опционально инвалидация refresh по body
- [ ] Проверить `GET /auth/me` с `Authorization: Bearer`
- [ ] Обновить `server/docs/auth-session.md` и `contract/` (схемы auth-ответов)
- [ ] CORS: убедиться, что mobile origin не нужен (native ≠ browser CORS, но preflight для webview может понадобиться)

## Фаза 2 — Mobile: shared API слой

- [ ] `apiClient` на axios: Bearer из SecureStore, без `withCredentials`
- [ ] Interceptor 401 → refresh → retry (как в `client/src/shared/api/apiClient.js`)
- [ ] SecureStore: access + refresh (`expo-secure-store`)
- [ ] Парсинг ответов через `@molha/api-contract` / `parseApiContract`
- [ ] `resolveUploadedImageUrl` для RN (без `window.location.origin`, абсолютный API/media URL)
- [ ] Обработка сетевых ошибок (нет сети, таймаут) — единые тексты RU
- [ ] React Query: query keys, cache, staleTime (по аналогии с web)

## Фаза 3 — Mobile: экраны v1 (MVP)

- [ ] Splash + иконка приложения (1024×1024)
- [ ] Auth: Login, Register, Logout
- [ ] Email verify: in-app код (`POST /auth/verify-email`); ссылка из письма → deep link (v2) или web
- [ ] Каталог: лента/сетка товаров, пагинация, поиск (если есть в API)
- [ ] Категории: навигация по дереву категорий
- [ ] Карточка товара: фото, цена, описание, продавец
- [ ] Корзина: стратегия sync (server-only v1 или local+server)
- [ ] Checkout: экран адреса с DaData autocomplete
- [ ] Оформление заказа
- [ ] Профиль: данные пользователя, «Мои заказы»
- [ ] UGC: кнопка «Пожаловаться» на товар (App Store)
- [ ] Пустые состояния, лоадеры, ошибки на каждом экране
- [ ] Pull-to-refresh на списках

## Фаза 4 — Медиа и загрузки

- [ ] `expo-image` с кэшем для карточек товара
- [ ] Загрузка фото: `POST /upload` через FormData RN (`{ uri, name, type }`, HEIC)
- [ ] Видео-превью (если товары со stories/видео) — `expo-av` или WebView fallback
- [ ] Permissions: камера, галерея (`expo-image-picker`)

## Фаза 5 — Сборка и публикация

- [ ] Apple Developer Account ($99/год)
- [ ] Google Play Console ($25)
- [ ] Bundle ID / Application ID (напр. `ru.izibuy.app`)
- [ ] `eas.json`: профили development, preview, production
- [ ] EAS Build: iOS `.ipa`, Android `.aab`
- [ ] Internal testing: TestFlight + Google Internal testing
- [ ] Privacy Policy URL (обязательно для сторов)
- [ ] Скриншоты, описание, keywords RU/EN
- [ ] App Store review notes: модерация UGC, кнопка «Пожаловаться»
- [ ] `eas submit` → App Store Connect + Google Play
- [ ] Prod API на HTTPS с публичным доменом (`PUBLIC_UPLOAD_BASE_URL`)
- [ ] Dev: LAN API URL + Android cleartext / iOS ATS exceptions

## Фаза 6 — Наблюдаемость

- [ ] Sentry React Native (`@sentry/react-native`) — отдельный DSN или тег `platform:mobile`
- [ ] Логирование версии app + build number в Sentry breadcrumbs
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

*Последнее обновление: июнь 2026.*
