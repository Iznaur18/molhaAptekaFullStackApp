/**
 * Диагностика Web Push.
 *
 *   cd server && node scripts/diagnoseWebPush.mjs
 *   cd server && node scripts/diagnoseWebPush.mjs --send <userIdOrEmail>
 *
 * --send шлёт тестовый системный пуш одному юзеру (если есть подписка).
 */
import "dotenv/config";
import mongoose from "mongoose";
import webpush from "web-push";

import { UserModel } from "../models/index.js";
import { sendWebPushToUser } from "../services/user/webPushNotifications.js";

const args = process.argv.slice(2);
const sendIdx = args.indexOf("--send");
const sendTarget = sendIdx >= 0 ? args[sendIdx + 1] : null;

const pub = process.env.VAPID_PUBLIC_KEY?.trim() ?? "";
const priv = process.env.VAPID_PRIVATE_KEY?.trim() ?? "";
const sub = process.env.VAPID_SUBJECT?.trim() ?? "";

const line = (ok, text) => console.log(`${ok ? "OK  " : "FAIL"} ${text}`);

console.log("\n=== 1) VAPID env ===");
line(pub.length >= 80, `VAPID_PUBLIC_KEY len=${pub.length}`);
line(priv.length >= 40, `VAPID_PRIVATE_KEY len=${priv.length}`);
line(/^mailto:|^https:\/\//i.test(sub), `VAPID_SUBJECT=${sub || "(empty)"}`);
try {
  webpush.setVapidDetails(sub || "mailto:support@gitorg.ru", pub, priv);
  line(true, "web-push accepts key pair");
} catch (e) {
  line(false, `web-push reject: ${e instanceof Error ? e.message : e}`);
}

const mongoUri = process.env.MONGO_URI?.trim();
if (!mongoUri) {
  line(false, "MONGO_URI missing");
  process.exit(1);
}

await mongoose.connect(mongoUri);
console.log("\n=== 2) Users with webPushSubscriptions ===");

const withSubs = await UserModel.find({ "webPushSubscriptions.0": { $exists: true } })
  .select("userEmail userName notificationsEnabled isActiveUser isBlockedUser webPushSubscriptions")
  .lean();

if (withSubs.length === 0) {
  line(false, "Ни у кого нет webPushSubscriptions в Mongo");
  console.log(`
Почему так часто бывает:
  • Открыли сайт с телефона как http://192.168.x.x:5173 — Push API ЗАПРЕЩЁН (не HTTPS).
  • На ПК надо: http://127.0.0.1:5173 (не localhost иногда ок, у вас редирект на 127.0.0.1).
  • В профиле не нажали «Push на устройство → Включить» / браузер не дал permission.
  • После «Включить» должен уйти PUT /auth/me/web-push-subscription → 200.

Чёткий чеклист на ПК:
  1) API запущен (порт 4444), VAPID в .env, API перезапущен.
  2) Открыть ТОЛЬКО http://127.0.0.1:5173
  3) Залогиниться тем же юзером, кому шлёте.
  4) Профиль → Push на устройство → Включить → статус «Включены».
  5) F12 → Application → Service Workers → /sw.js activated.
  6) F12 → Application → Notifications → permission=granted.
  7) F12 → Network → PUT .../web-push-subscription → 200.
  8) Снова: node scripts/diagnoseWebPush.mjs  (должен показать подписку).
  9) node scripts/diagnoseWebPush.mjs --send <email или userId>
  10) Баннер сверху на ПК.

Телефон (web):
  • LAN http://192.168.x.x — НЕ сработает никогда.
  • Нужен HTTPS (прод gitorg.ru) или туннель (ngrok/cloudflared) на https://...
  • iOS: сначала «На экран Домой», потом разрешение.
`);
} else {
  line(true, `Подписок у пользователей: ${withSubs.length}`);
  for (const u of withSubs) {
    const n = Array.isArray(u.webPushSubscriptions) ? u.webPushSubscriptions.length : 0;
    console.log(
      `  - id=${u._id} email=${u.userEmail ?? "—"} name=${u.userName ?? "—"} subs=${n} notifEnabled=${u.notificationsEnabled} active=${u.isActiveUser} blocked=${u.isBlockedUser}`,
    );
  }
}

if (sendTarget) {
  console.log("\n=== 3) Send test push ===");
  const query = mongoose.isValidObjectId(sendTarget)
    ? { _id: sendTarget }
    : { userEmail: String(sendTarget).trim().toLowerCase() };
  const user = await UserModel.findOne(query)
    .select("_id userEmail webPushSubscriptions notificationsEnabled")
    .lean();
  if (!user) {
    line(false, `User not found: ${sendTarget}`);
  } else {
    const n = user.webPushSubscriptions?.length ?? 0;
    line(n > 0, `target=${user._id} email=${user.userEmail} subs=${n}`);
    if (n > 0) {
      await sendWebPushToUser(String(user._id), {
        title: "Gitorg test",
        body: "Тестовый системный пуш — если видишь это, цепочка ок",
        url: "/notifications",
        data: { kind: "staff_broadcast" },
      });
      line(true, "sendWebPushToUser вызван (смотри баннер ОС / Focus Assist)");
    }
  }
}

await mongoose.disconnect();
console.log("\nDone.\n");
