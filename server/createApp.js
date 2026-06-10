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
  addressRouter,
  installmentRouter,
  priceOfferRouter,
  appIntroRouter,
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
import { resolveApiCorsMiddleware } from "./utils/resolveApiCorsMiddleware.js";
import { UPLOADS_DIR } from "./utils/uploadsDir.js";

export const createApp = () => {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  app.set("trust proxy", 1);
  app.use(requestIdMW);
  app.use(express.json());
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
    (_req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(UPLOADS_DIR),
  );

  app.use("/upload", uploadRouter);
  app.use("/auth", authRouter);
  app.use("/vote", voteRouter);
  app.use("/user", userRouter);
  app.use("/order", orderRouter);
  app.use("/cart", cartRouter);
  app.use("/product", productRouter);
  app.use("/address", addressRouter);
  app.use("/installment", installmentRouter);
  app.use("/price-offers", priceOfferRouter);
  app.use("/app-intro", appIntroRouter);
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
