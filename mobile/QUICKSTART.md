# iziBuy Mobile — шпаргалка запуска

> Полный roadmap: [`docs/clients/mobile-development.md`](../docs/clients/mobile-development.md)  
> Samsung / adb: [`docs/SAMSUNG-ANDROID-DEV.md`](docs/SAMSUNG-ANDROID-DEV.md)

## Перед каждым сеансом

1. ПК и телефон в **одной Wi‑Fi** (VPN off).
2. Узнать LAN IP ПК:

```powershell
ipconfig
# IPv4 Wi‑Fi, напр. 192.168.100.58
```

3. В `mobile/.env` — **LAN IP**, не `127.0.0.1`:

```env
EXPO_PUBLIC_API_URL=http://192.168.100.58:4444
```

4. Windows Firewall — разрешить **Node.js** на частной сети.

---

## Терминал 1 — API (обязательно)

```powershell
cd server
npm run start:dev
```

Проверка: `http://localhost:4444` открывается на ПК.

---

## Терминал 2 — Metro

```powershell
cd mobile
npm start
```

---

## Браузер (быстрый UI)

В терминале Metro нажми **`w`** → `http://localhost:8081`

Или сразу:

```powershell
cd mobile
npm run web
```

> Web не заменяет Samsung: нет SecureStore, image-picker, expo-video.

---

## Телефон по QR

**Expo Go не используем** (SDK 54 + dev-модули). Нужен **development build**.

### Один раз — установить dev APK на Samsung

**Путь A — EAS (без Android Studio):**

```powershell
cd mobile
npx eas-cli login
npm run build:dev:android
# скачать APK → установить на телефон
```

**Путь B — USB + Android Studio:**

```powershell
cd mobile
npm run android:install
```

### Каждый день — Metro + QR

```powershell
cd mobile
npm run start:dev
```

1. Открой на Samsung **iziBuy (dev build)** — не Expo Go.
2. Отсканируй QR из терминала или введи URL Metro вручную.

| Команда | Для чего |
| -------- | -------- |
| `npm start` | Metro + web (`w`) |
| `npm run start:dev` | Metro для **dev client** + QR на телефон |
| `npm run web` | Сразу в браузер |

---

## Если не работает

| Симптом | Что проверить |
| -------- | --------------- |
| API недоступен с телефона | `.env` → LAN IP; server запущен; та же Wi‑Fi |
| QR не подключается | `npm run start:dev`, не `npm start`; открыт dev build, не Expo Go |
| Завис EAS upload | VPN off; Node 20 LTS; подождать >5 мин после keystore |
| `adb` не найден | `%LOCALAPPDATA%\Android\Sdk\platform-tools` в PATH |

---

## Полезные команды

```powershell
cd mobile
npm run typecheck
npm run regression:wf72
npm run build:preview:android
```

Deep links на Samsung (нужен `adb`):

```powershell
cd mobile
.\scripts\wf72-adb-deep-links.ps1 -ProductId <id> -RaffleId <id> -UserId <id> -SellerId <id>
```
