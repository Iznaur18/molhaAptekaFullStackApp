# План горизонтали: когда одного VPS мало

Базовый деплой сейчас: **вариант A** — один VPS, nginx (SPA + proxy API), Node Express, MongoDB Atlas или RS, медиа S3/CDN. См. [`docs/deploy/DEPLOY.md`](../../docs/deploy/DEPLOY.md).

Документ — **когда масштабировать**, **в каком порядке**, **что менять в коде**. Не «переписать всё в k8s».

---

## 0. Текущие ограничения кодовой базы

| Компонент | Сейчас | Блокер для N инстансов API |
|-----------|--------|----------------------------|
| Rate limit | `express-rate-limit` in-memory | лимиты на инстанс, не глобально → **Redis store** |
| Cron | `setInterval` в `server/index.js` (stories, installment, premium) | дублируется на каждом процессе → **один worker** или **distributed lock** |
| Сессии | JWT в httpOnly cookie, stateless | ✅ горизонталь API без sticky sessions |
| Заказы / баллы | Mongo **transactions** (`mongoTransaction.js`) | только **primary**; replica — read-only |
| Upload | S3 + CDN (`UPLOAD_STORAGE=s3`) | ✅ shared storage |
| Upload disk | `server/uploads/` на VPS | ❌ нужен S3 до второго API |
| Каталог | aggregate без `$lookup` orders | `soldQuantity` денорм на Product |

---

## 1. Сигналы «пора» (метрики)

Смотреть **7 дней p95**, не разовые пики.

| Метрика | Жёлтая зона | Красная (действовать) |
|---------|-------------|------------------------|
| CPU VPS (sustained) | > 60% | > 80% 15+ мин |
| RAM Node | > 70% | OOM / restart systemd |
| `GET /product` p95 | > 800 ms | > 2 s |
| `POST /order` p95 / ошибки | > 1.5 s | таймауты, write conflict |
| Mongo **primary** CPU | > 50% | > 75%, `Slow Query` в Atlas |
| Mongo connections | > 70% pool | exhausted |
| nginx 502/504 | редкие | регулярные при деплое/пике |
| Disk (если uploads на VPS) | > 70% | > 85% |

Инструменты: `/health`, Sentry, Atlas Performance Advisor, `journalctl -u izibuy-api`, `npm run explain:queries`.

---

## 2. Лестница масштабирования (порядок)

Делать **снизу вверх**. Каждый шаг — отдельный релиз/чеклист.

```
[1] Вертикаль VPS + индексы + CDN     ← вы здесь после марафона §6
[2] Mongo Atlas tier / disk IOPS
[3] Разделить статику (CDN) и API (уже частично при S3)
[4] 2+ API за nginx + Redis (rate limit + cron leader)
[5] Read replica для тяжёлого read (каталог)
[6] Очередь фоновых задач (email, denorm, cron)
[7] Отдельный worker-процесс / сервис
```

### Шаг 1 — без горизонтали (дешево)

- Увеличить VPS (CPU/RAM).
- `migrate:apply` + [`MONGO-INDEXES-AUDIT.md`](MONGO-INDEXES-AUDIT.md).
- `UPLOAD_STORAGE=s3`, `PUBLIC_UPLOAD_BASE_URL` = CDN.
- Кэш nginx на `/assets/` (уже в example).
- Отключить тяжёлые sort (`purchases`/`views`) по умолчанию или лимит `page` (продуктовое решение).

**Когда хватает:** до ~50–100 RPS read, <5k DAU на одном 2–4 vCPU — часто достаточно.

### Шаг 2 — Mongo

- Atlas: поднять tier, включить **Auto Scale** (compute), проверить регион ближе к VPS.
- Уже нужен **replica set** (транзакции заказов) — не standalone.
- Read replica на Atlas = следующий шаг (см. §4), не путать с «просто RS для транзакций».

### Шаг 3 — nginx: несколько upstream API

```nginx
upstream izibuy_api {
    server 127.0.0.1:4444;
    server 127.0.0.1:4445;  # второй systemd unit / PM2 instance
    keepalive 32;
}
```

**Перед этим обязательно:**

1. Redis + `rate-limit-redis` (см. [`RATE-LIMIT-AUDIT.md`](RATE-LIMIT-AUDIT.md) v2).
2. Cron только на одном инстансе:

```js
// v2: CRON_LEADER=true только на izibuy-api@1
if (process.env.CRON_LEADER === "true") {
  setInterval(...);
}
```

или вынести cron в `izibuy-worker.service`.

3. S3 для медиа (не локальный disk).

Sticky sessions **не нужны** (JWT stateless).

### Шаг 4 — Read replica (каталог / списки)

**Кандидаты на secondary** (eventual consistency OK):

