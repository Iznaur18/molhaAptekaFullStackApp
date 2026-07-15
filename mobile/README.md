# iziBuy Mobile

Expo + React Native. API — `../server/`, контракты — `@molha/api-contract`.

Roadmap: [`docs/mobile-development.md`](../docs/mobile-development.md) · Buyer path (G.3): [`docs/BUYER-CRITICAL-PATH.md`](docs/BUYER-CRITICAL-PATH.md) · Staff → web (G.1): [`docs/STAFF-WEB-ONLY.md`](docs/STAFF-WEB-ONLY.md)

## Требования

- Node.js 20+
- Dev UI: **web** (`w` в Metro)
- Dev native: **Samsung Android** — [`docs/SAMSUNG-ANDROID-DEV.md`](docs/SAMSUNG-ANDROID-DEV.md) (APK или USB + `npm run android:install`)
- Expo Go на Samsung **не используем** (SDK 54)
- Запущенный `server/` на порту **4444**

## Установка

```bash
cd mobile
npm install
cp .env.example .env
# отредактируй EXPO_PUBLIC_API_URL — LAN IP хоста, не 127.0.0.1
```

Узнать IP на Windows:

```powershell
ipconfig
# IPv4 твоей Wi‑Fi сети, напр. 192.168.1.10
```

## Запуск

```bash
npm start
```

Для быстрой проверки: `w` → `http://localhost:8081`. Нативный smoke — **EAS dev build** → [`docs/EAS-DEV-BUILD.md`](docs/EAS-DEV-BUILD.md).

