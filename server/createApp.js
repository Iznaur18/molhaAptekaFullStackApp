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
  usersLoyaltyRaffleRouter,
  siteHeaderBannerRouter,
  siteHeaderBannerCampaignRouter,
  introAdRouter,
  sellerPersonalCategoryRouter,
  sellerShelfRouter,
  auditRouter,
  analyticsRouter,
  staffRouter,
  onecRouter,
  onecExchangeRouter,
} from "./routes/index.js";
import {
  generalRateLimiter,
  errorHandler,
  notFoundHandler,
  requestIdMW,
  accessLogMW,
  csrfCookieOriginCheckMW,
  auditStaffActionMW,
} from "./middlewares/index.js";
import { buildApiHelmetOptions } from "./utils/buildApiHelmetOptions.js";
import { buildHealthPayload } from "./utils/buildHealthPayload.js";
import { API_JSON_BODY_LIMIT } from "./constants/securityRateLimitConstants.js";
import { resolveApiCorsMiddleware } from "./utils/resolveApiCorsMiddleware.js";
import { resolveUploadContentType } from "./utils/resolveUploadContentType.js";
import { resolveUploadsRequestPathPrivacy } from "./utils/resolveUploadsRequestPathPrivacy.js";
import { UPLOADS_DIR } from "./utils/uploadsDir.js";
import {
  productLinkPreviewController,
  sellerLinkPreviewController,
} from "./controllers/LinkPreview/linkPreviewControllers.js";

export const createApp = () => {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  app.set("trust proxy", 1);
  app.use(requestIdMW);
  app.use(accessLogMW);

  // CommerceML-обмен смонтирован ДО json-парсера, CORS и CSRF-гейта:
  // `mode=file` присылает бинарный ZIP потоком (его читает сам контроллер),
  // а 1С не браузер — ни Origin, ни куки сайта у неё нет.
  app.use("/onec/exchange", onecExchangeRouter);

  app.use(express.json({ limit: API_JSON_BODY_LIMIT }));
  app.use(cookieParser());
  app.use(resolveApiCorsMiddleware(isProduction));
  app.use(csrfCookieOriginCheckMW);
  app.use(helmet(buildApiHelmetOptions({ isProduction })));

  app.use(generalRateLimiter);

  app.get("/health", (_req, res) => {
    const health = buildHealthPayload();
    const statusCode = health.status === "ok" ? 200 : 503;
    // Публично только status — internals (mongo/git/uptime) не светим даже в dev/LAN.
    return res.status(statusCode).json({ status: health.status });
  });

  // Локальные файлы (UPLOAD_STORAGE=disk) и legacy после миграции на S3/CDN.
  // `/uploads/private/*` закрыт — только `GET /upload/private/:filename` (staff).
  app.use("/uploads", (req, res, next) => {
    const { malformed, isPrivate } = resolveUploadsRequestPathPrivacy(req.path);
    if (malformed) {
      return res.status(400).end();
    }
    if (isPrivate) {
      return res.status(404).end();
    }
    return next();
  });
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

  // Сквозной аудит staff-мутаций: слушатель на finish, пишет только если запрос
  // прошёл staff-гейт (req.staffAudit). Ставится до роутеров.
  app.use(auditStaffActionMW);

  // Open Graph для crawler’ов (WhatsApp/Telegram/…) — до API-роутеров.
  app.get("/product/:productId", productLinkPreviewController);
  app.get("/seller/:sellerId", sellerLinkPreviewController);

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
  app.use("/users-loyalty-raffle", usersLoyaltyRaffleRouter);
  app.use("/site-header-banner", siteHeaderBannerRouter);
  app.use("/site-header-banner-campaign", siteHeaderBannerCampaignRouter);
  app.use("/intro-ad", introAdRouter);
  app.use("/seller-personal-category", sellerPersonalCategoryRouter);
  app.use("/seller-shelf", sellerShelfRouter);
  app.use("/audit", auditRouter);
  app.use("/analytics", analyticsRouter);
  app.use("/staff", staffRouter);
  app.use("/onec", onecRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
