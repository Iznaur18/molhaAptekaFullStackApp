# EAS Dev Build — iziBuy mobile

APK для **Samsung** без Android Studio. Полный гайд: [`SAMSUNG-ANDROID-DEV.md`](SAMSUNG-ANDROID-DEV.md).

Первый нативный smoke на **SDK 54** (Expo Go не подходит).

## 1. Аккаунт Expo

```bash
cd mobile
npx eas-cli login
npx eas-cli whoami
```

## 2. Привязка проекта (один раз)

```bash
npx eas-cli build:configure
```

Добавит `extra.eas.projectId` в `app.json`.

## 3. LAN API в билде

В `eas.json` → профиль `development` → `env.EXPO_PUBLIC_API_URL` — **IPv4 Wi‑Fi ПК**, не `127.0.0.1`.

```powershell
ipconfig
```

Телефон и ПК — одна сеть. `server/` на `:4444`.

Альтернатива без пересборки при смене IP: [EAS Environment Variables](https://docs.expo.dev/eas/environment-variables/) + `eas env:push`.

## 4. Сборка

**Android (физ. устройство, APK):**

```bash
npm run build:dev:android
```

**iOS Simulator (нужен Mac / облачная очередь EAS):**

```bash
npm run build:dev:ios-simulator
```

**iOS устройство (Apple Developer):**

```bash
npm run build:dev:ios-device
```

Скачать артефакт: ссылка в терминале или [expo.dev](https://expo.dev) → Builds.

## 5. Запуск Metro для dev client

```bash
npm run start:dev
```

Открыть dev client на телефоне → QR / deep link. Не `expo start` без `--dev-client`.

## 6. Чеклист smoke

- [ ] Логин / регистрация
- [ ] Каталог, карточка, видео-превью
- [ ] Корзина → checkout → заказ
- [ ] Профиль → аватар upload
- [ ] Мои заказы → confirm/cancel

## Troubleshooting

| Проблема | Решение |
| -------- | ------- |
| [expo.dev/builds](https://expo.dev/accounts/iznaur18/projects/izibuy/builds) пусто | Билд не дошёл до очереди — CLI завис/упал **до** upload. `npx eas-cli build:list` тоже пустой |
| Зависло после `Generating keystore` | Нормально ждать 1–3 мин → должна появиться `Compressing project files`. Нет строки — VPN/firewall/antivirus, перезапуск терминала |
| `mobile/` не в git | EAS грузит только tracked files. `git add mobile/ contract/` + commit |
| `.easignore` не работает | Файл только в **корне monorepo** (`../.easignore`), не в `mobile/`. Без него upload ~130 MB вместо ~16 MB |
| `--non-interactive` + dirty tree | `$env:EAS_BUILD_AUTOCOMMIT=1` перед `npm run build:dev:android` |
| API unreachable | IP в `eas.json`, firewall Windows, `server` слушает `0.0.0.0` |
| `file:../contract` на EAS | `contract/` должен быть в git |
| Cleartext HTTP Android | `usesCleartextTraffic: true` в `app.json` (dev) |
| SDK mismatch | Только dev build, не Expo Go |

## Preview / Production

### Preview Android (P0)

Профиль `preview` в `eas.json`: internal APK, `EXPO_PUBLIC_API_URL=http://192.168.100.58:4444` (LAN этого стенда).

`app.json` → `"slug": "izibuy"` (должен совпадать с EAS projectId; display name остаётся Gitorg).

```powershell
cd mobile
npx eas-cli whoami
$env:EAS_BUILD_AUTOCOMMIT = "1"   # если dirty tree
npm run build:preview:android -- --non-interactive
```

Последний успешный preview (21.11.2026):

https://expo.dev/accounts/iznaur18/projects/izibuy/builds/22699959-cc4b-42bd-8c77-40fc7b65b825

После установки APK:

1. SHA-256 keystore → `client/public/.well-known/assetlinks.json` (`npx eas-cli credentials -p android`, см. `UNIVERSAL-APP-LINKS.md`).
2. Live App Links verify — только после деплоя well-known на `gitorg.ru`.

### Production

```bash
npm run build:production
```

Prod: задать `EXPO_PUBLIC_API_URL` и `EXPO_PUBLIC_UPLOAD_BASE_URL` на HTTPS в EAS secrets / `eas.json` production, не LAN.
