# E2E smoke (Playwright)

Требования: MongoDB локально (как для `server` dev), Node 20+.

```bash
# один раз — браузер Chromium
cd client
npx playwright install chromium

# тесты (поднимут server + client, если ещё не запущены)
npm run test:e2e
```

Проверяет:

1. `GET /health` — mongo connected  
2. Главная — кнопка «Войти»  
3. `GET /product` — публичный каталог  

Если dev-серверы уже работают — `reuseExistingServer: true` их переиспользует.
