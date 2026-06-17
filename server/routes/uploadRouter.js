import { createAsyncRouter } from "../utils/createAsyncRouter.js";
import {
  uploadMW,
  checkAuthMW,
  uploadRateLimiter,
  uploadVideoMW,
} from "../middlewares/index.js"; // Импортируем uploadMW и checkAuthMW из middlewares/index.js. Он будет использоваться для загрузки файла.
import { uploadController, uploadVideoController } from "../controllers/index.js";

const router = createAsyncRouter();

// Rate limiting для загрузки файлов (защита от перегрузки сервера)
router.post(
  "/",
  checkAuthMW,
  uploadRateLimiter,
  uploadMW.single("image"),
  uploadController,
);

router.post(
  "/video",
  checkAuthMW,
  uploadRateLimiter,
  uploadVideoMW.single("video"),
  uploadVideoController,
);

export { router as uploadRouter }; // Получаем в файле index.js и используем в app.use('/upload', uploadRouter);
