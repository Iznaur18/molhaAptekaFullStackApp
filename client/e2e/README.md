# E2E (Playwright)

Требования: MongoDB (локально или CI service), Node 20+.

```bash
# один раз — Chromium
cd client
npx playwright install chromium

# миграции + фикстуры (если сервер не поднимает globalSetup сам)
cd ../server
npm run migrate:apply
npm run e2e:seed

# тесты (поднимут server + client, если ещё не запущены)
cd ../client
npm run test:e2e
```

## Сценарии

| Spec                            | Что проверяет                                                   |
| ------------------------------- | --------------------------------------------------------------- |
| `smoke.spec.js`                 | health, кнопка «Войти», `GET /product`                          |
| `catalog-cart.spec.js`          | вход → карточка в ленте → «В корзину» → `/basket`               |
| `seller-create-product.spec.js` | вход продавца → «Разместить товар» → дерево категорий → создать |

Фикстуры: `server/scripts/e2ePlaywrightSeed.js` (buyer, seller, approved товар в каталоге).

CI: `.github/workflows/e2e-playwright.yml` (Mongo 7 + migrate + Playwright).

`SKIP_E2E_SEED=1` — не пересоздавать фикстуры (если уже засеяли вручную).
