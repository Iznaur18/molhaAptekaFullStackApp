import path from "node:path";

import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import {
  uploadRouter,
  authRouter,
  voteRouter,
  userRouter,
  orderRouter,
  productRouter,
  cartRouter,
  favoritesRouter,
  addressRouter,
  installmentRouter,
  priceOfferRouter,
  appIntroRouter,
  siteHeaderBannerRouter,
  introAdRouter,
  sellerPersonalCategoryRouter,
} from "./routes/index.js";
import {
  generalRateLimiter,
  errorHandler,
  notFoundHandler,
  requestIdMW,
} from "./middlewares/index.js";
import { buildApiHelmetOptions } from "./utils/buildApiHelmetOptions.js";
import { buildHealthPayload } from "./utils/buildHealthPayload.js";
import { API_JSON_BODY_LIMIT } from "./constants/securityRateLimitConstants.js";
import { resolveApiCorsMiddleware } from "./utils/resolveApiCorsMiddleware.js";
import { resolveUploadContentType } from "./utils/resolveUploadContentType.js";
import { UPLOADS_DIR } from "./utils/uploadsDir.js";

export const createApp = () => {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  app.set("trust proxy", 1);
  app.use(requestIdMW);
  app.use(express.json({ limit: API_JSON_BODY_LIMIT }));
  app.use(cookieParser());
  app.use(resolveApiCorsMiddleware(isProduction));
  app.use(helmet(buildApiHelmetOptions({ isProduction })));

  app.use(generalRateLimiter);

  app.get("/health", (_req, res) => {
    const health = buildHealthPayload();
    res.status(health.status === "ok" ? 200 : 503).json(health);
  });

  // Локальные файлы (UPLOAD_STORAGE=disk) и legacy после миграции на S3/CDN.
  app.use(
    "/uploads",
    express.static(UPLOADS_DIR, {
      setHeaders(res, filePath) {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader(
          "Content-Type",
          resolveUploadContentType(path.basename(filePath)),
        );
      },
    }),
  );

  app.use("/upload", uploadRouter);
  app.use("/auth", authRouter);
  app.use("/vote", voteRouter);
  app.use("/user", userRouter);
  app.use("/order", orderRouter);
  app.use("/cart", cartRouter);
  app.use("/favorites", favoritesRouter);
  app.use("/product", productRouter);
  app.use("/address", addressRouter);
  app.use("/installment", installmentRouter);
  app.use("/price-offers", priceOfferRouter);
  app.use("/app-intro", appIntroRouter);
  app.use("/site-header-banner", siteHeaderBannerRouter);
  app.use("/intro-ad", introAdRouter);
  app.use("/seller-personal-category", sellerPersonalCategoryRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  if (isProduction && !process.env.FRONTEND_URL) {
    console.warn(
      "createApp: FRONTEND_URL не задан в production — CORS может быть небезопасен",
    );
  }

  return app;
};
