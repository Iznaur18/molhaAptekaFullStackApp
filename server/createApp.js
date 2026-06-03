import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoose from 'mongoose';

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
import { UPLOADS_DIR } from './utils/uploadsDir.js';

export const createApp = () => {
    const app = express();
    const isProduction = process.env.NODE_ENV === 'production';

    app.set('trust proxy', 1);
    app.use(express.json());
    app.use(cookieParser());
    app.use(
        process.env.FRONTEND_URL
            ? cors({ origin: process.env.FRONTEND_URL, credentials: true })
            : cors({ origin: true, credentials: true }),
    );
    app.use(helmet());

    app.use(generalRateLimiter);

    app.get('/health', (_req, res) => {
        const mongoReady = mongoose.connection.readyState === 1;
        res.status(mongoReady ? 200 : 503).json({
            status: mongoReady ? 'ok' : 'degraded',
            mongo: mongoReady ? 'connected' : 'disconnected',
            uptimeSec: Math.floor(process.uptime()),
        });
    });

    app.use(
        '/uploads',
        (_req, res, next) => {
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            next();
        },
        express.static(UPLOADS_DIR),
    );

    app.use('/upload', uploadRouter);
    app.use('/auth', authRouter);
    app.use('/vote', voteRouter);
    app.use('/user', userRouter);
    app.use('/order', orderRouter);
    app.use('/cart', cartRouter);
    app.use('/product', productRouter);
    app.use('/address', addressRouter);
    app.use('/installment', installmentRouter);
    app.use('/price-offers', priceOfferRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    if (isProduction && !process.env.FRONTEND_URL) {
        console.warn(
            'createApp: FRONTEND_URL не задан в production — CORS может быть небезопасен',
        );
    }

    return app;
};
