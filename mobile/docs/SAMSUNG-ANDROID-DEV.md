# Samsung Android — основной нативный тест

**Web** (`w` в Metro) — быстрый UI. **Samsung** — финальная проверка: SecureStore, image-picker, expo-video, жесты, сеть LAN.

Expo Go на Samsung **не используем** (SDK 54 ≠ Expo Go).

---

## Что нужно на ПК

| Компонент | Зачем |
| --------- | ----- |
| `server/` на `:4444` | API |
| `mobile/.env` → `EXPO_PUBLIC_API_URL=http://<LAN-IP>:4444` | Samsung не видит `127.0.0.1` |
| Телефон и ПК в одной Wi‑Fi | LAN |

```powershell
ipconfig
# IPv4, напр. 192.168.1.96 → в .env и eas.json (development)
```

---

## Путь A — без Android Studio (рекомендуем сначала)

Облачная сборка APK → установка на Samsung вручную.

```powershell
cd mobile
npx eas-cli login          # один раз
npx eas-cli build:configure # один раз → projectId в app.json
npm run build:dev:android
```

1. Скачай APK по ссылке из терминала / [expo.dev](https://expo.dev) → Builds.
2. Перекинь на Samsung (USB / Telegram / Drive).
3. **Настройки → Безопасность** → разреши установку из неизвестных источников (для Files / Chrome).
4. Установи **iziBuy (development build)**.

Запуск JS-бандла:

```powershell
cd mobile
npm run start:dev
```

На Samsung открой установленное приложение → подключится к Metro (QR / LAN). ПК и телефон — одна сеть; Windows Firewall — разреши Node на частных сетях.

**Плюсы:** не нужен Android SDK. **Минусы:** пересборка APK при смене нативных модулей (~15–20 мин в очереди EAS).

---

## Путь B — Samsung по USB (быстрые итерации)

Нужны [Android Studio](https://developer.android.com/studio) + Platform Tools (`adb`).

### Samsung: отладка по USB

1. **Настройки → О телефоне** → 7× тап «Номер сборки» → режим разработчика.
2. **Настройки → Параметры разработчика** → **Отладка по USB** — вкл.
3. USB-кабель → режим **Передача файлов** (не «Только зарядка»).
4. На телефоне подтверди «Разрешить отладку с этого компьютера».

Проверка на ПК:

```powershell
adb devices
# должно быть: XXXXX    device
```

Если `adb` не найден — добавь в PATH:

`%LOCALAPPDATA%\Android\Sdk\platform-tools`

### Первая локальная сборка

```powershell
cd mobile
npm run android:install
```

Скрипт: `expo run:android --device` — соберёт dev client, поставит на подключённый Samsung, поднимет Metro.

Дальше только JS:

```powershell
npm run start:dev
```

Открой iziBuy на телефоне.

### Беспроводная отладка (Samsung, Android 11+)

**Параметры разработчика → Отладка по Wi‑Fi** → спарить с `adb pair` / `adb connect` (IP:порт с экрана телефона). Удобно без кабеля после первой настройки.

---

## Smoke на Samsung (чеклист)

- [ ] Каталог, скролл, pull-to-refresh
- [ ] Карточка товара + **видео-превью** (expo-video)
- [ ] Логин → корзина → checkout (DaData адрес)
- [ ] Профиль → **аватар** (галерея Samsung)
- [ ] Мои заказы → confirm / cancel
- [ ] «Пожаловаться» на товар

Баги фиксируем под Samsung; web — регрессия.

---

## Troubleshooting Samsung

| Симптом | Решение |
| ------- | ------- |
| Network Error / API | IP в `.env`, не `localhost`; firewall; `server` запущен |
| Metro не коннектится | `npm run start:dev`, одна Wi‑Fi, отключи VPN |
| Cleartext HTTP blocked | `usesCleartextTraffic: true` в `app.json` (уже есть) |
| Галерея / камера | Разрешение при первом выборе аватара |
| Видео не играет | Проверь URL `/uploads/...` с LAN; fallback на фото |
| Expo Go вместо dev client | Удали Expo Go с теста; ставь только наш APK / `run:android` |
| `adb devices` пусто | Кабель, режим передачи файлов, драйвер Samsung USB |

---

## Решения по платформам (зафиксировано)

| Задача | Web | Samsung |
| ------ | --- | ------- |
| Верстка, навигация | ✅ первично | smoke |
| Auth, API, корзина | ✅ | ✅ обязательно |
| expo-image-picker / upload | ограничено | ✅ эталон |
| expo-video | браузер | ✅ эталон |
| Релиз в стор | — | Google Play (`.aab`, preview APK) |

iOS — позже (EAS / Mac). **v1 натив: Samsung + Google Play.**