PowerShell с env без `.env`:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:4444"
npm start
```

## Структура (FSD-lite)

| Папка | Назначение |
| ----- | ---------- |
| `app/` | Expo Router — экраны и навигация |
| `entities/session/` | auth API, mutations, `useAuthSessionQuery` |
| `entities/product/` | каталог API, `ProductCard`, infinite query |
| `entities/cart/` | `GET/PUT /cart`, server-only, badge |
| `features/cart-add/` | `AddToCartButton` на карточке товара |
| `features/checkout/` | оформление заказа в корзине |
| `features/catalog-filter/` | поиск и chips категорий |
| `entities/address/` | DaData suggest |
| `entities/order/` | `POST /order`, `GET /order` (мои заказы) |
| `features/email-verify/` | подтверждение email in-app |
| `app/orders/` | экран «Мои заказы» |
| `shared/api/` | `apiClient`, SecureStore, query keys |
| `shared/lib/` | `@izibuy/shared-lib` (formatters, upload URL) + `resolveUploadedMediaUrl` |
| `shared/config/` | env, тексты ошибок, staleTime |

## Buyer-critical path (G.3)

Приоритет mobile: **каталог → карточка → корзина → заказ → профиль**. Staff — web only (§ Staff inventory).

| Шаг | Route | Ключевой код |
| --- | ----- | ------------ |
| Каталог | `/(tabs)/index`, `/(tabs)/catalog` | `fetchCatalogProductsPage`, `ProductCard` |
| Карточка | `/product/[id]` | `fetchCatalogProductById`, `AddToCartButton` |
| Корзина | `/(tabs)/cart` | `fetchMyCart`, `replaceMyCart`, `CheckoutForm` |
| Заказ | `/orders` (после checkout) | `createOrder`, `fetchMyOrders` |
| Профиль | `/(tabs)/profile`, `/profile/edit` | `fetchAuthMe`, `useAuthSessionQuery` |

Подробно: [`docs/BUYER-CRITICAL-PATH.md`](docs/BUYER-CRITICAL-PATH.md)

```bash
npm run regression:wf72      # статика wiring
npm run smoke:buyer-path     # API smoke (server + e2e seed)
```

## Staff inventory (G.2 — maintenance only)

С **G.1** пункты staff в hub-меню открывают **web SPA** (`openProfileStaffWebSection`). Код ниже — **legacy in-app**, не расширять; баги — P3, фикс только если ломает buyer-path. Новые staff-фичи — только `client/`.

| Section ID | Feature / экран | Роль | Web path (G.1) |
| ---------- | ---------------- | ---- | -------------- |
| `create-raffle` | `features/create-raffle-page` | moderator | **in-app** (`/hub/create-raffle`) |
| `product-moderation` | `features/product-moderation-page` | moderator | `/moderation-products` |
| `intro-ad-moderation` | `features/intro-ad-moderation-page` | moderator | `/moderation-intro-ad` |
| `seller-personal-category-moderation` | `features/seller-personal-category-moderation-page` | moderator | `/moderation-seller-categories` |
| `product-reports` | `features/product-reports-page` (+ story reports) | moderator | `/product-reports` |
| `product-promotions` | `features/product-promotions-staff-page` | moderator | `/product-promotions` |
| `raffles` | `features/raffles-staff-page` | moderator | `/staff-raffles` |
| `data-confirmation-requests` | `features/data-confirmation-requests-page` | moderator | `/data-confirmation-requests` |
| `installment-disputes` | `features/installment-disputes-page` | moderator | `/installment-disputes` |
| `admin-orders` | `features/admin-orders-page` | admin | `/admin-orders` |
| `search-synonyms-admin` | `features/search-synonyms-admin-page` | admin | `/search-synonyms-admin` |
| `category-tree-admin` | `features/category-tree-admin-page` | admin | `/category-tree-admin` |
| `app-intro-admin` | `features/app-intro-admin-page` | admin | `/app-intro-admin` |
| `popular-products-admin` | `features/popular-products-admin-page` | admin | `/profile/popular-products-admin` |

**Связанный legacy-код (не hub, тоже maintenance):**

| Область | Путь | Назначение |
| ------- | ---- | ---------- |
| Hub wiring | `features/profile-hub/ui/HubSectionContent.tsx` | switch staff → legacy pages (обходится G.1 redirect) |
| Badge API | `features/profile-hub/api/staffBadgeApi.ts` | счётчики staff в меню |
| Каталог admin UI | `features/catalog-browser/ui/EditCategoryDisplayModal.tsx`, `EditFeedTileDisplayModal.tsx` | правка отображения категорий/плиток (admin) |
| Shared UI | `shared/ui/StaffModerationActions.tsx`, `shared/theme/staffQueueStyles.ts` | кнопки очередей |
| Entities | `entities/*/…Staff*.ts`, `*Moderation*.ts`, `*Admin*.ts` | API + mutations для таблиц выше |

**Активная разработка mobile:** buyer/seller trade (`my-products`, `create-product`, корзина, заказы, каталог, профиль) — см. §6 audit [`docs/client-mobile-consolidation-audit.md`](../docs/client-mobile-consolidation-audit.md).

## Скрипты

| Команда | Описание |
| ------- | -------- |
| `npm start` | Metro (Expo Go / web) |
| `npm run start:dev` | Metro для **dev client** после EAS build |
| `npm run android:install` | Сборка + установка на Samsung по USB (Android Studio) |
| `npm run build:dev:android` | EAS APK → sideload на Samsung |
| `npm run android` | эмулятор / устройство Android |
| `npm run lint` | ESLint |
| `npm run regression:wf72` | static regression (routes, hub, deep links, upload wiring) |
| `npm run smoke:buyer-path` | API smoke buyer path (G.3) |

## Dev-заметки

- **Windows:** iOS Simulator недоступен → iPhone + Expo Go или EAS Build (облако).
- **HTTP на Android:** cleartext для LAN — понадобится dev build (фаза 5); Expo Go обычно ок для `http://192.168.x.x`.
- **Auth:** Bearer + SecureStore + auto-refresh при 401. Экран логина — фаза 3.

## Сборка (фаза 5)

```bash
npm install -g eas-cli
eas login
eas build:configure   # один раз, если проект не привязан к Expo
eas build --platform android --profile development
eas build --platform android --profile preview
eas build --platform all --profile production
```

Профили в `eas.json`: `development` (dev client), `preview` (internal APK), `production` (AAB/IPA).

Перед prod: `EXPO_PUBLIC_API_URL` и `EXPO_PUBLIC_UPLOAD_BASE_URL` на HTTPS в EAS secrets.
