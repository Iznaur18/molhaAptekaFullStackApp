<!-- 2. Сделать подтверждение email адреса -->
<!-- Доработать подкатегории в дизайне -->
<!-- <!-- Сделать систему подарков как в ТГ -->
---
Сделать мини анимацию экрана open in | close интро при переходе между страницами, чтобы скрыть загрузки контента при переходах между экранами, скрыть плавной мягкой анимацией. Анимация должны быть такой, слева на право выходит темно синий экран по середине название "iziBuy" 0.5 секунду стоит на месте и идет дальше в правую сторону экрана

сделай новый Темный фон, с плавно перетикающим ярко-синим цветом по краям

Дизайн карточки переделать, описание карточки как будто поверх фото, при наведении, описание сползает вниз, а фото карточки увеличивается на всю карточку, как тут https://ru.pinterest.com/pin/269723465177738150/ или тут https://ru.pinterest.com/pin/702209766942403531/

2. [ ] Prod deploy — **когда будет VPS/домен** (`docs/deploy/DEPLOY.md`)
VPS/домен, env, Mongo RS, S3/uploads (docs/deploy/DEPLOY.md)
CI green на ветке с Query/AppShell

Feature flags: IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED, IS_PRODUCT_CATEGORY_TREE_PICKER_ENABLED, DaData rollout
Двойная система категорий (legacy enum + tree) — не сведена

P2 — Техдолг
Zod вместо express-validator (~40 validation-файлов)
Рефактор монстров: ProductCard, ProductDetailsModal, AppShellModalsLayer
useCatalogGridVirtualizer — хрупкость на mobile/resize
Design tokens вместо 115 разрозненных CSS

P3 — Тесты
E2e smoke расширен (частично)
Client unit tests (vitest) — libs + API + Query hooks + CheckoutForm/AddressDeliveryFields (`npm test` в client/)
Полный npm run test:e2e всех spec вместе
E2e: KYC approve staff, installment, raffle, reject moderation

