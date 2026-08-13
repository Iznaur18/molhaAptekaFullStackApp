# Скриншоты и листинг для сторов

## Быстрый старт

```powershell
# 1. Запущены server + mobile web
cd server; npm run start:dev
cd mobile; npm run web

# 2. Feature graphic (Google Play 1024×500)
npm run generate:store-feature-graphic

# 3. Авто-скриншоты гостевых экранов (Playwright)
npx playwright install chromium   # один раз
npm run capture:store-screenshots
```

Результат: `mobile/store-assets/`

## Размеры

| Платформа | Папка | Размер (px) | Кол-во |
|-----------|-------|-------------|--------|
| **Google Play** | `phone-9x16-google/` | 1080×1920 (9:16) | 2–8 |
| **Google Play** | `google-play/feature-graphic-1024x500.png` | 1024×500 | 1 обяз. |
| **App Store** | `phone-6.7-apple/` | 1290×2796 (6.7") | мин. 3 |
| **Обе** | `icon.png` | 1024×1024 | уже в `assets/images/` |

## Авто-скриншоты (гость)

Скрипт `capture-store-screenshots.mjs` снимает:

1. `01-catalog` — каталог
2. `02-product` — карточка (первый товар из API)
3. `03-cart-guest` — корзина без входа
4. `04-login` / `05-register`
5. `06-profile-guest`
6. `07-privacy`

Env (опционально):

```env
STORE_SCREENSHOT_WEB_URL=http://localhost:8081
STORE_SCREENSHOT_API_URL=http://127.0.0.1:4444
```

## Вручную (после логина)

Для полного листинга добавь 2–3 скрина с аккаунтом:

| Экран | Как |
|-------|-----|
| Корзина с товарами | Войти → добавить товар → `/cart` |
| Checkout | В корзине, блок оформления |
| Мои заказы | Профиль → Мои заказы |

**Samsung / APK:** `adb exec-out screencap -p > store-assets/phone-9x16-google/08-cart-auth.png`

**iOS Simulator:** Cmd+S или `xcrun simctl io booted screenshot …`

## Тексты листинга

Готовые шаблоны RU:

- `store-assets/listing/google-play-ru.txt`
- `store-assets/listing/app-store-ru.txt`

Замени `https://ВАШ-ДОМЕН` и `iznaur.guzhaev@mail.ru` перед публикацией.

## Чеклист перед загрузкой

- [ ] Иконка 1024×1024
- [ ] Feature graphic 1024×500 (Google)
- [ ] ≥2 скрина 9:16 (Google)
- [ ] ≥3 скрина 6.7" (Apple)
- [ ] Privacy Policy URL живой
- [ ] Скрины без личных данных тестового аккаунта (или тестовый никнейм)
