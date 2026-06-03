import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {
    uploadRouter,
    authRouter,
    voteRouter,
    userRouter,
    orderRouter,
    productRouter,
    cartRouter,
    addressRouter,
    installmentRouter,
    priceOfferRouter,
} from './routes/index.js';
import { generalRateLimiter, errorHandler, notFoundHandler } from './middlewares/index.js';
import { UPLOADS_DIR, ensureUploadsDir } from './utils/uploadsDir.js';
import { expireStaleUserStories } from './utils/userStoryHelpers.js';
import { processInstallmentCronTasks } from './utils/installmentHelpers.js';
import { processPremiumCronTasks } from './utils/premiumAccess.js';
import { INSTALLMENT_CRON_INTERVAL_MS } from './constants/installmentConstants.js';
import { PREMIUM_CRON_INTERVAL_MS } from './constants/premiumConstants.js';

ensureUploadsDir();

const USER_STORY_CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET не задан в .env'); // выводим ошибку в консоль
  process.exit(1); // выход из программы с кодом 1 (ошибка)
}
if (!process.env.MONGO_URI) { // если MONGO_URI не задан в .env, то выводим ошибку в консоль и выходим из программы с кодом 1 (ошибка)
    console.error('MONGO_URI не задан в .env'); // выводим ошибку в консоль
    process.exit(1); // выход из программы с кодом 1 (ошибка)
}

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !process.env.FRONTEND_URL) {
    console.error(
        'FRONTEND_URL не задан в production — CORS будет открыт для всех доменов. Задайте FRONTEND_URL в .env',
    );
    process.exit(1);
}
if (!isProduction && !process.env.FRONTEND_URL) {
    console.warn(
        'FRONTEND_URL не задан — CORS разрешён для всех origin (только для dev)',
    );
}

const app = express(); // создаем экземпляр express
// Один hop прокси (Vite dev `server.proxy`, nginx и т.п.) — иначе `express-rate-limit` v7
// может кинуть ValidationError из‑за `X-Forwarded-For` при `trust proxy === false`.
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(
    process.env.FRONTEND_URL
        ? cors({ origin: process.env.FRONTEND_URL, credentials: true })
        : cors({ origin: true, credentials: true }),
);
app.use(helmet()); // защита от некоторых типов атак

// Общий rate limiting для всех API запросов (защита от DDoS)
// Применяется ко всем маршрутам, кроме статических файлов
app.use(generalRateLimiter);

app.get('/health', (_req, res) => {
    const mongoReady = mongoose.connection.readyState === 1;
    res.status(mongoReady ? 200 : 503).json({
        status: mongoReady ? 'ok' : 'degraded',
        mongo: mongoReady ? 'connected' : 'disconnected',
        uptimeSec: Math.floor(process.uptime()),
    });
});

// раздача загруженных файлов по URL /uploads/...
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(UPLOADS_DIR),
);

// роут загрузки файла: POST /upload
app.use('/upload', uploadRouter); // Это префикс, который будет использоваться для загрузки файла.

// авторизация: POST /auth/register, POST /auth/login
app.use('/auth', authRouter); // Это префикс для маршрутов авторизации.

// голосование за пользователя: POST /vote/:userVoteTargetIdClient (body: userVoteValueClient 1–10)
app.use('/vote', voteRouter);

app.use('/user', userRouter);

app.use('/order', orderRouter);

app.use('/cart', cartRouter);

app.use('/product', productRouter);

app.use('/address', addressRouter);

app.use('/installment', installmentRouter);

app.use('/price-offers', priceOfferRouter);

// Обработчик несуществующих маршрутов (404) - должен быть перед errorHandler
app.use(notFoundHandler);

// Централизованный обработчик ошибок (должен быть последним middleware)
app.use(errorHandler);

const PORT = process.env.PORT ?? 4444; // порт для запуска сервера. Через process.env.PORT мы получаем порт из файла .env.

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    setInterval(() => {
        void expireStaleUserStories().catch((error) => {
            console.error('expireStaleUserStories error:', error);
        });
    }, USER_STORY_CLEANUP_INTERVAL_MS);

    setInterval(() => {
        void processInstallmentCronTasks().catch((error) => {
            console.error('processInstallmentCronTasks error:', error);
        });
    }, INSTALLMENT_CRON_INTERVAL_MS);

    setInterval(() => {
        void processPremiumCronTasks().catch((error) => {
            console.error('processPremiumCronTasks error:', error);
        });
    }, PREMIUM_CRON_INTERVAL_MS);

    app
      .listen(PORT, () => {
        console.log(`Сервер успешно запущен на ${PORT}.`);
      })
      .on('error', (err) => {
        console.error('Ошибка запуска сервера:', err);
        process.exit(1);
      });
  } catch (err) {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  }
}

void start();