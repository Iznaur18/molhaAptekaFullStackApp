import "dotenv/config";

import { isSmtpConfigured, sendSmtpMail } from "../utils/smtpMail.js";

const recipient = process.argv[2]?.trim();

if (!recipient || !recipient.includes("@")) {
  console.error("Использование: npm run test:smtp -- your@email.com");
  process.exit(1);
}

if (!isSmtpConfigured()) {
  console.error(
    "SMTP не настроен. Заполните SMTP_HOST, SMTP_USER, SMTP_PASS в server/.env",
  );
  process.exit(1);
}

try {
  await sendSmtpMail({
    to: recipient,
    subject: "Gitorg — тест SMTP",
    text: "Если вы видите это письмо, SMTP настроен правильно.",
    html: "<p>Если вы видите это письмо, <strong>SMTP настроен правильно</strong>.</p>",
  });
  console.log(`✓ Тестовое письмо отправлено на ${recipient}`);
} catch (error) {
  console.error("✗ Ошибка отправки:", error);
  process.exit(1);
}
