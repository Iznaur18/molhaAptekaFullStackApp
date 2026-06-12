# iziBuy Mobile

Expo + React Native. API — `../server/`, контракты — `@molha/api-contract`.

Roadmap: [`docs/mobile-development.md`](../docs/mobile-development.md)

## Требования

- Node.js 20+
- Dev UI: **web** (`w` в Metro)
- Dev native: **Samsung Android** — [`docs/SAMSUNG-ANDROID-DEV.md`](docs/SAMSUNG-ANDROID-DEV.md) (APK или USB + `npm run android:install`)
- Expo Go на Samsung **не используем** (SDK 56)
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
| `shared/lib/` | `resolveUploadedMediaUrl`, `formatApiErrorMessage` |
| `shared/config/` | env, тексты ошибок, staleTime |

## Скрипты

| Команда | Описание |
| ------- | -------- |
| `npm start` | Metro (Expo Go / web) |
| `npm run start:dev` | Metro для **dev client** после EAS build |
| `npm run android:install` | Сборка + установка на Samsung по USB (Android Studio) |
| `npm run build:dev:android` | EAS APK → sideload на Samsung |
| `npm run android` | эмулятор / устройство Android |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |

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