| Запрос | Риск |
|--------|------|
| `GET /product` (листинг) | товар только что одобрен — задержка 1–2 с |
| `GET /product/moderation/pending` | лучше **primary** (очередь staff) |
| `GET /order`, `POST /order` | **только primary** |
| `GET /order/sales` | можно secondary с lag monitor |

Реализация v2:

```js
// mongoose second connection
const readConn = mongoose.createConnection(process.env.MONGO_URI_READ);
// ProductReadModel = readConn.model('Product', ProductSchema)
```

`MONGO_URI_READ` = Atlas «read preference secondary» connection string или dedicated analytics node.

**Не** читать корзину/заказы с secondary без явного решения по lag.

### Шаг 5 — Очередь задач

Когда появляется:

- массовые email (verify, уведомления);
- denorm `soldQuantity`, search blob rebuild;
- экспорт / отчёты staff;
- повтор cron при падении инстанса.

| Вариант | Плюсы | Минусы |
|---------|-------|--------|
| **BullMQ + Redis** | retries, delay, dashboard (Bull Board) | Redis ещё один сервис |
| Inngest / Trigger.dev | managed, durable | vendor, $ |
| Mongo as queue (cap collection) | без Redis | хуже UX ops, не брать для v1 |

**v1 очереди (минимум):**

| Job | Триггер | Примечание |
|-----|---------|------------|
| `expireProductPromotions` | cron 5 min | `index.js` (`PRODUCT_PROMOTION_CRON_INTERVAL_MS`) |
| `expireStaleUserStories` | cron | уже interval |
| `processInstallmentCronTasks` | cron | уже interval |
| `processPremiumCronTasks` | cron | уже interval |
| `sendEmailVerification` | POST register | async, retry SMTP |
| `rebuildProductSearchBlob` | PATCH product | debounce bulk |

API: `queue.add('job', payload)` → HTTP 202 или fire-and-forget; worker — отдельный `node server/worker.js`.

### Шаг 6 — Выделенный worker VPS

```
[LB/nginx] → API x N (stateless)
                ↓
            Redis (rate limit + queue)
                ↓
         Worker x 1 (cron + BullMQ consumer)
                ↓
         Mongo primary (+ optional read replica)
         S3/CDN
```

SPA остаётся на CDN/nginx; API можно на меньших инстансах без cron.

---

## 3. Что **не** делать рано

- Kubernetes до 2+ VPS и боли с деплоем.
- Шардирование Mongo.
- Микросервисы (order-service, catalog-service) — монолит Express тянет долго.
- GraphQL / BFF только ради масштаба.
- Read replica без Redis rate limit на 2 API — получите 2× лимит и 2× cron.

---

## 4. Чеклист перед вторым инстансом API

- [ ] `UPLOAD_STORAGE=s3`
- [ ] Redis (Managed: Upstash / Atlas не даёт Redis — отдельный VPS или Upstash)
- [ ] `rate-limit-redis` подключён
- [ ] `npm run start:worker` (BullMQ cron + email consumer при `REDIS_URL`)
- [ ] Health check nginx только на живые upstream
- [ ] Sentry + alert на p95 `/product`, `/order`
- [ ] Load test (k6): 50 concurrent catalog + 10 checkout

---

## 5. Оценка ёмкости одного VPS (ориентир)

| Профиль | Один API 2 vCPU | Комментарий |
|---------|-----------------|-------------|
| Каталог read | ~30–80 req/s | при индексах; aggregate purchases/views — ниже |
| Checkout write | ~5–15 req/s | транзакции + stock |
| Upload | ~2–5 req/s | 5 МБ, CPU + S3 latency |

Узкое место чаще **Mongo primary** или **aggregate catalog**, не nginx.

---

## 6. Roadmap в коде (backlog)

| ID | Задача | Шаг лестницы |
|----|--------|--------------|
| H-1 | ~~Redis rate limit store~~ ✅ `REDIS_URL` + `rate-limit-redis` | 4 |
| H-2 | `CRON_LEADER` / `worker.js` | 4 |
| H-3 | ~~`MONGO_URI_READ` + read models для `GET /product`~~ ✅ | 5 |
| H-4 | ~~BullMQ + вынести email/cron из request path~~ ✅ `queues/`, `worker.js` | 5–6 |
| H-5 | ~~Денорм `soldQuantity` на Product~~ ✅ поле + sync + миграция `20260612` | 1–5 |
| H-6 | ~~Убрать `expireProductPromotions` из hot path `getProducts`~~ ✅ cron в `index.js` | 1 |

---

## 7. Связанные документы

- [`PRODUCTION-AND-ARCHITECTURE.md`](PRODUCTION-AND-ARCHITECTURE.md)
- [`MONGO-INDEXES-AUDIT.md`](MONGO-INDEXES-AUDIT.md)
- [`RATE-LIMIT-AUDIT.md`](RATE-LIMIT-AUDIT.md)
- [`RUNBOOK.md`](RUNBOOK.md)
- [`production-checklist.md`](production-checklist.md)
