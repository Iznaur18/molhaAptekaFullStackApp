/**
 * Web Push (браузер / PWA) — системный баннер на устройстве.
 *
 * 1. Сгенерируй VAPID:
 *    cd server && node --input-type=module -e "import webpush from 'web-push'; console.log(webpush.generateVAPIDKeys())"
 * 2. Пропиши в server/.env:
 *    VAPID_PUBLIC_KEY=...
 *    VAPID_PRIVATE_KEY=...
 *    VAPID_SUBJECT=mailto:support@gitorg.ru
 * 3. Перезапусти API.
 * 4. HTTPS или localhost (LAN http://192.168.x.x — Push API нет).
 * 5. Профиль → «Push на устройство» → Включить → разрешить в браузере.
 * 6. iOS: сначала «На экран Домой», потом кнопка.
 * 7. Smoke: любое событие createUserInAppNotification → баннер сверху.
 */
