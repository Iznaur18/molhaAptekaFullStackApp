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

| Spec                                    | Что проверяет                                                            |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `smoke.spec.js`                         | health, главная, гость из профиля попадает на `/login`, `GET /product`   |
| `catalog-cart.spec.js`                  | вход → поиск (Enter) → карточка → «В корзину» → `/basket`                |
| `seller-create-product.spec.js`         | вход продавца → мастер из 8 шагов (категория … проверка) → создать       |
| `upload-image.spec.js`                  | вход (buyer) → «Изменить профиль» → аватар с кадрированием → `/uploads/` |
| `product-manage-toggle-display.spec.js` | модератор → админка кнопок → upload (показ artwork продавцу — `fixme`)   |
| `query-profile-smoke.spec.js`           | Query-вкладки профиля + derive action-count vs list API                  |
| `query-mutations-smoke.spec.js`         | checkout самовывозом, moderation approve, story upload, KYC submit       |
| `catalog-virtualizer-mobile.spec.js`    | mobile/Pixel: виртуализация каталога (scroll, resize, portrait lock)     |

Фикстуры: `server/scripts/e2ePlaywrightSeed.js` (buyer, seller, moderator, kyc-buyer, approved + pending товары, **105 virtual catalog** для virtualizer e2e). Товарам сид даёт точку самовывоза, продавцу — «Доставка и оплата» с регионом (новый товар следует профилю: регион по адресу без DaData не определить) и безлимит товаров (иначе 107 сид-товаров упираются в лимит 50). Товары, созданные тестом через мастер, сид удаляет — иначе они висят в очереди модерации.

Подводные камни:

- мутации из `APIRequestContext` шлют заголовок `Origin` (`helpers/api.js`) — без него сервер отвечает 403;
- пока покупатель не забрал дневную скидку, fixed-плашка «Скидка за возвращение» перекрывает кнопки внизу экрана — тесты забирают её через `claimPromoReturnStreak`;
- локально порты и браузер переопределяются: `E2E_API_PORT`, `E2E_CLIENT_PORT`, `E2E_BROWSER_CHANNEL=chrome`.

CI: `.github/workflows/e2e-playwright.yml` (Mongo 7 + migrate + Playwright).

`SKIP_E2E_SEED=1` — не пересоздавать фикстуры (если уже засеяли вручную).
